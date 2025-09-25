'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  LogOut
} from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import Loading from '@/app/loading';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [userRole, setUserRole] = useState<string | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    const fetchUserRole = async () => {
      setIsRoleLoading(true);
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        setUserRole(role);

        // Redirect if role doesn't match the current dashboard path
        if (role === 'landlord' && !pathname.startsWith('/dashboard/landlord')) {
          router.replace('/dashboard/landlord');
        } else if (role === 'tenant' && !pathname.startsWith('/dashboard/tenant')) {
          router.replace('/dashboard/tenant');
        }
      } else {
        // Handle case where user exists in Auth but not in Firestore
        console.error("User document not found in Firestore.");
        router.push('/login');
      }
      setIsRoleLoading(false);
    };

    fetchUserRole();
  }, [user, isUserLoading, router, firestore, pathname]);

  const handleLogout = async () => {
    await auth.signOut();
    toast({
        title: "Logged Out",
        description: "You have been successfully logged out."
    })
    router.push('/login');
  };

  if (isUserLoading || isRoleLoading) {
    return <Loading />;
  }

  const isLandlord = userRole === 'landlord';
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
                <Link href={item.href}>
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
        <SidebarContent className="!flex-grow-0">
            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
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
