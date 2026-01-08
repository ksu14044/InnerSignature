import { useMemo, useCallback, useRef } from 'react';

/**
 * 리스트 데이터를 최적화하여 변환하는 Hook
 * @param {Array} data - 원본 데이터 배열
 * @param {Function} transformFn - 변환 함수
 * @returns {Array} 변환된 데이터
 */
export const useOptimizedList = (data, transformFn) => {
  const transformedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data.map(transformFn);
  }, [data, transformFn]);
  
  return transformedData;
};

/**
 * 디바운스 Hook - 빈번한 함수 호출을 제어
 * @param {Function} callback - 실행할 함수
 * @param {number} delay - 지연 시간 (ms)
 * @returns {Function} 디바운스된 함수
 */
export const useDebounce = (callback, delay = 300) => {
  const timeoutRef = useRef(null);
  
  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

/**
 * 배열 데이터를 메모이제이션하는 Hook
 * @param {Array} array - 메모이제이션할 배열
 * @param {Array} deps - 의존성 배열
 * @returns {Array} 메모이제이션된 배열
 */
export const useMemoizedArray = (array, deps = []) => {
  return useMemo(() => array || [], deps);
};

/**
 * 객체 데이터를 메모이제이션하는 Hook
 * @param {Object} obj - 메모이제이션할 객체
 * @param {Array} deps - 의존성 배열
 * @returns {Object} 메모이제이션된 객체
 */
export const useMemoizedObject = (obj, deps = []) => {
  return useMemo(() => obj || {}, deps);
};

