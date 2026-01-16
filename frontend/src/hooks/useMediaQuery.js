import { useState, useEffect } from 'react';

/**
 * 미디어 쿼리를 감지하는 커스텀 훅
 * @param {string} query - 미디어 쿼리 문자열 (예: '(max-width: 480px)')
 * @returns {boolean} - 미디어 쿼리가 매칭되는지 여부
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // 초기값 설정
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    // 미디어 쿼리 변경 감지
    const listener = () => setMatches(media.matches);
    
    // addEventListener 지원 여부 확인
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      // 구형 브라우저 대응
      media.addListener(listener);
    }
    
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [matches, query]);

  return matches;
};

/**
 * 모바일 디바이스인지 감지 (480px 이하)
 * @returns {boolean}
 */
export const useIsMobile = () => useMediaQuery('(max-width: 480px)');

/**
 * 태블릿 디바이스인지 감지 (768px 이하)
 * @returns {boolean}
 */
export const useIsTablet = () => useMediaQuery('(max-width: 768px)');

/**
 * 데스크톱 디바이스인지 감지 (768px 초과)
 * @returns {boolean}
 */
export const useIsDesktop = () => useMediaQuery('(min-width: 769px)');






