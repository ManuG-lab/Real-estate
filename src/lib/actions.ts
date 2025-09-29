'use server';

import { suggestProperties } from '@/ai/flows/ai-property-suggestions';
import type { Property } from '@/lib/types';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { credential } from 'firebase-admin';

// Ensure Firebase admin is initialized
let adminApp: App;
if (!getApps().length) {
  // In a real production environment, you would use a service account for secure authentication.
  // For this development setup, we initialize without specific credentials,
  // relying on Application Default Credentials if available (e.g., in Google Cloud).
  // If running locally without ADC, this might require `gcloud auth application-default login`.
  adminApp = initializeApp();
} else {
  adminApp = getApps()[0];
}

const db = getFirestore(adminApp);

export async function getAiSuggestions(
  preferences: string,
  viewingHistory: string[]
): Promise<{
  suggestedProperties: Property[];
  error?: string;
}> {
  try {
    const propertiesSnapshot = await db.collection('properties').get();
    const allProperties: Property[] = [];
    propertiesSnapshot.forEach(doc => {
        allProperties.push({ id: doc.id, ...doc.data() } as Property)
    });


    // We are not using the AI flow for now, just returning some properties
    // This is to avoid dependency on a running genkit instance for this step
    // In a real scenario, you would call the `suggestProperties` flow
    // const result = await suggestProperties({
    //   viewingHistory: viewingHistory.join(','),
    //   preferences: preferences,
    // });
    
    // Mocking the AI result for now
    const suggestedIds = allProperties.slice(0, 3).map(p => p.id);
    
    const suggestedProperties = allProperties.filter((p) =>
      suggestedIds.includes(p.id)
    );

    return { suggestedProperties };
  } catch (e: any) {
    console.error(e);
    // Check if e is an object and has a message property
    const errorMessage = (typeof e === 'object' && e !== null && 'message' in e) 
      ? e.message 
      : 'Failed to get AI suggestions. Please try again later.';
      
    return {
      suggestedProperties: [],
      error: errorMessage as string,
    };
  }
}
