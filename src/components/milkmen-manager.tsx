
"use client";

import React, { useState } from "react";
import type { Milkman } from "@/types";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Edit, Trash2, PlusCircle, Check, X } from "lucide-react";
import { addMilkman, updateMilkman, deleteMilkman } from "@/lib/firebase-service";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface MilkmenManagerProps {
  milkmen: Milkman[];
}

export function MilkmenManager({ milkmen }: MilkmenManagerProps) {
  const [user] = useAuthState(auth);
  const { userProfile } = useUserProfile(user?.uid);
  const { toast } = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [newMilkmanName, setNewMilkmanName] = useState("");
  const [newMilkmanRate, setNewMilkmanRate] = useState<number | "">("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingRate, setEditingRate] = useState<number | "">("");

  const householdId = userProfile?.householdId;
  const MAX_MILKMEN = 5;

  const handleAddClick = () => {
    setIsAdding(true);
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewMilkmanName("");
    setNewMilkmanRate("");
  };

  const handleSaveNewMilkman = async () => {
    if (!householdId || !newMilkmanName || newMilkmanRate === "") return;
    try {
      await addMilkman(householdId, newMilkmanName, Number(newMilkmanRate));
      toast({ title: "Milkman Added", description: `${newMilkmanName} has been added.` });
      handleCancelAdd();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to add milkman." });
    }
  };

  const handleEditClick = (milkman: Milkman) => {
    setEditingId(milkman.id);
    setEditingName(milkman.name);
    setEditingRate(milkman.rate);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
    setEditingRate("");
  };

  const handleSaveEdit = async (milkmanId: string) => {
    if (!householdId || !editingName || editingRate === "") return;
    try {
      await updateMilkman(householdId, milkmanId, editingName, Number(editingRate));
      toast({ title: "Milkman Updated", description: `Details for ${editingName} updated.` });
      handleCancelEdit();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update milkman." });
    }
  };

  const handleDelete = async (milkmanId: string) => {
    if (!householdId) return;
    try {
      await deleteMilkman(householdId, milkmanId);
      toast({ title: "Milkman Deleted", description: "The milkman has been removed." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete milkman." });
    }
  };

  const isAddFormValid = newMilkmanName.trim().length > 0 && newMilkmanRate !== "";

  return (
    <div className="p-2 border rounded-md">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">Milk Suppliers</h3>
      <div className="space-y-2">
        {milkmen.map((milkman) =>
          editingId === milkman.id ? (
            // Editing State
            <div key={milkman.id} className="flex items-center gap-2 p-2 border rounded-md">
              <Input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                className="h-8"
                placeholder="Name"
              />
              <Input
                type="number"
                value={editingRate}
                onChange={(e) => setEditingRate(e.target.value === '' ? '' : Number(e.target.value))}
                className="h-8 w-24"
                placeholder="Rate/L"
              />
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleSaveEdit(milkman.id)}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancelEdit}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            // Display State
            <div key={milkman.id} className="flex items-center justify-between p-2 border rounded-md">
              <span className="font-medium">{milkman.name} (₹{milkman.rate}/L)</span>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEditClick(milkman)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will delete {milkman.name} from your list of suppliers. Past milk records will not be affected. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(milkman.id)} className="bg-destructive hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )
        )}
        {isAdding && (
          <div className="flex items-center gap-2 p-2 border rounded-md border-dashed">
            <Input
              value={newMilkmanName}
              onChange={(e) => setNewMilkmanName(e.target.value)}
              placeholder="New milkman name"
              className="h-8"
            />
             <Input
                type="number"
                value={newMilkmanRate}
                onChange={(e) => setNewMilkmanRate(e.target.value === '' ? '' : Number(e.target.value))}
                className="h-8 w-24"
                placeholder="Rate/L"
              />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8" disabled={!isAddFormValid}>
                  <Check className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Add a new supplier?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will add "{newMilkmanName}" with a rate of ₹{Number(newMilkmanRate)}/L to your list of suppliers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSaveNewMilkman}>
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancelAdd}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      {!isAdding && milkmen.length < MAX_MILKMEN && (
        <Button variant="outline" size="sm" className="mt-2 w-full" onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Milkman
        </Button>
      )}
    </div>
  );
}
