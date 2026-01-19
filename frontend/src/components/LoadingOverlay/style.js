import styled from '@emotion/styled';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  
  ${props => props.modal ? `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 9999;
  ` : props.fullScreen ? `
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

export const ModalContent = styled.div`
  ${props => props.modal ? `
    background-color: white;
    border-radius: 12px;
    padding: 40px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    min-width: 300px;
    max-width: 90%;
    
    @media (max-width: 768px) {
      padding: 30px 20px;
      min-width: 250px;
    }
  ` : `
    display: contents;
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

export const ProgressContainer = styled.div`
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;

  @media (max-width: 768px) {
    width: 250px;
  }
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
`;

export const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.progress}%;
  background: linear-gradient(90deg, var(--primary-color), #4caf50);
  border-radius: 4px;
  transition: width 0.3s ease;
  animation: shimmer 2s infinite;
  
  @keyframes shimmer {
    0% { background-position: -100% 0; }
    100% { background-position: 100% 0; }
  }
`;

export const ProgressText = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color);
`;

