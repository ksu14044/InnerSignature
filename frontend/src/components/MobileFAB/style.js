import styled from '@emotion/styled';

export const FAB = styled.button`
  position: fixed;
  bottom: 80px;
  right: 16px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: var(--primary-color);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (min-width: 481px) {
    display: none;
  }

  &:active {
    transform: scale(0.95);
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
  }

  &:hover {
    box-shadow: 0 6px 16px rgba(0, 123, 255, 0.5);
  }
`;

export const FABTooltip = styled.div`
  position: absolute;
  right: calc(100% + 12px);
  top: 50%;
  transform: translateY(-50%);
  background-color: var(--dark-color);
  color: white;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0.95;

  &::after {
    content: '';
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    border: 6px solid transparent;
    border-left-color: var(--dark-color);
  }
`;

