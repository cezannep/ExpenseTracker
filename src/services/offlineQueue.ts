import { PendingOperation } from "@/types";

const QUEUE_STORAGE_KEY = "expense_tracker_pending_ops_v1";

export class OfflineQueueService {
  private static getStorageKey(userId?: string): string {
    return userId ? `${QUEUE_STORAGE_KEY}_${userId}` : QUEUE_STORAGE_KEY;
  }

  static getQueue(userId?: string): PendingOperation[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(this.getStorageKey(userId));
      if (!raw) return [];
      return JSON.parse(raw) as PendingOperation[];
    } catch (e) {
      console.warn("Failed to read offline queue from storage:", e);
      return [];
    }
  }

  static saveQueue(queue: PendingOperation[], userId?: string): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(queue));
    } catch (e) {
      console.error("Failed to persist offline queue to storage:", e);
    }
  }

  static enqueue(operation: Omit<PendingOperation, "status" | "retryCount" | "createdAt">, userId?: string): PendingOperation {
    const queue = this.getQueue(userId);
    const op: PendingOperation = {
      ...operation,
      status: "pending",
      retryCount: 0,
      createdAt: new Date().toISOString(),
    };

    // If an operation already exists for the same entity, coalesce or append
    const updated = [...queue.filter((item) => item.entityId !== op.entityId || op.operation === "create"), op];
    this.saveQueue(updated, userId);
    return op;
  }

  static dequeue(operationId: string, userId?: string): void {
    const queue = this.getQueue(userId);
    const updated = queue.filter((item) => item.operationId !== operationId);
    this.saveQueue(updated, userId);
  }

  static markFailed(operationId: string, error: string, userId?: string): void {
    const queue = this.getQueue(userId);
    const updated = queue.map((item) => {
      if (item.operationId === operationId) {
        return {
          ...item,
          status: "failed" as const,
          retryCount: item.retryCount + 1,
          lastError: error,
        };
      }
      return item;
    });
    this.saveQueue(updated, userId);
  }

  static clear(userId?: string): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.getStorageKey(userId));
  }
}

