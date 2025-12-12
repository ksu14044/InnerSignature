import styled from '@emotion/styled';

export const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  padding: 20px;
`;

export const Card = styled.div`
  background-color: white;
  border-radius: 20px;
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 450px;
  overflow: hidden;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 24px 0 24px;
  margin-bottom: 24px;
`;

export const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: var(--secondary-color);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background-color: var(--light-color);
    color: var(--dark-color);
  }
`;

export const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: var(--dark-color);
  margin: 0;
`;

export const Form = styled.form`
  padding: 0 24px 24px 24px;
`;

export const Description = styled.p`
  color: var(--secondary-color);
  font-size: 14px;
  margin-bottom: 24px;
  text-align: center;
  line-height: 1.6;
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
`;

export const SubmitButton = styled.button`
  width: 100%;
  padding: 16px 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;

  &:hover:not(:disabled) {
    background-color: var(--primary-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const LinkContainer = styled.div`
  text-align: center;
  margin-top: 20px;
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

export const ResultContainer = styled.div`
  padding: 24px;
  text-align: center;
`;

export const ResultMessage = styled.div`
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  background-color: ${props => props.success ? '#d4edda' : '#f8d7da'};
  color: ${props => props.success ? '#155724' : '#721c24'};
  font-size: 16px;
  line-height: 1.5;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

export const Button = styled.button`
  flex: 1;
  padding: 14px 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: var(--primary-hover);
    transform: translateY(-1px);
  }
`;

