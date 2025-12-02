import { BlurView } from 'expo-blur';
import { StyleSheet, Platform } from 'react-native';
import { YStack, YStackProps, useTheme } from 'tamagui';

interface GlassPanelProps extends YStackProps {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
}

export const GlassPanel = ({ children, intensity = 40, tint = 'dark', style, ...props }: GlassPanelProps) => {
  const theme = useTheme();

  return (
    <YStack
       overflow="hidden"
       borderColor="$gray5"
       borderWidth={1}
       borderRadius="$4"
       backgroundColor="rgba(20,20,20,0.4)" // Semi-transparent base
       {...props}
       style={[style]}
    >
      {/* The Blur Layer */}
      {Platform.OS !== 'web' && (
         <BlurView 
            intensity={intensity} 
            tint={tint} 
            style={StyleSheet.absoluteFill} 
         />
      )}
      
      {/* Content Layer */}
      <YStack zIndex={1} f={1}>
        {children}
      </YStack>
    </YStack>
  );
};
