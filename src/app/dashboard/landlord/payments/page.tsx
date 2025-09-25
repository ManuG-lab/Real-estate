'use client';

import * as React from 'react';
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from '@tanstack/react-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DataTable } from '@/components/data-table';
import { useCollection, useFirebase, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import Loading from '@/app/loading';
import type { Payment, Lease, Property, User } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

interface PaymentData extends Payment {
  tenantName: string;
  propertyName: string;
}

export default function LandlordPaymentsPage() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [paymentData, setPaymentData] = React.useState<PaymentData[]>([]);
  const [dataLoading, setDataLoading] = React.useState(true);

  const leasesQuery = useMemoFirebase(
    () => user ? query(collection(firestore, 'leases'), where('landlordId', '==', user.uid)) : null,
    [firestore, user]
  );
  const { data: leases, isLoading: leasesLoading } = useCollection<Lease>(leasesQuery);

  const leaseIds = React.useMemo(() => leases?.map(l => l.id) || [], [leases]);

  const paymentsQuery = useMemoFirebase(
    () => leaseIds.length > 0 ? query(collection(firestore, 'payments'), where('leaseId', 'in', leaseIds)) : null,
    [firestore, leaseIds]
  );
  const { data: payments, isLoading: paymentsLoading } = useCollection<Payment>(paymentsQuery);

  React.useEffect(() => {
    if (paymentsLoading || !payments || !leases || !firestore) return;

    const fetchData = async () => {
      setDataLoading(true);
      const tenantIds = Array.from(new Set(leases.map((l) => l.tenantId)));
      const propertyIds = Array.from(new Set(leases.map((l) => l.propertyId)));

      const tenants: Record<string, User> = {};
      if (tenantIds.length > 0) {
        // Firestore 'in' query has a limit of 30 elements.
        // We'd need to chunk this for larger datasets.
        const tenantsQuery = query(collection(firestore, 'users'), where('id', 'in', tenantIds.slice(0,30)));
        const tenantsSnapshot = await getDocs(tenantsQuery);
        tenantsSnapshot.forEach((doc) => {
          tenants[doc.id] = { id: doc.id, ...doc.data() } as User;
        });
      }

      const properties: Record<string, Property> = {};
      if (propertyIds.length > 0) {
        const propertiesQuery = query(collection(firestore, 'properties'), where('id', 'in', propertyIds.slice(0,30)));
        const propertiesSnapshot = await getDocs(propertiesQuery);
        propertiesSnapshot.forEach((doc) => {
          properties[doc.id] = { id: doc.id, ...doc.data() } as Property;
        });
      }
      
      const combinedData = payments.map((payment) => {
        const lease = leases.find(l => l.id === payment.leaseId);
        const tenant = lease ? tenants[lease.tenantId] : undefined;
        const property = lease ? properties[lease.propertyId] : undefined;

        return {
          ...payment,
          tenantName: tenant?.name || 'N/A',
          propertyName: property?.name || 'N/A',
        };
      });

      setPaymentData(combinedData);
      setDataLoading(false);
    };

    fetchData();
  }, [payments, paymentsLoading, leases, firestore]);

  const columns: ColumnDef<PaymentData>[] = [
    {
      accessorKey: 'tenantName',
      header: 'Tenant',
    },
    {
      accessorKey: 'propertyName',
      header: 'Property',
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'));
        const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: 'paymentDate',
      header: 'Date',
      cell: ({ row }) => {
         const date = (row.getValue('paymentDate') as any)?.toDate ? (row.getValue('paymentDate') as any).toDate() : new Date(row.getValue('paymentDate'));
         return <span>{format(date, 'PPP')}</span>;
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          variant={
            row.getValue('status') === 'paid'
              ? 'default'
              : row.getValue('status') === 'overdue'
              ? 'destructive'
              : 'secondary'
          }
          className="capitalize"
        >
          {row.getValue('status')}
        </Badge>
      ),
    },
  ];

  const table = useReactTable({
    data: paymentData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  const isLoading = isUserLoading || dataLoading;

  if (isLoading && paymentData.length === 0) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl font-bold">All Payments</CardTitle>
          <CardDescription>A complete log of all tenant payments.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <Input
              placeholder="Filter by property..."
              value={(table.getColumn('propertyName')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn('propertyName')?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          </div>
          <DataTable table={table} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
