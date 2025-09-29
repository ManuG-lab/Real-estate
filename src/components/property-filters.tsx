'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';

export function PropertyFilters() {
  return (
    <Card className="shadow-md">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5 items-end">
          <div className="space-y-1">
            <label htmlFor="location" className="text-sm font-medium">Location</label>
            <Input id="location" placeholder="e.g., Nairobi, New York" />
          </div>
          <div className="space-y-1">
            <label htmlFor="price" className="text-sm font-medium">Price Range</label>
            <Select>
              <SelectTrigger id="price">
                <SelectValue placeholder="Any Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-1000">$0 - $1,000</SelectItem>
                <SelectItem value="1000-2000">$1,000 - $2,000</SelectItem>
                <SelectItem value="2000-3000">$2,000 - $3,000</SelectItem>
                <SelectItem value="3000+">$3,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label htmlFor="bedrooms" className="text-sm font-medium">Bedrooms</label>
            <Select>
              <SelectTrigger id="bedrooms">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4+">4+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label htmlFor="amenities" className="text-sm font-medium">Amenities</label>
            <Select>
              <SelectTrigger id="amenities">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pool">Pool</SelectItem>
                <SelectItem value="gym">Gym</SelectItem>
                <SelectItem value="parking">Parking</SelectItem>
                <SelectItem value="pet-friendly">Pet Friendly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            <Search className="mr-2 h-4 w-4" /> Search
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
