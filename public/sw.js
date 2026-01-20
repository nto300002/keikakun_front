const SW_VERSION = 'v2.0.0';

self.addEventListener('install', () => {
  console.log(`[Service Worker ${SW_VERSION}] Install event`);
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log(`[Service Worker ${SW_VERSION}] Activate event`);
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  console.log(`[Service Worker ${SW_VERSION}] Push event received`);

  if (!event.data) {
    console.log(`[Service Worker ${SW_VERSION}] Push event has no data`);
    return;
  }

  try {
    const data = event.data.json();
    console.log(`[Service Worker ${SW_VERSION}] Push data:`, data);

    const options = {
      body: data.body || '',
      icon: data.icon || '/icon-192.png',
      badge: data.badge || '/icon-192.png',
      data: data.data || {},
      requireInteraction: true,
      tag: data.data?.type || 'notification',
      actions: [
        { action: 'view', title: 'ダッシュボードを開く', icon: '/icon-192.png' },
        { action: 'close', title: '閉じる' }
      ],
      vibrate: [200, 100, 200],
      timestamp: Date.now()
    };

    console.log(`[Service Worker ${SW_VERSION}] Showing notification with options:`, options);
    console.log(`[Service Worker ${SW_VERSION}] Notification.permission:`, Notification.permission);

    event.waitUntil(
      self.registration.showNotification(data.title || '通知', options)
        .then(() => {
          console.log(`[Service Worker ${SW_VERSION}] ✅ Notification shown successfully`);
        })
        .catch((error) => {
          console.error(`[Service Worker ${SW_VERSION}] ❌ Failed to show notification:`, error);
        })
    );
  } catch (error) {
    console.error(`[Service Worker ${SW_VERSION}] Error parsing push data:`, error);
  }
});

self.addEventListener('notificationclick', (event) => {
  console.log(`[Service Worker ${SW_VERSION}] Notification click event`);

  event.notification.close();

  const data = event.notification.data || {};
  let targetUrl = '/dashboard';

  if (event.action === 'view') {
    if (data.type === 'deadline_alert') {
      targetUrl = '/recipients?filter=deadline';
    } else if (data.type === 'staff_action_approved') {
      targetUrl = '/dashboard';
    } else if (data.type === 'staff_action_rejected') {
      targetUrl = '/dashboard';
    } else if (data.type === 'role_change_approved') {
      targetUrl = '/dashboard';
    } else if (data.type === 'role_change_rejected') {
      targetUrl = '/dashboard';
    }
  } else if (event.action === 'close') {
    return;
  } else {
    if (data.type === 'deadline_alert') {
      targetUrl = '/recipients?filter=deadline';
    }
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(targetUrl) && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

self.addEventListener('pushsubscriptionchange', (event) => {
  console.log(`[Service Worker ${SW_VERSION}] Push subscription changed`);

  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: null
    })
    .then((subscription) => {
      console.log(`[Service Worker ${SW_VERSION}] Re-subscribed:`, subscription);
      return fetch('/api/v1/push-subscriptions/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription.toJSON())
      });
    })
  );
});
