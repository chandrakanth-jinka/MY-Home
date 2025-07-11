"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { useToast } from "@/hooks/use-toast";
import { joinHousehold } from "@/lib/firebase-service";
import type { User } from "firebase/auth";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
    name: z.string().min(3, { message: "Household name must be at least 3 characters." }).max(50),
    pin: z.string().length(4, { message: "PIN must be exactly 4 digits." }).regex(/^\d{4}$/, "PIN must be numeric."),
  });

interface JoinHouseholdFormProps {
  user: User;
  onJoined: () => void;
}

export function JoinHouseholdForm({ user, onJoined }: JoinHouseholdFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      pin: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const success = await joinHousehold(user, values.name, values.pin);
      if (success) {
        toast({
          title: "Joined Household!",
          description: `You are now a member of ${values.name}.`,
        });
        onJoined();
      } else {
        throw new Error("Household not found or PIN is incorrect.");
      }
    } catch (error: any) {
      console.error("Failed to join household:", error);
      toast({
        variant: "destructive",
        title: "Join Failed",
        description: error.message || "Could not join the household. Check the name and PIN.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join an Existing Household</CardTitle>
        <CardDescription>
          Enter the household name and 4-digit PIN to join.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Household Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. The Smiths" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>4-Digit PIN</FormLabel>
                  <FormControl>
                    <Input type="password" maxLength={4} placeholder="e.g. 1234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Join Household
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
