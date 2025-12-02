import { YStack, Text, Button, XStack, ScrollView } from 'tamagui';
import { useRouter } from 'expo-router';
import { HolographicBackground } from '../../components/ui/HolographicBackground';
import { GlassPanel } from '../../components/ui/GlassPanel';
import { PaymentService } from '../../services/paymentService';
import { auth } from '../../constants/firebaseConfig';
import { useState } from 'react';
import { Spinner } from 'tamagui';

const TIERS = [
  {
    id: 'Shield',
    name: 'THE SHIELD',
    price: 999,
    currency: 'INR',
    color: '$cyan10',
    features: ['Standard DRM', 'Encrypted Feed', 'Verified Badge']
  },
  {
    id: 'Professional',
    name: 'PROFESSIONAL',
    price: 9999,
    currency: 'INR',
    color: '$blue10',
    features: ['Bio-Steganography', 'Geo-Fencing', 'Priority Support']
  },
  {
    id: 'Elite',
    name: 'ULTRA ELITE',
    price: 99999,
    currency: 'INR',
    color: '$yellow10',
    features: ['Biometric Lock', 'Invite Only Access', 'Zero-Knowledge Proofs']
  }
];

export default function SubscribeScreen() {
  const router = useRouter();
  const [processing, setProcessing] = useState<string | null>(null);

  const handlePurchase = async (tier: any) => {
    if (!auth.currentUser) {
      router.push('/(auth)/login');
      return;
    }

    setProcessing(tier.id);
    try {
      await PaymentService.initiateUpgrade(
        auth.currentUser.uid, 
        tier.id, 
        tier.price, 
        tier.currency
      );
      router.replace('/(protected)/dashboard');
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <>
      <HolographicBackground />
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        <YStack f={1} pt="$8" px="$4" space>
          <Text fontSize="$8" color="white" fontFamily="$heading" ta="center" mb="$4">
            UPGRADE CLEARANCE
          </Text>

          {TIERS.map((tier) => (
            <GlassPanel 
              key={tier.id} 
              p="$5" 
              mb="$4" 
              borderColor={tier.color} 
              borderWidth={1}
              pressStyle={{ scale: 0.98 }}
            >
               <XStack jc="space-between" ai="center" mb="$2">
                  <Text fontSize="$6" color={tier.color} fontWeight="bold">{tier.name}</Text>
                  <Text fontSize="$5" color="white">₹{tier.price.toLocaleString()}</Text>
               </XStack>

               <YStack space="$1" mb="$4">
                  {tier.features.map(f => (
                    <Text key={f} color="$gray10" fontSize="$3">• {f}</Text>
                  ))}
               </YStack>

               <Button 
                 bg={tier.color} 
                 color="black" 
                 fontWeight="bold"
                 onPress={() => handlePurchase(tier)}
                 disabled={!!processing}
               >
                 {processing === tier.id ? <Spinner color="black" /> : 'INITIATE TRANSFER'}
               </Button>
            </GlassPanel>
          ))}

          <Button chromeless onPress={() => router.back()}>
            <Text color="$gray10">Return to Lobby</Text>
          </Button>
        </YStack>
      </ScrollView>
    </>
  );
}
