import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { PanicButton } from '../../components/PanicButton';
import { View, ActivityIndicator } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../constants/firebaseConfig';
import { AuthService } from '../../services/authService';
import { DeviceBindingService } from '../../services/deviceBinding';
import { YStack, Text } from 'tamagui';

export default function ProtectedLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        setAuthorized(false);
        router.replace('/(auth)/login');
        return;
      }

      try {
        // 1. Get User Profile
        const userProfile = await AuthService.getUserProfile(user.uid);
        
        if (!userProfile) {
          throw new Error("User profile not found.");
        }

        // 2. Get Current Device ID
        const currentDeviceId = await DeviceBindingService.getDeviceId();

        // 3. Compare (Security Check)
        if (userProfile.deviceId !== currentDeviceId) {
           console.warn(`Device Mismatch! Expected ${userProfile.deviceId}, Got ${currentDeviceId}`);
           throw new Error("Device Identity Mismatch. Access Denied.");
        }

        setAuthorized(true);
      } catch (e: any) {
        console.error(e);
        setErrorMsg(e.message);
        setAuthorized(false);
        // Optional: Auto-logout on security failure
        // await AuthService.logout();
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <YStack f={1} ai="center" jc="center" bg="$background">
        <ActivityIndicator size="large" color="white" />
        <Text mt="$4">Verifying Encryption Keys...</Text>
      </YStack>
    );
  }

  if (errorMsg) {
     return (
      <YStack f={1} ai="center" jc="center" bg="$background" p="$4" space>
        <Text fontSize="$6" color="$red10" ta="center">SECURITY ALERT</Text>
        <Text color="$gray10" ta="center">{errorMsg}</Text>
        <PanicButton /> 
      </YStack>
     );
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
      <PanicButton />
    </View>
  );
}
