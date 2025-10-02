'use client';

import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { PropertyCard } from '@/components/property-card';
import { PropertyFilters } from '@/components/property-filters';
import { AiSuggester } from '@/components/ai-suggester';
import { collection, query, where } from 'firebase/firestore';
import type { Property } from '@/lib/types';
import Loading from './loading';
import Image from 'next/image';
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ChatDialog from './globallayouts/ChatDialog';


const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);



interface Message {
  sender: "you" | "REA";
  message: string;
}

export default function Home() {
 

 
  const { firestore } = useFirebase();

  const propertiesQuery = useMemoFirebase(
    () => query(collection(firestore, 'properties'), where('availability', '==', 'available')),
    [firestore]
  );
  const { data: availableProperties, isLoading } = useCollection<Property>(propertiesQuery);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12 rounded-lg bg-card p-8 text-center shadow-lg">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-primary md:text-5xl">
          Find Your Next Home
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Discover the perfect rental property that fits your lifestyle and
          budget.
        </p>
        <div className="mt-6">
          <AiSuggester />
        </div>
      </section>

      <section className="mb-8">
        <PropertyFilters />
      </section>

      <section>
        <h2 className="font-headline text-3xl font-semibold mb-6">
          Available Rental
        </h2>
        {availableProperties && availableProperties.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {availableProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12">
            <p>No available properties at the moment. Please check back later!</p>
          </div>
        )}
      </section>

        <ChatDialog/>
    </div>
  );
}
