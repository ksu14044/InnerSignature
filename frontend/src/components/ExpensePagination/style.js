import styled from '@emotion/styled';

export const PaginationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin: 32px 0;
  padding: 24px;
  background-color: white;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow);

  @media (max-width: 768px) {
    margin: 24px 0;
    padding: 20px;
  }

  @media (max-width: 480px) {
    margin: 16px 8px;
    padding: 16px;
    gap: 12px;
    border-radius: 16px;
    background: white;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

export const PaginationInfo = styled.div`
  font-size: 14px;
  color: var(--secondary-color);
  font-weight: 500;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;

  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

export const Pagination = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: ${props => props.active ? 'var(--primary-color)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--dark-color)'};
  font-weight: ${props => props.active ? '600' : '500'};
  font-size: 14px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  opacity: ${props => props.disabled ? '0.5' : '1'};

  &:hover:not(:disabled) {
    background-color: ${props => props.active ? 'var(--primary-hover)' : 'var(--light-color)'};
    border-color: ${props => props.active ? 'var(--primary-hover)' : 'var(--primary-color)'};
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    min-width: 36px;
    height: 36px;
    padding: 6px 10px;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    min-width: 32px;
    height: 32px;
    padding: 4px 8px;
    font-size: 11px;
  }
`;
