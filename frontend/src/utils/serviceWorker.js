// Service Worker 등록 및 관리 유틸리티

// Service Worker 등록
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });

      console.log('[SW] 등록 성공:', registration.scope);

      // Service Worker 업데이트 처리
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 새 버전이 설치됨 - 사용자에게 알림
              showUpdateNotification();
            }
          });
        }
      });

      // Service Worker 상태 모니터링
      if (registration.active) {
        console.log('[SW] 활성화됨');
      }

      return registration;
    } catch (error) {
      console.error('[SW] 등록 실패:', error);
    }
  } else {
    console.log('[SW] Service Worker 미지원 브라우저');
  }
};

// Service Worker 업데이트 알림 표시
const showUpdateNotification = () => {
  // 사용자 정의 이벤트 발생
  window.dispatchEvent(new CustomEvent('serviceWorkerUpdate'));

  // 브라우저 기본 알림 (선택사항)
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('InnerSignature 업데이트', {
      body: '새 버전이 설치되었습니다. 페이지를 새로고침하여 최신 버전을 사용하세요.',
      icon: '/favicon.ico'
    });
  }
};

// Service Worker 업데이트 적용
export const updateServiceWorker = async () => {
  const registration = await navigator.serviceWorker.getRegistration();
  if (registration && registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
};

// 캐시 정보 조회
export const getCacheInfo = async () => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();

      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };

      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_CACHE_INFO' },
        [messageChannel.port2]
      );
    });
  }

  return null;
};

// 오프라인 상태 확인
export const isOnline = () => {
  return navigator.onLine;
};

// 네트워크 상태 모니터링
export const monitorNetworkStatus = (callback) => {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // 초기 상태 반환
  callback(navigator.onLine);

  // 정리 함수 반환
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

// Service Worker 메시지 처리
const handleServiceWorkerMessage = (event) => {
  if (event.data && event.data.type === 'CACHE_UPDATED') {
    console.log('[SW] 캐시가 업데이트되었습니다');
  }
};

// Service Worker 메시지 리스너 등록
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
}

