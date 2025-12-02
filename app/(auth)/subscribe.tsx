import { YStack, Text, Button, XStack, ScrollView } from 'tamagui';
import { useRouter } from 'expo-router';
import { HolographicBackground } from '../../components/ui/HolographicBackground';
import { PaymentService } from '../../services/paymentService';
import { auth } from '../../constants/firebaseConfig';
import { useState } from 'react';
import { Spinner } from 'tamagui';
import { NeonButton } from '../../components/ui/NeonButton';

const TIERS = [
  {
    id: 'Shield',
    name: 'THE SHIELD',
    price: 999,
    currency: 'INR',
    color: '$cyan10',
    variant: 'cyan',
    features: ['Standard DRM', 'Encrypted Feed', 'Verified Badge']
  },
  {
    id: 'Professional',
    name: 'PROFESSIONAL',
    price: 9999,
    currency: 'INR',
    color: '$blue10',
    variant: 'pink',
    features: ['Bio-Steganography', 'Geo-Fencing', 'Priority Support']
  },
  {
    id: 'Elite',
    name: 'ULTRA ELITE',
    price: 99999,
    currency: 'INR',
    color: '$yellow10',
    variant: 'red',
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
      await PaymentService.initiateUpgrade(auth.currentUser.uid, tier.id, tier.price, tier.currency);
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
          <Text fontSize="$8" color="white" fontFamily="$heading" ta="center" mb="$6" textShadowColor="$cyan10" textShadowRadius={10}>
            UPGRADE CLEARANCE
          </Text>

          {TIERS.map((tier) => (
            <YStack 
              key={tier.id} 
              p="$5" 
              mb="$6" 
              borderColor={tier.color} 
              borderLeftWidth={4}
              bg="rgba(0,0,0,0.4)"
            >
               <XStack jc="space-between" ai="center" mb="$2">
                  <Text fontSize="$6" color={tier.color} fontFamily="$heading">{tier.name}</Text>
                  <Text fontSize="$5" color="white" fontFamily="$mono">₹{tier.price.toLocaleString()}</Text>
               </XStack>

               <YStack space="$1" mb="$4">
                  {tier.features.map(f => (
                    <Text key={f} color="$gray10" fontSize="$3" fontFamily="$mono">> {f}</Text>
                  ))}
               </YStack>

               <NeonButton 
                 label={processing === tier.id ? 'PROCESSING...' : 'INITIATE TRANSFER'}
                 variant={tier.variant as any}
                 onPress={() => handlePurchase(tier)}
                 disabled={!!processing}
               />
            </YStack>
          ))}

          <Button chromeless onPress={() => router.back()} mt="$4">
            <Text color="$gray10" fontSize="$3">Return to Lobby</Text>
          </Button>
        </YStack>
      </ScrollView>
    </>
  );
}