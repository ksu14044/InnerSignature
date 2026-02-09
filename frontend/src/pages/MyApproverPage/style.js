import styled from '@emotion/styled';

// 지출결의서 목록 페이지와 동일한 전체 레이아웃 컨테이너
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

export const InfoBox = styled.div`
  padding: 24px;
  background: #f8f9fa;
  border-radius: 4px;
  border: none;
  margin-bottom: 24px;
  
  p {
    margin: 0;
    font-size: 15px;
    font-weight: 350;
    color: #666666;
    line-height: 24px;
  }

  p + p {
    margin-top: 0;
  }

  @media (max-width: 480px) {
    margin: 0 16px 16px;
    padding: 16px;
  }
`;

export const ActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
`;

export const AddButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #489bff;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  line-height: 19.2px;
  height: 40px;
  transition: all 0.2s;

  &:hover {
    background-color: #3a8aef;
    transform: translateY(-1px);
  }

  img {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }
`;

export const TableContainer = styled.div`
  overflow-x: auto;
  border-radius: 4px;
  border: 1px solid #e4e4e4;
  background-color: transparent;
  box-shadow: none;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    border-radius: 4px;
  }

  @media (max-width: 480px) {
    margin: 0 16px 16px;
    border-radius: 4px;
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: transparent;

  thead {
    background-color: transparent;

    th {
      padding: 16px 12px;
      border-bottom: none;
      color: #333333;
      font-weight: 500;
      font-size: 14px;
      text-align: left;
    }
  }

  tbody tr {
    border-bottom: none;
    transition: background-color 0.2s;

    &:hover {
      background-color: transparent;
    }
  }

  tbody td {
    padding: 16px 12px;
    color: #666666;
    font-size: 16px;
    font-weight: 400;
  }

  @media (max-width: 768px) {
    thead th, tbody td {
      padding: 12px 8px;
      font-size: 13px;
    }
  }

  @media (max-width: 480px) {
    min-width: 600px;
    
    thead th, tbody td {
      padding: 12px 8px;
      font-size: 12px;
    }
  }
`;

export const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => (props.active ? '#f8ebff' : '#f1f3f5')};
  color: ${props => (props.active ? '#a133e0' : '#777777')};
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

export const EditButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;

  img {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }
`;

export const DeleteButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;

  img {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }
`;

export const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;

  @media (max-width: 480px) {
    padding: 0;
    align-items: flex-end;
  }
`;

export const ModalContent = styled.div`
  background: white;
  border-radius: 4px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid #e4e4e4;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

  @media (max-width: 480px) {
    border-radius: 16px 16px 0 0;
    max-height: 90vh;
    width: 100%;
    max-width: 100%;
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;

  @media (max-width: 480px) {
    padding: 16px;
  }
`;

export const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: var(--dark-color);
  margin: 0;

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

export const ModalCloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }
`;

export const ModalBody = styled.div`
  padding: 24px;

  @media (max-width: 480px) {
    padding: 16px;
  }
`;

export const FormGroup = styled.div`
  margin-bottom: 20px;

  @media (max-width: 480px) {
    margin-bottom: 16px;
  }
`;

export const FormLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 700;
  color: #333333;
  font-size: 14px;
`;

export const RequiredAsterisk = styled.span`
  color: #D72D30;
  margin-left: 2px;
`;

export const FormSelect = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  font-size: 15px;
  font-weight: 400;
  color: #333333;
  line-height: 18px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #489bff;
  }

  @media (max-width: 480px) {
    font-size: 16px; /* iOS 줌 방지 */
  }
`;

export const FormInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  font-size: 15px;
  font-weight: 400;
  color: #333333;
  line-height: 18px;
  
  &:focus {
    outline: none;
    border-color: #489bff;
  }

  @media (max-width: 480px) {
    font-size: 16px; /* iOS 줌 방지 */
  }
`;

export const FormHelpText = styled.small`
  display: block;
  margin-top: 4px;
  color: #666666;
  font-size: 12px;
  line-height: 14.4px;
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 24px 24px 24px;
`;

export const ModalButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: 62px;
  height: 36px;
  background: ${props => props.variant === 'secondary' ? '#ffffff' : '#489bff'};
  color: ${props => props.variant === 'secondary' ? '#333333' : '#ffffff'};
  border: ${props => props.variant === 'secondary' ? '1px solid #e4e4e4' : 'none'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  line-height: 22.5px;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.variant === 'secondary' ? '#f8f9fa' : '#3a8aef'};
  }
`;

