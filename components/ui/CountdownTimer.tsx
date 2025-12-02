import { Text } from 'tamagui';
import { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';

export const CountdownTimer = ({ expiresAt }: { expiresAt: Timestamp }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      if (!expiresAt) return;
      
      const now = new Date().getTime();
      const expiry = expiresAt.toDate().getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('EXPIRED');
        clearInterval(interval);
      } else {
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <Text color="$red10" fontSize="$3" fontFamily="$mono" fontWeight="bold">
      T-MINUS: {timeLeft}
    </Text>
  );
};
