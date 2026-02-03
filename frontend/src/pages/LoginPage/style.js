import styled from '@emotion/styled';

export const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  padding: 40px 20px 24px;
  box-sizing: border-box;

  @media (max-width: 480px) {
    padding: 32px 16px 20px;
  }
`;

export const LoginCard = styled.div`
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  justify-content: center;
`;

export const LogoSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
`;

export const LogoImage = styled.img`
  width: auto;
  height: auto;
  margin-bottom: 0;
`;

export const Logo = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  color: #3b82f6;
  letter-spacing: 0.5px;

  @media (max-width: 480px) {
    font-size: 28px;
  }
`;

export const Subtitle = styled.p`
  font-size: 18px;
  margin: 0 0 40px 0;
  color: #111827;
  text-align: center;
  font-weight: 400;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  @media (max-width: 480px) {
    font-size: 16px;
    margin-bottom: 32px;
  }
`;

export const Form = styled.form`
  width: 100%;

  @media (max-width: 480px) {
    width: 100%;
  }
`;

export const FormTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: var(--dark-color);
  text-align: center;
  margin: 0 0 32px 0;

  @media (max-width: 480px) {
    font-size: 20px;
    margin-bottom: 24px;
  }
`;

export const InputGroup = styled.div`
  position: relative;
  margin-bottom: 16px;
  width: 100%;
`;

export const InputIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--secondary-color);
  z-index: 1;
`;

export const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  background-color: #ffffff;
  transition: all 0.2s;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

export const ClearButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--secondary-color);
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  z-index: 2;
  font-size: 14px;

  &:hover {
    background-color: var(--light-color);
    color: var(--dark-color);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }
`;

export const SubmitButtonBase = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px 20px;
  background-color: #489BFF;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
  margin-bottom: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  &:hover {
    background-color: #2563eb;
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const LinkContainer = styled.div`
  text-align: center;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  flex-wrap: wrap;

  a {
    color: #489BFF;
    text-decoration: none;
    transition: all 0.2s;

    &:hover {
      color: #2563eb;
      text-decoration: underline;
    }
  }

  button {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    color: #489BFF;
    cursor: pointer;
    font: inherit;
    font-size: 14px;

    &:hover {
      color: #2563eb;
      text-decoration: underline;
    }
  }
`;

export const LinkDivider = styled.span`
  color: #489BFF;
  margin: 0 4px;
`;

export const RegisterButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  background-color: var(--success-color);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #218838;
    transform: translateY(-1px);
  }
`;

export const Footer = styled.footer`
  width: 100%;
  margin-top: auto;
  text-align: center;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.8;
  padding: 24px 20px;
  background-color: #F8F9FA;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  @media (max-width: 480px) {
    font-size: 11px;
    padding: 20px 16px;
  }
`;

export const FooterContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;

  span {
    display: block;
  }
`;

export const FooterLink = styled.span`
  font-weight: 600;
  margin-top: 8px;
  margin-bottom: 2px;
`;

// 모달 스타일
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
  z-index: 1000;
  padding: 20px;
`;

export const ModalContent = styled.div`
  background-color: white;
  border-radius: 16px;
  width: 100%;
  max-width: 450px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);

  @media (max-width: 480px) {
    max-width: 95vw;
    border-radius: 12px;
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 24px;

  @media (max-width: 480px) {
    padding: 20px 20px 0 20px;
  }
`;

export const ModalTitle = styled.h3`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--dark-color);

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: var(--secondary-color);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background-color: var(--light-color);
    color: var(--dark-color);
  }
`;

export const ModalBody = styled.div`
  padding: 0 24px 24px 24px;

  @media (max-width: 480px) {
    padding: 0 20px 20px 20px;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 10px;
  }
`;

export const CancelButton = styled.button`
  flex: 1;
  padding: 14px 20px;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #5a6268;
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    padding: 16px 20px;
  }
`;

export const RadioGroup = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 8px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 12px;
  }
`;

export const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  
  input[type="radio"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
  
  span {
    font-size: 14px;
    color: var(--dark-color);
  }
`;

export const SearchButton = styled.button`
  padding: 12px 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: var(--primary-hover);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const CompanyList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-top: 8px;
`;

export const CompanyItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s;
  border-bottom: 1px solid var(--border-color);
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: var(--light-color);
  }
  
  ${props => props.selected && `
    background-color: rgba(0, 123, 255, 0.1);
    border-left: 3px solid var(--primary-color);
  `}
`;

export const CompanyMessage = styled.div`
  padding: 12px;
  color: #666;
  font-size: 14px;
  text-align: center;
  margin-top: 8px;
`;

export const SelectedCompany = styled.div`
  padding: 12px;
  background-color: rgba(0, 123, 255, 0.1);
  border-radius: 8px;
  margin-top: 8px;
  font-size: 14px;
  color: var(--dark-color);
`;

export const CompanySearchButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background-color: white;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  
  &:hover {
    border-color: #007bff;
    background-color: #f8f9ff;
  }
  
  span {
    flex: 1;
    text-align: left;
    color: ${props => props.hasValue ? '#333' : '#999'};
  }
`;

export const SubmitButton = styled(CancelButton)`
  background-color: var(--primary-color);
  
  &:hover {
    background-color: var(--primary-hover);
  }
`;