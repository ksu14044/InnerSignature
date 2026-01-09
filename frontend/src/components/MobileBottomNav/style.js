import styled from '@emotion/styled';

export const BottomNav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: white;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: var(--z-nav);
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
  transition: all var(--transition-base);
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-secondary)'};
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background-color: ${props => props.active ? 'var(--primary-color)' : 'transparent'};
    border-radius: 0 0 3px 3px;
    transition: all var(--transition-base);
  }
  
  &:active {
    background-color: ${props => props.active ? 'var(--primary-light)' : 'var(--bg-hover)'};
  }
`;

export const IconWrapper = styled.div`
  font-size: 22px;
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-secondary)'};
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
  transform: ${props => props.active ? 'scale(1.1)' : 'scale(1)'};
`;

export const Label = styled.span`
  font-size: var(--font-size-xs);
  font-weight: ${props => props.active ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)'};
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-secondary)'};
  transition: all var(--transition-base);
`;

