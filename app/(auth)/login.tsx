import { YStack, Text, XStack, Spinner } from 'tamagui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { AuthService } from '../../services/authService';
import { Alert } from 'react-native';
import { HolographicBackground } from '../../components/ui/HolographicBackground';
import { CyberpunkInput } from '../../components/ui/CyberpunkInput';
import { NeonButton } from '../../components/ui/NeonButton';
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
    <YStack f={1} ai="center" jc="center" px="$6">
      
      <MotiView
         from={{ opacity: 0, translateY: 20 }}
         animate={{ opacity: 1, translateY: 0 }}
         transition={{ type: 'timing', duration: 1000 }}
         style={{ width: '100%', maxWidth: 400 }}
      >
          <Text 
             fontSize={48} 
             color="$cyan10" 
             fontFamily="$heading" 
             textAlign="left"
             mb="$6"
             textShadowColor="rgba(0, 243, 255, 0.5)"
             textShadowRadius={20}
          >
            {isRegistering ? 'INIT_PROTOCOL' : 'SYSTEM_ENTRY'}
          </Text>
          
          <YStack space="$4" mb="$6">
            <CyberpunkInput 
                placeholder="IDENTITY (EMAIL)" 
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <CyberpunkInput 
                placeholder="ACCESS KEY" 
                secureTextEntry 
                value={password}
                onChangeText={setPassword}
            />
          </YStack>

          <NeonButton 
             label={loading ? 'PROCESSING...' : (isRegistering ? 'ESTABLISH UPLINK' : 'DECRYPT')}
             onPress={handleAuth}
             disabled={loading}
             mb="$4"
          />

          <XStack jc="center">
            <Text 
               color="$gray10" 
               fontSize="$3" 
               onPress={() => setIsRegistering(!isRegistering)}
               pressStyle={{ opacity: 0.5 }}
            >
                {isRegistering ? '< Return to Login Node' : '> Generate New Identity'}
            </Text>
          </XStack>

      </MotiView>

    </YStack>
    </>
  );
}