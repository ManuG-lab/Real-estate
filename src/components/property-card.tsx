import Link from 'next/link';
import Image from 'next/image';
import type { Property } from '@/lib/types';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BedDouble, Bath, Square, MapPin } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const mainImage = getPlaceholderImage(property.imageIds[0]);

  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-xl">
      <Link href={`/properties/${property.id}`} className="flex flex-col h-full">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            {mainImage && (
              <Image
                src={mainImage.imageUrl}
                alt={property.name}
                fill
                className="object-cover"
                data-ai-hint={mainImage.imageHint}
              />
            )}
            <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">
              ${property.price.toLocaleString()}/mo
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-4">
          <CardTitle className="font-headline text-xl mb-2 truncate">
            {property.name}
          </CardTitle>
          <CardDescription className="flex items-center gap-2 text-muted-foreground mb-4">
            <MapPin className="h-4 w-4" />
            <span>{property.location}</span>
          </CardDescription>
          <div className="flex justify-around text-sm text-muted-foreground border-t border-b py-3">
            <div className="flex items-center gap-2">
              <BedDouble className="h-4 w-4 text-primary" />
              <span>{property.bedrooms} Beds</span>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="h-4 w-4 text-primary" />
              <span>{property.bathrooms} Baths</span>
            </div>
            <div className="flex items-center gap-2">
              <Square className="h-4 w-4 text-primary" />
              <span>{property.size} sqft</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
           <Badge
              variant={
                property.availability === 'available' ? 'secondary' : 'destructive'
              }
              className="capitalize"
            >
              {property.availability}
            </Badge>
        </CardFooter>
      </Link>
    </Card>
  );
}
