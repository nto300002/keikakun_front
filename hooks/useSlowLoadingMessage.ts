import { useEffect, useState } from 'react';

export function useSlowLoadingMessage(isLoading: boolean, delayMs = 5000) {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      const resetTimer = window.setTimeout(() => {
        setShowMessage(false);
      }, 0);
      return () => window.clearTimeout(resetTimer);
    }

    const resetTimer = window.setTimeout(() => {
      setShowMessage(false);
    }, 0);
    const timer = window.setTimeout(() => {
      setShowMessage(true);
    }, delayMs);

    return () => {
      window.clearTimeout(resetTimer);
      window.clearTimeout(timer);
    };
  }, [delayMs, isLoading]);

  return showMessage;
}
