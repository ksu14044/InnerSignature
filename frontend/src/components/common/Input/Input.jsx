import React from 'react';
import * as S from './style';

/**
 * 공통 입력 필드 컴포넌트
 * @param {string} size - 입력 필드 크기 ('small' | 'large')
 * @param {boolean} fullWidth - 전체 너비 여부
 * @param {string} error - 에러 메시지
 * @param {React.ReactNode} children - 기타 children (예: 아이콘)
 * @param {object} style - 스타일 객체
 * @param {object} rest - 기타 input props
 */
const Input = ({
  size = 'large',
  fullWidth = true,
  error,
  children,
  style,
  ...rest
}) => {
  return (
    <S.InputWrapper fullWidth={fullWidth}>
      {children && <S.InputIcon>{children}</S.InputIcon>}
      <S.Input
        size={size}
        fullWidth={fullWidth}
        hasIcon={!!children}
        hasError={!!error}
        style={style}
        {...rest}
      />
      {error && <S.ErrorMessage>{error}</S.ErrorMessage>}
    </S.InputWrapper>
  );
};

export default Input;
