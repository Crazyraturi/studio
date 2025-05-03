// src/components/AppSidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Upload,
  Mail,
  Users,
  CalendarClock, // Changed Settings to CalendarClock for Schedule
  BarChart3,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const AppSidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard, tooltip: 'Dashboard' },
    { href: '/upload', label: 'Upload CSV', icon: Upload, tooltip: 'Upload CSV' },
    { href: '/templates', label: 'Email Templates', icon: Mail, tooltip: 'Email Templates' },
    { href: '/recipients', label: 'Recipients', icon: Users, tooltip: 'Manage Recipients' },
    { href: '/schedule', label: 'Schedule Emails', icon: CalendarClock, tooltip: 'Schedule Emails' }, // Updated icon
    { href: '/analytics', label: 'Analytics', icon: BarChart3, tooltip: 'Analytics' },
  ];

  return (
    <>
      <SidebarHeader className="flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-primary">
          {/* New SVG Logo */}
           <svg
             xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 512 512"
             fill="currentColor"
             className="h-6 w-6 text-accent"
             aria-label="InviteAI Logo"
           >
            <path fill="#FCD55F" d="M329.13 132.078c-29.34 0-53.13 23.79-53.13 53.13s23.79 53.13 53.13 53.13 53.13-23.79 53.13-53.13-23.79-53.13-53.13-53.13zm0 86.53c-18.42 0-33.39-14.97-33.39-33.39s14.97-33.39 33.39-33.39 33.39 14.97 33.39 33.39-14.97 33.39-33.39 33.39z"/>
            <path fill="#F7931E" d="M329.13 165.47c-11.04 0-20 8.96-20 20s8.96 20 20 20 20-8.96 20-20-8.96-20-20-20zm-18.12-18.12c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm36.23 0c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm18.12 18.12c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm-36.23 18.12c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm-18.12 0c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm-18.12-18.12c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm36.23-18.12c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
            <path fill="#F8F9FA" d="M382.26 85.74H182.93c-17.73 0-32.12 14.38-32.12 32.12v164.08h263.56V117.86c0-17.74-14.38-32.12-32.13-32.12z"/>
            <path fill="#2E3A59" d="M329.13 100.68c-46.02 0-83.52 37.5-83.52 83.52s37.5 83.52 83.52 83.52 83.52-37.5 83.52-83.52-37.5-83.52-83.52-83.52zm0 147.31c-35.15 0-63.78-28.63-63.78-63.78s28.63-63.78 63.78-63.78 63.78 28.63 63.78 63.78-28.63 63.78-63.78 63.78z"/>
            <path fill="#FF6B6B" d="M506.43 188.51L304.74 339.4c-8.85 6.88-19.61 10.6-30.74 10.6s-21.89-3.73-30.74-10.6L37.57 188.51c-13.37-10.38-15.3-29.04-4.92-42.42 10.38-13.37 29.04-15.3 42.42-4.92L256 273.1l180.93-131.93c13.37-10.38 32.04-8.45 42.42 4.92 10.38 13.37 8.45 32.04-4.92 42.42z"/>
            <path fill="#E95757" d="M506.43 188.51L274 329.91c-4.24 3.29-9.39 5.09-14.74 5.09L37.57 188.51c-13.37-10.38-15.3-29.04-4.92-42.42 10.38-13.37 29.04-15.3 42.42-4.92L256 273.1l180.93-131.93c13.37-10.38 32.04-8.45 42.42 4.92 10.38 13.37 8.45 32.04-4.92 42.42z"/>
            <path fill="#FF8A8A" d="M473.91 426.26H38.09C17.08 426.26 0 409.18 0 388.17V260.33l241.26 186.49c4.24 3.29 9.39 5.09 14.74 5.09s10.5-1.8 14.74-5.09L512 260.33v127.84c0 21.01-17.08 38.09-38.09 38.09z"/>
            <path fill="#F06565" d="M256 451.91c5.35 0 10.5-1.8 14.74-5.09L512 260.33v127.84c0 21.01-17.08 38.09-38.09 38.09H256V451.91z"/>
          </svg>
          <span className="group-data-[collapsible=icon]:hidden">InviteAI</span>
        </Link>
        <SidebarTrigger className="md:hidden" />
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-auto p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.tooltip}
                >
                  <a>
                    <item.icon />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
             <AvatarImage src="https://picsum.photos/40/40" alt="User Avatar" data-ai-hint="placeholder avatar" />
            <AvatarFallback>BE</AvatarFallback>
          </Avatar>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-medium text-sidebar-foreground">BEF Staff</span>
            <span className="text-xs text-muted-foreground">Admin</span>
          </div>
        </div>
      </SidebarFooter>
    </>
  );
};

export default AppSidebar;
