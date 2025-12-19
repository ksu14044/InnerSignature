import styled from '@emotion/styled';

export const BottomNav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: white;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-bottom: env(safe-area-inset-bottom, 0);
  @media (min-width: 481px) {
    display: none;
  }
`;

export const NavItem = styled.button`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  min-height: 64px;
  transition: all 0.2s;
  color: ${props => props.active ? 'var(--primary-color)' : '#666'};
  
  &:active {
    background-color: rgba(0, 123, 255, 0.05);
  }
`;

export const IconWrapper = styled.div`
  font-size: 20px;
  color: ${props => props.active ? 'var(--primary-color)' : '#666'};
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Label = styled.span`
  font-size: 11px;
  font-weight: ${props => props.active ? '600' : '400'};
  color: ${props => props.active ? 'var(--primary-color)' : '#666'};
  transition: all 0.2s;
`;

