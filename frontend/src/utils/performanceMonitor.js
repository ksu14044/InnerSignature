/**
 * 컴포넌트 렌더링 시간을 측정하는 유틸리티
 * @param {string} componentName - 컴포넌트 이름
 * @returns {Function} 측정 종료 함수
 */
export const measureRenderTime = (componentName) => {
  const start = performance.now();
  
  return () => {
    const end = performance.now();
    const duration = end - start;
    
    if (duration > 100) {
      console.warn(`⚠️ ${componentName} 렌더링 느림: ${duration.toFixed(2)}ms`);
    } else if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${componentName} 렌더링: ${duration.toFixed(2)}ms`);
    }
  };
};

/**
 * API 호출 시간을 측정하는 유틸리티
 * @param {string} apiName - API 이름
 * @param {Function} apiCall - API 호출 함수
 * @returns {Promise} API 응답
 */
export const measureApiCall = async (apiName, apiCall) => {
  const start = performance.now();
  
  try {
    const result = await apiCall();
    const end = performance.now();
    const duration = end - start;
    
    if (duration > 1000) {
      console.warn(`⚠️ ${apiName} API 느림: ${duration.toFixed(2)}ms`);
    } else if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${apiName} API: ${duration.toFixed(2)}ms`);
    }
    
    return result;
  } catch (error) {
    const end = performance.now();
    const duration = end - start;
    console.error(`❌ ${apiName} API 실패: ${duration.toFixed(2)}ms`, error);
    throw error;
  }
};

/**
 * 메모리 사용량을 로깅하는 유틸리티
 */
export const logMemoryUsage = () => {
  if (performance.memory) {
    const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory;
    console.log('메모리 사용량:', {
      used: `${(usedJSHeapSize / 1048576).toFixed(2)} MB`,
      total: `${(totalJSHeapSize / 1048576).toFixed(2)} MB`,
      limit: `${(jsHeapSizeLimit / 1048576).toFixed(2)} MB`
    });
  }
};

















