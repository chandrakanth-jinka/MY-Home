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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { doc, setDoc } from "firebase/firestore";

const formSchema = z.object({
  name: z.string().min(2, { message: "Please enter your name." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export function SignUpForm() {
  const [createUserWithEmailAndPassword, user, loading, error] = useCreateUserWithEmailAndPassword(auth);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const userCred = await createUserWithEmailAndPassword(values.email, values.password);
    if (userCred && userCred.user) {
      // Save name to Firestore user profile
      const userDocRef = doc(db, "users", userCred.user.uid);
      await setDoc(userDocRef, { name: values.name }, { merge: true });
    }
  }

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: error.message,
      });
    }
  }, [error, toast]);

  useEffect(() => {
    if (user) {
      // On successful creation, firebase hook automatically signs them in.
      // Redirect to home to check for household.
      router.push('/');
    }
  }, [user, router]);


  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Create an Account</CardTitle>
        <CardDescription>
          Get started by creating an account. You can then create or join a household.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign Up
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Button variant="link" asChild className="p-0">
            <Link href="/login">Sign In</Link>
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}
