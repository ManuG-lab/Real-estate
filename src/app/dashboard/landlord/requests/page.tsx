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
import { collection, query, where, doc, updateDoc, collectionGroup } from 'firebase/firestore';
import Loading from '@/app/loading';
import type { ViewingRequest, Property } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { DateRangePicker } from '@/components/date-range-picker';
import { addDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Check, X } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


export default function LandlordRequestsPage() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const propertiesQuery = React.useMemo(
    () => user ? query(collection(firestore, 'properties'), where('landlordId', '==', user.uid)) : null,
    [firestore, user]
  );
  const { data: properties, isLoading: propertiesLoading } = useCollection<Property>(propertiesQuery);

  const requestsQuery = React.useMemo(() => {
    if (!user || !date?.from) return null;
    
    let q = query(collectionGroup(firestore, 'viewingRequests'), where('landlordId', '==', user.uid), where('requestDate', '>=', date.from));
    if (date.to) {
        q = query(q, where('requestDate', '<=', date.to));
    }
    return q;
  }, [firestore, user, date]);

  const { data: requests, isLoading: requestsLoading } = useCollection<ViewingRequest>(requestsQuery);

  const handleStatusUpdate = async (request: ViewingRequest, status: 'confirmed' | 'cancelled') => {
    const requestRef = doc(firestore, `properties/${request.propertyId}/viewingRequests`, request.id);
    try {
      await updateDoc(requestRef, { status });
      toast({
        title: 'Success',
        description: `Request has been ${status}.`,
      });
    } catch (error) {
      console.error('Failed to update status:', error);
       const permissionError = new FirestorePermissionError({
        path: requestRef.path,
        operation: 'update',
        requestResourceData: { status }
      });
      errorEmitter.emit('permission-error', permissionError);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update request status.',
      });
    }
  };

  const getPropertyName = (propertyId: string) => {
      return properties?.find(p => p.id === propertyId)?.name || 'N/A';
  }

  const columns: ColumnDef<ViewingRequest>[] = [
    {
      accessorKey: 'name',
      header: 'Applicant Name',
    },
    {
        accessorKey: 'propertyId',
        header: 'Property',
        cell: ({ row }) => getPropertyName(row.getValue('propertyId'))
    },
    {
      accessorKey: 'preferredTime',
      header: 'Preferred Date',
      cell: ({ row }) => {
        const date = (row.getValue('preferredTime') as any)?.toDate ? (row.getValue('preferredTime') as any).toDate() : new Date(row.getValue('preferredTime'));
        return <span>{format(date, 'PPP')}</span>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          variant={
            row.getValue('status') === 'confirmed'
              ? 'default'
              : row.getValue('status') === 'cancelled'
              ? 'destructive'
              : 'secondary'
          }
          className="capitalize"
        >
          {row.getValue('status')}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const request = row.original;
        if (request.status !== 'pending') {
          return null;
        }

        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => handleStatusUpdate(request, 'confirmed')}
            >
              <Check className="h-4 w-4" />
              <span className="sr-only">Approve</span>
            </Button>
            <Button
              size="sm"
              variant="destructive"
               className="h-8 w-8 p-0"
              onClick={() => handleStatusUpdate(request, 'cancelled')}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Cancel</span>
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: requests || [],
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

  const isLoading = isUserLoading || propertiesLoading || requestsLoading;
  
  if (isLoading && !requests) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl font-bold">Viewing Requests</CardTitle>
          <CardDescription>
            Manage and respond to all viewing requests for your properties.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
             <DateRangePicker date={date} onDateChange={setDate} />
          </div>
          <DataTable table={table} isLoading={isLoading && !requests}/>
        </CardContent>
      </Card>
    </div>
  );
}
