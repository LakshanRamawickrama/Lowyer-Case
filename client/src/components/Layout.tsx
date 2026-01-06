import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileNav />

      <div className="lg:pl-64">
        <main className="py-4 lg:py-8 px-4 lg:px-8 pb-20 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
