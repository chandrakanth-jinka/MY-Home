import type { Timestamp } from "firebase/firestore";

export type Expense = {
  id: string;
  householdId: string;
  date: Date;
  name: string;
  amount: number;
  category: string;
  addedBy: string;
  lastEditedBy: string;
};

export type Milkman = {
  id: string;
  name: string;
  rate: number;
};

export type MilkEntry = {
  morning?: number;
  evening?: number;
  lastEditedBy?: string;
};

export type DailyMilkRecord = {
  [milkmanId: string]: MilkEntry;
};

export type MilkData = {
  [date: string]: DailyMilkRecord; // date is 'yyyy-MM-dd'
};

export type UserProfile = {
  uid: string;
  email: string;
  householdId?: string;
};

export type Household = {
  id: string;
  name: string;
  pin: string; // Should be hashed in a real app
  members: string[]; // array of user uids
  createdBy: string;
  createdAt: Timestamp;
};
