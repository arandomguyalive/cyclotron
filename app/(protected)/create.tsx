import { YStack, Text, Button, Input, Spinner, XStack, Image, Label, Switch } from 'tamagui';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { HolographicBackground } from '../../components/ui/HolographicBackground';
import { GlassPanel } from '../../components/ui/GlassPanel';
import { MediaService } from '../../services/mediaService';
import { AuthService } from '../../services/authService';
import { auth, db } from '../../constants/firebaseConfig';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Video, ResizeMode } from 'expo-av';
import { User } from '../../types';

export default function CreatePostScreen() {
  const router = useRouter();
  const [media, setMedia] = useState<any>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [ttl, setTtl] = useState<number>(3600); 
  const [userProfile, setUserProfile] = useState<User | null>(null);
  
  // Professional Features
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
        // Automatically elevate to Professional if advanced features are used
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
        <Text fontSize="$6" color="$white" fontFamily="$heading" mb="$4">NEW TRANSMISSION</Text>

        <GlassPanel 
          h={250} 
          ai="center" 
          jc="center" 
          overflow="hidden" 
          borderColor={media ? "$green10" : "$gray6"}
        >
          {media ? (
            mediaType === 'video' ? (
              <Video
                source={{ uri: media.uri }}
                style={{ width: '100%', height: '100%' }}
                resizeMode={ResizeMode.COVER}
                shouldPlay
                isLooping
              />
            ) : (
              <Image source={{ uri: media.uri }} w="100%" h="100%" objectFit="cover" />
            )
          ) : (
            <YStack ai="center" space>
              <Text color="$gray10">SELECT_MEDIA_SOURCE</Text>
              <XStack space>
                <Button size="$3" icon="image" onPress={() => handlePick('image')}>IMG</Button>
                <Button size="$3" icon="video" onPress={() => handlePick('video')}>VID</Button>
              </XStack>
            </YStack>
          )}
        </GlassPanel>

        <GlassPanel p="$4" space>
           <Input 
             placeholder="ADD_ENCRYPTED_CAPTION..." 
             value={caption} 
             onChangeText={setCaption}
             bg="transparent"
             borderWidth={0}
             color="$white"
           />
           
           <Text color="$gray10" fontSize="$2" mb="$2">SELF_DESTRUCT_TIMER</Text>
           <XStack space>
              {[{ label: '1H', value: 3600 }, { label: '24H', value: 86400 }, { label: '7D', value: 604800 }].map(opt => (
                <Button 
                  key={opt.label} 
                  size="$2" 
                  bg={ttl === opt.value ? '$red10' : 'transparent'}
                  borderColor="$red10"
                  borderWidth={1}
                  onPress={() => setTtl(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
           </XStack>
        </GlassPanel>

        {/* PROFESSIONAL TOOLS */}
        {isPro && (
            <GlassPanel p="$4" borderColor="$blue10" space>
                <Text color="$blue10" fontSize="$3" fontWeight="bold">PROFESSIONAL TOOLS</Text>
                
                <Text color="$gray10" fontSize="$2">GEO-BLOCKING (REGIONAL FENCE)</Text>
                <XStack space flexWrap="wrap">
                    {['US', 'CN', 'RU', 'IN', 'EU'].map(code => (
                        <Button
                           key={code}
                           size="$2"
                           chromeless
                           bg={blockedCountries.includes(code) ? '$blue10' : 'rgba(0,0,0,0.5)'}
                           onPress={() => toggleCountry(code)}
                           color="white"
                        >
                            {code}
                        </Button>
                    ))}
                </XStack>
                
                <XStack ai="center" space mt="$2">
                    <Text color="$gray10" fontSize="$2">FORENSIC BIO-STEGANOGRAPHY</Text>
                    <Text color="$green10" fontSize="$2">ACTIVE</Text>
                </XStack>
            </GlassPanel>
        )}

        <Button 
          mt="auto" 
          mb="$6" 
          themeInverse 
          onPress={handleUpload}
          disabled={uploading || !media}
          bg={isPro ? '$blue10' : '$red10'}
        >
          {uploading ? <Spinner color="$white" /> : (isPro ? 'INITIATE PRO UPLOAD' : 'INITIATE UPLOAD')}
        </Button>
      </YStack>
    </>
  );
}
