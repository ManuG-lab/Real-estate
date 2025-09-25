// A script to seed the database with initial data.
// This is for development purposes only.
// Use with `npx tsx src/lib/seed.ts`

import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { faker } from '@faker-js/faker';
import type { Property, User } from './types';

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
    const landlordRecords = [];
    for (let i = 0; i < NUM_LANDLORDS; i++) {
      const email = `landlord${i + 1}@example.com`;
      const name = faker.person.fullName();
      const avatarUrl = faker.image.avatar();
      try {
        const userRecord = await auth.createUser({
          email,
          password: DEFAULT_PASSWORD,
          displayName: name,
          photoURL: avatarUrl,
        });
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
        if (error.code === 'auth/email-already-exists') {
          console.warn(`- Landlord email ${email} already exists. Fetching existing user.`);
          const userRecord = await auth.getUserByEmail(email);
          landlordRecords.push(userRecord);
        } else {
          throw error;
        }
      }
    }

    // --- Create Tenants ---
    console.log(`\nCreating ${NUM_TENANTS} tenants...`);
    const tenantRecords = [];
    for (let i = 0; i < NUM_TENANTS; i++) {
      const email = `tenant${i + 1}@example.com`;
      const name = faker.person.fullName();
      const avatarUrl = faker.image.avatar();
      try {
        const userRecord = await auth.createUser({
          email,
          password: DEFAULT_PASSWORD,
          displayName: name,
          photoURL: avatarUrl
        });
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
      } catch (error: any) {
        if (error.code === 'auth/email-already-exists') {
          console.warn(`- Tenant email ${email} already exists. Fetching existing user.`);
           const userRecord = await auth.getUserByEmail(email);
           tenantRecords.push(userRecord);
        } else {
          throw error;
        }
      }
    }

    // --- Create Properties ---
    console.log(`\nCreating ${PROPERTIES_PER_LANDLORD} properties for each of ${landlordRecords.length} landlords...`);
    const propertyIds: string[] = [];
    for (const landlord of landlordRecords) {
      for (let i = 0; i < PROPERTIES_PER_LANDLORD; i++) {
        const propertyDocRef = db.collection('properties').doc();
        const propertyId = propertyDocRef.id;
        propertyIds.push(propertyId);

        const propertyData: Omit<Property, 'id'> = {
          landlordId: landlord.uid,
          name: faker.location.streetAddress(),
          price: faker.number.int({ min: 1000, max: 5000 }),
          location: faker.location.city(),
          address: `${faker.location.streetAddress()}, ${faker.location.city()}`,
          amenities: faker.helpers.arrayElements(['Gym', 'Pool', 'Parking', 'Pet Friendly', 'In-unit Washer/Dryer', 'Rooftop Deck', '24/7 Security'], {min: 2, max: 5}),
          availability: faker.helpers.arrayElement(['available', 'rented']),
          bedrooms: faker.number.int({ min: 1, max: 4 }),
          bathrooms: faker.number.int({ min: 1, max: 3 }),
          size: faker.number.int({ min: 500, max: 2500 }),
          imageIds: faker.helpers.arrayElements(availableImageIds, { min: 3, max: 6 }),
        };
        batch.set(propertyDocRef, propertyData);
        console.log(`- Queued property: ${propertyData.name}`);
      }
    }
    
    // --- Commit all writes to the database ---
    await batch.commit();
    console.log('\nBatch commit successful!');
    console.log('Database seeding completed successfully.');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // The script will exit automatically.
  }
}

seedDatabase();
