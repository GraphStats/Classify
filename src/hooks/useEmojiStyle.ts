import { useEffect, useState } from 'react';
import { EmojiStyle } from 'emoji-picker-react';

export function useEmojiStyle(): EmojiStyle {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline ? EmojiStyle.APPLE : EmojiStyle.NATIVE;
}
