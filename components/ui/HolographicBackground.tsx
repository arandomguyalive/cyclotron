import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { YStack } from 'tamagui';

export const HolographicBackground = () => {
  return (
    <YStack position="absolute" top={0} left={0} right={0} bottom={0} zIndex={-1} bg="black">
        {/* Deep Space Base */}
        <LinearGradient
          colors={['#000000', '#0a0a12', '#050505']}
          style={StyleSheet.absoluteFill}
        />

        {/* Animated Aurora / Nebula Effect */}
        <MotiView
            from={{ opacity: 0.3, scale: 1, translateX: -50 }}
            animate={{ opacity: 0.6, scale: 1.2, translateX: 50 }}
            transition={{
                type: 'timing',
                duration: 10000,
                loop: true,
            }}
            style={[StyleSheet.absoluteFill, { zIndex: 0 }]}
        >
             <LinearGradient
                colors={['transparent', 'rgba(0, 255, 255, 0.1)', 'rgba(138, 43, 226, 0.15)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />
        </MotiView>

        {/* Secondary Pulse */}
        <MotiView
            from={{ opacity: 0.2, scale: 1.1, translateY: -50 }}
            animate={{ opacity: 0.5, scale: 1, translateY: 50 }}
            transition={{
                type: 'timing',
                duration: 15000,
                loop: true,
            }}
            style={[StyleSheet.absoluteFill, { zIndex: 0 }]}
        >
             <LinearGradient
                colors={['transparent', 'rgba(255, 0, 128, 0.1)', 'transparent']}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
            />
        </MotiView>
    </YStack>
  );
};
