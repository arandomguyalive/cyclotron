import { YStack, Text, Button, Input, Spinner, XStack, Image } from 'tamagui';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { HolographicBackground } from '../../components/ui/HolographicBackground';
import { MediaService } from '../../services/mediaService';
import { AuthService } from '../../services/authService';
import { auth, db } from '../../constants/firebaseConfig';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Video, ResizeMode } from 'expo-av';
import { User } from '../../types';
import { NeonButton } from '../../components/ui/NeonButton';
import { CyberpunkInput } from '../../components/ui/CyberpunkInput';

export default function CreatePostScreen() {
  const router = useRouter();
  const [media, setMedia] = useState<any>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [ttl, setTtl] = useState<number>(3600); 
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [blockedCountries, setBlockedCountries] = useState<string[]>([]);

  useEffect(() => {
     if (auth.currentUser) {
        AuthService.getUserProfile(auth.currentUser.uid).then(setUserProfile);
     }
  }, []);

  const handlePick = async (type: 'image' | 'video') => {
    const result = await MediaService.pickMedia(type);
    if (result) {
      setMedia(result);
      setMediaType(type);
    }
  };

  const toggleCountry = (code: string) => {
      if (blockedCountries.includes(code)) {
          setBlockedCountries(prev => prev.filter(c => c !== code));
      } else {
          setBlockedCountries(prev => [...prev, code]);
      }
  };

  const handleUpload = async () => {
    if (!media || !auth.currentUser) return;
    setUploading(true);
    try {
      const filename = `posts/${auth.currentUser.uid}/${Date.now()}.${mediaType === 'video' ? 'mp4' : 'jpg'}`;
      const downloadUrl = await MediaService.uploadFile(media.uri, filename);
      const expirationDate = new Date();
      expirationDate.setSeconds(expirationDate.getSeconds() + ttl);

      await addDoc(collection(db, 'content'), {
        creatorId: auth.currentUser.uid,
        drmUrl: downloadUrl,
        tierLevelRequired: blockedCountries.length > 0 ? 'Professional' : 'Shield', 
        bioSteganographyEnabled: userProfile?.tier === 'Professional' || userProfile?.tier === 'Elite',
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expirationDate),
        type: mediaType,
        caption: caption,
        geoBlockList: blockedCountries
      });
      router.back();
    } catch (e) {
      console.error(e);
      alert('Transmission Failed');
    } finally {
      setUploading(false);
    }
  };

  const isPro = userProfile?.tier === 'Professional' || userProfile?.tier === 'Elite';

  return (
    <>
      <HolographicBackground />
      <YStack f={1} pt="$8" px="$4" space>
        <Text fontSize="$6" color="$cyan10" fontFamily="$heading" mb="$4">NEW TRANSMISSION</Text>

        {/* Media Preview Area - Minimalist */}
        <YStack h={300} bg="rgba(0,0,0,0.3)" borderWidth={1} borderColor="$gray8" jc="center" ai="center" overflow="hidden">
          {media ? (
            mediaType === 'video' ? (
              <Video source={{ uri: media.uri }} style={{ width: '100%', height: '100%' }} resizeMode={ResizeMode.COVER} shouldPlay isLooping />
            ) : (
              <Image source={{ uri: media.uri }} w="100%" h="100%" objectFit="cover" />
            )
          ) : (
            <XStack space>
               <Button chromeless onPress={() => handlePick('image')} icon="image">
                 <Text color="$cyan10">SELECT IMG</Text>
               </Button>
               <Button chromeless onPress={() => handlePick('video')} icon="video">
                 <Text color="$cyan10">SELECT VID</Text>
               </Button>
            </XStack>
          )}
        </YStack>

        <CyberpunkInput 
             placeholder="ENCRYPTED_CAPTION..." 
             value={caption} 
             onChangeText={setCaption}
        />

        {/* TTL Select */}
        <YStack space="$2" mb="$4">
           <Text color="$gray10" fontSize="$2" fontFamily="$mono">SELF_DESTRUCT_TIMER</Text>
           <XStack space>
              {[{ label: '1H', value: 3600 }, { label: '24H', value: 86400 }, { label: '7D', value: 604800 }].map(opt => (
                <Button 
                  key={opt.label} 
                  size="$2" 
                  chromeless
                  borderColor={ttl === opt.value ? '$red10' : '$gray8'}
                  borderWidth={1}
                  onPress={() => setTtl(opt.value)}
                >
                  <Text color={ttl === opt.value ? '$red10' : '$gray10'}>{opt.label}</Text>
                </Button>
              ))}
           </XStack>
        </YStack>

        {/* Pro Tools */}
        {isPro && (
            <YStack space="$2" mb="$4" opacity={0.8}>
                <Text color="$blue10" fontSize="$2" fontFamily="$mono">GEO-BLOCKING ACTIVE</Text>
                <XStack space flexWrap="wrap">
                    {['US', 'CN', 'RU', 'IN', 'EU'].map(code => (
                        <Button
                           key={code} size="$2" chromeless
                           bg={blockedCountries.includes(code) ? '$blue10' : 'transparent'}
                           borderColor="$blue10" borderWidth={1}
                           onPress={() => toggleCountry(code)}
                        >
                           <Text color={blockedCountries.includes(code) ? 'black' : '$blue10'}>{code}</Text>
                        </Button>
                    ))}
                </XStack>
            </YStack>
        )}

        <NeonButton 
           mt="auto" mb="$6"
           label={uploading ? 'UPLOADING...' : 'INITIATE UPLOAD'}
           variant={isPro ? 'cyan' : 'red'}
           onPress={handleUpload}
           disabled={uploading || !media}
        />
      </YStack>
    </>
  );
}