import styled from '@emotion/styled';

export const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  box-sizing: border-box;
  padding-top: 160px;
`;

export const LoginCard = styled.div`
  width: 100%;
  max-width: 384px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 160px;
`;

export const LogoSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 56px;
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
  font-size: 20px;
  margin: 0 0 40px 0;
  color: #111827;
  text-align: center;
  font-weight: 700;
  font-family: 'Noto Sans KR', sans-serif;

  @media (max-width: 480px) {
    font-size: 16px;
    margin-bottom: 40px;
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
  margin-bottom: 12px;
  
  width: 100%;
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


export const LinkContainer = styled.div`
  text-align: center;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  flex-wrap: wrap;
  margin-top: 24px;

  a {
    color: #489BFF;
    text-decoration: none;
    transition: all 0.2s;

    &:hover {
      color: #3B8BEB;
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
      color: #3B8BEB;
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
