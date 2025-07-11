"use client";

import { useState, useEffect } from "react";
import type { UserProfile } from "@/types";
import { getUserProfile } from "@/lib/firebase-service";

export function useUserProfile(uid: string | undefined) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const profile = await getUserProfile(uid);
        setUserProfile(profile);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [uid]);

  return { userProfile, loading, error };
}
