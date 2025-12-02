import { YStack, Text, XStack, Avatar, Button } from 'tamagui';
import { useEffect, useState } from 'react';
import { auth } from '../../constants/firebaseConfig';
import { AuthService } from '../../services/authService';
import { User } from '../../types';
import { useRouter } from 'expo-router';
import { HolographicBackground } from '../../components/ui/HolographicBackground';
import { NeonButton } from '../../components/ui/NeonButton';
import { MotiView } from 'moti';

export default function DashboardScreen() {
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
       if (auth.currentUser) {
         const profile = await AuthService.getUserProfile(auth.currentUser.uid);
         setUserProfile(profile);
       }
    };
    fetchProfile();
  }, []);

  if (!userProfile) return (
    <>
       <HolographicBackground />
       <YStack f={1} />
    </>
  );

  return (
    <>
    <HolographicBackground />
    <YStack f={1} pt="$10" px="$6" jc="space-between" pb="$8">
      
      {/* HUD HEADER */}
      <XStack ai="center" space>
        <Avatar circular size="$6" borderWidth={2} borderColor="$cyan10">
          <Avatar.Image source={{ uri: 'https://api.dicebear.com/9.x/avataaars/svg?seed=' + userProfile.uid }} />
          <Avatar.Fallback bg="transparent" />
        </Avatar>
        <YStack>
           <Text color="$cyan10" fontSize="$6" fontFamily="$heading" letterSpacing={2}>OPERATIVE</Text>
           <Text color="$gray10" fontSize="$3" fontFamily="$mono">ID: {userProfile.uid.substring(0, 8)}</Text>
        </YStack>
      </XStack>

      {/* TIER BADGE (Floating) */}
      <MotiView
         from={{ scale: 0 }}
         animate={{ scale: 1 }}
         transition={{ type: 'spring' }}
         style={{ position: 'absolute', top: 60, right: 20 }}
      >
         <Text 
           color={
             userProfile.tier === 'Elite' ? '$yellow10' : 
             userProfile.tier === 'Professional' ? '$blue10' : '$green10'
           } 
           fontFamily="$heading"
           fontSize="$9"
           opacity={0.2}
           transform={[{ rotate: '-15deg' }]}
         >
           {userProfile.tier.toUpperCase()}
         </Text>
      </MotiView>

      {/* CENTRAL OPERATIONS HUD */}
      <YStack space="$6" w="100%">
         <Text color="$gray10" fontSize="$3" mb="$2" letterSpacing={4}>AVAILABLE PROTOCOLS</Text>
         
         <NeonButton 
            label="ACCESS ENCRYPTED FEED" 
            variant="cyan" 
            onPress={() => router.push('/(protected)/feed')}
         />

         <NeonButton 
            label="INITIATE TRANSMISSION" 
            variant="pink" 
            onPress={() => router.push('/(protected)/create')}
         />
      </YStack>

      {/* FOOTER STATUS */}
      <YStack>
         <XStack jc="space-between" ai="flex-end">
            <YStack>
                <Text color="$gray10" fontSize="$2">DEVICE BINDING HASH</Text>
                <Text color="$green10" fontSize="$2" fontFamily="$mono">
                  {userProfile.deviceId || 'UNKNOWN_DEVICE'}
                </Text>
            </YStack>
            
            <Button chromeless onPress={() => {
                AuthService.logout();
                router.replace('/');
            }}>
                <Text color="$red10" fontSize="$3">TERMINATE</Text>
            </Button>
         </XStack>
      </YStack>
    </YStack>
    </>
  );
}