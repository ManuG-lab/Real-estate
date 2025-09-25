export type UserRole = 'landlord' | 'tenant';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string; // Made optional
}

export interface Amenity {
  id: string;
  name: string;
}

export interface Property {
  id: string;
  landlordId: string;
  name: string;
  price: number;
  location: string;
  address: string;
  amenities: string[];
  availability: 'available' | 'rented';
  imageIds: string[];
  bedrooms: number;
  bathrooms: number;
  size: number; // in sqft
}

export interface ViewingRequest {
  id: string;
  propertyId: string;
  landlordId: string;
  name: string;
  contact: string; // email or phone
  preferredTime: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface Application {
  id: string;
  propertyId: string;
  tenantId: string;
  status: 'pending' | 'approved' | 'declined';
  submittedAt: Date;
}

export interface Lease {
  id: string;
  propertyId: string;
  landlordId: string;
  tenantId: string;
  startDate: Date;
  endDate: Date;
  rentAmount: number;
  signed: boolean;
}

export interface Payment {
  id: string;
  leaseId: string;
  amount: number;
  paymentDate: Date;
  status: 'paid' | 'pending' | 'overdue';
}
