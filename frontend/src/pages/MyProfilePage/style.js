import styled from '@emotion/styled';

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;

  @media (max-width: 480px) {
    padding: 0;
    width: 100%;
    max-width: 100%;
    min-height: calc(100vh - 56px - 64px);
    background: #f5f5f5;
    padding-top: 56px;
    padding-bottom: 64px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--primary-color);

  @media (max-width: 480px) {
    display: none;
  }
`;

export const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: var(--dark-color);
  margin: 0;
`;

export const WelcomeText = styled.span`
  font-size: 16px;
  color: var(--secondary-color);
`;

export const HeaderRight = styled.div`
  display: flex;
  gap: 12px;
`;

export const ProfileCard = styled.div`
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  margin-bottom: var(--spacing-lg);
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  transition: all var(--transition-base);

  &:hover {
    box-shadow: var(--shadow);
  }

  @media (max-width: 480px) {
    border-radius: 0;
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-sm);
    box-shadow: none;
    border: none;
    border-bottom: 1px solid var(--border-light);
    
    &:last-child {
      margin-bottom: 0;
      padding-bottom: 80px;
    }
  }
`;

export const CardTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: var(--dark-color);
  margin: 0 0 24px 0;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 480px) {
    font-size: 18px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    white-space: normal;
  }
`;

export const FormGroup = styled.div`
  margin-bottom: 24px;

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: var(--dark-color);
    font-size: 14px;
  }

  @media (max-width: 480px) {
    margin-bottom: 20px;

    label {
      font-size: 13px;
      margin-bottom: 6px;
      color: #666;
    }
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;

  &:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
  }

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  @media (max-width: 480px) {
    padding: 14px 12px;
    font-size: 16px;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    min-height: 48px;
    background: #fafafa;
    
    &:focus {
      background: white;
      border-color: var(--primary-color);
    }
  }
`;

export const HelpText = styled.p`
  margin: 4px 0 0 0;
  font-size: 12px;
  color: var(--secondary-color);
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-light);

  @media (max-width: 480px) {
    position: relative;
    margin-top: var(--spacing-lg);
    padding-top: var(--spacing-md);
    justify-content: stretch;
    gap: var(--spacing-sm);
    border-top: 1px solid var(--border-light);
  }
`;

export const Button = styled.button`
  padding: var(--spacing-md) var(--spacing-lg);
  border: ${props => props.primary ? 'none' : '2px solid var(--border-color)'};
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  transition: all var(--transition-base);
  background-color: ${props => props.primary ? 'var(--primary-color)' : 'white'};
  color: ${props => props.primary ? 'white' : 'var(--text-primary)'};
  min-height: 48px;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background-color: ${props => props.primary ? 'var(--primary-hover)' : 'var(--bg-hover)'};
    transform: translateY(-1px);
    box-shadow: ${props => props.primary ? 'var(--shadow)' : 'var(--shadow-sm)'};
    border-color: ${props => props.primary ? 'transparent' : 'var(--primary-color)'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 480px) {
    flex: 1;
    justify-content: center;
    padding: var(--spacing-md);
    font-size: var(--font-size-base);
    border-radius: var(--radius-md);
    min-height: 52px;
    font-weight: var(--font-weight-semibold);
    
    span {
      display: inline;
    }
    
    svg {
      display: inline;
    }
    
    &:active:not(:disabled) {
      transform: scale(0.98);
    }
  }
`;

export const Loading = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: var(--secondary-color);
`;

export const CompanySection = styled.div`
  margin-bottom: 20px;

  @media (max-width: 480px) {
    margin-bottom: 16px;
  }
`;

export const CompanySectionTitle = styled.h3`
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: bold;
  color: var(--dark-color);

  @media (max-width: 480px) {
    font-size: 15px;
    margin-bottom: 12px;
    padding: 0 4px;
  }
`;

export const CompanyCard = styled.div`
  padding: 15px;
  margin-bottom: 10px;
  border: ${props => props.isCurrent ? '2px solid #28a745' : '1px solid #ddd'};
  border-radius: 5px;
  background-color: ${props => props.isCurrent ? '#f0f9f4' : 'white'};
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    padding: 12px;
    margin-bottom: 8px;
    border-radius: 12px;
    border: ${props => props.isCurrent ? '2px solid #28a745' : '1px solid #e0e0e0'};
    gap: 12px;
  }
`;

export const CompanyInfo = styled.div`
  flex: 1;
  min-width: 0;

  @media (max-width: 480px) {
    width: 100%;
  }
`;

export const CompanyNameRow = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 480px) {
    font-size: 15px;
    margin-bottom: 6px;
    white-space: normal;
  }
`;

export const CompanyDetails = styled.div`
  font-size: 14px;
  color: #666;

  @media (max-width: 480px) {
    font-size: 13px;
    line-height: 1.4;
  }
`;

export const CompanyActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    width: 100%;
    flex-direction: column;
    gap: 6px;
    
    button {
      width: 100%;
      justify-content: center;
    }
  }
`;

export const CurrentBadge = styled.span`
  background-color: #28a745;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
  white-space: nowrap;

  @media (max-width: 480px) {
    font-size: 10px;
    padding: 3px 10px;
  }
`;

export const PendingCompanyCard = styled.div`
  padding: 15px;
  margin-bottom: 10px;
  border: 1px solid #ff9800;
  border-radius: 5px;
  background-color: #fff3cd;

  @media (max-width: 480px) {
    padding: 12px;
    margin-bottom: 8px;
    border-radius: 12px;
  }
`;

export const SearchContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
  }
`;

export const SearchInput = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;

  @media (max-width: 480px) {
    padding: 14px 12px;
    font-size: 16px;
    border-radius: 8px;
    min-height: 48px;
  }
`;

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
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  position: relative;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;

  h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }

  button {
    background: none;
    border: none;
    font-size: 24px;
    color: #666;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;

    &:hover {
      background-color: #f0f0f0;
    }
  }
`;

export const ModalBody = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const TypeSelectButton = styled.button`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;

  &:hover {
    border-color: var(--primary-color);
    background-color: #f0f7ff;
  }

  div {
    flex: 1;

    strong {
      display: block;
      font-size: 18px;
      margin-bottom: 4px;
      color: var(--dark-color);
    }

    p {
      margin: 0;
      font-size: 14px;
      color: #666;
    }
  }
`;

