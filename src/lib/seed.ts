
// A script to seed the database with initial data.
// This is for development purposes only.
// Use with `npx tsx src/lib/seed.ts`

import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth, UserRecord } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { faker } from '@faker-js/faker';
import type { Property, User, Lease, Payment, ViewingRequest, Application } from './types';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp();
}

const auth = getAuth();
const db = getFirestore();

const DEFAULT_PASSWORD = 'password123';
const NUM_LANDLORDS = 5;
const NUM_TENANTS = 50;
const PROPERTIES_PER_LANDLORD = 5;

// From placeholder-images.json
const availableImageIds = [
    "img-1", "img-2", "img-3", "img-4", "img-5", "img-6",
    "img-7", "img-8", "img-9", "img-10", "img-11", "img-12",
    "img-13", "img-14", "img-15", "img-16", "img-17", "img-18"
];

async function seedDatabase() {
  console.log('Starting database seed process...');

  try {
    const batch = db.batch();

    // --- Create Landlords ---
    console.log(`Creating ${NUM_LANDLORDS} landlords...`);
    const landlordRecords: UserRecord[] = [];
    for (let i = 0; i < NUM_LANDLORDS; i++) {
      const email = `landlord${i + 1}@example.com`;
      const name = faker.person.fullName();
      const avatarUrl = faker.image.avatar();
      try {
        let userRecord: UserRecord;
        try {
            userRecord = await auth.createUser({
              email,
              password: DEFAULT_PASSWORD,
              displayName: name,
              photoURL: avatarUrl,
            });
        } catch (error: any) {
             if (error.code === 'auth/email-already-exists') {
                console.warn(`- Landlord email ${email} already exists. Fetching existing user.`);
                userRecord = await auth.getUserByEmail(email);
            } else {
                throw error;
            }
        }
        landlordRecords.push(userRecord);

        const userDocRef = db.collection('users').doc(userRecord.uid);
        const userData: User = {
          id: userRecord.uid,
          name,
          email,
          role: 'landlord',
          avatarUrl,
        };
        batch.set(userDocRef, { ...userData, createdAt: new Date() });
        console.log(`- Queued landlord: ${name} (${email})`);
      } catch (error: any) {
        console.error(`Failed to process landlord ${email}:`, error);
      }
    }

    // --- Create Tenants ---
    console.log(`\nCreating ${NUM_TENANTS} tenants...`);
    const tenantRecords: UserRecord[] = [];
    for (let i = 0; i < NUM_TENANTS; i++) {
      const email = `tenant${i + 1}@example.com`;
      const name = faker.person.fullName();
      const avatarUrl = faker.image.avatar();
      try {
        let userRecord: UserRecord;
        try {
            userRecord = await auth.createUser({
              email,
              password: DEFAULT_PASSWORD,
              displayName: name,
              photoURL: avatarUrl
            });
        } catch (error: any) {
            if (error.code === 'auth/email-already-exists') {
              console.warn(`- Tenant email ${email} already exists. Fetching existing user.`);
              userRecord = await auth.getUserByEmail(email);
            } else {
              throw error;
            }
        }

        tenantRecords.push(userRecord);
        const userDocRef = db.collection('users').doc(userRecord.uid);
        const userData: User = {
          id: userRecord.uid,
          name: name,
          email: email,
          role: 'tenant',
          avatarUrl,
        };
        batch.set(userDocRef, { ...userData, createdAt: new Date() });
        console.log(`- Queued tenant: ${name} (${email})`);
      } catch (error) {
         console.error(`Failed to process tenant ${email}:`, error);
      }
    }

    // --- Create Properties ---
    console.log(`\nCreating ${PROPERTIES_PER_LANDLORD} properties for each of ${landlordRecords.length} landlords...`);
    const properties: Property[] = [];
    for (const landlord of landlordRecords) {
      for (let i = 0; i < PROPERTIES_PER_LANDLORD; i++) {
        const propertyDocRef = db.collection('properties').doc();
        
        const propertyData: Property = {
          id: propertyDocRef.id,
          landlordId: landlord.uid,
          name: faker.location.streetAddress(),
          price: faker.number.int({ min: 1000, max: 5000 }),
          location: faker.location.city(),
          address: `${faker.location.streetAddress()}, ${faker.location.city()}`,
          amenities: faker.helpers.arrayElements(['Gym', 'Pool', 'Parking', 'Pet Friendly', 'In-unit Washer/Dryer', 'Rooftop Deck', '24/7 Security'], {min: 2, max: 5}),
          availability: 'available', // Start all as available
          bedrooms: faker.number.int({ min: 1, max: 4 }),
          bathrooms: faker.number.int({ min: 1, max: 3 }),
          size: faker.number.int({ min: 500, max: 2500 }),
          imageIds: faker.helpers.arrayElements(availableImageIds, { min: 3, max: 6 }),
        };
        properties.push(propertyData);
        batch.set(propertyDocRef, propertyData);
        console.log(`- Queued property: ${propertyData.name}`);
      }
    }

    const createdLeases: Lease[] = [];

    // --- Create Applications, Leases, Payments, and Viewing Requests ---
    console.log('\nCreating applications, leases, payments, and viewing requests...');
    const tenantsWithLeases = new Set<string>();

    for (const tenant of tenantRecords) {
        // Each tenant makes 1-3 applications
        const numApplications = faker.number.int({ min: 1, max: 3 });
        for (let i = 0; i < numApplications; i++) {
            const property = faker.helpers.arrayElement(properties);
            const appStatus = faker.helpers.arrayElement(['pending', 'approved', 'declined']);
            
            const applicationRef = db.collection('rentalApplications').doc();
            const applicationData: Application = {
                id: applicationRef.id,
                propertyId: property.id,
                tenantId: tenant.uid,
                status: appStatus,
                submittedAt: faker.date.past({ years: 1 }),
            };
            batch.set(applicationRef, applicationData);

            // If approved and tenant doesn't have a lease yet, create one
            if (appStatus === 'approved' && !tenantsWithLeases.has(tenant.uid)) {
                tenantsWithLeases.add(tenant.uid);

                const leaseRef = db.collection('leases').doc();
                const startDate = faker.date.past({ years: 1 });
                const endDate = faker.date.future({ years: 1, refDate: startDate });

                const leaseData: Lease = {
                    id: leaseRef.id,
                    propertyId: property.id,
                    landlordId: property.landlordId,
                    tenantId: tenant.uid,
                    startDate: startDate,
                    endDate: endDate,
                    rentAmount: property.price,
                    signed: true,
                };
                batch.set(leaseRef, leaseData);
                createdLeases.push(leaseData);
                
                // Mark property as rented
                const propToUpdateRef = db.collection('properties').doc(property.id);
                batch.update(propToUpdateRef, { availability: 'rented' });

                console.log(`- Queued Lease for ${tenant.displayName} on ${property.name}`);

                 // Create payment history for this lease
                let paymentDate = new Date(startDate.getTime());
                while (paymentDate < new Date()) { // Create payments up to today
                    if (paymentDate > endDate) break;

                    const paymentRef = db.collection('payments').doc();
                    const paymentStatus = faker.helpers.arrayElement<'paid' | 'pending' | 'overdue'>(['paid', 'paid', 'paid', 'paid', 'overdue']);
                    
                    const paymentData: Payment = {
                        id: paymentRef.id,
                        leaseId: leaseData.id,
                        amount: leaseData.rentAmount,
                        paymentDate: new Date(paymentDate.getTime()),
                        status: paymentDate < new Date() ? paymentStatus : 'pending',
                    };
                    batch.set(paymentRef, paymentData);
                    
                    // Move to next month
                    paymentDate.setMonth(paymentDate.getMonth() + 1);
                }
            }
        }

        // Each tenant makes 0-2 viewing requests
        const numRequests = faker.number.int({ min: 0, max: 2});
        for (let i = 0; i < numRequests; i++) {
             const property = faker.helpers.arrayElement(properties.filter(p => p.availability === 'available'));
             if (!property) continue;

             const requestRef = db.collection('viewingRequests').doc();
             const requestData: ViewingRequest = {
                id: requestRef.id,
                propertyId: property.id,
                landlordId: property.landlordId,
                name: tenant.displayName || faker.person.fullName(),
                contact: tenant.email || faker.internet.email(),
                preferredTime: faker.date.future({ days: 14 }),
                status: 'pending',
             };
             batch.set(requestRef, requestData);
        }
    }
    
    // --- Commit all writes to the database ---
    await batch.commit();
    console.log('\nBatch commit successful!');
    console.log('Database seeding completed successfully.');

  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();

    