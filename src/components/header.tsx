"use client";

import { Logo } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "./ui/button";
import { auth } from "@/lib/firebase";
import { useSignOut } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";

export function Header() {
  const [user] = useAuthState(auth);
  const [signOut] = useSignOut(auth);
  const router = useRouter();

  const handleSignOut = async () => {
    const success = await signOut();
    if (success) {
      router.push('/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Logo className="h-6 w-6 mr-2 text-primary" />
          <span className="font-bold font-headline">My Home</span>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {user && (
            <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign Out">
              <LogOut className="h-5 w-5" />
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
