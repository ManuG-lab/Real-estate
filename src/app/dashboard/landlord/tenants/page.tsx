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
import { useCollection, useFirebase, useUser } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Loading from '@/app/loading';
import type { Lease, User, Property } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

interface TenantData extends User {
  propertyName: string;
  leaseEndDate: string;
}

export default function LandlordTenantsPage() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [tenantData, setTenantData] = React.useState<TenantData[]>([]);
  const [dataLoading, setDataLoading] = React.useState(true);

  const leasesQuery = React.useMemo(
    () =>
      user
        ? query(collection(firestore, 'leases'), where('landlordId', '==', user.uid))
        : null,
    [firestore, user]
  );
  const { data: leases, isLoading: leasesLoading } = useCollection<Lease>(leasesQuery);

  React.useEffect(() => {
    if (leasesLoading || !leases || !firestore) {
      if (!leasesLoading) {
        setDataLoading(false);
      }
      return;
    }

    const fetchData = async () => {
      setDataLoading(true);
      const tenantIds = Array.from(new Set(leases.map((l) => l.tenantId)));
      const propertyIds = Array.from(new Set(leases.map((l) => l.propertyId)));

      if (tenantIds.length === 0 || propertyIds.length === 0) {
        setTenantData([]);
        setDataLoading(false);
        return;
      }

      const tenants: Record<string, User> = {};
      const tenantsQuery = query(collection(firestore, 'users'), where('id', 'in', tenantIds));
      const tenantsSnapshot = await getDocs(tenantsQuery);
      tenantsSnapshot.forEach((doc) => {
        tenants[doc.id] = { id: doc.id, ...doc.data() } as User;
      });

      const properties: Record<string, Property> = {};
      const propertiesQuery = query(collection(firestore, 'properties'), where('id', 'in', propertyIds));
      const propertiesSnapshot = await getDocs(propertiesQuery);
      propertiesSnapshot.forEach((doc) => {
        properties[doc.id] = { id: doc.id, ...doc.data() } as Property;
      });
      
      const combinedData = leases.map((lease) => {
        const tenant = tenants[lease.tenantId];
        const property = properties[lease.propertyId];
        const endDate = (lease.endDate as any)?.toDate ? (lease.endDate as any).toDate() : new Date(lease.endDate);

        return {
          ...(tenant || {}),
          id: lease.tenantId,
          propertyName: property?.name || 'N/A',
          leaseEndDate: endDate.toLocaleDateString(),
        } as TenantData;
      }).filter(td => td.name); // Filter out tenants that might not have been fetched

      setTenantData(combinedData);
      setDataLoading(false);
    };

    fetchData();
  }, [leases, leasesLoading, firestore]);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '';
    return name.split(' ').map((n) => n[0]).join('');
  };

  const columns: ColumnDef<TenantData>[] = [
    {
      accessorKey: 'name',
      header: 'Tenant',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.original.avatarUrl} alt={row.original.name} />
            <AvatarFallback>{getInitials(row.original.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-sm text-muted-foreground">{row.original.email}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'propertyName',
      header: 'Property',
    },
    {
      accessorKey: 'leaseEndDate',
      header: 'Lease End Date',
    },
  ];

  const table = useReactTable({
    data: tenantData,
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

  const isLoading = isUserLoading || dataLoading || leasesLoading;

  if (isLoading && tenantData.length === 0) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl font-bold">My Tenants</CardTitle>
          <CardDescription>
            A list of all tenants currently leasing your properties.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <Input
              placeholder="Filter by tenant name..."
              value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn('name')?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          </div>
          <DataTable table={table} isLoading={isLoading && tenantData.length === 0} />
        </CardContent>
      </Card>
    </div>
  );
}
