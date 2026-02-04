import styled from '@emotion/styled';

const sizeStyles = {
  small: {
    height: '36px',
    fontSize: '15px',
    fontWeight: '400',
    padding: '8px 16px',
  },
  large: {
    height: '48px',
    fontSize: '16px',
    fontWeight: '400',
    padding: '12px 16px',
  },
};

export const InputWrapper = styled.div`
  position: relative;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  display: flex;
  flex-direction: column;
  gap: 4px;

`;

export const InputIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 1;
  display: flex;
  align-items: center;
  pointer-events: none;
`;

export const Input = styled.input`
  width: 100%;
  border: 1px solid ${({ hasError }) => (hasError ? '#dc3545' : '#e5e7eb')};
  border-radius: 4px;
  background-color: #ffffff;
  transition: all 0.2s;
  box-sizing: border-box;
  font-family: 'Noto Sans KR', sans-serif;
  color: #333333;
  
  /* Size 스타일 */
  height: ${({ size }) => sizeStyles[size]?.height || sizeStyles.large.height};
  font-size: ${({ size }) => sizeStyles[size]?.fontSize || sizeStyles.large.fontSize};
  font-weight: ${({ size }) => sizeStyles[size]?.fontWeight || sizeStyles.large.fontWeight};
  padding: ${({ size, hasIcon }) => {
    const basePadding = sizeStyles[size]?.padding || sizeStyles.large.padding;
    if (hasIcon) {
      return `12px 16px 12px 48px`;
    }
    return basePadding;
  }};
  
  /* Focus 상태 */
  &:focus {
    outline: none;
    border-color: ${({ hasError }) => (hasError ? '#dc3545' : '#3b82f6')};
    box-shadow: 0 0 0 3px ${({ hasError }) => (hasError ? 'rgba(220, 53, 69, 0.1)' : 'rgba(59, 130, 246, 0.1)')};
  }
  
  /* Placeholder 스타일 */
  &::placeholder {
    color: #777777;
  }
  
  /* Disabled 상태 */
  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  @media (max-width: 480px) {
    min-height: 44px;
    font-size: 16px; /* iOS 줌 방지 */
  }
`;

export const ErrorMessage = styled.div`
  font-size: 13px;
  color: #D72D30;
  margin-top: 4px;
  font-family: 'Noto Sans KR', sans-serif;
`;
