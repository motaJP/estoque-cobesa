import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { SidebarNav } from "./sidebar-nav";
import { Header } from "./header";
import { CompatibilityChat } from "@/app/compatibility/components/compatibility-chat";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNav />
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="p-4 sm:p-6 lg:p-8 bg-background/95">
          {children}
        </main>
        <CompatibilityChat />
      </SidebarInset>
    </SidebarProvider>
  );
}
