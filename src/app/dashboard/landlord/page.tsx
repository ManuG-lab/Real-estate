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
import { properties, payments, viewingRequests, users, leases } from '@/lib/data';

// Mocking data for a single landlord (ID: 'user-1')
const MOCK_LANDLORD_ID = 'user-1';

export default function LandlordDashboard() {
  const landlordProperties = properties.filter(
    (p) => p.landlordId === MOCK_LANDLORD_ID
  );
  const propertyIds = landlordProperties.map((p) => p.id);
  
  const landlordLeases = leases.filter(l => propertyIds.includes(l.propertyId));
  const leaseIds = landlordLeases.map(l => l.id);

  const landlordPayments = payments.filter((p) => leaseIds.includes(p.leaseId));
  const landlordViewingRequests = viewingRequests.filter((vr) =>
    propertyIds.includes(vr.propertyId)
  );

  const totalIncome = landlordPayments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const pendingRequests = landlordViewingRequests.filter(vr => vr.status === 'pending').length;
  
  const overduePayments = landlordPayments.filter(p => p.status === 'overdue').length;


  const summaryCards = [
    {
      title: 'Total Properties',
      value: landlordProperties.length,
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
              {landlordPayments.slice(0, 5).map((payment) => {
                const lease = landlordLeases.find((l) => l.id === payment.leaseId);
                const tenant = users.find((u) => u.id === lease?.tenantId);
                const property = properties.find((p) => p.id === lease?.propertyId);

                return (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{tenant?.name || 'N/A'}</TableCell>
                    <TableCell>{property?.name || 'N/A'}</TableCell>
                    <TableCell className="text-right">${payment.amount.toLocaleString()}</TableCell>
                    <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
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
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
