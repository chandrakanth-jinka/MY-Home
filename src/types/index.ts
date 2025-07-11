export type Expense = {
  id: string;
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
