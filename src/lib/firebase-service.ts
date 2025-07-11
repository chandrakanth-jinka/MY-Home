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
} from "firebase/firestore";
import type { Expense, MilkData, MilkEntry, Milkman } from "@/types";
import { format } from "date-fns";

// Hardcoded household ID for now
const HOUSEHOLD_ID = "default-household";

const expensesCol = collection(db, `households/${HOUSEHOLD_ID}/expenses`);
const milkCol = collection(db, `households/${HOUSEHOLD_ID}/milk`);
const milkmenCol = collection(db, `households/${HOUSEHOLD_ID}/milkmen`);


// Expenses Functions
export const getExpenses = (callback: (data: Expense[]) => void) => {
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

export const addExpense = async (expense: Omit<Expense, "id">) => {
  await addDoc(expensesCol, {
    ...expense,
    date: Timestamp.fromDate(expense.date),
  });
};

// Milk Data Functions
export const getMilkData = (callback: (data: MilkData) => void) => {
    return onSnapshot(milkCol, (snapshot) => {
      const milkData: MilkData = {};
      snapshot.docs.forEach((doc) => {
        milkData[doc.id] = doc.data();
      });
      callback(milkData);
    });
};

export const updateMilkData = async (
    date: string, // "yyyy-MM-dd"
    milkmanId: string,
    entry: { morning?: number; evening?: number },
    user: string
  ) => {
    const dateDocRef = doc(db, `households/${HOUSEHOLD_ID}/milk`, date);
  
    const updatePayload: { [key: string]: any } = {};
  
    const newEntry: MilkEntry = { lastEditedBy: user };
    if (entry.morning !== undefined && entry.morning > 0) newEntry.morning = entry.morning;
    if (entry.evening !== undefined && entry.evening > 0) newEntry.evening = entry.evening;
  
    if (Object.keys(newEntry).length > 1) { // more than just lastEditedBy
      updatePayload[`${milkmanId}`] = newEntry;
    } else {
      // If both morning and evening are 0 or undefined, we remove the milkman's entry for that day
      updatePayload[`${milkmanId}`] = deleteField();
    }
  
    try {
        await setDoc(dateDocRef, updatePayload, { merge: true });

        // Cleanup: if the document for the date is now empty, we could delete it,
        // but Firestore doesn't charge for empty docs and this is simpler.
        // We'll just filter empty objects on the client side.

    } catch (error) {
      console.error("Error updating milk data: ", error);
    }
};

// Milkmen Functions
export const getMilkmen = (callback: (data: Milkman[]) => void) => {
    return onSnapshot(milkmenCol, (snapshot) => {
      if (snapshot.empty) {
        // Create default milkmen if none exist
        const defaultMilkmen: Omit<Milkman, "id">[] = [
            { name: "Amul", rate: 58 },
            { name: "Local Dairy", rate: 55 },
        ];
        defaultMilkmen.forEach(milkman => addDoc(milkmenCol, milkman));
      }
      const milkmen = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Milkman[];
      callback(milkmen);
    });
};
