import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../constants/firebaseConfig';
import { Alert, Platform } from 'react-native';

// Mock Types for Payment Gateways
type PaymentProvider = 'RAZORPAY' | 'STRIPE';

export const PaymentService = {
  
  async initiateUpgrade(uid: string, tier: 'Shield' | 'Professional' | 'Elite', amount: number, currency: 'INR' | 'USD') {
    const provider: PaymentProvider = currency === 'INR' ? 'RAZORPAY' : 'STRIPE';
    
    console.log(`Initiating ${provider} payment for ${tier} - ${amount} ${currency}`);

    // 1. Create Order (Server Side Mock)
    const orderId = `${provider}_ORDER_${Date.now()}`;

    // 2. Open Gateway (Client Side Mock)
    // In a real app, this would open the Razorpay Checkout or Stripe Sheet
    const success = await this.simulatePaymentGateway(provider, amount);

    if (success) {
       await this.fulfillUpgrade(uid, tier);
       return true;
    } else {
       throw new Error("Payment Failed or Cancelled");
    }
  },

  async simulatePaymentGateway(provider: PaymentProvider, amount: number): Promise<boolean> {
     return new Promise((resolve) => {
        // Simulate user interaction time
        setTimeout(() => {
           // 90% Success Rate for testing
           const isSuccess = Math.random() > 0.1;
           if (isSuccess) {
             Alert.alert('Payment Successful', `Transaction processed via ${provider}`);
             resolve(true);
           } else {
             Alert.alert('Payment Failed', 'Bank declined transaction.');
             resolve(false);
           }
        }, 2000);
     });
  },

  async fulfillUpgrade(uid: string, newTier: string) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      tier: newTier
    });
    console.log(`User ${uid} upgraded to ${newTier}`);
  }
};
