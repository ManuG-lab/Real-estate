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
import { leases, payments, properties, applications } from '@/lib/data';
import { Separator } from '@/components/ui/separator';

// Mocking data for a single tenant (ID: 'user-11')
const MOCK_TENANT_ID = 'user-11';

export default function TenantDashboard() {
  const tenantLease = leases.find((l) => l.tenantId === MOCK_TENANT_ID && l.signed);
  const tenantPayments = tenantLease ? payments.filter((p) => p.leaseId === tenantLease.id) : [];
  const property = tenantLease ? properties.find(p => p.id === tenantLease.propertyId) : null;
  const tenantApplications = applications.filter(a => a.tenantId === MOCK_TENANT_ID);

  const nextPayment = tenantPayments.find(p => p.status === 'pending' || p.status === 'overdue');

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
                        <p className="text-lg font-semibold">{new Date(nextPayment.paymentDate).toLocaleDateString()}</p>
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
                  {tenantPayments.filter(p => p.status === 'paid').slice(0, 5).map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{property?.name}</TableCell>
                      <TableCell className="text-right">${payment.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className="capitalize">{payment.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
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
                      {new Date(tenantLease.startDate).toLocaleDateString()} - {new Date(tenantLease.endDate).toLocaleDateString()}
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
                <ul className="space-y-4">
                {tenantApplications.slice(0,3).map(app => {
                    const appProperty = properties.find(p => p.id === app.propertyId);
                    return (
                        <li key={app.id} className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold">{appProperty?.name}</p>
                                <p className="text-sm text-muted-foreground">Applied: {new Date(app.submittedAt).toLocaleDateString()}</p>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
