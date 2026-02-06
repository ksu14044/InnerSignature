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
  background-color: #ffffff;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  box-shadow: var(--shadow-lg);
  width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;

  @media (max-width: 768px) {
    width: 95vw;
    max-width: 500px;
    margin: 0 10px;
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  margin-bottom: 16px;
`;

export const Title = styled.h3`
  margin: 0;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #333333;
  line-height: 21.6px;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  width: 24px;
  height: 24px;
  color: #333333;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    opacity: 0.7;
  }
`;

export const Instruction = styled.p`
  margin: 0 24px 20px 24px;
  color: #666666;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 15px;
  font-weight: 350;
  text-align: center;
  line-height: 24px;
`;

export const CanvasContainer = styled.div`
  position: relative;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  background-color: #fafafa;
  margin: 0 24px 24px 24px;
  overflow: hidden;
  width: 452px;
  height: 160px;
  box-sizing: border-box;

  .sigCanvas {
    display: block;
    width: 452px !important;
    height: 160px !important;
  }

  @media (max-width: 768px) {
    width: calc(100% - 48px);
    max-width: 452px;
    margin: 0 24px 24px 24px;

    .sigCanvas {
      width: 100% !important;
      height: 160px !important;
    }
  }
`;

export const ClearButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  border: none;
  background: none;
  color: #666666;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 12px;
  font-weight: 350;
  cursor: pointer;
  padding: 0;
  z-index: 10;
  line-height: 18px;

  &:hover:not(:disabled) {
    color: #333333;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

export const RedrawButton = styled.button`
  position: absolute;
  top: 1px;
  right: 8px;
  border: none;
  background: none;
  color: #666666;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 12px;
  font-weight: 350;
  cursor: pointer;
  padding: 0;
  z-index: 10;
  line-height: 18px;

  &:hover:not(:disabled) {
    color: #333333;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

export const ReuploadButton = styled.button`
  position: absolute;
  top: 1px;
  right: 8px;
  border: none;
  background: none;
  color: #666666;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 12px;
  font-weight: 350;
  cursor: pointer;
  padding: 0;
  z-index: 10;
  line-height: 18px;

  &:hover:not(:disabled) {
    color: #333333;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
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
  justify-content: center;
  gap: 0;
  padding: 0;
  width: 60px;
  height: 36px;
  border: none;
  border-radius: 4px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 500;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  line-height: 18px;

  ${props => props.variant === 'primary' ? `
    background-color: ${props.disabled ? '#999999' : '#489bff'};
    color: #ffffff;

    &:hover:not(:disabled) {
      background-color: #3a8ce6;
    }

    &:active:not(:disabled) {
      background-color: #2d7fd9;
    }

    &:disabled {
      cursor: not-allowed;
    }
  ` : props.variant === 'secondary' ? `
    background-color: #ffffff;
    color: #333333;
    border: 1px solid #e4e4e4;

    &:hover:not(:disabled) {
      background-color: #f5f5f5;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  ` : `
    background-color: #ffffff;
    color: #333333;
    border: 1px solid #e4e4e4;

    &:hover:not(:disabled) {
      background-color: #f5f5f5;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `}

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const TabGroup = styled.div`
  display: flex;
  gap: 0;
  padding: 0 24px 16px 24px;
  margin-bottom: 16px;
`;

export const Tab = styled.button`
  padding: 0;
  border: none;
  background: none;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 16px;
  font-weight: ${props => props.active ? '500' : '400'};
  color: ${props => props.active ? '#333333' : '#666666'};
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 24px;
  line-height: 19.2px;

  &:hover {
    color: #333333;
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
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 768px) {
    padding: 0 16px 20px 16px;
  }
`;

export const UploadArea = styled.div`
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #fafafa;
  width: 452px;
  height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;

  &:hover {
    border-color: #489bff;
    background-color: #f0f7ff;
  }

  p {
    margin: 0;
    font-family: 'Noto Sans KR', sans-serif;
    color: #666666;
    font-size: 15px;
    font-weight: 350;
    line-height: 24px;
  }

  @media (max-width: 768px) {
    width: calc(100% - 48px);
    max-width: 452px;
    padding: 36px 16px;
  }
`;

export const UploadedImageWrapper = styled.div`
  position: relative;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  padding: 0;
  background-color: #fafafa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 452px;
  height: 160px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    width: calc(100% - 48px);
    max-width: 452px;
  }
`;

export const UploadedImage = styled.img`
  width: 85px;
  height: 84px;
  object-fit: contain;
  border-radius: 0;
`;

export const RemoveImageButton = styled.button`
  display: none;
`;

export const NameInputSection = styled.div`
  margin: 0 24px 24px 24px;
  padding: 0;
  width: 452px;

  @media (max-width: 768px) {
    width: 100%;
    margin: 0 16px 20px 16px;
  }
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: #333333;
  line-height: 16.8px;

  .asterisk {
    color: #D72D30;
  }
`;

export const NameInputWrapper = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 16px;
`;

export const NameInput = styled.input`
  width: 100%;
  height: 36px;
  padding: 0 ${props => props.hasValue ? '36px' : '12px'} 0 12px;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  background-color: #ffffff;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 15px;
  font-weight: 400;
  color: #333333;
  box-sizing: border-box;
  line-height: 15px;
  
  &::placeholder {
    color: #777777;
  }
  
  &:focus {
    outline: none;
    border-color: #489bff;
  }
`;

export const ClearNameButton = styled.button`
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
  z-index: 1;
  
  &:hover {
    opacity: 0.7;
  }
  
  &:active {
    opacity: 0.5;
  }
`;

export const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  
  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
    border: 1px solid #e4e4e4;
    border-radius: 4px;
    appearance: none;
    position: relative;
    
    &:checked {
      background-color: #489bff;
      border-color: #489bff;
      
      &::after {
        content: '';
        position: absolute;
        left: 4px;
        top: 1px;
        width: 5px;
        height: 9px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }
    
    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }
  
  label {
    font-family: 'Noto Sans KR', sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: #000000;
    cursor: pointer;
    user-select: none;
    line-height: 16.8px;
  }
`;

export const HelpText = styled.p`
  margin: 0;
  margin-top: 8px;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 12px;
  font-weight: 350;
  color: #666666;
  line-height: 14.4px;
`;