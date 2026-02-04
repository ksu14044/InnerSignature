import styled from '@emotion/styled';

const sizeStyles = {
  small: {
    height: '36px',
    fontSize: '15px',
    fontWeight: '500',
    padding: '8px 16px',
  },
  medium: {
    height: '40px',
    fontSize: '16px',
    fontWeight: '500',
    padding: '10px 20px',
  },
  large: {
    height: '48px',
    fontSize: '16px',
    fontWeight: '500',
    padding: '12px 24px',
  },
};

const variantStyles = {
  primary: {
    backgroundColor: '#489BFF',
    color: '#ffffff',
    border: 'none',
    hoverBackgroundColor: '#3B8BEB',
  },
  secondary: {
    backgroundColor: '#6c757d',
    color: '#ffffff',
    border: 'none',
    hoverBackgroundColor: '#5a6268',
  },
  danger: {
    backgroundColor: '#dc3545',
    color: '#ffffff',
    border: 'none',
    hoverBackgroundColor: '#c82333',
  },
  success: {
    backgroundColor: '#28a745',
    color: '#ffffff',
    border: 'none',
    hoverBackgroundColor: '#218838',
  },
  outline: {
    backgroundColor: 'transparent',
    color: '#489BFF',
    border: '1px solid #489BFF',
    hoverBackgroundColor: 'rgba(72, 155, 255, 0.1)',
  },
};

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Noto Sans KR', sans-serif;
  box-sizing: border-box;
  white-space: nowrap;
  
  /* Size 스타일 */
  height: ${({ size }) => sizeStyles[size]?.height || sizeStyles.medium.height};
  font-size: ${({ size }) => sizeStyles[size]?.fontSize || sizeStyles.medium.fontSize};
  font-weight: ${({ size }) => sizeStyles[size]?.fontWeight || sizeStyles.medium.fontWeight};
  padding: ${({ size }) => sizeStyles[size]?.padding || sizeStyles.medium.padding};
  
  /* Variant 스타일 */
  background-color: ${({ variant }) => variantStyles[variant]?.backgroundColor || variantStyles.primary.backgroundColor};
  color: ${({ variant }) => variantStyles[variant]?.color || variantStyles.primary.color};
  border: ${({ variant }) => variantStyles[variant]?.border || variantStyles.primary.border};
  
  /* Full Width */
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  
  /* Hover 효과 */
  &:hover:not(:disabled) {
    background-color: ${({ variant }) => variantStyles[variant]?.hoverBackgroundColor || variantStyles.primary.hoverBackgroundColor};
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  /* Active 효과 */
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
  
  /* Disabled 상태 */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  /* Focus 상태 */
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(72, 155, 255, 0.2);
  }
  
  @media (max-width: 480px) {
    min-height: 44px;
    width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  }
`;
