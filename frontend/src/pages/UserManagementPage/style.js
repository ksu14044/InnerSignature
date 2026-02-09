import styled from '@emotion/styled';

// 결의서 목록 페이지와 동일한 레이아웃
export const Container = styled.div`
  width: 100%;
  padding: 24px 24px 24px 40px;
  min-height: 100vh;
  background: #f8f9fa;

  @media (max-width: 768px) {
    padding: 16px 16px 16px 40px;
  }

  @media (max-width: 480px) {
    padding: 0;
    width: 100%;
    max-width: 100%;
    min-height: auto;
    background: #f5f5f5;
    padding-top: 56px;
    padding-bottom: 80px;
    padding-left: 40px;
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--primary-color);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  @media (max-width: 480px) {
    display: none;
  }
`;

export const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: var(--dark-color);
  margin: 0;
`;

export const WelcomeText = styled.span`
  font-size: 16px;
  color: var(--secondary-color);
`;

export const HeaderRight = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
  }

  @media (max-width: 480px) {
    display: none;
  }
`;

export const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  @media (max-width: 480px) {
    display: none;
  }
`;

export const MobileToolbar = styled.div`
  display: none;

  @media (max-width: 480px) {
    display: flex;
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-md);
    background: white;
    border-bottom: 1px solid var(--border-light);
  }
`;

export const Button = styled.button`
  padding: var(--spacing-md) var(--spacing-lg);
  border: ${props => props.primary || props.danger ? 'none' : '2px solid var(--border-color)'};
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  transition: all var(--transition-base);
  background-color: ${props => props.primary ? 'var(--primary-color)' : props.danger ? 'var(--danger-color)' : 'white'};
  color: ${props => props.primary || props.danger ? 'white' : 'var(--text-primary)'};
  min-height: 48px;

  &:hover:not(:disabled) {
    background-color: ${props => props.primary ? 'var(--primary-hover)' : props.danger ? 'var(--danger-hover)' : 'var(--bg-hover)'};
    transform: translateY(-1px);
    box-shadow: ${props => props.primary || props.danger ? 'var(--shadow)' : 'var(--shadow-sm)'};
    border-color: ${props => props.primary || props.danger ? 'transparent' : 'var(--primary-color)'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 480px) {
    padding: var(--spacing-md);
    font-size: var(--font-size-base);
    width: 100%;
    justify-content: center;
    min-height: 48px;
  }
`;

// 승인 대기 사용자 테이블
export const PendingUsersCard = styled.div`
  background: white;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  padding: 24px;
  margin-bottom: 24px;
`;

export const PendingUsersTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #333333;
  margin: 0 0 24px 0;
`;

export const PendingUsersTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;

  thead {
    background-color: #f8f9fa;
  }

  th {
    padding: 12px;
    text-align: left;
    font-weight: 500;
    font-size: 14px;
    color: #333333;
    border-bottom: 1px solid #e4e4e4;
  }

  tbody tr {
    border-bottom: 1px solid #e4e4e4;
    background-color: #f8f9fa;

    &:hover {
      background-color: #f0f0f0;
    }
  }

  td {
    padding: 12px;
    font-size: 15px;
    color: #666666;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

// 사용자 목록 테이블
export const UsersTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  overflow: hidden;

  thead {
    background-color: #f8f9fa;
  }

  th {
    padding: 12px;
    text-align: left;
    font-weight: 500;
    font-size: 14px;
    color: #333333;
    border-bottom: 1px solid #e4e4e4;
  }

  tbody tr {
    border-bottom: 1px solid #e4e4e4;
    background-color: white;

    &:hover {
      background-color: #f8f9fa;
    }
  }

  td {
    padding: 12px;
    font-size: 15px;
    color: #666666;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

export const CompanySelectCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    font-size: 14px;
    color: #495057;
  }

  @media (max-width: 480px) {
    padding: 16px;
    margin: 0 8px 16px 8px;
  }
`;

export const LoadingText = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

export const EmptyText = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

export const ApproveButton = styled.button`
  width: 32px;
  height: 32px;
  background: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s;

  img {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }

  &:hover {
    background-color: #f0f0f0;
  }
`;

export const RejectButton = styled.button`
  width: 32px;
  height: 32px;
  background: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s;

  img {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }

  &:hover {
    background-color: #f0f0f0;
  }
`;

export const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #489bff;
`;

export const DisabledText = styled.span`
  color: #999999;
  font-size: 15px;
`;

// 피그마 디자인에 맞는 상태 배지 (활성: #f8ebff 배경, #a133e0 텍스트)
export const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 400;
  background-color: ${props => props.active ? '#f8ebff' : '#f0f0f0'};
  color: ${props => props.active ? '#a133e0' : '#666666'};
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
  }
`;

export const IconButton = styled.button`
  padding: 8px;
  border: none;
  border-radius: 4px;
  background-color: ${props => props.danger ? '#f8d7da' : '#e7f3ff'};
  color: ${props => props.danger ? '#dc3545' : '#0066cc'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Loading = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: var(--secondary-color);
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const Modal = styled.div`
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

  @media (max-width: 480px) {
    width: 100%;
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
`;

export const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--secondary-color);
  padding: 4px;

  &:hover {
    color: var(--dark-color);
  }
`;

export const ModalBody = styled.div`
  padding: 20px;
`;

export const FormGroup = styled.div`
  margin-bottom: 20px;

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: var(--dark-color);
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;

  &:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    padding: 12px;
    font-size: 16px;
    min-height: 48px;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;

  @media (max-width: 480px) {
    padding: 12px;
    font-size: 16px;
    min-height: 48px;
  }
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
`;

export const ConfirmDialog = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;

export const ConfirmTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
`;

export const ConfirmMessage = styled.p`
  margin: 0 0 24px 0;
  color: var(--secondary-color);
`;

export const ConfirmButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

// 피그마 디자인에 맞는 권한 선택 드롭다운
export const RoleSelect = styled.select`
  padding: 6px 12px;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  font-size: 12px;
  background-color: white;
  color: #666666;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 100px;
  
  &:hover:not(:disabled) {
    border-color: #489bff;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: #f8f9fa;
  }

  @media (max-width: 480px) {
    width: 100%;
    padding: 10px;
    font-size: 14px;
    min-height: 44px;
  }
`;

export const ProfileCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 480px) {
    padding: 16px;
    margin: 0 8px 16px 8px;
    border-radius: 12px;
  }
`;

export const CardTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: var(--dark-color);
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 10px;

  @media (max-width: 480px) {
    font-size: 18px;
    margin-bottom: 16px;
  }
`;

// 모바일 카드 뷰
export const MobileCardContainer = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: block;
    padding: 8px;
  }
`;

export const UserCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const UserCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e9ecef;
`;

export const UserCardInfo = styled.div`
  flex: 1;
`;

export const UserCardName = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: var(--dark-color);
  margin-bottom: 4px;
`;

export const UserCardId = styled.div`
  font-size: 14px;
  color: #666;
`;

export const UserCardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
`;

export const UserCardRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
`;

export const UserCardLabel = styled.span`
  color: #666;
  font-weight: 500;
`;

export const UserCardValue = styled.span`
  color: var(--dark-color);
  font-weight: 600;
`;

export const UserCardActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #e9ecef;
`;

export const MobileSelect = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  min-height: 48px;
`;

export const MobileCheckbox = styled.input`
  width: 24px;
  height: 24px;
  cursor: pointer;
`;

