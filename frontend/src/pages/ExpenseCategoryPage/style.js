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

export const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--primary-color);

  @media (max-width: 480px) {
    padding: 16px;
    margin-bottom: 16px;
    background: white;
    border-radius: 0;
  }
`;

export const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  min-height: 48px;
  
  &:hover {
    background: #5a6268;
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    padding: 12px 16px;
    font-size: 13px;
  }
`;

export const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: var(--dark-color);
  margin: 0;

  @media (max-width: 768px) {
    font-size: 24px;
  }

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

export const InfoBox = styled.div`
  padding: 24px;
  background: #fafdff;
  border: 1px solid #489bff;
  border-radius: 8px;
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
  margin-bottom: 24px;

  @media (max-width: 480px) {
    margin: 0 16px 16px;
  }
`;

export const AddButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 118px;
  width: auto;
  height: 40px;
  padding: 0 20px;
  background: ${props => props.$disabled ? '#e4e4e4' : '#489bff'};
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  font-size: 16px;
  font-weight: 500;
  line-height: 16px;
  white-space: nowrap;
  transition: all 0.2s;
  opacity: ${props => props.$disabled ? 1 : 1};
  
  &:hover {
    background: ${props => props.$disabled ? '#e4e4e4' : '#3a8aef'};
    transform: ${props => props.$disabled ? 'none' : 'translateY(-1px)'};
  }

  &:active {
    transform: ${props => props.$disabled ? 'none' : 'translateY(0)'};
  }

  @media (max-width: 480px) {
    width: 100%;
    padding: 12px 16px;
  }
`;

export const CategoryList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  @media (max-width: 480px) {
    margin: 0 16px;
    gap: 12px;
  }
`;

// ActionButtons를 CategoryItem보다 먼저 정의
export const ActionButtons = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  z-index: 2;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
`;

export const CategoryItem = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  min-height: 97px;
  padding: 24px 24px 24px 24px;
  background: ${props => {
    if (props.isDragOver) return 'rgba(228, 228, 228, 0.3)';
    return props.isActive ? '#ffffff' : 'rgba(228, 228, 228, 0.4)';
  }};
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  cursor: ${props => props.draggable ? 'move' : 'default'};
  opacity: ${props => {
    if (props.isDragging) return 0.5;
    if (!props.isActive) return 0.4;
    return 1;
  }};
  transition: all 0.2s;
  
  /* 드롭 위치 표시: 왼쪽 삽입선 */
  &::before {
    content: '';
    display: ${props => (props.isDragOver && props.dropPosition === 'left') ? 'block' : 'none'};
    position: absolute;
    left: -6px;
    top: 12px;
    bottom: 12px;
    width: 3px;
    background: #666666;
    border-radius: 9999px;
    z-index: 1;
  }

  /* 드롭 위치 표시: 오른쪽 삽입선 */
  &::after {
    content: '';
    display: ${props => (props.isDragOver && props.dropPosition === 'right') ? 'block' : 'none'};
    position: absolute;
    right: -6px;
    top: 12px;
    bottom: 12px;
    width: 3px;
    background: #666666;
    border-radius: 9999px;
    z-index: 1;
  }
  
  &:hover {
    background: rgba(228, 228, 228, 0.4);
  }
  
  &:hover ${ActionButtons} {
    opacity: 1;
    visibility: visible;
  }
  
  &[draggable="true"] {
    user-select: none;
  }

  @media (max-width: 480px) {
    padding: 16px;
    min-height: 97px;
  }
`;

export const CategoryInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const CategoryName = styled.div`
  font-size: 18px;
  font-weight: 500;
  color: #333333;
  line-height: 21.6px;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

export const CategoryMeta = styled.div`
  font-size: 16px;
  font-weight: 350;
  color: #666666;
  line-height: 19.2px;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

export const EditButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  
  img {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    width: 28px;
    height: 28px;
    
    img {
      width: 20px;
      height: 20px;
    }
  }
`;

export const DeleteButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  
  img {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    width: 28px;
    height: 28px;
    
    img {
      width: 20px;
      height: 20px;
    }
  }
`;

export const EmptyMessage = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: #666666;
  font-size: 15px;
  font-weight: 350;
  background: white;
  border-radius: 4px;
  border: 1px solid #e4e4e4;

  @media (max-width: 480px) {
    margin: 0 16px;
    padding: 32px 16px;
    font-size: 14px;
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
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);

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
  padding: 24px 24px 20px 24px;
  border-bottom: none;

  @media (max-width: 480px) {
    padding: 16px;
  }
`;

export const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #000000;
  margin: 0;
  line-height: 18px;

  @media (max-width: 480px) {
    font-size: 16px;
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
  transition: all 0.2s;
  
  img {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }
  
  &:hover {
    opacity: 0.7;
  }
`;

