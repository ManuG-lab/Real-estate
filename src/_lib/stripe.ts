// functions/src/stripe.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";

admin.initializeApp();
const db = admin.firestore();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export const createCheckoutSession = functions.https.onCall(
  async (data, context) => {
    const { houseId, userId } = data;

    if (!houseId || !userId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "House ID and User ID are required"
      );
    }

    // Get the house from Firestore
    const houseRef = db.collection("properties").doc(houseId);
    const houseSnap = await houseRef.get();

    if (!houseSnap.exists) {
      throw new functions.https.HttpsError("not-found", "Property not found");
    }

    const propertyData = houseSnap.data();
    if (!propertyData?.price) {
      throw new functions.https.HttpsError("invalid-argument", "Property has no price");
    }

    const amount = propertyData.price * 100; // Stripe expects cents

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Payment for House ${houseId}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: "https://yourapp.com/success",
      cancel_url: "https://yourapp.com/cancel",
    });

    // Store Payment Record
    await db.collection("payments").doc(session.id).set({
      userId,
      houseId,
      amount,
      currency: "usd",
      sessionId: session.id,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { id: session.id, url: session.url };
  }
);
