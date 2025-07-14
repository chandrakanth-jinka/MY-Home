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
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { GoogleAuthProvider, signInWithPopup, fetchSignInMethodsForEmail } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password cannot be empty." }),
});

export function LoginForm() {
  const [signInWithEmailAndPassword, user, loading, error] = useSignInWithEmailAndPassword(auth);
  const { toast } = useToast();
  const router = useRouter();
  const [googleLoading, setGoogleLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await signInWithEmailAndPassword(values.email, values.password);
  }

  function isInWebView() {
    // Simple check for iOS/Android WebView
    const ua = window.navigator.userAgent || '';
    return (
      (ua.includes('wv') || // Android WebView
        ua.includes('WebView')) && // iOS WebView
      !window.navigator.standalone
    );
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      if (isInWebView()) {
        toast({
          variant: "destructive",
          title: "Google Sign-In Not Supported",
          description: "Google sign-in is not supported in this environment. Please open the app in your device's browser.",
        });
        return;
      }
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        await setDoc(
          userDocRef,
          {
            uid: user.uid,
            email: user.email,
            name: user.displayName || "",
            providers: user.providerData.map((p) => p.providerId),
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
      // Redirect to home/dashboard after successful sign-in
      router.push("/");
    } catch (error: any) {
      if (error.code === "auth/account-exists-with-different-credential") {
        const email = error.customData?.email;
        if (email) {
          const methods = await fetchSignInMethodsForEmail(auth, email);
          if (methods.includes("password")) {
            toast({
              variant: "destructive",
              title: "Account Exists",
              description:
                "An account already exists with this email using a password. Please sign in with your email and password first, then link your Google account from your profile settings.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Account Exists",
              description: `An account already exists with this email using: ${methods.join(", ")}. Please sign in with that method first, then link your Google account from your profile settings.`,
            });
          }
        } else {
          toast({
            variant: "destructive",
            title: "Account Exists",
            description:
              "An account already exists with this email. Please sign in with your original method first, then link your Google account from your profile settings.",
          });
        }
      } else if (error.code === "auth/popup-blocked") {
        toast({
          variant: "destructive",
          title: "Popup Blocked",
          description: "Your browser blocked the Google sign-in popup. Please allow popups and try again, or use a different browser.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Google Sign-In Failed",
          description: error.message,
        });
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message,
      });
    }
  }, [error, toast]);

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Welcome Back!</CardTitle>
        <CardDescription>Enter your credentials to access your household.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              Sign In
            </Button>
          </form>
        </Form>
        <div className="my-4 flex items-center justify-center">
          <span className="text-xs text-muted-foreground">or</span>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center py-3 text-base md:text-sm"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
        >
          {googleLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <svg className="mr-2 h-5 w-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.22l6.85-6.85C36.68 2.36 30.74 0 24 0 14.82 0 6.71 5.48 2.69 13.44l7.98 6.2C12.13 13.13 17.62 9.5 24 9.5z" /><path fill="#34A853" d="M46.1 24.5c0-1.64-.15-3.22-.42-4.74H24v9.04h12.42c-.54 2.9-2.18 5.36-4.64 7.04l7.18 5.6C43.98 37.36 46.1 31.36 46.1 24.5z" /><path fill="#FBBC05" d="M10.67 28.04c-1.04-3.1-1.04-6.44 0-9.54l-7.98-6.2C.64 16.36 0 20.06 0 24c0 3.94.64 7.64 2.69 11.7l7.98-6.2z" /><path fill="#EA4335" d="M24 48c6.74 0 12.68-2.24 16.98-6.12l-7.18-5.6c-2.02 1.36-4.6 2.16-7.8 2.16-6.38 0-11.87-3.63-14.33-8.94l-7.98 6.2C6.71 42.52 14.82 48 24 48z" /><path fill="none" d="M0 0h48v48H0z" /></g></svg>
          Continue with Google
        </Button>
        <div className="mt-2 text-xs text-center text-muted-foreground md:text-sm">
          New or returning users can use Google to sign up or sign in instantly.
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Button variant="link" asChild className="p-0">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}
