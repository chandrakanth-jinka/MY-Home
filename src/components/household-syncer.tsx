"use client";
import { useSyncHousehold } from '@/hooks/useUserProfile';

export function HouseholdSyncer() {
  useSyncHousehold();
  return null;
} 