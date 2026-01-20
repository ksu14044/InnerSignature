import styled from '@emotion/styled';

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

export const Content = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;

  @media (max-width: 768px) {
    max-width: 95vw;
    margin: 0 10px;
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 16px;
`;

export const Title = styled.h3`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--dark-color);
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  color: var(--secondary-color);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background-color: var(--light-color);
    color: var(--dark-color);
  }
`;

export const Instruction = styled.p`
  margin: 0 24px 20px 24px;
  color: var(--secondary-color);
  font-size: 14px;
  text-align: center;
`;

export const CanvasContainer = styled.div`
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background-color: #fafafa;
  margin: 0 24px 24px 24px;
  overflow: hidden;

  .sigCanvas {
    display: block;
    width: 100% !important;
    height: auto !important;
    min-height: 200px;
  }

  @media (max-width: 768px) {
    margin: 0 16px 20px 16px;

    .sigCanvas {
      min-height: 150px;
    }
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  padding: 0 24px 24px 24px;
  justify-content: flex-end;

  @media (max-width: 768px) {
    padding: 0 16px 20px 16px;
    flex-direction: column;
  }
`;

export const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 44px;

  ${props => props.variant === 'primary' ? `
    background-color: var(--success-color);
    color: white;

    &:hover:not(:disabled) {
      background-color: #218838;
      transform: translateY(-1px);
      box-shadow: var(--shadow);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  ` : `
    background-color: var(--light-color);
    color: var(--dark-color);
    border: 1px solid var(--border-color);

    &:hover:not(:disabled) {
      background-color: #e9ecef;
      border-color: var(--secondary-color);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `}

  @media (max-width: 768px) {
    justify-content: center;
    padding: 14px 20px;
  }
`;

export const TabGroup = styled.div`
  display: flex;
  gap: 8px;
  padding: 0 24px 16px 24px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 16px;
`;

export const Tab = styled.button`
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 8px 8px 0 0;
  background-color: ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.active ? 'white' : 'var(--secondary-color)'};
  font-weight: ${props => props.active ? '600' : '400'};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.active ? 'var(--primary-color)' : 'var(--light-color)'};
  }
`;

export const SavedSignatureList = styled.div`
  padding: 0 24px;
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 24px;
`;

export const SignatureOption = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 2px solid ${props => props.selected ? 'var(--primary-color)' : 'var(--border-color)'};
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: ${props => props.selected ? '#f0f7ff' : 'white'};

  &:hover {
    border-color: var(--primary-color);
    background-color: #f0f7ff;
  }
`;

export const SignaturePreview = styled.div`
  width: 120px;
  height: 80px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

export const SignatureInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const SignatureName = styled.span`
  font-weight: 600;
  font-size: 16px;
  color: var(--dark-color);
`;

export const SignatureType = styled.span`
  font-size: 12px;
  color: var(--secondary-color);
`;

export const DefaultBadge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  background-color: var(--success-color);
  color: white;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  margin-top: 4px;
  width: fit-content;
`;

export const UploadContainer = styled.div`
  padding: 0 24px 24px 24px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    padding: 0 16px 20px 16px;
  }
`;

export const UploadArea = styled.div`
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #fafafa;

  &:hover {
    border-color: var(--primary-color);
    background-color: #f0f7ff;
  }

  p {
    margin: 0;
    color: var(--secondary-color);
    font-size: 14px;
  }

  @media (max-width: 768px) {
    padding: 36px 16px;
  }
`;

export const UploadedImageWrapper = styled.div`
  position: relative;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  background-color: #fafafa;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

export const UploadedImage = styled.img`
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 4px;
`;

export const RemoveImageButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: white;
  color: var(--dark-color);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #ffebee;
    border-color: #f44336;
    color: #f44336;
  }
`;