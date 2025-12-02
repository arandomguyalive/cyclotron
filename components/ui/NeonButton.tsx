import { Button, ButtonProps, Text, styled } from 'tamagui';
import { MotiView } from 'moti';
import { CyberTheme } from '../../constants/theme';

interface NeonButtonProps extends ButtonProps {
  variant?: 'cyan' | 'pink' | 'red';
  label: string;
}

export const NeonButton = ({ variant = 'cyan', label, ...props }: NeonButtonProps) => {
  const color = variant === 'pink' ? CyberTheme.colors.neonPink 
              : variant === 'red' ? CyberTheme.colors.neonRed 
              : CyberTheme.colors.neonCyan;

  return (
    <Button
      backgroundColor="transparent"
      borderWidth={1}
      borderColor={color}
      pressStyle={{
        backgroundColor: color,
        opacity: 0.2
      }}
      {...props}
      overflow="hidden"
    >
      <Text 
        color={color} 
        fontFamily="$heading" 
        fontSize="$5" 
        fontWeight="bold"
        textShadowColor={color}
        textShadowRadius={5}
      >
        {label.toUpperCase()}
      </Text>

      {/* Constant Pulse Animation Background */}
      <MotiView
         from={{ opacity: 0 }}
         animate={{ opacity: [0, 0.1, 0] }}
         transition={{
            type: 'timing',
            duration: 2000,
            loop: true,
         }}
         style={{
             position: 'absolute',
             top: 0, left: 0, right: 0, bottom: 0,
             backgroundColor: color
         }}
      />
    </Button>
  );
};
