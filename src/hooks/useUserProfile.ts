"use client";

import { useState, useEffect } from "react";
import type { UserProfile } from "@/types";
import { getUserProfile } from "@/lib/firebase-service";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteField } from "firebase/firestore";

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

export function useSyncHousehold() {
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      let houseId = typeof window !== 'undefined' ? localStorage.getItem('house_id') : null;
      if (!houseId) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.householdId) {
            localStorage.setItem('house_id', data.householdId);
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);
}

export async function leaveHousehold(uid: string) {
  localStorage.removeItem('house_id');
  await updateDoc(doc(db, 'users', uid), { householdId: deleteField() });
}
