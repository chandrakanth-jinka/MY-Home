"use client";

import { db } from "./firebase";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  Timestamp,
  orderBy,
  doc,
  setDoc,
  getDoc,
  deleteField,
  where,
  getDocs,
  writeBatch,
  updateDoc,
  arrayUnion,
  deleteDoc,
} from "firebase/firestore";
import type { Expense, MilkData, MilkEntry, Milkman, UserProfile, Household } from "@/types";
import type { User } from "firebase/auth";

// Auth & User Profile Functions
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const userDocRef = doc(db, "users", uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
    }
    return null;
}

// Household Functions
export const createHousehold = async (user: User, householdName: string, pin: string) => {
    const householdsRef = collection(db, "households");
    // Check if household name already exists
    const q = query(householdsRef, where("name", "==", householdName));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        throw new Error("A household with this name already exists. Please choose another name.");
    }

    const batch = writeBatch(db);

    // Create the household document
    const householdDocRef = doc(householdsRef);
    const newHousehold: Household = {
        id: householdDocRef.id,
        name: householdName,
        pin: pin, // In a real app, this should be hashed.
        members: [user.uid],
        createdBy: user.uid,
        createdAt: Timestamp.now(),
    };
    batch.set(householdDocRef, newHousehold);
    
    // Update the user's profile with the new household ID
    const userDocRef = doc(db, "users", user.uid);
    const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || "",
        householdId: householdDocRef.id,
    };
    batch.set(userDocRef, userProfile, { merge: true });

    // Add default milkmen
    const milkmenColRef = collection(db, `households/${householdDocRef.id}/milkmen`);
    const defaultMilkmen = [
        { name: "Amul", rate: 58 },
        { name: "Local Dairy", rate: 55 },
    ];
    defaultMilkmen.forEach(milkman => {
        const milkmanDocRef = doc(milkmenColRef);
        batch.set(milkmanDocRef, milkman);
    });


    await batch.commit();

    return householdDocRef.id;
}


export const joinHousehold = async (user: User, householdName: string, pin: string): Promise<boolean> => {
    const householdsRef = collection(db, "households");
    const q = query(householdsRef, where("name", "==", householdName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return false; // Household not found
    }

    const householdDoc = querySnapshot.docs[0];
    const householdData = householdDoc.data() as Household;

    if (householdData.pin !== pin) {
        return false; // Incorrect PIN
    }

    const batch = writeBatch(db);

    // Add user to household's member list
    const householdDocRef = doc(db, "households", householdDoc.id);
    batch.update(householdDocRef, {
        members: arrayUnion(user.uid)
    });

    // Update user's profile
    const userDocRef = doc(db, "users", user.uid);
    const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || "",
        householdId: householdDoc.id,
    };
    batch.set(userDocRef, userProfile, { merge: true });

    await batch.commit();

    return true;
}


// Expenses Functions
export const getExpenses = (householdId: string, callback: (data: Expense[]) => void) => {
  const expensesCol = collection(db, `households/${householdId}/expenses`);
  const q = query(expensesCol, orderBy("date", "desc"));
  return onSnapshot(q, (snapshot) => {
    const expenses = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: (data.date as Timestamp).toDate(),
      } as Expense;
    });
    callback(expenses);
  });
};

export const addExpense = async (householdId: string, expense: Omit<Expense, "id">) => {
  const expensesCol = collection(db, `households/${householdId}/expenses`);
  await addDoc(expensesCol, {
    ...expense,
    date: Timestamp.fromDate(expense.date),
  });
};

export const updateExpense = async (householdId: string, expenseId: string, updatedFields: Partial<Expense>) => {
    if (!householdId || !expenseId) throw new Error("Household and Expense ID are required");
    const expenseDocRef = doc(db, `households/${householdId}/expenses`, expenseId);
    
    const dataToUpdate: { [key: string]: any } = { ...updatedFields };
    if (updatedFields.date) {
        dataToUpdate.date = Timestamp.fromDate(updatedFields.date);
    }

    await updateDoc(expenseDocRef, dataToUpdate);
};

export const deleteExpense = async (householdId: string, expenseId: string) => {
    if (!householdId || !expenseId) throw new Error("Household and Expense ID are required");
    const expenseDocRef = doc(db, `households/${householdId}/expenses`, expenseId);
    await deleteDoc(expenseDocRef);
};


// Milk Data Functions
export const getMilkData = (householdId: string, callback: (data: MilkData) => void) => {
    const milkCol = collection(db, `households/${householdId}/milk`);
    return onSnapshot(milkCol, (snapshot) => {
      const milkData: MilkData = {};
      snapshot.docs.forEach((doc) => {
        milkData[doc.id] = doc.data();
      });
      callback(milkData);
    });
};

export const updateMilkData = async (
    householdId: string,
    date: string, // "yyyy-MM-dd"
    milkmanId: string,
    entry: { morning?: number; evening?: number },
    user: string
  ) => {
    const dateDocRef = doc(db, `households/${householdId}/milk`, date);
  
    const updatePayload: { [key: string]: any } = {};
  
    // Check if the entry is empty (both morning and evening are undefined or 0)
    const isMorningEmpty = entry.morning === undefined || entry.morning === 0;
    const isEveningEmpty = entry.evening === undefined || entry.evening === 0;

    if (isMorningEmpty && isEveningEmpty) {
      // If both are empty, we remove the field for this milkman
      updatePayload[`${milkmanId}`] = deleteField();
    } else {
      // Otherwise, we create or update the entry
      const newEntry: MilkEntry = { lastEditedBy: user };
      if (entry.morning !== undefined && entry.morning > 0) {
        newEntry.morning = entry.morning;
      }
      if (entry.evening !== undefined && entry.evening > 0) {
        newEntry.evening = entry.evening;
      }
      updatePayload[`${milkmanId}`] = newEntry;
    }
  
    try {
        await setDoc(dateDocRef, updatePayload, { merge: true });
        
        // After updating, check if the entire date document is now empty.
        const dateDocSnap = await getDoc(dateDocRef);
        if (dateDocSnap.exists() && Object.keys(dateDocSnap.data()).length === 0) {
            // If the document is empty, delete it.
            await deleteDoc(dateDocRef);
        }
    } catch (error) {
      console.error("Error updating milk data: ", error);
    }
};

// Milkmen Functions
export const getMilkmen = (householdId: string, callback: (data: Milkman[]) => void) => {
    const milkmenCol = collection(db, `households/${householdId}/milkmen`);
    const q = query(milkmenCol, orderBy("name"));
    return onSnapshot(q, (snapshot) => {
      const milkmen = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Milkman[];
      callback(milkmen);
    });
};

export const addMilkman = async (householdId: string, name: string, rate: number) => {
    if (!householdId) throw new Error("Household ID is required");
    const milkmenCol = collection(db, `households/${householdId}/milkmen`);
    await addDoc(milkmenCol, { name, rate });
};

export const updateMilkman = async (householdId: string, milkmanId: string, name: string, rate: number) => {
    if (!householdId || !milkmanId) throw new Error("Household and Milkman ID are required");
    const milkmanDoc = doc(db, `households/${householdId}/milkmen`, milkmanId);
    await updateDoc(milkmanDoc, { name, rate });
};

export const deleteMilkman = async (householdId: string, milkmanId: string) => {
    if (!householdId || !milkmanId) throw new Error("Household and Milkman ID are required");
    const milkmanDoc = doc(db, `households/${householdId}/milkmen`, milkmanId);
    await deleteDoc(milkmanDoc);
    // Note: This does not delete the historical milk entries for this milkman.
    // That data will remain but won't be editable through the UI anymore. This is intended.
};