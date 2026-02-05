import styled from '@emotion/styled';

export const PaginationContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin: 24px 0;
  padding: 0;
  background-color: transparent;
  border: none;
  box-shadow: none;

  @media (max-width: 768px) {
    margin: 16px 0;
  }

  @media (max-width: 480px) {
    margin: 12px 0;
  }
`;

export const PaginationInfo = styled.div`
  font-size: 14px;
  color: #666666;
  font-weight: 400;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  margin-right: 16px;

  @media (max-width: 480px) {
    font-size: 11px;
    margin-right: 8px;
  }
`;

export const Pagination = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
`;

export const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: ${props => props.active ? '1px solid #333333' : 'none'};
  border-radius: 4px;
  background-color: ${props => props.active ? 'transparent' : '#ffffff'};
  color: ${props => props.active ? '#666666' : '#666666'};
  font-weight: 400;
  font-size: 14px;
  line-height: 14px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  opacity: ${props => props.disabled ? '0.5' : '1'};

  &:hover:not(:disabled) {
    background-color: #ffffff;
    ${props => !props.active && 'border: 1px solid #333333;'}
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    width: 28px;
    height: 28px;
    font-size: 11px;
  }
`;

export const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
`;

export const PaginationIcon = styled.img`
  width: 24px;
  height: 24px;
  object-fit: contain;
`;
