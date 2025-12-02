import { YStack, Text, Input, Button, XStack, Spinner } from 'tamagui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { AuthService } from '../../services/authService';
import { Alert } from 'react-native';
import { HolographicBackground } from '../../components/ui/HolographicBackground';
import { GlassPanel } from '../../components/ui/GlassPanel';
import { MotiView } from 'moti';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter Identity and Key');
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        await AuthService.registerWithEmail(email, password);
      } else {
        await AuthService.loginWithEmail(email, password);
      }
      router.replace('/(protected)/dashboard');
    } catch (error: any) {
      Alert.alert('Access Denied', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <HolographicBackground />
    <YStack f={1} ai="center" jc="center" p="$4">
      
      <MotiView
         from={{ opacity: 0, scale: 0.9 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ type: 'timing', duration: 800 }}
         style={{ width: '100%', maxWidth: 400 }}
      >
        <GlassPanel p="$6" space="$4">
          <Text 
             fontSize="$9" 
             color="$white" 
             fontFamily="$heading" 
             textAlign="center"
             textShadowColor="rgba(0, 255, 255, 0.75)"
             textShadowRadius={10}
             mb="$2"
          >
            {isRegistering ? 'INIT_IDENTITY' : 'SYSTEM_LOGIN'}
          </Text>
          
          <YStack space="$2">
            <Text fontSize="$3" color="$gray10" ml="$2">IDENTITY_STRING</Text>
            <Input 
                placeholder="user@net.sec" 
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                bg="rgba(0,0,0,0.3)"
                borderColor="$gray6"
                color="$white"
                height={50}
            />
          </YStack>

          <YStack space="$2">
            <Text fontSize="$3" color="$gray10" ml="$2">PRIVATE_KEY</Text>
            <Input 
                placeholder="••••••••••••" 
                secureTextEntry 
                value={password}
                onChangeText={setPassword}
                bg="rgba(0,0,0,0.3)"
                borderColor="$gray6"
                color="$white"
                height={50}
            />
          </YStack>

          <Button 
            mt="$4"
            onPress={handleAuth} 
            disabled={loading}
            bg="$blue10"
            borderColor="$blue8"
            borderWidth={1}
            pressStyle={{ bg: "$blue9", scale: 0.98 }}
            height={50}
          >
            <Text color="white" fontWeight="bold" fontSize="$4">
               {loading ? <Spinner color="white" /> : (isRegistering ? 'ESTABLISH_LINK' : 'DECRYPT_ACCESS')}
            </Text>
          </Button>

          <XStack jc="center" mt="$4">
            <Button 
              size="$2" 
              chromeless 
              onPress={() => setIsRegistering(!isRegistering)}
            >
              <Text color="$gray10" fontSize="$3">
                  {isRegistering ? 'Return to Login Node' : 'Generate New Identity'}
              </Text>
            </Button>
          </XStack>
        </GlassPanel>
      </MotiView>

    </YStack>
    </>
  );
}
