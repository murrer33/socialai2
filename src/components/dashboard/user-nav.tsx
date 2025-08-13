
'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, CreditCard, Settings, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

type Role = 'Owner' | 'Editor';

export function UserNav() {
  const { toast } = useToast();
  const [role, setRole] = useState<Role>('Owner');

  const handleSwitchRole = () => {
    const newRole = role === 'Owner' ? 'Editor' : 'Owner';
    setRole(newRole);
    toast({
        title: "Role Switched",
        description: `You are now acting as an ${newRole}.`,
    })
  }
  
  const user = {
      name: role === 'Owner' ? 'SME Owner' : 'Content Editor',
      email: role === 'Owner' ? 'owner@example.com' : 'editor@example.com',
      fallback: role === 'Owner' ? 'SO' : 'CE',
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={`https://placehold.co/40x40.png?text=${user.fallback}`} alt={user.name} />
            <AvatarFallback>{user.fallback}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
           <DropdownMenuItem disabled={role === 'Editor'}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
         <DropdownMenuItem onClick={handleSwitchRole}>
            <Users className="mr-2 h-4 w-4" />
            <span>Switch to {role === 'Owner' ? 'Editor' : 'Owner'}</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
