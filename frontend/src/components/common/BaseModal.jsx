import React from 'react';
import { FaTimes } from 'react-icons/fa';
import * as S from './BaseModal.style';

/**
 * 공통 모달 베이스 컴포넌트
 * 모든 모달의 기본 구조를 표준화
 */
const BaseModal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'medium', // small, medium, large
  closeOnOverlayClick = true
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = closeOnOverlayClick ? onClose : undefined;

  return (
    <S.ModalOverlay onClick={handleOverlayClick}>
      <S.ModalContent onClick={(e) => e.stopPropagation()} size={size}>
        <S.ModalHeader>
          <S.ModalTitle>{title}</S.ModalTitle>
          <S.CloseButton onClick={onClose}>
            <FaTimes />
          </S.CloseButton>
        </S.ModalHeader>

        <S.ModalBody>
          {children}
        </S.ModalBody>

        {footer && (
          <S.ModalFooter>
            {footer}
          </S.ModalFooter>
        )}
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

export default BaseModal;
