import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "./user-nav";

export function Header() {
  return (
    <header className="sticky top-0 z-10 w-full bg-background/95 shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between h-16 px-4 border-b sm:px-6 lg:px-8">
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        <div className="hidden md:block">
          {/* Could add breadcrumbs or page title here */}
        </div>
        <div className="flex items-center gap-4 ml-auto">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
