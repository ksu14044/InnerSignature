import styled from '@emotion/styled';

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 9998;
  cursor: pointer;
  transition: clip-path 0.2s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const Highlight = styled.div`
  position: fixed;
  border: 3px solid #007bff;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 123, 255, 0.5);
  z-index: 9999;
  pointer-events: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  /* 하이라이트 영역은 원래 밝기 유지 - 배경 투명 */
  background-color: transparent;
`;

export const Tooltip = styled.div`
  position: fixed;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 10000;
  min-width: 280px;
  max-width: 400px;
  width: calc(100vw - 40px);
  max-width: 400px;
  pointer-events: auto;
  margin: 0 20px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center top;

  @media (max-width: 768px) {
    min-width: calc(100vw - 40px);
    max-width: calc(100vw - 40px);
  }
`;

export const TooltipHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
`;

export const TooltipTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

export const TooltipClose = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;

  &:hover {
    color: #333;
  }
`;

export const TooltipContent = styled.div`
  padding: 20px;
  font-size: 14px;
  line-height: 1.6;
  color: #666;
`;

export const TooltipFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-top: 1px solid #e0e0e0;
  background-color: #f8f9fa;
`;

export const StepIndicator = styled.span`
  font-size: 12px;
  color: #999;
`;

export const TooltipActions = styled.div`
  display: flex;
  gap: 8px;
`;

export const TooltipButton = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;

  ${props => props.variant === 'primary' ? `
    background-color: #007bff;
    color: white;
    &:hover {
      background-color: #0056b3;
    }
  ` : `
    background-color: #e9ecef;
    color: #333;
    &:hover {
      background-color: #dee2e6;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

