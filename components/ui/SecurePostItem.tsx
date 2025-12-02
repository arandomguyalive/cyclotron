import { YStack, Text, XStack, Avatar, Button } from 'tamagui';
import { Video, ResizeMode } from 'expo-av';
import { Dimensions, Platform } from 'react-native';
import { Content } from '../../types';
import { GlassPanel } from './GlassPanel';
import { useState, useRef } from 'react';
import { Image } from 'tamagui';
import { CountdownTimer } from './CountdownTimer';
import { BiometricGuard } from '../BiometricGuard';
import { BlurView } from 'expo-blur';
import { auth } from '../../constants/firebaseConfig';

const { width, height } = Dimensions.get('window');
const SCREEN_HEIGHT = height; 

interface SecurePostItemProps {
  item: Content;
  isActive: boolean;
}

export const SecurePostItem = ({ item, isActive }: SecurePostItemProps) => {
  const videoRef = useRef<Video>(null);
  const [isLocked, setIsLocked] = useState(false);

  // Only Elite content triggers the biometric lock
  const isBiometricLocked = item.tierLevelRequired === 'Elite';
  
  // Professional/Elite content has Forensic Steganography
  const hasSteganography = item.bioSteganographyEnabled || item.tierLevelRequired === 'Professional' || item.tierLevelRequired === 'Elite';
  const viewerId = auth.currentUser?.uid || 'UNKNOWN_VIEWER';

  return (
    <YStack w={width} h={SCREEN_HEIGHT} bg="black" jc="center" ai="center">
      
      {/* Biometric Guard Logic */}
      {isBiometricLocked && isActive && Platform.OS !== 'web' && (
        <BiometricGuard 
          onSecurityBreach={(breached) => {
             setIsLocked(breached);
          }} 
        />
      )}

      {/* Media Layer */}
      {item.drmUrl.includes('.mp4') || item.type === 'video' ? (
        <Video
          ref={videoRef}
          style={{ width: width, height: SCREEN_HEIGHT }}
          source={{ uri: item.drmUrl }}
          resizeMode={ResizeMode.COVER}
          isLooping
          // Pause if not active OR if biometric lock is triggered
          shouldPlay={isActive && !isLocked}
        />
      ) : (
        <Image 
          source={{ uri: item.drmUrl }} 
          width={width} 
          height={SCREEN_HEIGHT} 
          objectFit="cover" 
        />
      )}

      {/* FORENSIC BIO-STEGANOGRAPHY LAYER */}
      {hasSteganography && (
          <YStack position="absolute" top={0} left={0} right={0} bottom={0} zIndex={10} pointerEvents="none" jc="space-between">
              {/* We repeat the viewer ID in a grid with very low opacity. Invisible to eye, visible to contrast enhancement. */}
              {[...Array(10)].map((_, i) => (
                  <XStack key={i} jc="space-around" opacity={0.03}>
                      {[...Array(3)].map((_, j) => (
                          <Text key={j} color="white" fontSize={10} fontWeight="bold">{viewerId}</Text>
                      ))}
                  </XStack>
              ))}
          </YStack>
      )}

      {/* Security Lock Overlay */}
      {isLocked && (
         <BlurView intensity={90} tint="dark" style={{ position: 'absolute', width, height, zIndex: 999, alignItems: 'center', justifyContent: 'center' }}>
            <YStack ai="center" space>
               <Button size="$6" circular icon="lock" bg="$red10" />
               <Text color="$red10" fontSize="$6" fontWeight="bold" mt="$4">BIOMETRIC LOCK ENGAGED</Text>
               <Text color="white">EYES ON SCREEN REQUIRED</Text>
            </YStack>
         </BlurView>
      )}

      {/* Overlay UI (Holographic) */}
      <YStack 
         position="absolute" 
         bottom={100} 
         left={0} 
         right={0} 
         p="$4" 
         ai="flex-start"
      >
         <GlassPanel 
            p="$3" 
            bg="rgba(0,0,0,0.5)" 
            borderColor="$gray6" 
            maxWidth={width * 0.8}
         >
            <XStack ai="center" space mb="$2">
               <Avatar size="$3" circular borderColor="$cyan10" borderWidth={1}>
                   <Avatar.Image source={{ uri: 'https://api.dicebear.com/9.x/avataaars/svg?seed=' + item.creatorId }} />
                   <Avatar.Fallback bg="$gray5" />
               </Avatar>
               <Text color="$cyan10" fontWeight="bold" fontSize="$3">
                  {item.creatorId.substring(0, 8)}
               </Text>
            </XStack>
            
            <Text color="white" fontSize="$4" textShadowColor="black" textShadowRadius={2}>
               {item.caption || "Encrypted Transmission"}
            </Text>
            
            {item.expiresAt && <CountdownTimer expiresAt={item.expiresAt} />}

            <Text color="$gray9" fontSize="$2" mt="$2" fontFamily="$mono">
               SECURE_HASH: {item.id.substring(0, 12)}
            </Text>
         </GlassPanel>
      </YStack>

      {/* Side Actions */}
      <YStack position="absolute" bottom={120} right={10} space>
          <Button circular size="$5" icon="heart" themeInverse opacity={0.8} />
          <Button circular size="$5" icon="message-circle" themeInverse opacity={0.8} />
          <Button circular size="$5" icon="share-2" themeInverse opacity={0.8} />
      </YStack>

    </YStack>
  );
};
