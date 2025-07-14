"use client";

import { Logo } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "./ui/button";
import { auth } from "@/lib/firebase";
import { useSignOut } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useUserProfile, leaveHousehold as leaveHouseholdUtil } from "@/hooks/useUserProfile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function Header() {
  const [user] = useAuthState(auth);
  const [signOut] = useSignOut(auth);
  const router = useRouter();

  const { userProfile } = useUserProfile(user?.uid);

  const handleLeaveHousehold = async () => {
    if (!user?.uid) return;
    await leaveHouseholdUtil(user.uid);
    router.push("/household");
  };

  const handleSignOut = async () => {
    localStorage.removeItem('house_id');
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Sign Out">
                  <LogOut className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {userProfile?.householdId && (
                  <DropdownMenuItem onClick={handleLeaveHousehold}>
                    Leave Household
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleSignOut}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
