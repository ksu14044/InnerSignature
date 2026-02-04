import React from 'react';
import * as S from './style';

/**
 * 공통 버튼 컴포넌트
 * @param {string} size - 버튼 크기 ('small' | 'medium' | 'large')
 * @param {string} variant - 버튼 스타일 ('primary' | 'secondary' | 'danger' | 'success' | 'outline')
 * @param {boolean} disabled - 비활성화 여부
 * @param {boolean} fullWidth - 전체 너비 여부
 * @param {React.ReactNode} children - 버튼 내용
 * @param {object} rest - 기타 button props
 */
const Button = ({
  size = 'medium',
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  children,
  ...rest
}) => {
  return (
    <S.Button
      size={size}
      variant={variant}
      disabled={disabled}
      fullWidth={fullWidth}
      {...rest}
    >
      {children}
    </S.Button>
  );
};

export default Button;
