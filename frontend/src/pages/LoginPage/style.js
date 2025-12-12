import styled from '@emotion/styled';

export const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  padding: 20px;

  @media (max-width: 480px) {
    padding: 10px;
  }
`;

export const LoginCard = styled.div`
  background-color: white;
  border-radius: 20px;
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 400px;
  overflow: hidden;

  @media (max-width: 480px) {
    border-radius: 16px;
  }
`;

export const LogoSection = styled.div`
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  padding: 40px 30px;
  text-align: center;
  color: white;

  @media (max-width: 480px) {
    padding: 30px 20px;
  }
`;

export const Logo = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;

  @media (max-width: 480px) {
    font-size: 28px;
  }
`;

export const Subtitle = styled.p`
  font-size: 16px;
  margin: 0;
  opacity: 0.9;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

export const Form = styled.form`
  padding: 40px 30px;

  @media (max-width: 480px) {
    padding: 30px 20px;
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
  margin-bottom: 20px;
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
  padding: 16px 16px 16px 48px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 16px;
  background-color: var(--light-color);
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    background-color: white;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  &::placeholder {
    color: var(--secondary-color);
  }
`;

export const SubmitButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 16px;

  &:hover {
    background-color: var(--primary-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const TestButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 16px;

  &:hover {
    background-color: #ff5252;
    transform: translateY(-2px);
    box-shadow: var(--shadow);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const LinkContainer = styled.div`
  text-align: center;
  margin: 16px 0;
  font-size: 14px;

  a {
    color: var(--primary-color);
    text-decoration: none;
    transition: all 0.2s;

    &:hover {
      color: var(--primary-hover);
      text-decoration: underline;
    }
  }

  span {
    color: var(--secondary-color);
    margin: 0 8px;
  }
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
