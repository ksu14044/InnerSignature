import styled from '@emotion/styled';

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

export const TabHeaderBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: white;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 16px;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 16px;
    margin-bottom: 16px;
  }
`;

export const TabSection = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
  flex: 1;
  
  @media (max-width: 768px) {
    gap: 24px;
    width: 100%;
  }
  
  @media (max-width: 480px) {
    gap: 16px;
    width: 100%;
    flex-wrap: wrap;
  }
`;

export const TabHeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-left: auto;
  
  @media (max-width: 768px) {
    width: 100%;
    margin-left: 0;
    justify-content: flex-end;
  }
  
  @media (max-width: 480px) {
    width: 100%;
    margin-left: 0;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
`;

export const TabText = styled.span`
  font-size: 20px;
  font-weight: ${props => props.active ? '700' : '500'};
  color: ${props => {
    if (props.active) return '#333333';
    if (props.style?.opacity === 0.5) return '#999999';
    return '#777777';
  }};
  line-height: 24px;
  cursor: pointer;
  transition: color 0.2s;
  
  &:hover {
    color: ${props => props.active ? '#333333' : '#666666'};
  }
  
  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

export const InfoMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  margin-bottom: 24px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e4e4e4;
  text-align: center;

  @media (max-width: 480px) {
    margin: 0 16px 20px;
    padding: 12px 16px;
  }
`;

export const WarningIcon = styled.div`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

export const WarningText = styled.p`
  font-size: 15px;
  font-weight: 350;
  color: #666666;
  line-height: 18px;
  margin: 0;
  
  strong {
    font-weight: 700;
  }
`;

export const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: ${props => props.variant === 'gray' ? '#e4e4e4' : '#489bff'};
  color: ${props => props.variant === 'gray' ? '#333333' : '#ffffff'};
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  line-height: 19.2px;
  height: 40px;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.variant === 'gray' ? '#d0d0d0' : '#3a8aef'};
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    padding: 12px 20px;
  }

  @media (max-width: 480px) {
    padding: 10px 16px;
    font-size: 14px;
  }
`;

export const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(264px, 1fr));
  gap: 24px;
  padding: 0;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    padding: 0 16px;
    gap: 12px;
  }
`;

export const CardItem = styled.div`
  background: white;
  border-radius: 4px;
  padding: 0px 12px 24px;
  border: 1px solid #e4e4e4;
  width: 264px;
  height: 176px;
  display: flex;
  flex-direction: column;
  transition: all 0.2s;
  position: relative;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 264px;
  }

  @media (max-width: 480px) {
    width: 100%;
    max-width: 100%;
  }
`;

export const CardActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-bottom: 12px;
  width: 100%;
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  width: 100%;
`;

export const CardName = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #333333;
  line-height: 21.6px;
  width: 100%;
`;

export const DefaultBadge = styled.span`
  background-color: #28a745;
  color: white;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
`;

export const EditButton = styled.button`
  background: white;
  border: none;
  color: #333333;
  cursor: pointer;
  padding: 0;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f0f0f0;
  }

  img {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }
`;

export const DeleteButton = styled.button`
  background: white;
  border: none;
  color: #333333;
  cursor: pointer;
  padding: 0;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f0f0f0;
  }

  img {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }
`;

export const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
`;

export const CardNumberGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  flex-wrap: wrap;

  span {
    font-size: 16px;
    font-weight: 400;
    color: #333333;
    line-height: 19.2px;
  }
`;

export const CardInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  font-size: 14px;
  margin-top: auto;
`;

export const CardInfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  line-height: 16.8px;

  span:first-child {
    font-weight: 500;
    color: #666666;
  }

  span:last-child {
    font-weight: 350;
    color: #666666;
  }
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #e4e4e4;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    padding: 60px 20px;
  }

  @media (max-width: 480px) {
    margin: 0 16px 20px;
    padding: 40px 16px;
  }
`;

export const EmptyText = styled.p`
  font-size: 15px;
  font-weight: 350;
  color: #666666;
  line-height: 18px;
  margin: 0;
`;

// 모달 스타일
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;

  @media (max-width: 480px) {
    padding: 0;
    align-items: flex-end;
  }
`;

export const ModalContent = styled.div`
  background: white;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

  @media (max-width: 480px) {
    max-width: 100%;
    max-height: 90vh;
    border-radius: 4px 4px 0 0;
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
`;

export const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #333333;
  line-height: 21.6px;
  margin: 0;
`;

export const CloseButton = styled.button`
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

  img {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }

  span {
    font-size: 24px;
    color: #666666;
  }
`;

export const ModalBody = styled.div`
  padding: 24px;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  font-size: 14px;
  font-weight: 700;
  color: #333333;
  line-height: 16.8px;
`;

export const RequiredAsterisk = styled.span`
  color: #D72D30;
  margin-left: 2px;
`;

export const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  font-size: 15px;
  font-weight: 400;
  color: #333333;
  line-height: 18px;
  background: white;
  transition: border-color 0.2s;
  box-sizing: border-box;
  padding-right: ${props => props.value ? '40px' : '12px'};
  height: 36px;

  &::placeholder {
    color: #777777;
  }

  &:focus {
    outline: none;
    border-color: #489bff;
  }

  &:focus + ${props => props.placeholder ? 'span' : ''} {
    display: none;
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

export const PlaceholderText = styled.span`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 15px;
  font-weight: 400;
  color: #777777;
  opacity: 0.47;
  pointer-events: none;
  line-height: 18px;
  user-select: none;
`;

export const ClearInputButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }
`;

export const XCircleIcon = styled.div`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 100%;
    height: 100%;
  }
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  cursor: pointer;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
`;

export const HelpText = styled.p`
  font-size: 12px;
  font-weight: 400;
  color: #666666;
  line-height: 14.4px;
  margin: 0;
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 0;
  margin-top: 0;
`;

export const CancelButton = styled.button`
  background-color: white;
  color: #333333;
  border: 1px solid #e4e4e4;
  padding: 0;
  width: 60px;
  height: 36px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  line-height: 22.5px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #f8f9fa;
    border-color: #d0d0d0;
  }
`;

export const SubmitButton = styled.button`
  background-color: ${props => props.disabled ? '#999999' : '#489bff'};
  color: white;
  border: none;
  padding: 0;
  width: 62px;
  height: 36px;
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-size: 15px;
  font-weight: 500;
  line-height: 22.5px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background-color: #3a8aef;
  }

  &:disabled {
    opacity: 1;
  }
`;



