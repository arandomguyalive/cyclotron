import { Button } from 'tamagui';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { DeviceBindingService } from '../services/deviceBinding';

export const PanicButton = () => {
  const router = useRouter();

  const handlePanic = async () => {
    // 1. Wipe Local State
    await DeviceBindingService.clearDeviceId();
    
    // 2. Redirect
    router.replace('/');
    
    // 3. Feedback
    // In a real app, this might just silently crash or exit
    console.log("System Purged");
  };

  return (
    <Button 
      position="absolute" 
      bottom="$4" 
      right="$4" 
      bg="$red10" 
      circular 
      size="$6"
      onPress={handlePanic}
      elevation="$4"
    >
      !
    </Button>
  );
};
