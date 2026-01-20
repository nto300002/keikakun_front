'use client';

import { useState, useEffect, useCallback } from 'react';
import { http } from '@/lib/http';

interface UsePushNotificationReturn {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  isPWA: boolean;
  isIOS: boolean;
  error: string | null;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  requestPermission: () => Promise<NotificationPermission>;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

function detectIOS(): boolean {
  if (typeof window === 'undefined') return false;

  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

function detectPWA(): boolean {
  if (typeof window === 'undefined') return false;

  // iOS SafariのstandaloneモードをチェックするためにNavigatorを拡張
  interface NavigatorStandalone extends Navigator {
    standalone?: boolean;
  }

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as NavigatorStandalone).standalone === true
  );
}

export function usePushNotification(): UsePushNotificationReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPWA, setIsPWA] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSupport = () => {
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      const supported = 'serviceWorker' in navigator && 'PushManager' in window;
      setIsSupported(supported);
      setIsPWA(detectPWA());
      setIsIOS(detectIOS());
    };

    checkSupport();
  }, []);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!isSupported) {
        setIsLoading(false);
        return;
      }

      try {
        const registration = await navigator.serviceWorker.getRegistration('/sw.js');
        if (!registration) {
          setIsLoading(false);
          return;
        }

        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (err) {
        console.error('[usePushNotification] Error checking subscription:', err);
        setError(err instanceof Error ? err.message : 'Failed to check subscription');
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [isSupported]);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    const permission = await Notification.requestPermission();
    return permission;
  }, []);

  const subscribe = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const permission = await requestPermission();

      if (permission !== 'granted') {
        throw new Error('PERMISSION_DENIED');
      }

      // Service Workerを登録（既に登録済みの場合は既存のものを返す）
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      // Service Workerがアクティブになるまで待機
      if (registration.installing || registration.waiting) {
        await new Promise<void>((resolve) => {
          const worker = registration.installing || registration.waiting;
          if (worker) {
            worker.addEventListener('statechange', function onStateChange() {
              if (worker.state === 'activated') {
                worker.removeEventListener('statechange', onStateChange);
                resolve();
              }
            });
          } else {
            resolve();
          }
        });
      }

      // 念のためService Workerの準備完了を待機
      await navigator.serviceWorker.ready;

      await registration.update();

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        throw new Error('VAPID_KEY_MISSING');
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      await http.post<void>(
        '/api/v1/push-subscriptions/subscribe',
        subscription.toJSON()
      );

      setIsSubscribed(true);
      console.log('[usePushNotification] Successfully subscribed');
    } catch (err) {
      console.error('[usePushNotification] Subscribe error:', err);
      const errorMessage = err instanceof Error ? err.message : 'UNKNOWN_ERROR';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [requestPermission]);

  const unsubscribe = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw.js');

      if (!registration) {
        // Service Workerが登録されていない場合は、既に購読解除済みとみなす
        console.log('[usePushNotification] Service Worker not registered, assuming already unsubscribed');
        setIsSubscribed(false);
        return;
      }

      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // 購読が存在しない場合は、既に購読解除済みとみなす
        console.log('[usePushNotification] No subscription found, assuming already unsubscribed');
        setIsSubscribed(false);
        return;
      }

      const endpoint = subscription.endpoint;

      // ブラウザ側の購読を解除
      await subscription.unsubscribe();

      // サーバー側の購読データを削除
      try {
        await http.delete(
          `/api/v1/push-subscriptions/unsubscribe?endpoint=${encodeURIComponent(endpoint)}`
        );
      } catch (apiErr) {
        // サーバー側で購読が見つからない場合は警告のみ出して続行
        console.warn('[usePushNotification] Failed to delete subscription from server:', apiErr);
      }

      setIsSubscribed(false);
      console.log('[usePushNotification] Successfully unsubscribed');
    } catch (err) {
      console.error('[usePushNotification] Unsubscribe error:', err);
      const errorMessage = err instanceof Error ? err.message : 'UNKNOWN_ERROR';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    isPWA,
    isIOS,
    error,
    subscribe,
    unsubscribe,
    requestPermission
  };
}
