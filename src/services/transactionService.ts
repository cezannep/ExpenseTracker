import { Transaction, CreateTransactionInput, UpdateTransactionInput } from "@/types";
import { TransactionRepository } from "@/repositories";
import { OfflineQueueService } from "./offlineQueue";

export class TransactionService {
  /**
   * Generates a stable unique ID for new transactions.
   */
  static generateId(): string {
    return `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Creates a transaction: validates, enqueues locally, and synchronizes to Firestore.
   */
  static async createTransaction(
    userId: string,
    input: CreateTransactionInput
  ): Promise<Transaction> {
    const id = this.generateId();
    const now = new Date().toISOString();

    const newTx: Transaction = {
      id,
      userId,
      type: input.type,
      amountPaise: Math.round(input.amountPaise),
      category: input.category,
      note: input.note?.trim() || undefined,
      date: input.date,
      createdAt: now,
      updatedAt: now,
      syncStatus: "pending",
    };

    // 1. Enqueue operation locally
    OfflineQueueService.enqueue({
      operationId: `op-${id}`,
      entityId: id,
      entityType: "transaction",
      operation: "create",
      payload: newTx,
    }, userId);

    // 2. Attempt Firestore sync if user is authenticated and online
    if (userId && userId !== "guest") {
      try {
        await TransactionRepository.create(userId, { ...newTx, syncStatus: "synced" });
        OfflineQueueService.dequeue(`op-${id}`, userId);
        return { ...newTx, syncStatus: "synced" };
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Sync failed";
        OfflineQueueService.markFailed(`op-${id}`, errorMsg, userId);
        console.warn(`[TransactionService] Firestore sync queued offline for ${id}:`, errorMsg);
        return { ...newTx, syncStatus: "pending" };
      }
    }

    return newTx;
  }

  /**
   * Updates an existing transaction.
   */
  static async updateTransaction(
    userId: string,
    id: string,
    updates: UpdateTransactionInput
  ): Promise<void> {
    const now = new Date().toISOString();
    const payload = {
      ...updates,
      ...(updates.amountPaise !== undefined ? { amountPaise: Math.round(updates.amountPaise) } : {}),
      updatedAt: now,
    };

    OfflineQueueService.enqueue({
      operationId: `op-upd-${id}-${Date.now()}`,
      entityId: id,
      entityType: "transaction",
      operation: "update",
      payload,
    }, userId);

    if (userId && userId !== "guest") {
      try {
        await TransactionRepository.update(userId, id, payload);
        OfflineQueueService.dequeue(`op-upd-${id}-${Date.now()}`, userId);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Update sync failed";
        OfflineQueueService.markFailed(`op-upd-${id}-${Date.now()}`, errorMsg, userId);
      }
    }
  }

  /**
   * Deletes a transaction.
   */
  static async deleteTransaction(userId: string, id: string): Promise<void> {
    const opId = `op-del-${id}-${Date.now()}`;
    OfflineQueueService.enqueue({
      operationId: opId,
      entityId: id,
      entityType: "transaction",
      operation: "delete",
    }, userId);

    if (userId && userId !== "guest") {
      try {
        await TransactionRepository.delete(userId, id);
        OfflineQueueService.dequeue(opId, userId);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Delete sync failed";
        OfflineQueueService.markFailed(opId, errorMsg, userId);
        throw err;
      }
    }
  }

  /**
   * Processes all pending operations in the offline queue (e.g. upon regaining network connectivity).
   */
  static async processQueue(userId: string): Promise<{ processed: number; failed: number }> {
    if (!userId || userId === "guest") return { processed: 0, failed: 0 };
    const queue = OfflineQueueService.getQueue(userId);
    let processed = 0;
    let failed = 0;

    for (const op of queue) {
      if (op.status === "processing") continue;
      try {
        if (op.entityType === "transaction") {
          if (op.operation === "create" && op.payload) {
            await TransactionRepository.create(userId, op.payload as Transaction);
          } else if (op.operation === "update" && op.payload) {
            await TransactionRepository.update(userId, op.entityId, op.payload as UpdateTransactionInput);
          } else if (op.operation === "delete") {
            await TransactionRepository.delete(userId, op.entityId);
          }
        }
        OfflineQueueService.dequeue(op.operationId, userId);
        processed++;
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Queue retry error";
        OfflineQueueService.markFailed(op.operationId, errorMsg, userId);
        failed++;
      }
    }

    return { processed, failed };
  }
}
