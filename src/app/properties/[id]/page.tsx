
'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getPlaceholderImages } from '@/lib/placeholder-images';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RequestViewingForm } from '@/components/request-viewing-form';
import { MapPin, BedDouble, Bath, Square, Building, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDoc, useFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Property, User } from '@/lib/types';
import Loading from '@/app/loading';
import React from 'react';

export default function PropertyPage({ params }: { params: { id: string } }) {
  const { id } = React.use(params);
  const { firestore } = useFirebase();

  const propertyRef = React.useMemo(() => doc(firestore, 'properties', id), [firestore, id]);
  const { data: property, isLoading: propertyLoading } = useDoc<Property>(propertyRef);

  const landlordRef = React.useMemo(() => 
    property ? doc(firestore, 'users', property.landlordId) : null, 
    [firestore, property]
  );
  const { data: landlord, isLoading: landlordLoading } = useDoc<User>(landlordRef);

  if (propertyLoading || landlordLoading) {
    return <Loading />;
  }

  if (!property) {
    notFound();
  }
  
  const images = getPlaceholderImages(property.imageIds || ['img-1', 'img-2', 'img-3']);

  const features = [
    { icon: BedDouble, label: `${property.bedrooms} Bedrooms`},
    { icon: Bath, label: `${property.bathrooms} Bathrooms`},
    { icon: Square, label: `${property.size} sqft`},
    { icon: Building, label: 'Apartment'}
  ];
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return '';
    const names = name.split(' ');
    return names.map(n => n[0]).join('');
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Image Carousel */}
          <Card className="mb-8 overflow-hidden">
            <Carousel className="w-full">
              <CarouselContent>
                {images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="relative h-96 w-full">
                      <Image
                        src={image.imageUrl}
                        alt={`${property.name} - image ${index + 1}`}
                        fill
                        className="object-cover"
                        priority={index === 0}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                        data-ai-hint={image.imageHint}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-4" />
              <CarouselNext className="absolute right-4" />
            </Carousel>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                    <div>
                        <h1 className="font-headline text-4xl font-bold text-primary">{property.name}</h1>
                        <p className="mt-2 flex items-center gap-2 text-lg text-muted-foreground">
                            <MapPin className="h-5 w-5" />
                            {property.address}, {property.location}
                        </p>
                    </div>
                    <div className="mt-4 md:mt-0 text-right">
                        <p className="font-headline text-3xl font-bold text-accent">${property.price.toLocaleString()}<span className="text-lg font-normal text-muted-foreground">/month</span></p>
                        <Badge variant={property.availability === 'available' ? 'default' : 'destructive'} className="mt-2 capitalize bg-primary text-primary-foreground">
                            {property.availability}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="my-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    {features.map(feature => (
                        <div key={feature.label} className="p-4 bg-secondary rounded-lg">
                            <feature.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                            <p className="font-semibold">{feature.label}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-8">
                    <h3 className="font-headline text-2xl font-semibold mb-4">Amenities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {property.amenities.map(amenity => (
                            <div key={amenity} className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span className="text-muted-foreground">{amenity}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-8">
            {/* Landlord Info */}
            {landlord && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Meet the Landlord</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={landlord.avatarUrl} alt={landlord.name} />
                            <AvatarFallback>{getInitials(landlord.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-bold text-lg">{landlord.name}</p>
                            <p className="text-sm text-muted-foreground">{landlord.email}</p>
                        </div>
                    </CardContent>
                </Card>
            )}
            
            {/* Request Viewing */}
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Interested? Request a Viewing</CardTitle>
                </CardHeader>
                <CardContent>
                    <RequestViewingForm propertyId={id} landlordId={property.landlordId} />
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
