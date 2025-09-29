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
import { collection, query, where } from 'firebase/firestore';
import Loading from '@/app/loading';
import type { Property } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

const columns: ColumnDef<Property>[] = [
  {
    accessorKey: 'name',
    header: 'Property',
  },
  {
    accessorKey: 'location',
    header: 'Location',
  },
  {
    accessorKey: 'price',
    header: 'Rent Price',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('price'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);

      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'availability',
    header: 'Status',
    cell: ({ row }) => (
      <Badge
        variant={
          row.getValue('availability') === 'available'
            ? 'secondary'
            : 'destructive'
        }
        className="capitalize"
      >
        {row.getValue('availability')}
      </Badge>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const property = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(property.id)}
            >
              Copy property ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View property page</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function LandlordPropertiesPage() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const propertiesQuery = useMemoFirebase(
    () =>
      user
        ? query(
            collection(firestore, 'properties'),
            where('landlordId', '==', user.uid)
          )
        : null,
    [firestore, user]
  );
  const { data: properties, isLoading: propertiesLoading } =
    useCollection<Property>(propertiesQuery);

  const table = useReactTable({
    data: properties || [],
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

  const isLoading = isUserLoading || propertiesLoading;

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl font-bold">
            My Properties
          </CardTitle>
          <CardDescription>
            View and manage all the properties you own.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <Input
              placeholder="Filter by location..."
              value={
                (table.getColumn('location')?.getFilterValue() as string) ?? ''
              }
              onChange={(event) =>
                table.getColumn('location')?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          </div>
          <DataTable table={table} />
        </CardContent>
      </Card>
    </div>
  );
}
