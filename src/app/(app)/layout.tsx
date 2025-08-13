import { Logo } from "@/components/dashboard/logo";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LifeBuoy } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter>
            <Button variant="ghost" className="w-full justify-start gap-2">
                <LifeBuoy className="size-4" />
                <span className="group-data-[collapsible=icon]:hidden">Support</span>
            </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <DashboardHeader />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
