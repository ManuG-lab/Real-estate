// A script to seed the database with initial data.
// This is for development purposes only.
// Use with `npx tsx src/lib/seed.ts`

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, setDoc, doc, collection, writeBatch, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '../firebase/config'; // Adjust the import path as necessary
import { faker } from '@faker-js/faker';
import type { Property, User, Lease, Payment } from './types';

// Initialize Firebase Admin
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

const DEFAULT_PASSWORD = 'password123';
const NUM_LANDLORDS = 5;
const NUM_TENANTS = 50;
const PROPERTIES_PER_LANDLORD = 5;

async function seedDatabase() {
  console.log('Starting database seed process...');

  try {
    const batch = writeBatch(db);

    // --- Create Landlords ---
    console.log(`Creating ${NUM_LANDLORDS} landlords...`);
    const landlordIds: string[] = [];
    for (let i = 0; i < NUM_LANDLORDS; i++) {
      const email = `landlord${i + 1}@example.com`;
      const name = faker.person.fullName();
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, DEFAULT_PASSWORD);
        const userId = userCredential.user.uid;
        landlordIds.push(userId);

        const userDocRef = doc(db, 'users', userId);
        const userData: Omit<User, 'avatarUrl'> = {
          id: userId,
          name: name,
          email: email,
          role: 'landlord',
        };
        batch.set(userDocRef, { ...userData, createdAt: serverTimestamp() });
        console.log(`- Created landlord: ${name} (${email})`);
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          console.warn(`- Landlord email ${email} already exists. Skipping creation.`);
          // If you need the UID of the existing user, you'd have to fetch it.
          // For this script, we'll just skip adding them to our list to process.
        } else {
          throw error;
        }
      }
    }

    // --- Create Tenants ---
    console.log(`\nCreating ${NUM_TENANTS} tenants...`);
    const tenantIds: string[] = [];
     for (let i = 0; i < NUM_TENANTS; i++) {
      const email = `tenant${i + 1}@example.com`;
      const name = faker.person.fullName();
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, DEFAULT_PASSWORD);
        const userId = userCredential.user.uid;
        tenantIds.push(userId);

        const userDocRef = doc(db, 'users', userId);
         const userData: Omit<User, 'avatarUrl'> = {
          id: userId,
          name: name,
          email: email,
          role: 'tenant',
        };
        batch.set(userDocRef, { ...userData, createdAt: serverTimestamp() });
        console.log(`- Created tenant: ${name} (${email})`);
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          console.warn(`- Tenant email ${email} already exists. Skipping creation.`);
        } else {
          throw error;
        }
      }
    }

    // --- Create Properties ---
    console.log(`\nCreating ${PROPERTIES_PER_LANDLORD} properties for each of ${landlordIds.length} landlords...`);
    const propertyIds: string[] = [];
    for (const landlordId of landlordIds) {
      for (let i = 0; i < PROPERTIES_PER_LANDLORD; i++) {
        const propertyDocRef = doc(collection(db, 'properties'));
        const propertyId = propertyDocRef.id;
        propertyIds.push(propertyId);

        const propertyData: Omit<Property, 'id' | 'imageIds'> = {
          landlordId: landlordId,
          name: `${faker.word.adjective()} ${faker.word.noun()} ${faker.location.streetAddress()}`,
          price: faker.number.int({ min: 1000, max: 5000 }),
          location: faker.location.city(),
          address: faker.location.streetAddress(),
          amenities: faker.helpers.arrayElements(['Gym', 'Pool', 'Parking', 'Pet Friendly', 'In-unit Washer/Dryer'], {min: 2, max: 4}),
          availability: faker.helpers.arrayElement(['available', 'rented']),
          bedrooms: faker.number.int({ min: 1, max: 4 }),
          bathrooms: faker.number.int({ min: 1, max: 3 }),
          size: faker.number.int({ min: 500, max: 2500 }),
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
    // Firebase connections can be left open, but if you want to explicitly exit:
    process.exit(0);
  }
}

seedDatabase();
