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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { useToast } from "@/hooks/use-toast";
import { createHousehold } from "@/lib/firebase-service";
import type { User } from "firebase/auth";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(3, { message: "Household name must be at least 3 characters." }).max(50),
  pin: z.string().length(4, { message: "PIN must be exactly 4 digits." }).regex(/^\d{4}$/, "PIN must be numeric."),
});

interface CreateHouseholdFormProps {
  user: User;
  onCreated: () => void;
}

export function CreateHouseholdForm({ user, onCreated }: CreateHouseholdFormProps) {
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
      await createHousehold(user, values.name, values.pin);
      toast({
        title: "Household Created!",
        description: `Welcome to ${values.name}!`,
      });
      onCreated();
    } catch (error: any) {
      console.error("Household creation failed:", error);
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: error.message || "Could not create the household. Please try again.",
      });
    } finally {
        setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Household</CardTitle>
        <CardDescription>
          Give your household a name and a 4-digit PIN for others to join.
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
                  <FormDescription>
                    Other members will use this PIN to join.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Household
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
