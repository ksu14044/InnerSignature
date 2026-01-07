import styled from '@emotion/styled';

export const FAB = styled.button`
  position: fixed;
  bottom: 80px;
  right: 16px;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background: var(--primary-color);
  color: white;
  box-shadow: var(--shadow-lg);
  z-index: var(--z-fixed);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border: none;
  cursor: pointer;
  transition: all var(--transition-slow);
  position: relative;
  
  @media (min-width: 481px) {
    display: none;
  }

  &:active {
    transform: scale(0.92);
    box-shadow: var(--shadow-md);
  }

  &:hover {
    box-shadow: var(--shadow-xl);
    transform: translateY(-2px);
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

