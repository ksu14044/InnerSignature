import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProductTour from '../components/ProductTour/ProductTour';
import { getTourStepsForPage } from '../config/tourConfig';

const TourContext = createContext();

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within TourProvider');
  }
  return context;
};

export const TourProvider = ({ children }) => {
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentPageTour, setCurrentPageTour] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // 페이지 변경 시 Tour 자동 종료
    if (isTourActive) {
      setIsTourActive(false);
    }
  }, [location.pathname]);

  const startTour = () => {
    const steps = getTourStepsForPage(location.pathname);
    if (steps && steps.length > 0) {
      setCurrentPageTour(steps);
      setIsTourActive(true);
    } else {
      alert('이 페이지에는 가이드가 없습니다.');
    }
  };

  const stopTour = () => {
    setIsTourActive(false);
    setCurrentPageTour(null);
  };

  const value = {
    isTourActive,
    startTour,
    stopTour,
  };

  return (
    <TourContext.Provider value={value}>
      {children}
      {isTourActive && currentPageTour && (
        <ProductTour
          steps={currentPageTour}
          isActive={isTourActive}
          onClose={stopTour}
        />
      )}
    </TourContext.Provider>
  );
};

