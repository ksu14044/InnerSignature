import React from 'react';
import { FaTimes } from 'react-icons/fa';
import * as S from './style';

const ApproverSelectionModal = ({ 
  isOpen, 
  onClose, 
  adminUsers, 
  selectedApprovers, 
  onToggleApprover,
  loadingApprovers 
}) => {
  if (!isOpen) return null;

  return (
    <S.ModalOverlay onClick={onClose}>
      <S.ModalContent onClick={(e) => e.stopPropagation()}>
        <S.ModalHeader>
          <S.ModalTitle>결재자 선택</S.ModalTitle>
          <S.CloseButton onClick={onClose}>
            <FaTimes />
          </S.CloseButton>
        </S.ModalHeader>

        <S.ModalBody>
          {selectedApprovers.length > 0 && (
            <S.SelectedApproversBox>
              <S.SelectedTitle>선택된 결재 순서</S.SelectedTitle>
              <S.SelectedList>
                {selectedApprovers.map((userId, index) => {
                  const adminUser = adminUsers.find(user => user.userId === userId);
                  return (
                    <S.SelectedItem key={userId}>
                      <S.OrderBadge inline>{index + 1}순위</S.OrderBadge>
                      <S.SelectedName>{adminUser?.koreanName || '알 수 없음'}</S.SelectedName>
                      <S.SelectedPosition>{adminUser?.position || '관리자'}</S.SelectedPosition>
                    </S.SelectedItem>
                  );
                })}
              </S.SelectedList>
            </S.SelectedApproversBox>
          )}

          {loadingApprovers && adminUsers.length === 0 ? (
            <S.LoadingMessage>결재자 목록을 불러오는 중...</S.LoadingMessage>
          ) : adminUsers.length === 0 ? (
            <S.InfoMessage>
              결재자로 지정된 사용자가 없습니다. 관리자 페이지에서 결재자를 지정해주세요.
            </S.InfoMessage>
          ) : (
            <S.ApproverGrid>
              {adminUsers.map((adminUser) => {
                const orderIndex = selectedApprovers.indexOf(adminUser.userId);
                const isSelected = orderIndex > -1;
                return (
                  <S.ApproverCheckbox key={adminUser.userId} isSelected={isSelected}>
                    <input
                      type="checkbox"
                      id={`approver-${adminUser.userId}`}
                      checked={isSelected}
                      onChange={() => onToggleApprover(adminUser.userId)}
                    />
                    <label htmlFor={`approver-${adminUser.userId}`}>
                      <S.ApproverInfo>
                        <S.ApproverName>
                          {adminUser.koreanName}
                          {isSelected && (
                            <S.OrderBadge inline>
                              {orderIndex + 1}순위
                            </S.OrderBadge>
                          )}
                        </S.ApproverName>
                        <S.ApproverPosition>{adminUser.position || '관리자'}</S.ApproverPosition>
                      </S.ApproverInfo>
                    </label>
                  </S.ApproverCheckbox>
                );
              })}
            </S.ApproverGrid>
          )}

          <S.ModalFooter>
            <S.CancelButton onClick={onClose}>취소</S.CancelButton>
            <S.ConfirmButton onClick={onClose}>
              확인
            </S.ConfirmButton>
          </S.ModalFooter>
        </S.ModalBody>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

export default ApproverSelectionModal;

