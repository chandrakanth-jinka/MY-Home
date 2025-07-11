import { HouseholdManager } from "@/components/auth/household-manager";
import { Header } from "@/components/header";

export default function HouseholdPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
       <Header />
      <main className="flex flex-1 items-center justify-center p-4">
        <HouseholdManager />
      </main>
    </div>
  );
}
