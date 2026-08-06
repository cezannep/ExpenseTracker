import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Transaction, UserProfile } from "../types";

export class TransactionRepository {
  private static collectionName = "transactions";

  static async addTransaction(transaction: Omit<Transaction, "id" | "createdAt">): Promise<Transaction> {
    const createdAt = new Date().toISOString();
    const dataToSave: Record<string, any> = {
      ...transaction,
      createdAt,
    };

    // Firestore does not accept `undefined` values for fields (e.g. note: undefined)
    Object.keys(dataToSave).forEach((key) => {
      if (dataToSave[key] === undefined) {
        delete dataToSave[key];
      }
    });

    const docRef = await addDoc(collection(db, this.collectionName), dataToSave);

    return {
      id: docRef.id,
      ...transaction,
      createdAt,
    };
  }

  static async updateTransaction(id: string, updates: Partial<Omit<Transaction, "id">>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    const dataToUpdate: Record<string, any> = { ...updates };
    Object.keys(dataToUpdate).forEach((key) => {
      if (dataToUpdate[key] === undefined) {
        delete dataToUpdate[key];
      }
    });
    await updateDoc(docRef, dataToUpdate);
  }

  static async deleteTransaction(id: string): Promise<void> {
    console.log(`[Firestore DB] Initiating deleteDoc for document ID: "${id}"...`);
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
    console.log(`[Firestore DB] ✅ SUCCESS: Document "${id}" successfully deleted from Firebase Cloud Firestore!`);
  }

  static async getUserTransactions(userId: string): Promise<Transaction[]> {
    const q = query(
      collection(db, this.collectionName),
      where("userId", "==", userId)
    );

    const snapshot = await getDocs(q);
    const txs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Transaction[];

    // Sort client-side to prevent Firestore composite index requirements
    txs.sort((a, b) => new Date(b.date + 'T' + (b.createdAt || '')).getTime() - new Date(a.date + 'T' + (a.createdAt || '')).getTime());
    return txs;
  }

  static subscribeUserTransactions(
    userId: string, 
    onUpdate: (transactions: Transaction[]) => void
  ) {
    const q = query(
      collection(db, this.collectionName),
      where("userId", "==", userId)
    );

    return onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Transaction[];

      // Sort client side to avoid index creation issues in firestore demo mode
      txs.sort((a, b) => new Date(b.date + 'T' + (b.createdAt || '')).getTime() - new Date(a.date + 'T' + (a.createdAt || '')).getTime());
      onUpdate(txs);
    });
  }
}

export class UserRepository {
  private static collectionName = "users";

  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const docRef = doc(db, this.collectionName, userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  }

  static async createOrUpdateProfile(profile: UserProfile): Promise<void> {
    const docRef = doc(db, this.collectionName, profile.uid);
    await setDoc(docRef, profile, { merge: true });
  }

  static async updateDailyLimit(userId: string, limit: number): Promise<void> {
    const docRef = doc(db, this.collectionName, userId);
    await updateDoc(docRef, { dailyLimit: limit });
  }

  static async saveDailyBudgetSnapshot(userId: string, date: string, limit: number): Promise<void> {
    const docRef = doc(db, this.collectionName, userId);
    await updateDoc(docRef, {
      [`dailyBudgetHistory.${date}`]: limit
    });
  }

  static async updateMonthlyBudget(userId: string, budget: number): Promise<void> {
    const docRef = doc(db, this.collectionName, userId);
    await updateDoc(docRef, { monthlyBudget: budget });
  }
}
