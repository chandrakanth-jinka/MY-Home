import { Dashboard } from "@/components/dashboard";
import { Header } from "@/components/header";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <Dashboard />
      </main>
    </div>
  );
}
