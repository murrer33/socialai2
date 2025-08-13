'use client'

import { UserNav } from "@/components/dashboard/user-nav";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePathname } from "next/navigation";

const getTitleFromPathname = (pathname: string) => {
    const segment = pathname.split('/').pop() || 'planner';
    if (segment === 'app') return 'Planner';
    return segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function DashboardHeader() {
    const pathname = usePathname();
    const title = getTitleFromPathname(pathname);

    return (
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-card px-4 sm:px-6">
            <SidebarTrigger className="md:hidden" />
            <h1 className="hidden text-xl font-semibold md:block">{title}</h1>
            <div className="relative ml-auto flex-1 md:grow-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                />
            </div>
            <Button className="gap-1 hidden sm:flex" size="sm">
                <PlusCircle className="h-4 w-4" />
                New Post
            </Button>
            <UserNav />
        </header>
    );
}
