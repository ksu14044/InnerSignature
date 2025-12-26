import styled from '@emotion/styled';

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;

  @media (max-width: 480px) {
    padding: 0;
    width: 100%;
    max-width: 100%;
    min-height: calc(100vh - 56px - 64px);
    background: #f5f5f5;
    padding-top: 56px;
    padding-bottom: 64px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
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
    padding: 0 8px;
    margin-bottom: 16px;
  }
`;

export const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  background-color: ${props => props.primary ? 'var(--primary-color)' : props.danger ? '#dc3545' : '#f8f9fa'};
  color: ${props => props.primary || props.danger ? '#fff' : 'var(--dark-color)'};

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    padding: 12px 16px;
    font-size: 13px;
    width: 100%;
    justify-content: center;
    min-height: 48px;
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  thead {
    background-color: var(--primary-color);
    color: white;
  }

  th {
    padding: 16px;
    text-align: left;
    font-weight: 600;
  }

  tbody tr {
    border-bottom: 1px solid #e9ecef;
    transition: background-color 0.2s;

    &:hover {
      background-color: #f8f9fa;
    }
  }

  td {
    padding: 16px;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

export const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => props.active ? '#d4edda' : '#f8d7da'};
  color: ${props => props.active ? '#155724' : '#721c24'};
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

export const RoleSelect = styled.select`
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    border-color: var(--primary-color);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

