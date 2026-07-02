const SW_VERSION = 'v2.0.0';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  try {
    const data = event.data.json();

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

    event.waitUntil(
      self.registration.showNotification(data.title || '通知', options)
        .catch(() => {
          console.error(`[Service Worker ${SW_VERSION}] Failed to show notification`);
        })
    );
  } catch {
    console.error(`[Service Worker ${SW_VERSION}] Error parsing push data`);
  }
});

self.addEventListener('notificationclick', (event) => {
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
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: null
    })
    .then((subscription) => {
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
