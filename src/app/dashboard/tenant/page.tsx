'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
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
import { Button } from '@/components/ui/button';
import { FileText, CalendarDays, Home, CreditCard, AlertCircle, DollarSign } from 'lucide-react';
import { useCollection, useFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, where, doc, getDoc } from 'firebase/firestore';
import Loading from '@/app/loading';
import { Separator } from '@/components/ui/separator';
import type { Lease, Payment, Property, Application } from '@/lib/types';
import { useState, useEffect, useMemo } from 'react';

// A custom hook to fetch multiple documents by their IDs from a collection.
const useProperties = (propertyIds: string[]) => {
    const { firestore } = useFirebase();
    const [properties, setProperties] = useState<Record<string, Property>>({});
    const [isLoading, setIsLoading] = useState(false);

    const stablePropertyIds = useMemo(() => propertyIds.length > 0 ? propertyIds.sort().join(',') : null, [propertyIds]);

    useEffect(() => {
        if (!firestore || !stablePropertyIds) {
            setProperties({});
            return;
        };

        const fetchProperties = async () => {
            setIsLoading(true);
            const newProperties: Record<string, Property> = {};
            const propertyPromises = propertyIds.map(async (id) => {
                try {
                    const propDocRef = doc(firestore, 'properties', id);
                    const docSnap = await getDoc(propDocRef);
                    if (docSnap.exists()) {
                        return { id: docSnap.id, ...docSnap.data() } as Property;
                    }
                } catch (error) {
                    console.error(`Error fetching property document for ID ${id}:`, error);
                }
                return null;
            });
            
            const resolvedProperties = await Promise.all(propertyPromises);

            resolvedProperties.forEach(prop => {
                if (prop) {
                    newProperties[prop.id] = prop;
                }
            });

            setProperties(newProperties);
            setIsLoading(false);
        };

        fetchProperties();
    }, [firestore, stablePropertyIds, propertyIds]);

    return { properties, isLoading: isLoading };
}

