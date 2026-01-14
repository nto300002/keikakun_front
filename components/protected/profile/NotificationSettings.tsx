'use client';

import { useState, useEffect } from 'react';
import { usePushNotification } from '@/hooks/usePushNotification';
import { toast } from '@/lib/toast-debug';
import { http } from '@/lib/http';

interface NotificationPreferences {
  in_app_notification: boolean;
  email_notification: boolean;
  system_notification: boolean;
}

export default function NotificationSettings() {
  const {
    isSupported,
    isSubscribed,
    isLoading: isPushLoading,
    isPWA,
    isIOS,
    error: pushError,
    subscribe,
    unsubscribe
  } = usePushNotification();

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    in_app_notification: true,
    email_notification: true,
    system_notification: false
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const data = await http.get<NotificationPreferences>(
        '/api/v1/staffs/me/notification-preferences'
      );
      setPreferences(data);
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async (newPreferences: NotificationPreferences) => {
    setIsSaving(true);

    try {
      const data = await http.put<NotificationPreferences>(
        '/api/v1/staffs/me/notification-preferences',
        newPreferences
      );
      setPreferences(data);
      toast.success('通知設定を保存しました');
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
      toast.error(error instanceof Error ? error.message : '設定の保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (key: keyof NotificationPreferences) => {
    const newValue = !preferences[key];

    const newPreferences = {
      ...preferences,
      [key]: newValue
    };

    if (!newPreferences.in_app_notification &&
        !newPreferences.email_notification &&
        !newPreferences.system_notification) {
      toast.error('少なくとも1つの通知方法を有効にしてください');
      return;
    }

    if (key === 'system_notification') {
      if (newValue) {
        try {
          await subscribe();
          await savePreferences(newPreferences);
        } catch (error) {
          console.error('Failed to subscribe:', error);
          toast.error('システム通知の有効化に失敗しました');
        }
      } else {
        try {
          await unsubscribe();
          await savePreferences(newPreferences);
        } catch (error) {
          console.error('Failed to unsubscribe:', error);
          toast.error('システム通知の無効化に失敗しました');
        }
      }
    } else {
      await savePreferences(newPreferences);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">通知設定</h2>
        <p className="text-gray-400">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">通知設定</h2>
      <p className="text-gray-400 mb-6">
        期限アラートやアクション承認をどのように受け取るか設定できます
      </p>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-medium">アプリ内通知</h3>
            <p className="text-sm text-gray-400">
              アプリ内のトースト通知で受け取る
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.in_app_notification}
              onChange={() => handleToggle('in_app_notification')}
              disabled={isSaving}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-medium">メール通知</h3>
            <p className="text-sm text-gray-400">
              期限アラートをメールで受け取る（毎日9:00）
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.email_notification}
              onChange={() => handleToggle('email_notification')}
              disabled={isSaving}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-medium">システム通知（Web Push）</h3>
            <p className="text-sm text-gray-400">
              デバイスのシステム通知で受け取る
            </p>

            {!isSupported && (
              <p className="text-sm text-red-500 mt-2">
                お使いのブラウザはシステム通知をサポートしていません
              </p>
            )}

            {isSupported && isIOS && !isPWA && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800 font-medium">iOSでの設定方法:</p>
                <ol className="text-sm text-yellow-700 mt-1 list-decimal list-inside">
                  <li>Safariで「共有」ボタンをタップ</li>
                  <li>「ホーム画面に追加」を選択</li>
                  <li>追加したアイコンからアプリを開く</li>
                  <li>この設定画面でシステム通知を有効化</li>
                </ol>
              </div>
            )}

            {pushError && (
              <p className="text-sm text-red-500 mt-2">
                エラー: {pushError}
              </p>
            )}
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.system_notification && isSubscribed}
              onChange={() => handleToggle('system_notification')}
              disabled={isSaving || isPushLoading || !isSupported || (isIOS && !isPWA)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
          </label>
        </div>
      </div>

      {isSaving && (
        <p className="text-sm text-gray-400 mt-4">保存中...</p>
      )}
    </div>
  );
}
