import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  onSnapshot,
  Unsubscribe,
  where
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Transaction, UserProfile, DailyBudgetSnapshot } from "../types";

function sanitizeForFirestore<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      result[key] = val;
    }
  }
  return result;
}

export class TransactionRepository {
  /**
   * Reference to the user-scoped subcollection: users/{userId}/transactions
   */
  private static getUserTransactionsRef(userId: string) {
    return collection(db, "users", userId, "transactions");
  }

  static async create(userId: string, transaction: Transaction): Promise<Transaction> {
    const docRef = doc(this.getUserTransactionsRef(userId), transaction.id);
    const dataToSave = sanitizeForFirestore({
      ...transaction,
      userId,
      amountPaise: Math.round(transaction.amountPaise),
      updatedAt: transaction.updatedAt || new Date().toISOString(),
    });

    await setDoc(docRef, dataToSave, { merge: true });
    return transaction;
  }

  static async update(
    userId: string, 
    id: string, 
    updates: Partial<Omit<Transaction, "id" | "userId">>
  ): Promise<void> {
    const docRef = doc(this.getUserTransactionsRef(userId), id);
    const dataToUpdate = sanitizeForFirestore({
      ...updates,
      ...(updates.amountPaise !== undefined ? { amountPaise: Math.round(updates.amountPaise) } : {}),
      updatedAt: new Date().toISOString(),
    });

    await updateDoc(docRef, dataToUpdate);
  }

  static async delete(userId: string, id: string): Promise<void> {
    const docRef = doc(this.getUserTransactionsRef(userId), id);
    await deleteDoc(docRef);

    // Also attempt legacy root collection deletion if it existed there
    try {
      const legacyDocRef = doc(db, "transactions", id);
      await deleteDoc(legacyDocRef);
    } catch {
      // Legacy document may not exist, safe to ignore
    }
  }

  static async list(userId: string): Promise<Transaction[]> {
    // 1. Fetch from standard user-scoped subcollection
    const subColQuery = query(this.getUserTransactionsRef(userId));
    const snapshot = await getDocs(subColQuery);
    
    let txs = snapshot.docs.map((d) => {
      const data = d.data();
      const amountPaise = data.amountPaise !== undefined 
        ? data.amountPaise 
        : Math.round((data.amount || 0) * 100);

      return {
        id: d.id,
        ...data,
        amountPaise,
      } as Transaction;
    });

    // 2. Migration fallback: If subcollection is empty, check legacy root collection
    if (txs.length === 0) {
      try {
        const legacyQuery = query(collection(db, "transactions"), where("userId", "==", userId));
        const legacySnapshot = await getDocs(legacyQuery);
        if (!legacySnapshot.empty) {
          const migratedTxs: Transaction[] = [];
          for (const legacyDoc of legacySnapshot.docs) {
            const lData = legacyDoc.data();
            const tx: Transaction = {
              id: legacyDoc.id,
              userId,
              type: lData.type || "expense",
              amountPaise: lData.amountPaise !== undefined ? lData.amountPaise : Math.round((lData.amount || 0) * 100),
              category: lData.category || "Others",
              note: lData.note,
              date: lData.date || new Date().toISOString().split("T")[0],
              createdAt: lData.createdAt || new Date().toISOString(),
              updatedAt: lData.updatedAt || new Date().toISOString(),
            };
            // Save into subcollection
            await this.create(userId, tx);
            migratedTxs.push(tx);
          }
          txs = migratedTxs;
        }
      } catch {
        // Safe to ignore legacy fetch errors
      }
    }

    // Sort client-side descending by transaction date and timestamp
    txs.sort((a, b) => {
      const timeA = new Date(a.date + "T" + (a.createdAt ? a.createdAt.split("T")[1] || "00:00:00" : "00:00:00")).getTime();
      const timeB = new Date(b.date + "T" + (b.createdAt ? b.createdAt.split("T")[1] || "00:00:00" : "00:00:00")).getTime();
      return timeB - timeA;
    });

    return txs;
  }

  static subscribe(
    userId: string, 
    onUpdate: (transactions: Transaction[]) => void
  ): Unsubscribe {
    const q = query(this.getUserTransactionsRef(userId));

    return onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map((d) => {
        const data = d.data();
        const amountPaise = data.amountPaise !== undefined 
          ? data.amountPaise 
          : Math.round((data.amount || 0) * 100);

        return {
          id: d.id,
          ...data,
          amountPaise,
        } as Transaction;
      });

      txs.sort((a, b) => {
        const timeA = new Date(a.date + "T" + (a.createdAt ? a.createdAt.split("T")[1] || "00:00:00" : "00:00:00")).getTime();
        const timeB = new Date(b.date + "T" + (b.createdAt ? b.createdAt.split("T")[1] || "00:00:00" : "00:00:00")).getTime();
        return timeB - timeA;
      });

      onUpdate(txs);
    });
  }

  // Alias helpers for existing call sites
  static async addTransaction(transaction: Transaction): Promise<Transaction> {
    return this.create(transaction.userId, transaction);
  }

  static async updateTransaction(
    id: string, 
    updates: Partial<Omit<Transaction, "id">>
  ): Promise<void> {
    // If userId not provided in caller, we update in legacy or use active user
    const legacyDocRef = doc(db, "transactions", id);
    await updateDoc(legacyDocRef, sanitizeForFirestore(updates as Record<string, unknown>));
  }

  static async deleteTransaction(id: string): Promise<void> {
    const legacyDocRef = doc(db, "transactions", id);
    await deleteDoc(legacyDocRef);
  }

  static async getUserTransactions(userId: string): Promise<Transaction[]> {
    return this.list(userId);
  }
}

