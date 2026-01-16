import { useState, useRef, useEffect, useMemo } from 'react';
import * as S from './style';

const ScrollableChartsGrid = ({ children }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const scrollContainerRef = useRef(null);

  const childrenArray = useMemo(() => {
    return Array.isArray(children) ? children.filter(Boolean) : [children].filter(Boolean);
  }, [children]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 480);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isMobile) return;

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;
      
      // 모든 children이 카드이므로 필터링 불필요
      const cards = Array.from(container.children);
      
      let closestIndex = 0;
      let minDistance = Infinity;
      
      cards.forEach((card, index) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(cardCenter - containerCenter);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });
      
      // childrenArray 길이를 초과하지 않도록 제한
      if (closestIndex < childrenArray.length) {
        setActiveIndex(closestIndex);
      }
    };

    // 스크롤 이벤트에 requestAnimationFrame 사용하여 즉시 반응
    let rafId = null;
    const handleScrollRAF = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        handleScroll();
        rafId = null;
      });
    };

    container.addEventListener('scroll', handleScrollRAF, { passive: true });
    handleScroll(); // 초기 인덱스 설정
    
    return () => {
      container.removeEventListener('scroll', handleScrollRAF);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isMobile, childrenArray.length]);

  const handleDotClick = (index) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    // 모든 children이 카드이므로 필터링 불필요
    const cards = Array.from(container.children);
    const targetCard = cards[index];
    if (!targetCard) return;
    
    const containerRect = container.getBoundingClientRect();
    const cardRect = targetCard.getBoundingClientRect();
    const scrollLeft = container.scrollLeft;
    const cardLeft = cardRect.left - containerRect.left + scrollLeft;
    const containerCenter = containerRect.width / 2;
    const cardCenter = cardRect.width / 2;
    
    container.scrollTo({
      left: cardLeft - containerCenter + cardCenter,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <S.ChartsGrid ref={scrollContainerRef}>
        {children}
      </S.ChartsGrid>
      {isMobile && childrenArray.length > 1 && (
        <S.PaginationDots>
          {childrenArray.map((_, index) => (
            <S.PaginationDot
              key={index}
              active={index === activeIndex}
              onClick={() => handleDotClick(index)}
            />
          ))}
        </S.PaginationDots>
      )}
    </>
  );
};

export default ScrollableChartsGrid;