export default function TenantDashboard() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();

  // Find the active lease for the current tenant
  const leaseQuery = useMemo(() => 
    user ? query(collection(firestore, 'leases'), where('tenantId', '==', user.uid), where('signed', '==', true)) : null, 
    [firestore, user]
  );
  const { data: tenantLeases, isLoading: leaseLoading } = useCollection<Lease>(leaseQuery);
  const tenantLease = tenantLeases?.[0]; // Assuming one active lease per tenant

  // Get the property associated with the lease
  const propertyRef = useMemo(() => 
    tenantLease ? doc(firestore, 'properties', tenantLease.propertyId) : null,
    [firestore, tenantLease]
  );
  const { data: property, isLoading: propertyLoading } = useDoc<Property>(propertyRef);

  // Get payments for that lease
  const paymentsQuery = useMemo(() => 
    tenantLease ? query(collection(firestore, 'payments'), where('leaseId', '==', tenantLease.id)) : null,
    [firestore, tenantLease]
  );
  const { data: tenantPayments, isLoading: paymentsLoading } = useCollection<Payment>(paymentsQuery);

  // Get the tenant's applications
  const applicationsQuery = useMemo(() => 
    user ? query(collection(firestore, 'rentalApplications'), where('tenantId', '==', user.uid)) : null,
    [firestore, user]
  );
  const { data: tenantApplications, isLoading: applicationsLoading } = useCollection<Application>(applicationsQuery);
  
  // Get all unique property IDs from the applications
  const applicationPropertyIds = useMemo(() =>
    Array.from(new Set(tenantApplications?.map(app => app.propertyId) || []))
  , [tenantApplications]);

  // Fetch the property documents for all applications
  const { properties: allProperties, isLoading: allPropertiesLoading } = useProperties(applicationPropertyIds as string[]);


  const isLoading = isUserLoading || leaseLoading || propertyLoading || paymentsLoading || applicationsLoading || allPropertiesLoading;
  
  if (isLoading) {
    return <Loading />;
  }

  const nextPayment = tenantPayments?.find(p => p.status === 'pending' || p.status === 'overdue');
  const paidPayments = tenantPayments?.filter(p => p.status === 'paid');

  const getPaymentDate = (payment: Payment) => (payment.paymentDate as any)?.toDate ? (payment.paymentDate as any).toDate() : new Date(payment.paymentDate);
  const getLeaseDate = (lease: Lease, field: 'startDate' | 'endDate') => (lease[field] as any)?.toDate ? (lease[field] as any).toDate() : new Date(lease[field]);
  const getApplicationDate = (app: Application) => (app.submittedAt as any)?.toDate ? (app.submittedAt as any).toDate() : new Date(app.submittedAt);

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Tenant Overview</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {nextPayment && property && (
             <Card className="bg-primary/5 border-primary">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <AlertCircle className="h-6 w-6 text-accent" />
                        <CardTitle className="font-headline text-primary">Rent Due Soon</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div>
                        <p className="text-sm text-muted-foreground">Amount Due</p>
                        <p className="text-2xl font-bold">${nextPayment.amount.toLocaleString()}</p>
                    </div>
                     <div>
                        <p className="text-sm text-muted-foreground">Due Date</p>
                        <p className="text-lg font-semibold">{getPaymentDate(nextPayment).toLocaleDateString()}</p>
                    </div>
                    <Button size="lg" className="w-full md:w-auto md:justify-self-end bg-accent hover:bg-accent/90 text-accent-foreground">
                        <CreditCard className="mr-2 h-5 w-5"/>
                        Pay Now
                    </Button>
                </CardContent>
             </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Payment History</CardTitle>
              <CardDescription>Your record of all past rent payments.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paidPayments && paidPayments.length > 0 ? (
                    paidPayments.slice(0, 5).map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{getPaymentDate(payment).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{property?.name}</TableCell>
                        <TableCell className="text-right">${payment.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className="capitalize">{payment.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                     <TableRow>
                        <TableCell colSpan={4} className="text-center">No paid payments found.</TableCell>
                     </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {tenantLease && property ? (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">My Active Lease</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Home className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Property</p>
                    <p className="font-semibold">{property.name}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Lease Period</p>
                    <p className="font-semibold">
                      {getLeaseDate(tenantLease, 'startDate').toLocaleDateString()} - {getLeaseDate(tenantLease, 'endDate').toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Rent</p>
                    <p className="font-semibold">${tenantLease.rentAmount.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                 <Button variant="outline" className="w-full">
                    <FileText className="mr-2 h-4 w-4"/>
                    View Full Lease
                 </Button>
              </CardFooter>
            </Card>
          ) : (
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">No Active Lease</CardTitle>
                    <CardDescription>You do not have an active lease. Browse rentals to find your next home.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Button asChild className="w-full">
                        <a href="/">Browse Rentals</a>
                     </Button>
                </CardContent>
             </Card>
          )}

           <Card>
            <CardHeader>
              <CardTitle className="font-headline">My Applications</CardTitle>
            </CardHeader>
            <CardContent>
                {tenantApplications && tenantApplications.length > 0 ? (
                    <ul className="space-y-4">
                    {tenantApplications.slice(0,3).map(app => {
                        const appProperty = allProperties[app.propertyId];
                        return (
                            <li key={app.id} className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">{appProperty?.name || 'Loading...'}</p>
                                    <p className="text-sm text-muted-foreground">Applied: {getApplicationDate(app).toLocaleDateString()}</p>
                                </div>
                                <Badge
                                    variant={
                                    app.status === 'approved'
                                        ? 'default'
                                        : app.status === 'declined'
                                        ? 'destructive'
                                        : 'secondary'
                                    }
                                    className="capitalize"
                                >
                                    {app.status}
                                </Badge>
                            </li>
                        )
                    })}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground text-center">No applications found.</p>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
