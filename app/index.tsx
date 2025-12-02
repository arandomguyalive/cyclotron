import { YStack, Text, Button, H2, Paragraph, Spinner, XStack, Dialog } from 'tamagui';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform, FlatList, Modal, View } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { ContentService } from '../services/contentService';
import { Content } from '../types';
import { Video, ResizeMode } from 'expo-av';
import { GlassPanel } from '../components/ui/GlassPanel';
import { HolographicBackground } from '../components/ui/HolographicBackground';

// --- COMPONENTS ---

// 1. The Artificial Lag Wrapper (Frustration Engine)
const BufferedView = ({ children }: { children: React.ReactNode }) => {
  const [buffering, setBuffering] = useState(true);

  useEffect(() => {
    // Random delay between 1.5s and 4s to simulate poor connection
    const delay = Math.random() * 2500 + 1500; 
    const timer = setTimeout(() => setBuffering(false), delay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <YStack f={1} ai="center" jc="center" bg="black">
      {buffering ? (
        <YStack ai="center" space>
          <Spinner size="large" color="$gray8" />
          <Text color="$gray8" fontSize="$2">Buffering (Free Tier)...</Text>
        </YStack>
      ) : (
        children
      )}
    </YStack>
  );
};

// 2. The Ad Card (High Contrast, Annoying)
const AdCard = ({ onPress }: { onPress: () => void }) => (
  <YStack h={300} m="$4" bg="$yellow10" ai="center" jc="center" p="$4" elevation="$5">
    <Text fontSize="$9" fontWeight="bold" color="black" ta="center">BUY CRYPTO NOW!</Text>
    <Text fontSize="$5" color="black" ta="center" mt="$2">1000x LEVERAGE!</Text>
    <Button mt="$4" bg="black" color="white" size="$4" onPress={onPress}>CLICK HERE</Button>
    <Text fontSize="$1" position="absolute" bottom={2} right={2} color="black">Ad</Text>
  </YStack>
);

// --- SCREEN ---

export default function LobbyScreen() {
  const router = useRouter();
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNag, setShowNag] = useState(false);

  const loadFeed = async () => {
    setLoading(true);
    try {
      const data = await ContentService.getLobbyFeed();
      
      // Inject Ads every 3 items
      const mixedFeed: any[] = [];
      data.forEach((item, index) => {
        mixedFeed.push({ type: 'content', data: item });
        if ((index + 1) % 3 === 0) {
          mixedFeed.push({ type: 'ad', id: `ad-${index}` });
        }
      });
      
      setFeed(mixedFeed);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();

    // Random Nag Screen Timer (Every 15-30 seconds)
    const nagLoop = setInterval(() => {
       if (Math.random() > 0.5) setShowNag(true);
    }, 20000);

    return () => clearInterval(nagLoop);
  }, []);

  const handleSeed = async () => {
    await ContentService.seedLobbyData();
    loadFeed();
  };

  return (
    <YStack f={1} bg="$background">
      {/* Degraded Background (No Hologram) */}
      <YStack position="absolute" fullscreen bg="#1a1a1a" />

       {/* Header */}
      <YStack pt="$8" pb="$4" px="$4" ai="center" space>
        <H2 color="$color" opacity={0.5}>THE LOBBY</H2>
        <Text color="$red10" fontSize="$3" letterSpacing={2}>UNVERIFIED FEED</Text>
      </YStack>

      {/* Feed */}
      {loading ? (
         <Spinner size="large" color="$red10" />
      ) : (
        <FlatList
          data={feed}
          keyExtractor={(item, index) => item.id || `item-${index}`}
          renderItem={({ item }) => {
            if (item.type === 'ad') return <AdCard onPress={() => router.push('/(auth)/subscribe')} />;

            const content = item.data as Content;
            return (
              <GlassPanel mb="$4" mx="$4" h={300} overflow="hidden" borderColor="$gray8">
                 <BufferedView>
                    <Video
                      style={{ width: '100%', height: '100%' }}
                      source={{ uri: content.drmUrl }}
                      resizeMode={ResizeMode.COVER}
                      shouldPlay={false} // Auto-play disabled for free users
                      isMuted={true}
                    />
                    {/* The Blur Filter (Censorship) */}
                    <BlurView 
                      intensity={Platform.OS === 'android' ? 80 : 40} 
                      style={StyleSheet.absoluteFill} 
                      tint="dark"
                    />
                    <YStack position="absolute" ai="center" jc="center" fullscreen>
                       <Text color="white" opacity={0.5} fontWeight="bold">PREMIUM CONTENT</Text>
                       <Text color="white" opacity={0.5} fontSize="$2">Upgrade to View</Text>
                    </YStack>
                 </BufferedView>
              </GlassPanel>
            );
          }}
          ListEmptyComponent={() => (
            <YStack ai="center" p="$4">
              <Text color="$gray10">No signals found.</Text>
              <Button onPress={handleSeed} mt="$4">Dev: Seed</Button>
            </YStack>
          )}
        />
      )}

      {/* Sticky Upgrade Button */}
      <YStack position="absolute" bottom="$6" left={0} right={0} ai="center">
         <Button 
            size="$6" 
            themeInverse
            onPress={() => router.push('/(auth)/login')}
            elevation="$4"
            circular
            width={200}
            bg="$red10"
         >
          AUTHENTICATE
         </Button>
      </YStack>

      {/* The Nag Modal (Obstruction) */}
      <Modal visible={showNag} transparent animationType="slide">
         <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
            <YStack bg="$gray2" p="$6" borderRadius="$4" w="80%" ai="center" space>
               <Text fontSize="$6" color="$red10" fontWeight="bold" ta="center">SERVER CAPACITY REACHED</Text>
               <Paragraph color="$gray10" ta="center">
                 Lobby bandwidth is restricted. Premium users have priority access.
               </Paragraph>
               <Button mt="$4" w="100%" onPress={() => router.push('/(auth)/subscribe')} themeInverse>
                 UPGRADE NOW
               </Button>
               <Button chromeless mt="$2" onPress={() => setShowNag(false)}>
                 Wait in Queue (5s)
               </Button>
            </YStack>
         </View>
      </Modal>

    </YStack>
  );
}