import { useCallback } from 'react';
import liff from '@line/liff';

export function useCloseWindow() {
  return useCallback(() => {
    if (liff.isInClient()) {
      liff.closeWindow();
    } else {
      window.close();
    }
  }, []);
}
