'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { SiteLogo } from '@/components/icons';
import {
  LayoutDashboard,
  Building2,
  FileText,
  Wallet,
  Users,
  Bell,
} from 'lucide-react';

const landlordNav = [
  { href: '/dashboard/landlord', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/landlord/properties', label: 'Properties', icon: Building2 },
  { href: '/dashboard/landlord/requests', label: 'Viewing Requests', icon: Users },
  { href: '/dashboard/landlord/leases', label: 'Leases', icon: FileText },
  { href: '/dashboard/landlord/payments', label: 'Payments', icon: Wallet },
];

const tenantNav = [
  { href: '/dashboard/tenant', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/tenant/applications', label: 'Applications', icon: FileText },
  { href: '/dashboard/tenant/lease', label: 'My Lease', icon: Building2 },
  { href: '/dashboard/tenant/payments', label: 'Payments', icon: Wallet },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLandlord = pathname.startsWith('/dashboard/landlord');
  const navItems = isLandlord ? landlordNav : tenantNav;

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <SiteLogo className="size-7 text-primary" />
            <span className="text-lg font-bold font-headline">
              {isLandlord ? 'Landlord' : 'Tenant'} DB
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-2">
            <SidebarTrigger className="sm:hidden" />
            {/* Header content like search or user menu can go here */}
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
