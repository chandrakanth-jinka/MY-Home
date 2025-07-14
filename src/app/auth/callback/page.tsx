"use client";
import { useEffect } from "react";
import { getAuth, getRedirectResult } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          router.push("/dashboard");
        } else {
          router.push("/login");
        }
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  return <div className="flex min-h-screen items-center justify-center">Signing you in...</div>;
}