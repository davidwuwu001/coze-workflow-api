/**
 * Service Worker for Coze Hub PWA
 * 提供离线缓存和后台同步功能
 */

const CACHE_NAME = 'coze-hub-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/css/index.css',
  '/assets/js/index.js',
  // 添加其他静态资源
];

/**
 * Service Worker 安装事件
 * 预缓存重要资源
 */
self.addEventListener('install', (event) => {
  console.log('Service Worker 安装中...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('缓存已打开');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('缓存资源失败:', error);
      })
  );
});

/**
 * Service Worker 激活事件
 * 清理旧缓存
 */
self.addEventListener('activate', (event) => {
  console.log('Service Worker 激活中...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

/**
 * 网络请求拦截
 * 实现缓存优先策略
 */
self.addEventListener('fetch', (event) => {
  // 只处理 GET 请求
  if (event.request.method !== 'GET') {
    return;
  }

  // 跳过 API 请求，让它们直接访问网络
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('coze.cn') ||
      event.request.url.includes('coze.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果缓存中有响应，返回缓存的版本
        if (response) {
          console.log('从缓存返回:', event.request.url);
          return response;
        }

        // 否则从网络获取
        console.log('从网络获取:', event.request.url);
        return fetch(event.request).then((response) => {
          // 检查是否是有效响应
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // 克隆响应，因为响应流只能使用一次
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch((error) => {
        console.error('获取资源失败:', error);
        // 可以返回一个离线页面
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

/**
 * 后台同步事件
 * 处理离线时的数据同步
 */
self.addEventListener('sync', (event) => {
  console.log('后台同步事件:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // 这里可以添加后台同步逻辑
      console.log('执行后台同步')
    );
  }
});

/**
 * 推送消息事件
 * 处理推送通知
 */
self.addEventListener('push', (event) => {
  console.log('收到推送消息:', event);
  
  const options = {
    body: event.data ? event.data.text() : '您有新的消息',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('Coze Hub', options)
  );
});

/**
 * 通知点击事件
 * 处理用户点击通知的行为
 */
self.addEventListener('notificationclick', (event) => {
  console.log('通知被点击:', event);
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});