import { Property, User, ViewingRequest, Application, Lease, Payment } from './types';

export const users: User[] = [
  { id: 'user-1', name: 'Alice Johnson', email: 'alice@example.com', role: 'landlord', avatarUrl: 'https://picsum.photos/seed/user1/100/100' },
  { id: 'user-2', name: 'Bob Williams', email: 'bob@example.com', role: 'landlord', avatarUrl: 'https://picsum.photos/seed/user2/100/100' },
  { id: 'user-11', name: 'Charlie Brown', email: 'charlie@example.com', role: 'tenant', avatarUrl: 'https://picsum.photos/seed/user11/100/100' },
  { id: 'user-12', name: 'Diana Prince', email: 'diana@example.com', role: 'tenant', avatarUrl: 'https://picsum.photos/seed/user12/100/100' },
];

export const properties: Property[] = [
  {
    id: 'prop-1',
    landlordId: 'user-1',
    name: 'Sunny Downtown Apartment',
    price: 2500,
    location: 'New York',
    address: '123 Main St, Apt 4B',
    amenities: ['Gym', 'Pool', 'In-unit Washer/Dryer', 'Rooftop Deck'],
    availability: 'available',
    imageIds: ['img-1', 'img-2', 'img-3'],
    bedrooms: 2,
    bathrooms: 2,
    size: 1100,
  },
  {
    id: 'prop-2',
    landlordId: 'user-1',
    name: 'Cozy Suburban House',
    price: 3200,
    location: 'San Francisco',
    address: '456 Oak Ave',
    amenities: ['Backyard', 'Garage', 'Fireplace', 'Pet Friendly'],
    availability: 'rented',
    imageIds: ['img-4', 'img-5', 'img-6'],
    bedrooms: 3,
    bathrooms: 2,
    size: 1800,
  },
  {
    id: 'prop-3',
    landlordId: 'user-2',
    name: 'Modern Loft in Arts District',
    price: 2800,
    location: 'Los Angeles',
    address: '789 Art St, Loft 3',
    amenities: ['High Ceilings', 'Exposed Brick', 'Gym', 'Parking'],
    availability: 'available',
    imageIds: ['img-7', 'img-8', 'img-9'],
    bedrooms: 1,
    bathrooms: 1,
    size: 950,
  },
  {
    id: 'prop-4',
    landlordId: 'user-2',
    name: 'Lakeside Cabin Retreat',
    price: 1800,
    location: 'Seattle',
    address: '101 Lakeview Dr',
    amenities: ['Lake Access', 'Fire Pit', 'Deck', 'Hiking Trails'],
    availability: 'available',
    imageIds: ['img-10', 'img-11', 'img-12'],
    bedrooms: 2,
    bathrooms: 1,
    size: 800,
  },
  {
    id: 'prop-5',
    landlordId: 'user-1',
    name: 'Chic Urban Studio',
    price: 1950,
    location: 'New York',
    address: '234 Broadway, Unit 1502',
    amenities: ['Doorman', 'Elevator', 'Modern Kitchen', 'City View'],
    availability: 'available',
    imageIds: ['img-13', 'img-14', 'img-15'],
    bedrooms: 0,
    bathrooms: 1,
    size: 550,
  },
  {
    id: 'prop-12',
    landlordId: 'user-1',
    name: 'Family Home with Garden',
    price: 4500,
    location: 'Nairobi',
    address: '56 Ridgeways',
    amenities: ['Garden', 'Parking', 'Gated Community', 'Pet Friendly'],
    availability: 'available',
    imageIds: ['img-16', 'img-17', 'img-18'],
    bedrooms: 4,
    bathrooms: 3,
    size: 2500,
  }
];

export const applications: Application[] = [
    { id: 'app-1', propertyId: 'prop-1', tenantId: 'user-11', status: 'approved', submittedAt: new Date('2023-10-01') },
    { id: 'app-2', propertyId: 'prop-3', tenantId: 'user-11', status: 'pending', submittedAt: new Date('2023-10-15') },
    { id: 'app-3', propertyId: 'prop-4', tenantId: 'user-12', status: 'declined', submittedAt: new Date('2023-10-05') },
];

export const leases: Lease[] = [
    { id: 'lease-1', propertyId: 'prop-1', landlordId: 'user-1', tenantId: 'user-11', startDate: new Date('2023-11-01'), endDate: new Date('2024-10-31'), rentAmount: 2500, signed: true },
    { id: 'lease-2', propertyId: 'prop-2', landlordId: 'user-1', tenantId: 'user-12', startDate: new Date('2023-09-01'), endDate: new Date('2024-08-31'), rentAmount: 3200, signed: true },
];

export const payments: Payment[] = [
    { id: 'pay-1', leaseId: 'lease-1', amount: 2500, paymentDate: new Date('2023-11-01'), status: 'paid' },
    { id: 'pay-2', leaseId: 'lease-1', amount: 2500, paymentDate: new Date('2023-12-01'), status: 'paid' },
    { id: 'pay-3', leaseId: 'lease-1', amount: 2500, paymentDate: new Date('2024-01-01'), status: 'pending' },
    { id: 'pay-4', leaseId: 'lease-2', amount: 3200, paymentDate: new Date('2023-11-01'), status: 'paid' },
    { id: 'pay-5', leaseId: 'lease-2', amount: 3200, paymentDate: new Date('2023-12-01'), status: 'overdue' },
];

export const viewingRequests: ViewingRequest[] = [
    { id: 'vr-1', propertyId: 'prop-1', landlordId: 'user-1', name: 'Eve', contact: 'eve@example.com', preferredTime: new Date(), status: 'pending' },
    { id: 'vr-2', propertyId: 'prop-3', landlordId: 'user-2', name: 'Frank', contact: 'frank@example.com', preferredTime: new Date(), status: 'confirmed' },
    { id: 'vr-3', propertyId: 'prop-1', landlordId: 'user-1', name: 'Grace', contact: 'grace@example.com', preferredTime: new Date(), status: 'cancelled' },
];
