"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseTracker } from "@/components/expense-tracker";
import { MilkTracker } from "@/components/milk-tracker";
import { Reports } from "@/components/reports";
import type { Expense, MilkData, Milkman } from "@/types";
import { addExpense, getExpenses, getMilkData, updateMilkData, getMilkmen } from "@/lib/firebase-service";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";

export function Dashboard() {
  const [user, authLoading] = useAuthState(auth);
  const { userProfile, loading: profileLoading } = useUserProfile(user?.uid);
  const router = useRouter();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [milkData, setMilkData] = useState<MilkData>({});
  const [milkmen, setMilkmen] = useState<Milkman[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || profileLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (!userProfile?.householdId) {
      router.replace('/household');
      return;
    }

    const householdId = userProfile.householdId;
    let localLoading = true;

    const unsubscribeExpenses = getExpenses(householdId, (data) => {
      setExpenses(data);
      if (localLoading) {
        setLoading(false);
        localLoading = false;
      }
    });
    const unsubscribeMilkData = getMilkData(householdId, (data) => {
      setMilkData(data);
    });
    const unsubscribeMilkmen = getMilkmen(householdId, (data) => {
      setMilkmen(data);
    });

    return () => {
      unsubscribeExpenses();
      unsubscribeMilkData();
      unsubscribeMilkmen();
    };
  }, [user, userProfile, authLoading, profileLoading, router]);

  const handleAddExpense = async (expense: Omit<Expense, 'id' | 'addedBy' | 'lastEditedBy' | 'householdId'>) => {
    if (!user || !userProfile?.householdId) return;
    const newExpense: Omit<Expense, 'id'> = {
      ...expense,
      householdId: userProfile.householdId,
      addedBy: userProfile.name || user.email || "Unknown User",
      lastEditedBy: userProfile.name || user.email || "Unknown User",
    };
    await addExpense(userProfile.householdId, newExpense);
  };

  const handleUpdateMilkEntry = async (date: string, milkmanId: string, entry: { morning?: number, evening?: number }) => {
    if (!user || !userProfile?.householdId) return;
    await updateMilkData(userProfile.householdId, date, milkmanId, entry, user.email || "Unknown User");
  };

  if (loading || authLoading || profileLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Tabs defaultValue="expenses" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="expenses">Expenses</TabsTrigger>
        <TabsTrigger value="milk">Milk</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="expenses">
        <ExpenseTracker expenses={expenses} addExpense={handleAddExpense} />
      </TabsContent>
      <TabsContent value="milk">
        <MilkTracker
          milkData={milkData}
          milkmen={milkmen}
          updateMilkEntry={handleUpdateMilkEntry}
        />
      </TabsContent>
      <TabsContent value="reports">
        <Reports expenses={expenses} milkData={milkData} milkmen={milkmen} />
      </TabsContent>
    </Tabs>
  );
}
