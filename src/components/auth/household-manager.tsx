"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateHouseholdForm } from "./create-household-form";
import { JoinHouseholdForm } from "./join-household-form";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function HouseholdManager() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.replace('/login');
    return null;
  }
  
  const onHouseholdSet = () => {
    router.replace('/dashboard');
  }

  return (
    <Tabs defaultValue="join" className="w-full max-w-md">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="join">Join Household</TabsTrigger>
        <TabsTrigger value="create">Create Household</TabsTrigger>
      </TabsList>
      <TabsContent value="join">
        <JoinHouseholdForm user={user} onJoined={onHouseholdSet} />
      </TabsContent>
      <TabsContent value="create">
        <CreateHouseholdForm user={user} onCreated={onHouseholdSet} />
      </TabsContent>
    </Tabs>
  );
}
