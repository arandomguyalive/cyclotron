import { YStack, Text, Spinner, Button } from 'tamagui';
import { FlatList, Dimensions, ViewToken } from 'react-native';
import { useEffect, useState, useRef, useCallback } from 'react';
import { ContentService } from '../../services/contentService';
import { Content } from '../../types';
import { SecurePostItem } from '../../components/ui/SecurePostItem';
import { HolographicBackground } from '../../components/ui/HolographicBackground';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

export default function FeedScreen() {
  const [feed, setFeed] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const loadFeed = async () => {
    setLoading(true);
    try {
      const data = await ContentService.getSecureFeed();
      setFeed(data);
      if (data.length > 0) setActivePostId(data[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  // Viewability Config to auto-play videos
  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setActivePostId(viewableItems[0].item.id);
    }
  }, []);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  }).current;

  return (
    <>
      <HolographicBackground />
      <YStack f={1} bg="black">
        
        {/* Back Button Overlay */}
        <Button 
          position="absolute" 
          top={insets.top + 10} 
          left={20} 
          zIndex={100} 
          circular 
          size="$3" 
          icon="arrow-left" 
          onPress={() => router.back()}
          bg="rgba(0,0,0,0.5)"
          color="white"
        />

        {loading ? (
           <YStack f={1} ai="center" jc="center">
              <Spinner size="large" color="$cyan10" />
              <Text color="$cyan10" mt="$4">DECRYPTING STREAM...</Text>
           </YStack>
        ) : feed.length === 0 ? (
           <YStack f={1} ai="center" jc="center" p="$4">
              <Text color="$gray10" ta="center">NO SIGNALS DETECTED.</Text>
              <Button mt="$4" onPress={loadFeed}>REFRESH SCAN</Button>
           </YStack>
        ) : (
          <FlatList
            data={feed}
            renderItem={({ item }) => (
              <SecurePostItem item={item} isActive={activePostId === item.id} />
            )}
            keyExtractor={(item) => item.id}
            pagingEnabled
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
            snapToInterval={height}
            snapToAlignment="start"
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
          />
        )}
      </YStack>
    </>
  );
}
