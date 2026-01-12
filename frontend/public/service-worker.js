// InnerSignature Service Worker
// 오프라인 지원과 캐싱 전략 구현

const CACHE_NAME = 'innersignature-v1.0.0';
const STATIC_CACHE_NAME = 'innersignature-static-v1.0.0';
const API_CACHE_NAME = 'innersignature-api-v1.0.0';

// 캐시할 정적 리소스들
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/favicon2.png',
  '/favicon3.png',
  '/favicon4.png',
  '/favicon5.png',
  '/vite.svg',
  '/manifest.json'
];

// 캐시하지 않을 API 경로들 (실시간 데이터)
const EXCLUDE_API_PATHS = [
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/refresh',
  '/api/expenses/create',
  '/api/expenses/update',
  '/api/expenses/delete',
  '/api/approvals/approve',
  '/api/approvals/reject'
];

// 캐시 전략: Stale While Revalidate
const CACHE_STRATEGIES = {
  // 정적 리소스: Cache First (캐시 우선)
  static: 'cache-first',
  // API: Network First (네트워크 우선, 실패 시 캐시)
  api: 'network-first',
  // 중요하지 않은 리소스: Network Only
  networkOnly: 'network-only'
};

// ===== Service Worker 설치 =====
self.addEventListener('install', (event) => {
  console.log('[SW] 설치 중...');

  event.waitUntil(
    Promise.all([
      // 정적 리소스 캐시
      caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('[SW] 정적 리소스 캐싱 중...');
        return cache.addAll(STATIC_ASSETS);
      }),

      // 즉시 활성화
      self.skipWaiting()
    ])
  );
});

// ===== Service Worker 활성화 =====
self.addEventListener('activate', (event) => {
  console.log('[SW] 활성화 중...');

  event.waitUntil(
    Promise.all([
      // 오래된 캐시 정리
      cleanupOldCaches(),

      // 모든 클라이언트 제어
      self.clients.claim()
    ])
  );
});

// ===== 오래된 캐시 정리 =====
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name =>
    name !== CACHE_NAME &&
    name !== STATIC_CACHE_NAME &&
    name !== API_CACHE_NAME
  );

  return Promise.all(
    oldCaches.map(cacheName => {
      console.log(`[SW] 오래된 캐시 삭제: ${cacheName}`);
      return caches.delete(cacheName);
    })
  );
}

// ===== Fetch 이벤트 처리 =====
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API 요청 처리
  if (url.pathname.startsWith('/api/')) {
    if (shouldExcludeApiPath(url.pathname)) {
      // 제외할 API는 네트워크 전용
      return;
    }

    event.respondWith(handleApiRequest(request));
    return;
  }

  // 정적 리소스 처리
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // 기본 처리 (네트워크 우선)
  event.respondWith(
    fetch(request).catch(() => {
      // 네트워크 실패 시 오프라인 페이지 표시 고려
      return new Response('네트워크 연결이 불안정합니다.', {
        status: 503,
        statusText: 'Service Unavailable'
      });
    })
  );
});

// ===== API 요청 제외 여부 확인 =====
function shouldExcludeApiPath(pathname) {
  return EXCLUDE_API_PATHS.some(excludePath =>
    pathname.startsWith(excludePath)
  );
}

// ===== 정적 리소스 여부 확인 =====
function isStaticAsset(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  return STATIC_ASSETS.some(asset =>
    pathname === asset || pathname.endsWith('.js') || pathname.endsWith('.css')
  );
}

// ===== API 요청 처리 (Network First) =====
async function handleApiRequest(request) {
  try {
    // 네트워크 요청 시도
    const networkResponse = await fetch(request);

    // 성공 시 캐시에 저장
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // 네트워크 실패 시 캐시에서 찾기
    console.log('[SW] API 네트워크 실패, 캐시에서 찾는 중...');

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // 캐시도 없으면 에러 응답
    return new Response(
      JSON.stringify({
        success: false,
        message: '네트워크 연결이 불안정하며 캐시된 데이터가 없습니다.'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// ===== 정적 리소스 처리 (Cache First) =====
async function handleStaticRequest(request) {
  try {
    // 캐시에서 먼저 찾기
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // 백그라운드에서 캐시 업데이트
      updateCacheInBackground(request);
      return cachedResponse;
    }

    // 캐시에 없으면 네트워크 요청
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] 정적 리소스 로드 실패:', error);
    return new Response('리소스를 로드할 수 없습니다.', {
      status: 404,
      statusText: 'Not Found'
    });
  }
}

// ===== 백그라운드 캐시 업데이트 =====
async function updateCacheInBackground(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse);
    }
  } catch (error) {
    // 백그라운드 업데이트 실패는 무시
    console.log('[SW] 백그라운드 캐시 업데이트 실패 (무시):', error);
  }
}

// ===== 푸시 알림 처리 (향후 확장용) =====
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    data: data.url
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ===== 푸시 알림 클릭 처리 =====
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});

// ===== 주기적 백그라운드 동기화 (향후 확장용) =====
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// ===== 백그라운드 동기화 구현 =====
async function doBackgroundSync() {
  console.log('[SW] 백그라운드 동기화 실행');

  try {
    // 오프라인 동안 쌓인 데이터 동기화 로직
    // (향후 구현: IndexedDB에서 대기 중인 요청들 처리)
    console.log('[SW] 백그라운드 동기화 완료');
  } catch (error) {
    console.error('[SW] 백그라운드 동기화 실패:', error);
  }
}

// ===== 성능 모니터링 =====
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'GET_CACHE_INFO') {
    getCacheInfo().then(info => {
      event.ports[0].postMessage(info);
    });
  }
});

// ===== 캐시 정보 조회 =====
async function getCacheInfo() {
  const cacheNames = await caches.keys();
  const info = {};

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    info[cacheName] = keys.length;
  }

  return info;
}

