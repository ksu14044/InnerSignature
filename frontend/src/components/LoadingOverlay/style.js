import styled from '@emotion/styled';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  
  ${props => props.fullScreen ? `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    min-height: 100vh;
    background-color: #f8f9fa;
    z-index: 9999;
  ` : `
    padding: 40px;
    width: 100%;
  `}
`;

export const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid #e0e0e0;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    border-width: 3px;
  }
`;

export const Message = styled.div`
  font-size: 18px;
  font-weight: 500;
  color: var(--secondary-color);
  text-align: center;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

