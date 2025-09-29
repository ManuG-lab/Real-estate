'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Home, Building, User, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { SiteLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useAuth, useUser } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);

  const navLinks = [
    { href: '/', label: 'Rentals', icon: Home },
    ...(userRole === 'landlord' ? [{ href: '/dashboard/landlord', label: 'Dashboard', icon: LayoutDashboard }] : []),
    ...(userRole === 'tenant' ? [{ href: '/dashboard/tenant', label: 'Dashboard', icon: LayoutDashboard }] : []),
  ];

  useEffect(() => {
    if (user) {
      const fetchUserRole = async () => {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        }
      };
      fetchUserRole();
    } else {
      setUserRole(null);
    }
  }, [user, firestore]);

  const handleLogout = async () => {
    await auth.signOut();
    toast({
        title: "Logged Out",
        description: "You have been successfully logged out."
    })
    router.push('/login');
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return '';
    const names = name.split(' ');
    return names.map(n => n[0]).join('');
  }


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center gap-2">
          <SiteLogo className="h-8 w-8" />
          <span className="hidden font-bold sm:inline-block font-headline text-lg">
            RealEstateConnect
          </span>
        </Link>

        {!pathname.startsWith('/dashboard') && (
            <nav className="hidden items-center gap-6 text-sm md:flex">
            {navLinks.map((link) => (
                <Link
                key={link.href}
                href={link.href}
                className={cn(
                    'transition-colors hover:text-foreground/80',
                    pathname === link.href
                    ? 'text-foreground font-semibold'
                    : 'text-foreground/60'
                )}
                >
                {link.label}
                </Link>
            ))}
            </nav>
        )}

        <div className="flex flex-1 items-center justify-end gap-4">
          {!isUserLoading && user ? (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                      <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push(userRole === 'landlord' ? '/dashboard/landlord' : '/dashboard/tenant')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                     <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          ) : (
            <div className='hidden md:flex items-center gap-2'>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 p-6">
                <Link href="/" className="mr-6 flex items-center gap-2">
                  <SiteLogo className="h-8 w-8" />
                  <span className="font-bold sm:inline-block font-headline text-lg">
                    RealEstateConnect
                  </span>
                </Link>
                <div className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center gap-3 rounded-md p-2 text-lg font-medium hover:bg-muted"
                      >
                        <link.icon className="h-5 w-5" />
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                </div>
                <div className="mt-auto flex flex-col gap-2">
                   {!isUserLoading && !user && (
                    <>
                        <SheetClose asChild>
                            <Button variant="outline" asChild>
                            <Link href="/login">Login</Link>
                            </Button>
                        </SheetClose>
                        <SheetClose asChild>
                            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                            <Link href="/signup">Sign Up</Link>
                            </Button>
                        </SheetClose>
                    </>
                   )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
