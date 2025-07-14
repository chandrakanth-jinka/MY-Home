"use client";
import { HouseholdSyncer } from './household-syncer';

export function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <HouseholdSyncer />
            {children}
        </>
    );
} 