export class BudgetRepository {
  private static getDailyBudgetsRef(userId: string) {
    return collection(db, "users", userId, "dailyBudgets");
  }

  static async saveDailySnapshot(userId: string, date: string, amountPaise: number): Promise<void> {
    const docRef = doc(this.getDailyBudgetsRef(userId), date);
    const now = new Date().toISOString();
    const data: DailyBudgetSnapshot = {
      date,
      amountPaise: Math.round(amountPaise),
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(docRef, data, { merge: true });
  }

  static async listDailySnapshots(userId: string): Promise<Record<string, number>> {
    try {
      const snapshot = await getDocs(this.getDailyBudgetsRef(userId));
      const map: Record<string, number> = {};
      snapshot.docs.forEach((d) => {
        const data = d.data();
        if (data.amountPaise !== undefined) {
          map[d.id] = data.amountPaise;
        } else if (data.dailyLimit !== undefined) {
          map[d.id] = Math.round(data.dailyLimit * 100);
        }
      });
      return map;
    } catch {
      return {};
    }
  }
}

export class UserRepository {
  private static collectionName = "users";

  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const docRef = doc(db, this.collectionName, userId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    const rawDailyLimit = data.dailyLimitPaise !== undefined 
      ? data.dailyLimitPaise 
      : Math.round((data.dailyLimit || 150) * 100);
    const dailyLimitPaise = rawDailyLimit > 0 && rawDailyLimit < 1000 
      ? Math.round(rawDailyLimit * 100) 
      : Math.round(rawDailyLimit);
      
    const rawMonthlyBudget = data.monthlyBudgetPaise !== undefined
      ? data.monthlyBudgetPaise
      : Math.round((data.monthlyBudget || 4500) * 100);
    const monthlyBudgetPaise = rawMonthlyBudget > 0 && rawMonthlyBudget < 10000 
      ? Math.round(rawMonthlyBudget * 100) 
      : Math.round(rawMonthlyBudget);

    const dailyBudgetHistory: Record<string, number> = {};
    if (data.dailyBudgetHistory) {
      for (const [d, v] of Object.entries(data.dailyBudgetHistory)) {
        dailyBudgetHistory[d] = (typeof v === "number" && v > 0 && v < 1000) ? Math.round(v * 100) : Math.round(Number(v));
      }
    }

    return {
      uid: userId,
      name: data.name || "Personal Account",
      email: data.email || "",
      photoURL: data.photoURL,
      dailyLimitPaise,
      monthlyBudgetPaise,
      timezone: data.timezone || "Asia/Kolkata",
      currency: "INR",
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
      dailyBudgetHistory,
    };
  }

  static async createOrUpdateProfile(profile: UserProfile): Promise<void> {
    const docRef = doc(db, this.collectionName, profile.uid);
    const dataToSave = sanitizeForFirestore({
      ...profile,
      dailyLimitPaise: Math.round(profile.dailyLimitPaise),
      monthlyBudgetPaise: profile.monthlyBudgetPaise ? Math.round(profile.monthlyBudgetPaise) : undefined,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(docRef, dataToSave, { merge: true });
  }

  static async updateDailyLimit(userId: string, limitPaise: number): Promise<void> {
    const docRef = doc(db, this.collectionName, userId);
    await updateDoc(docRef, {
      dailyLimitPaise: Math.round(limitPaise),
      updatedAt: new Date().toISOString(),
    });
  }

  static async saveDailyBudgetSnapshot(userId: string, date: string, limitPaise: number): Promise<void> {
    // Save to subcollection
    await BudgetRepository.saveDailySnapshot(userId, date, limitPaise);
    // Also update profile dailyBudgetHistory map for backward compatibility
    const docRef = doc(db, this.collectionName, userId);
    await updateDoc(docRef, {
      [`dailyBudgetHistory.${date}`]: Math.round(limitPaise),
      updatedAt: new Date().toISOString(),
    });
  }

  static async updateMonthlyBudget(userId: string, budgetPaise: number): Promise<void> {
    const docRef = doc(db, this.collectionName, userId);
    await updateDoc(docRef, {
      monthlyBudgetPaise: Math.round(budgetPaise),
      updatedAt: new Date().toISOString(),
    });
  }
}
