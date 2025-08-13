'use client';
import {
  LayoutDashboard,
  CalendarDays,
  Inbox,
  BarChart3,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const navItems = [
    { href: "/planner", icon: LayoutDashboard, label: "Planner" },
    { href: "/calendar", icon: CalendarDays, label: "Calendar" },
    { href: "/inbox", icon: Inbox, label: "Inbox" },
    { href: "/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/settings", icon: Settings, label: "Settings" },
];

export function SidebarNav() {
    const pathname = usePathname();

    return (
        <SidebarMenu>
            {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        tooltip={{children: item.label}}
                    >
                        <Link href={item.href}>
                            <item.icon />
                            <span>{item.label}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    );
}
