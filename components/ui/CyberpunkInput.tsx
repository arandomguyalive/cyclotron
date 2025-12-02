import { Input, InputProps, YStack, styled } from 'tamagui';
import { MotiView } from 'moti';
import { useState } from 'react';
import { CyberTheme } from '../../constants/theme';

interface CyberpunkInputProps extends InputProps {
  label?: string;
}

// Base styled input without default borders
const StyledInput = styled(Input, {
  backgroundColor: 'transparent',
  borderWidth: 0,
  borderBottomWidth: 1,
  borderColor: '$gray8',
  color: CyberTheme.colors.neonCyan,
  fontFamily: '$mono',
  fontSize: 16,
  height: 50,
  paddingLeft: 0,
  focusStyle: {
    borderColor: CyberTheme.colors.neonCyan,
    borderBottomWidth: 2,
  },
});

export const CyberpunkInput = ({ label, ...props }: CyberpunkInputProps) => {
  const [focused, setFocused] = useState(false);

  return (
    <YStack mb="$4" w="100%">
      {label && (
        <MotiView
          animate={{
            color: focused ? CyberTheme.colors.neonCyan : CyberTheme.colors.textDim,
            translateX: focused ? 5 : 0,
          }}
          transition={{ type: 'timing', duration: 300 }}
        >
           <YStack mb="$1">
             <Input 
                // Dummy hidden text to act as label container if needed, 
                // but using Tamagui Text is better.
                // We just render Text directly.
             /> 
           </YStack>
        </MotiView>
      )}
      
      <StyledInput 
        {...props}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus && props.onFocus(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur && props.onBlur(e);
        }}
        placeholderTextColor="rgba(255,255,255,0.3)"
      />
      
      {/* Animated Glow Bar */}
      <MotiView
        from={{ scaleX: 0, opacity: 0 }}
        animate={{ 
           scaleX: focused ? 1 : 0,
           opacity: focused ? 1 : 0
        }}
        transition={{ type: 'spring', damping: 15 }}
        style={{
          height: 2,
          backgroundColor: CyberTheme.colors.neonCyan,
          marginTop: -2, // Overlap the border
          shadowColor: CyberTheme.colors.neonCyan,
          shadowOpacity: 1,
          shadowRadius: 10,
        }}
      />
    </YStack>
  );
};
