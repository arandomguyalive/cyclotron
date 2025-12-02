import { YStack, Text, Button, H2, Paragraph, Spinner } from 'tamagui';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform, FlatList, Modal, View } from 'react-native';
import { useEffect, useState } from 'react';
import { ContentService } from '../services/contentService';
import { Content } from '../types';
import { Video, ResizeMode } from 'expo-av';
import { NeonButton } from '../components/ui/NeonButton';

// --- COMPONENTS ---

const BufferedView = ({ children }: { children: React.ReactNode }) => {
  const [buffering, setBuffering] = useState(true);

  useEffect(() => {
    const delay = Math.random() * 2500 + 1500; 
    const timer = setTimeout(() => setBuffering(false), delay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <YStack f={1} ai="center" jc="center" bg="#050505">
      {buffering ? (
        <YStack ai="center" space>
          <Spinner size="large" color="#333" />
          <Text color="#333" fontSize="$2">Buffering (Free Tier)...</Text>
        </YStack>
      ) : (
        children
      )}
    </YStack>
  );
};

const AdCard = ({ onPress }: { onPress: () => void }) => (
  <YStack h={400} m="$0" bg="$yellow10" ai="center" jc="center" p="$4">
    <Text fontSize={48} fontWeight="bold" color="black" ta="center" lineHeight={48}>BUY CRYPTO</Text>
    <Text fontSize="$6" color="black" ta="center" mt="$2">1000x LEVERAGE</Text>
    <Button mt="$6" bg="black" color="$yellow10" size="$5" onPress={onPress} fontWeight="bold">CLICK HERE</Button>
    <Text fontSize="$2" position="absolute" bottom={10} right={10} color="rgba(0,0,0,0.5)">SPONSORED CONTENT</Text>
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
    const nagLoop = setInterval(() => {
       if (Math.random() > 0.6) setShowNag(true);
    }, 25000);
    return () => clearInterval(nagLoop);
  }, []);

  const handleSeed = async () => {
    await ContentService.seedLobbyData();
    loadFeed();
  };

  return (
    <YStack f={1} bg="#050505">
       {/* Minimalist Header */}
      <YStack pt="$8" pb="$4" px="$4" ai="center" borderBottomWidth={1} borderColor="#222">
        <H2 color="#444" fontSize="$5" letterSpacing={4}>THE LOBBY</H2>
      </YStack>

      {/* Feed */}
      {loading ? (
         <YStack f={1} ai="center" jc="center">
            <Spinner size="large" color="$red10" />
         </YStack>
      ) : (
        <FlatList
          data={feed}
          keyExtractor={(item, index) => item.id || `item-${index}`}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            if (item.type === 'ad') return <AdCard onPress={() => router.push('/(auth)/subscribe')} />;

            const content = item.data as Content;
            return (
              <YStack h={500} borderBottomWidth={1} borderColor="#222" overflow="hidden">
                 <BufferedView>
                    <Video
                      style={{ width: '100%', height: '100%' }}
                      source={{ uri: content.drmUrl }}
                      resizeMode={ResizeMode.COVER}
                      shouldPlay={false}
                      isMuted={true}
                    />
                    {/* Heavy Blur Logic */}
                    <BlurView 
                      intensity={Platform.OS === 'android' ? 100 : 60} 
                      style={StyleSheet.absoluteFill} 
                      tint="dark"
                    />
                    <YStack position="absolute" ai="center" jc="center" fullscreen pointerEvents="none">
                       <Text color="#666" fontSize="$9" fontWeight="bold" opacity={0.2}>LOCKED</Text>
                    </YStack>
                 </BufferedView>
              </YStack>
            );
          }}
          ListEmptyComponent={() => (
            <YStack ai="center" p="$4" mt="$10">
              <Text color="$gray10">NO SIGNAL</Text>
              <Button onPress={handleSeed} mt="$4" chromeless>Seed Data</Button>
            </YStack>
          )}
        />
      )}

      {/* Bottom Floating Button */}
      <YStack position="absolute" bottom="$8" left={0} right={0} ai="center">
         <NeonButton 
            label="AUTHENTICATE" 
            variant="red"
            width={200}
            onPress={() => router.push('/(auth)/login')}
         />
      </YStack>

      {/* Nag Modal */}
      <Modal visible={showNag} transparent animationType="fade">
         <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' }}>
            <YStack p="$6" w="90%" ai="center" space>
               <Text fontSize="$9" color="$red10" fontWeight="bold" ta="center" fontFamily="$heading">BANDWIDTH LIMIT</Text>
               <Text color="$gray10" ta="center" fontSize="$4" fontFamily="$mono" mt="$4">
                 You are in the queue position #48,291.
               </Text>
               
               <YStack w="100%" mt="$8" space>
                   <NeonButton 
                      label="PRIORITY ACCESS (UPGRADE)" 
                      variant="cyan" 
                      onPress={() => { setShowNag(false); router.push('/(auth)/subscribe'); }}
                   />
                   
                   <Button chromeless mt="$4" onPress={() => setShowNag(false)}>
                     <Text color="$gray10">Wait (Slow)</Text>
                   </Button>
               </YStack>
            </YStack>
         </View>
      </Modal>

    </YStack>
  );
}
