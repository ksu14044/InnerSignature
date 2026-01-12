import styled from '@emotion/styled';

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 20px;
`;

export const ModalContent = styled.div`
  background-color: white;
  border-radius: 16px;
  width: 100%;
  max-height: 90vh;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;

  ${({ size }) => {
    switch (size) {
      case 'small':
        return `
          max-width: 400px;
        `;
      case 'large':
        return `
          max-width: 1000px;
        `;
      case 'medium':
      default:
        return `
          max-width: 800px;
        `;
    }
  }}

  @media (max-width: 480px) {
    max-width: 95vw;
    border-radius: 12px;
    max-height: 95vh;
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 24px;

  @media (max-width: 480px) {
    padding: 20px 20px 0 20px;
  }
`;

export const ModalTitle = styled.h3`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #f0f0f0;
    color: #333;
  }
`;

export const ModalBody = styled.div`
  padding: 0 24px 24px 24px;
  overflow-y: auto;
  flex: 1;

  @media (max-width: 480px) {
    padding: 0 20px 20px 20px;
  }
`;

export const ModalFooter = styled.div`
  padding: 24px;
  border-top: 1px solid #e0e0e0;
  background-color: #fafafa;
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  @media (max-width: 480px) {
    padding: 20px;
    flex-direction: column;
  }
`;