export const ModalBody = styled.div`
  padding: 0 24px 24px 24px;

  @media (max-width: 480px) {
    padding: 0 16px 16px;
  }
`;

export const FormGroup = styled.div`
  margin-bottom: 24px;

  &:last-of-type {
    margin-bottom: 0;
  }

  @media (max-width: 480px) {
    margin-bottom: 20px;
  }
`;

export const FormLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 700;
  color: #333333;
  font-size: 14px;
  line-height: 16.8px;
  
  /* 에스터리스크 스타일 - 기본적으로 표시 */
  &::after {
    content: '*';
    color: #d72d30;
    margin-left: 2px;
  }
  
  /* 에스터리스크가 없는 경우 (예: 체크박스, 선택사항) */
  &:has(input[type="checkbox"])::after {
    display: none;
  }
  
  /* $noAsterisk prop이 있을 때 에스터리스크 숨김 */
  ${props => props.$noAsterisk && `
    &::after {
      display: none;
    }
  `}
`;

export const FormInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  font-size: 15px;
  color: #333333;
  background: #ffffff;
  transition: all 0.2s;
  min-height: 36px;
  height: 36px;
  
  &::placeholder {
    color: #666666;
    font-size: 15px;
  }
  
  &:focus {
    outline: none;
    border-color: #666666;
  }
  
  &[type="number"] {
    -moz-appearance: textfield;
    
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  @media (max-width: 480px) {
    font-size: 16px; /* iOS 줌 방지 */
    min-height: 40px;
    height: 40px;
  }
`;

export const FormHelpText = styled.small`
  display: block;
  margin-top: 8px;
  color: #666666;
  font-size: 12px;
  line-height: 14.4px;
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px 24px 24px 24px;
  border-top: none;

  @media (max-width: 480px) {
    padding: 16px;
    gap: 8px;
  }
`;

export const ModalButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  height: 36px;
  min-height: 36px;
  background: ${props => {
    if (props.variant === 'secondary') return '#ffffff';
    if (props.$disabled) return '#999999';
    return '#489bff';
  }};
  color: ${props => props.variant === 'secondary' ? '#333333' : '#ffffff'};
  border: ${props => props.variant === 'secondary' ? '1px solid #e4e4e4' : 'none'};
  border-radius: 4px;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  font-size: 15px;
  font-weight: 500;
  line-height: 22.5px;
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover:not(:disabled) {
    background: ${props => {
      if (props.variant === 'secondary') return '#f8f9fa';
      if (props.$disabled) return '#999999';
      return '#3a8aef';
    }};
    transform: ${props => props.$disabled ? 'none' : 'translateY(-1px)'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    flex: 1;
    padding: 0 12px;
    height: 40px;
    min-height: 40px;
  }
`;

export const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
`;

export const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 2px solid #489bff;
  background: ${props => props.checked ? '#489bff' : 'transparent'};
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  position: relative;
  transition: all 0.2s;
  
  &:checked::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 12px;
    font-weight: bold;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(72, 155, 255, 0.2);
  }
`;

export const CheckboxLabel = styled.label`
  font-size: 14px;
  font-weight: 400;
  color: #000000;
  line-height: 16.8px;
  cursor: pointer;
  user-select: none;
`;

// TabHeaderBar 스타일 (지출결의서 목록 페이지와 동일)
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

export const TabButton = styled.span`
  font-size: 20px;
  font-weight: ${props => props.active ? '700' : '500'};
  color: ${props => props.active ? '#333333' : '#666666'};
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

export const MappingTabContent = styled.div`
  background: white;
  padding: 24px;
  
  @media (max-width: 480px) {
    padding: 16px;
  }
`;

export const NoAccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
  min-height: 300px;

  @media (max-width: 480px) {
    padding: 40px 16px;
    min-height: 200px;
  }
`;

export const NoAccessIcon = styled.div`
  width: 40px;
  height: 40px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
    margin-bottom: 16px;
  }
`;

export const NoAccessMessage = styled.div`
  font-size: 15px;
  font-weight: 350;
  color: #666666;
  line-height: 24px;
  max-width: 500px;
  margin: 0 auto;

  @media (max-width: 480px) {
    font-size: 14px;
    line-height: 20px;
  }
`;

export const MappingList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 0;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

export const MappingItem = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 24px;
  background: #ffffff;
  border: 1px solid #e4e4e4;
  border-radius: 8px;
  min-height: 97px;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  transition: all 0.2s;

  &:hover {
    ${props => props.$clickable && `
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    `}
  }
  
  @media (max-width: 480px) {
    padding: 16px;
    min-height: 97px;
  }
`;

export const MappingInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const MappingTitle = styled.div`
  font-size: 18px;
  font-weight: 500;
  color: #333333;
  line-height: 21.6px;
`;

export const MappingMeta = styled.div`
  font-size: 16px;
  font-weight: 350;
  color: #666666;
  line-height: 19.2px;
`;

