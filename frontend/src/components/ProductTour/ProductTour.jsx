import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import * as S from './style';

const ProductTour = ({ steps = [], isActive = false, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightPosition, setHighlightPosition] = useState(null);
  const overlayRef = useRef(null);
  const tooltipRef = useRef(null);
  const location = useLocation();
  const isScrollingRef = useRef(false); // 스크롤 중인지 추적

  useEffect(() => {
    if (isActive && steps.length > 0) {
      scrollToStep(0);
    }
  }, [isActive, location.pathname]);

  // currentStep이 변경될 때 하이라이트 업데이트 (스크롤 중이 아닐 때만)
  useEffect(() => {
    if (isActive && currentStep < steps.length && !isScrollingRef.current) {
      updateHighlight();
    }
  }, [isActive, currentStep, steps]);

  const scrollToStep = (stepIndex) => {
    if (stepIndex >= steps.length) return;

    const step = steps[stepIndex];
    const element = document.querySelector(`[data-tourid="${step.target}"]`);

    if (element) {
      isScrollingRef.current = true; // 스크롤 시작
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        isScrollingRef.current = false; // 스크롤 완료
        updateHighlight();
      }, 200); // 스크롤 애니메이션 시간 고려 (더 빠르게)
    }
  };

  const updateHighlight = () => {
    if (currentStep >= steps.length) {
      setHighlightPosition(null);
      return;
    }

    const step = steps[currentStep];
    const element = document.querySelector(`[data-tourid="${step.target}"]`);

    if (element) {
      const rect = element.getBoundingClientRect();
      // 뷰포트 기준 좌표로 저장 (scrollY/scrollX 사용 안 함)
      setHighlightPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    } else {
      setHighlightPosition(null);
    }
  };

  // 스크롤/리사이즈 시에도 하이라이트 위치를 다시 계산
  useEffect(() => {
    if (!isActive) return;

    const handleScrollOrResize = () => {
      if (!isScrollingRef.current) {
        updateHighlight();
      }
    };

    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isActive, currentStep, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      const step = steps[nextStep];
      const element = document.querySelector(`[data-tourid="${step.target}"]`);
      
      if (element) {
        // 먼저 스크롤 실행
        isScrollingRef.current = true;
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // 스크롤 완료 후 currentStep 업데이트 (더 빠르게)
        setTimeout(() => {
          setCurrentStep(nextStep);
          isScrollingRef.current = false;
          updateHighlight();
        }, 200);
      } else {
        // 요소가 없으면 즉시 다음 단계로
        setCurrentStep(nextStep);
      }
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      const step = steps[prevStep];
      const element = document.querySelector(`[data-tourid="${step.target}"]`);
      
      if (element) {
        // 먼저 스크롤 실행
        isScrollingRef.current = true;
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // 스크롤 완료 후 currentStep 업데이트 (더 빠르게)
        setTimeout(() => {
          setCurrentStep(prevStep);
          isScrollingRef.current = false;
          updateHighlight();
        }, 200);
      } else {
        setCurrentStep(prevStep);
      }
    }
  };

  const handleFinish = () => {
    setCurrentStep(0);
    setHighlightPosition(null);
    isScrollingRef.current = false;
    onClose?.();
  };

  const handleSkip = () => {
    handleFinish();
  };

  if (!isActive || steps.length === 0 || currentStep >= steps.length) {
    return null;
  }

  const step = steps[currentStep];
  const element = document.querySelector(`[data-tourid="${step.target}"]`);

  if (!element) {
    // 요소가 없으면 다음 단계로 자동 이동
    if (currentStep < steps.length - 1) {
      setTimeout(() => {
        handleNext();
      }, 100);
    } else {
      handleFinish();
    }
    return null;
  }

  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  
  // 툴팁을 요소 아래에 배치, 공간이 부족하면 위에 배치
  let tooltipTop = rect.bottom + 10;
  const tooltipHeight = 200; // 예상 툴팁 높이
  if (rect.bottom + tooltipHeight > viewportHeight && rect.top - tooltipHeight > 0) {
    tooltipTop = rect.top - tooltipHeight - 10;
  }
  // 화면 밖으로 나가지 않도록 클램핑
  const tooltipMargin = 10;
  if (tooltipTop < tooltipMargin) {
    tooltipTop = tooltipMargin;
  } else if (tooltipTop + tooltipHeight > viewportHeight - tooltipMargin) {
    tooltipTop = viewportHeight - tooltipHeight - tooltipMargin;
  }
  
  // 모바일에서는 중앙 정렬, 데스크톱에서는 요소 기준
  const isMobile = viewportWidth < 768;
  const tooltipLeft = isMobile 
    ? Math.max(20, Math.min(rect.left + window.scrollX + rect.width / 2, viewportWidth - 20))
    : Math.max(10, Math.min(rect.left + window.scrollX + rect.width / 2, viewportWidth - 210));

  // 하이라이트 영역을 제외한 오버레이 클리핑 경로 계산
  const getOverlayClipPath = () => {
    if (!highlightPosition) return 'none';
    const { top, left, width, height } = highlightPosition;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // 하이라이트 영역을 제외한 4개의 사각형 영역
    const padding = 3; // 테두리 두께 고려
    const topPercent = ((top - padding) / viewportHeight) * 100;
    const leftPercent = ((left - padding) / viewportWidth) * 100;
    const rightPercent = ((left + width + padding) / viewportWidth) * 100;
    const bottomPercent = ((top + height + padding) / viewportHeight) * 100;
    
    return `polygon(
      0% 0%, 
      0% 100%, 
      ${leftPercent}% 100%, 
      ${leftPercent}% ${topPercent}%,
      ${rightPercent}% ${topPercent}%,
      ${rightPercent}% ${bottomPercent}%,
      ${leftPercent}% ${bottomPercent}%,
      ${leftPercent}% 100%,
      100% 100%, 
      100% 0%
    )`;
  };

  return (
    <>
      {/* 오버레이 - 하이라이트 영역을 제외 */}
      <S.Overlay 
        ref={overlayRef} 
        onClick={handleSkip}
        style={{
          clipPath: highlightPosition ? getOverlayClipPath() : 'none',
        }}
      />

      {/* 하이라이트 영역 */}
      {highlightPosition && (
        <S.Highlight
          style={{
            top: `${highlightPosition.top}px`,
            left: `${highlightPosition.left}px`,
            width: `${highlightPosition.width}px`,
            height: `${highlightPosition.height}px`,
          }}
        />
      )}

      {/* 툴팁 */}
      <S.Tooltip
        ref={tooltipRef}
        style={{
          top: `${tooltipTop}px`,
          left: viewportWidth < 768 ? '50%' : `${tooltipLeft}px`,
          transform: viewportWidth < 768 ? 'translateX(-50%)' : (tooltipLeft < viewportWidth / 2 ? 'translateX(-50%)' : 'translateX(-100%)'),
        }}
      >
        <S.TooltipHeader>
          <S.TooltipTitle>{step.title}</S.TooltipTitle>
          <S.TooltipClose onClick={handleSkip}>×</S.TooltipClose>
        </S.TooltipHeader>
        <S.TooltipContent>{step.content}</S.TooltipContent>
        <S.TooltipFooter>
          <S.StepIndicator>
            {currentStep + 1} / {steps.length}
          </S.StepIndicator>
          <S.TooltipActions>
            {currentStep > 0 && (
              <S.TooltipButton variant="secondary" onClick={handlePrevious}>
                이전
              </S.TooltipButton>
            )}
            <S.TooltipButton variant="primary" onClick={handleNext}>
              {currentStep === steps.length - 1 ? '완료' : '다음'}
            </S.TooltipButton>
          </S.TooltipActions>
        </S.TooltipFooter>
      </S.Tooltip>
    </>
  );
};

export default ProductTour;

