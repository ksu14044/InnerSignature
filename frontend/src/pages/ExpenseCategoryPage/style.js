import styled from '@emotion/styled';

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 15px;
  }

  @media (max-width: 480px) {
    padding: 0;
    width: 100%;
    max-width: 100%;
    min-height: auto; /* 모바일에서는 컨텐츠 높이에 따라 조정 */
    background: #f5f5f5;
    padding-top: 56px;
    padding-bottom: 80px; /* 하단 네비게이션 + 여유 공간 */
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
  padding: 16px;
  background: #e7f3ff;
  border: 1px solid #b3d9ff;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: var(--shadow);
  
  p {
    margin: 4px 0;
    font-size: 14px;
    color: #004085;
    line-height: 1.6;
  }

  @media (max-width: 480px) {
    margin: 8px;
    padding: 12px;
    font-size: 13px;
  }
`;

export const ActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;

  @media (max-width: 480px) {
    margin: 8px;
    margin-bottom: 12px;
  }
`;

export const AddButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  min-height: 48px;
  
  &:hover {
    background: var(--primary-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow);
  }

  @media (max-width: 480px) {
    width: 100%;
    padding: 12px 16px;
    justify-content: center;
  }
`;

export const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: 480px) {
    margin: 8px;
    gap: 8px;
  }
`;

export const CategoryItem = styled.div`
  position: relative; /* 삽입선 표시를 위해 */
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: ${props => {
    if (props.isDragOver) return '#f0f7ff';
    return props.isActive ? 'white' : 'var(--light-color)';
  }};
  border: 1px solid var(--border-color);
  border-radius: 12px;
  cursor: ${props => props.draggable ? 'move' : 'default'};
  opacity: ${props => {
    if (props.isDragging) return 0.5;
    return props.isActive ? 1 : 0.6;
  }};
  transition: all 0.2s;
  box-shadow: var(--shadow);
  
  /* 드롭 위치 표시: 위쪽 삽입선 */
  &::before {
    content: '';
    display: ${props => (props.isDragOver && props.dropPosition === 'before') ? 'block' : 'none'};
    position: absolute;
    left: 12px;
    right: 12px;
    top: -6px;
    height: 3px;
    background: var(--primary-color);
    border-radius: 9999px;
    z-index: 1;
  }

  /* 드롭 위치 표시: 아래쪽 삽입선 */
  &::after {
    content: '';
    display: ${props => (props.isDragOver && props.dropPosition === 'after') ? 'block' : 'none'};
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: -6px;
    height: 3px;
    background: var(--primary-color);
    border-radius: 9999px;
    z-index: 1;
  }
  
  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
  }
  
  &[draggable="true"] {
    user-select: none;
  }

  @media (max-width: 480px) {
    padding: 12px;
    gap: 12px;
    border-radius: 8px;
  }
`;

export const DragHandle = styled.div`
  color: var(--secondary-color);
  cursor: grab;
  font-size: 18px;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
  
  &:active {
    cursor: grabbing;
    color: var(--dark-color);
  }

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

export const CategoryInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const CategoryName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--dark-color);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

export const CategoryMeta = styled.div`
  font-size: 12px;
  color: var(--secondary-color);
  line-height: 1.5;

  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`;

export const EditButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  background: #17a2b8;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  min-height: 36px;
  
  &:hover {
    background: #138496;
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    padding: 6px 10px;
    font-size: 12px;
    min-height: 32px;
  }
`;

export const DeleteButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  background: var(--danger-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  min-height: 36px;
  
  &:hover {
    background: #c82333;
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    padding: 6px 10px;
    font-size: 12px;
    min-height: 32px;
  }
`;

export const EmptyMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: var(--secondary-color);
  font-size: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow);

  @media (max-width: 480px) {
    margin: 8px;
    padding: 32px 16px;
    font-size: 14px;
    border-radius: 8px;
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
  border-radius: 12px;
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
  padding: 20px;
  border-bottom: 1px solid var(--border-color);

  @media (max-width: 480px) {
    padding: 16px;
  }
`;

export const ModalTitle = styled.h2`
  font-size: 20px;
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
  font-size: 28px;
  color: var(--secondary-color);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    color: var(--dark-color);
    background: var(--light-color);
  }
`;

export const ModalBody = styled.div`
  padding: 20px;

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
  font-weight: 600;
  color: var(--dark-color);
  font-size: 14px;
`;

export const FormInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  min-height: 48px;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  @media (max-width: 480px) {
    font-size: 16px; /* iOS 줌 방지 */
  }
`;

export const FormHelpText = styled.small`
  display: block;
  margin-top: 4px;
  color: var(--secondary-color);
  font-size: 12px;
  line-height: 1.5;
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid var(--border-color);

  @media (max-width: 480px) {
    padding: 16px;
    gap: 8px;
  }
`;

export const ModalButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  background: ${props => props.variant === 'secondary' ? 'var(--secondary-color)' : 'var(--primary-color)'};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  min-height: 48px;
  
  &:hover {
    background: ${props => props.variant === 'secondary' ? '#5a6268' : 'var(--primary-hover)'};
    transform: translateY(-1px);
    box-shadow: var(--shadow);
  }

  @media (max-width: 480px) {
    flex: 1;
    padding: 12px 16px;
  }
`;

export const TabSection = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid #e5e7eb;
  padding: 0;
`;

export const TabButton = styled.button`
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 3px solid ${props => props.active ? '#007bff' : 'transparent'};
  color: ${props => props.active ? '#007bff' : '#6b7280'};
  font-weight: ${props => props.active ? '600' : '500'};
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #007bff;
  }
`;

export const MappingTabContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow);
`;

export const MappingList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
`;

export const MappingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s;

  &:hover {
    box-shadow: var(--shadow);
    transform: translateY(-1px);
  }
`;

export const MappingInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const MappingTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--dark-color);
`;

export const MappingMeta = styled.div`
  font-size: 14px;
  color: var(--secondary-color);
`;

