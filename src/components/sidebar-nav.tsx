"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Package,
  BarChart3,
  BrainCircuit,
  Settings,
  PackagePlus,
  LogOut,
  Wrench
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventário", icon: Package },
  { href: "/compatibility", label: "Compatibilidade", icon: Wrench },
  { href: "/reports", label: "Relatórios", icon: BarChart3 },
  { href: "/recommendations", label: "Recomendações", icon: BrainCircuit },
];

const settingsItem = { href: "/settings", label: "Configurações", icon: Settings };

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <PackagePlus className="w-8 h-8 text-primary" />
          <h1 className="text-xl font-bold font-headline group-data-[collapsible=icon]:hidden">
            Stock Master
          </h1>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
                className="justify-start"
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
         <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === settingsItem.href} tooltip={settingsItem.label} className="justify-start">
                    <Link href={settingsItem.href}>
                        <settingsItem.icon className="h-5 w-5" />
                        <span className="group-data-[collapsible=icon]:hidden">{settingsItem.label}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton tooltip="Sair" className="justify-start">
                    <LogOut className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">Sair</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
