'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Building2, DollarSign, Users, CalendarClock } from 'lucide-react';
import { useCollection, useFirebase, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import Loading from '@/app/loading';
import type { Property, Payment, ViewingRequest, Lease, User } from '@/lib/types';

export default function LandlordDashboard() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();

  const propertiesQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'properties'), where('landlordId', '==', user.uid)) : null
  , [firestore, user]);
  const { data: landlordProperties, isLoading: propertiesLoading } = useCollection<Property>(propertiesQuery);
  
  const propertyIds = landlordProperties?.map((p) => p.id) || [];

  const leasesQuery = useMemoFirebase(() => 
    user && propertyIds.length > 0 ? query(collection(firestore, 'leases'), where('propertyId', 'in', propertyIds)) : null
  , [firestore, user, landlordProperties]);
  const { data: landlordLeases, isLoading: leasesLoading } = useCollection<Lease>(leasesQuery);

  const leaseIds = landlordLeases?.map((l) => l.id) || [];

  const paymentsQuery = useMemoFirebase(() => 
    user && leaseIds.length > 0 ? query(collection(firestore, 'payments'), where('leaseId', 'in', leaseIds)) : null
  , [firestore, user, landlordLeases]);
  const { data: landlordPayments, isLoading: paymentsLoading } = useCollection<Payment>(paymentsQuery);
  
  const requestsQuery = useMemoFirebase(() =>
    user && propertyIds.length > 0 ? query(collection(firestore, 'viewingRequests'), where('propertyId', 'in', propertyIds)) : null
  , [firestore, user, landlordProperties]);
  const { data: landlordViewingRequests, isLoading: requestsLoading } = useCollection<ViewingRequest>(requestsQuery);

  // We need to fetch all tenants to display their names
  const tenantsQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'users'), where('role', '==', 'tenant')) : null
  , [firestore, user]);
  const { data: tenants, isLoading: tenantsLoading } = useCollection<User>(tenantsQuery);


  const isLoading = isUserLoading || propertiesLoading || leasesLoading || paymentsLoading || requestsLoading || tenantsLoading;

  if (isLoading) {
    return <Loading />;
  }

  const totalIncome = landlordPayments
    ?.filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0) || 0;
  
  const pendingRequests = landlordViewingRequests?.filter(vr => vr.status === 'pending').length || 0;
  
  const overduePayments = landlordPayments?.filter(p => p.status === 'overdue').length || 0;

  const summaryCards = [
    {
      title: 'Total Properties',
      value: landlordProperties?.length || 0,
      icon: Building2,
      description: 'Properties you manage',
    },
    {
      title: 'Total Income',
      value: `$${totalIncome.toLocaleString()}`,
      icon: DollarSign,
      description: 'From all paid rents',
    },
    {
      title: 'Viewing Requests',
      value: pendingRequests,
      icon: Users,
      description: 'New pending requests',
    },
    {
      title: 'Overdue Payments',
      value: overduePayments,
      icon: CalendarClock,
      description: 'Tenants with late payments',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Landlord Overview</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Recent Rent Payments</CardTitle>
          <CardDescription>A log of the most recent tenant payments.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant</TableHead>
                <TableHead>Property</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {landlordPayments && landlordPayments.length > 0 ? (
                landlordPayments.slice(0, 5).map((payment) => {
                  const lease = landlordLeases?.find((l) => l.id === payment.leaseId);
                  const tenant = tenants?.find((u) => u.id === lease?.tenantId);
                  const property = landlordProperties?.find((p) => p.id === lease?.propertyId);

                  // Firestore timestamps need to be converted to JS Dates
                  const paymentDate = (payment.paymentDate as any)?.toDate ? (payment.paymentDate as any).toDate() : new Date(payment.paymentDate);

                  return (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{tenant?.name || 'N/A'}</TableCell>
                      <TableCell>{property?.name || 'N/A'}</TableCell>
                      <TableCell className="text-right">${payment.amount.toLocaleString()}</TableCell>
                      <TableCell>{paymentDate.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.status === 'paid'
                              ? 'default'
                              : payment.status === 'overdue'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="capitalize"
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">No payments found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
