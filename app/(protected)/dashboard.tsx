import { YStack, Text, XStack, Avatar, Button, Card, H3 } from 'tamagui';
import { useEffect, useState } from 'react';
import { auth } from '../../constants/firebaseConfig';
import { AuthService } from '../../services/authService';
import { User } from '../../types';
import { useRouter } from 'expo-router';
import { HolographicBackground } from '../../components/ui/HolographicBackground';
import { GlassPanel } from '../../components/ui/GlassPanel';

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
    <YStack f={1} pt="$10" px="$4" space>
      
      {/* Header / Identity Card */}
      <GlassPanel p="$4" flexDirection="row" ai="center" space>
        <Avatar circular size="$6" borderWidth={2} borderColor="$blue10">
          <Avatar.Image source={{ uri: 'https://api.dicebear.com/9.x/avataaars/svg?seed=' + userProfile.uid }} />
          <Avatar.Fallback bg="$gray5" />
        </Avatar>
        <YStack f={1}>
           <Text color="$white" fontSize="$5" fontWeight="bold" fontFamily="$heading">OPERATIVE</Text>
           <Text color="$gray10" fontSize="$3" fontFamily="$mono">{userProfile.uid.substring(0, 8)}...</Text>
        </YStack>
        <YStack ml="auto" ai="flex-end">
           <Text 
             color={
               userProfile.tier === 'Elite' ? '$yellow10' : 
               userProfile.tier === 'Professional' ? '$blue10' : '$green10'
             } 
             fontWeight="bold"
             textShadowColor="rgba(0,0,0,0.5)"
             textShadowRadius={5}
           >
             [{userProfile.tier.toUpperCase()}]
           </Text>
           <Text color="$gray10" fontSize="$2">SECURE_LINK</Text>
        </YStack>
      </GlassPanel>

      {/* Secure Actions */}
      <YStack space="$4" mt="$6">
         <H3 color="$white" opacity={0.8}>OPERATIONS</H3>
         
         <XStack space>
            <GlassPanel 
               f={1} 
               h={120} 
               p="$3" 
               jc="space-between" 
               pressStyle={{ scale: 0.98, opacity: 0.9 }}
               onPress={() => router.push('/(protected)/feed')}
            >
               <Text fontSize="$5" color="$white">ENCRYPTED FEED</Text>
               <Button 
                  size="$2" 
                  bg="rgba(0,255,255,0.2)" 
                  iconAfter="arrow-right" 
                  borderColor="$cyan10" 
                  borderWidth={1}
                  onPress={() => router.push('/(protected)/feed')}
               >
                  Access
               </Button>
            </GlassPanel>
            <GlassPanel 
               f={1} 
               h={120} 
               p="$3" 
               jc="space-between" 
               pressStyle={{ scale: 0.98, opacity: 0.9 }}
               onPress={() => router.push('/(protected)/create')}
            >
               <Text fontSize="$5" color="$white">NEW TRANSMISSION</Text>
               <Button 
                 size="$2" 
                 bg="rgba(255,0,255,0.2)" 
                 iconAfter="plus" 
                 borderColor="$magenta10" 
                 borderWidth={1}
                 onPress={() => router.push('/(protected)/create')}
               >
                 Create
               </Button>
            </GlassPanel>
         </XStack>
         
         <GlassPanel p="$3">
            <Text fontSize="$4" mb="$2" color="$gray11">DEVICE_BINDING_HASH</Text>
            <Text color="$green10" fontSize="$2" fontFamily="$mono" numberOfLines={1} ellipsizeMode="middle">
              {userProfile.deviceId || 'UNKNOWN_DEVICE'}
            </Text>
         </GlassPanel>
      </YStack>

      <Button 
        mt="auto" 
        mb="$4" 
        bg="rgba(255,0,0,0.2)" 
        borderColor="$red10"
        borderWidth={1}
        onPress={() => {
          AuthService.logout();
          router.replace('/');
        }}
      >
        <Text color="$red10">TERMINATE SESSION</Text>
      </Button>
    </YStack>
    </>
  );
}
