import styled from '@emotion/styled';

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 15px;
  }

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
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--primary-color);

  @media (max-width: 768px) {
    margin-bottom: 24px;
    padding-bottom: 12px;
  }

  @media (max-width: 480px) {
    display: none;
  }
`;

export const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: var(--secondary-color);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  transition: all 0.2s;

  &:hover {
    background-color: var(--light-color);
    color: var(--dark-color);
  }

  @media (max-width: 768px) {
    font-size: 18px;
    padding: 6px;
  }
`;

export const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: var(--dark-color);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;

  @media (max-width: 768px) {
    font-size: 24px;
  }

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

export const Section = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border-color);

  @media (max-width: 768px) {
    padding: 20px;
    margin-bottom: 20px;
  }

  @media (max-width: 480px) {
    padding: 16px;
    margin-bottom: 8px;
    border-radius: 0;
    box-shadow: none;
    border: none;
    border-bottom: 1px solid #f0f0f0;
  }
`;

export const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: var(--dark-color);
  margin: 0 0 24px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;

  @media (max-width: 768px) {
    font-size: 18px;
    margin-bottom: 20px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
    margin-bottom: 16px;
  }
`;

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 20px;
  }
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  @media (max-width: 480px) {
    gap: 16px;
  }
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  font-weight: 600;
  font-size: 14px;
  color: var(--dark-color);
`;

export const Value = styled.span`
  font-size: 16px;
  color: var(--secondary-color);
  padding: 12px;
  background-color: var(--light-color);
  border-radius: 6px;
  border: 1px solid var(--border-color);
`;

export const Input = styled.input`
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s;
  min-height: 48px;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  &::placeholder {
    color: var(--secondary-color);
  }

  @media (max-width: 480px) {
    padding: 12px;
    font-size: 14px;
  }
`;

export const Select = styled.select`
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 48px;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  @media (max-width: 480px) {
    padding: 12px;
    font-size: 14px;
  }
`;

export const ApproverGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

export const ApproverCheckbox = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  background-color: white;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    border-color: var(--primary-color);
    background-color: rgba(0, 123, 255, 0.02);
  }

  input[type="checkbox"] {
    margin-right: 12px;
    width: 18px;
    height: 18px;
    accent-color: var(--primary-color);
  }

  label {
    cursor: pointer;
    margin: 0;
    flex: 1;
  }
`;

export const ApproverInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const ApproverName = styled.span`
  font-weight: 600;
  font-size: 16px;
  color: var(--dark-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

export const ApproverPosition = styled.span`
  font-size: 14px;
  color: var(--secondary-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

export const LoadingMessage = styled.p`
  color: var(--secondary-color);
  font-style: italic;
  text-align: center;
  padding: 32px;
`;

export const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: var(--success-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #218838;
    transform: translateY(-1px);
  }
`;

export const TableContainer = styled.div`
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid var(--border-color);

  @media (max-width: 480px) {
    border: none;
    border-radius: 0;
    overflow-x: visible;
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: white;

  @media (max-width: 768px) {
    font-size: 14px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

export const Th = styled.th`
  background-color: var(--light-color);
  border: 1px solid var(--border-color);
  padding: 16px 12px;
  text-align: center;
  font-weight: 600;
  color: var(--dark-color);
  font-size: 14px;

  @media (max-width: 768px) {
    padding: 12px 8px;
  }

  @media (max-width: 480px) {
    padding: 10px 6px;
    font-size: 11px;
    white-space: nowrap;
  }
`;

export const Td = styled.td`
  border: 1px solid var(--border-color);
  padding: 12px 8px;
  text-align: center;
  vertical-align: middle;

  @media (max-width: 480px) {
    padding: 10px 6px;
    font-size: 11px;
    
    input, select {
      width: 100%;
      min-width: 0;
      padding: 8px;
      font-size: 11px;
    }
  }
`;

export const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background-color: var(--danger-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  min-width: 40px;
  min-height: 40px;

  &:hover {
    background-color: #c82333;
    transform: scale(1.05);
  }

  @media (max-width: 480px) {
    min-width: 36px;
    min-height: 36px;
    padding: 6px;
    font-size: 12px;
  }
`;

export const TotalSection = styled.div`
  margin: 32px 0;

  @media (max-width: 480px) {
    margin: 16px 0;
    padding: 0 16px;
  }
`;

export const TotalCard = styled.div`
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: white;
  padding: 24px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    text-align: center;
    padding: 20px;
  }

  @media (max-width: 480px) {
    border-radius: 16px;
    padding: 20px;
  }
`;

export const TotalLabel = styled.span`
  font-size: 18px;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

export const TotalAmount = styled.span`
  font-size: 32px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 28px;
  }

  @media (max-width: 480px) {
    font-size: 24px;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 32px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    margin-top: 24px;
  }

  @media (max-width: 480px) {
    position: fixed;
    bottom: 64px;
    left: 0;
    right: 0;
    background: white;
    padding: 12px 16px;
    margin: 0;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
    flex-direction: column;
    gap: 8px;
    z-index: 998;
  }
`;

export const CancelButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  background-color: var(--light-color);
  color: var(--dark-color);
  border: 2px solid var(--border-color);
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 48px;

  &:hover {
    background-color: #e9ecef;
    border-color: var(--secondary-color);
  }

  @media (max-width: 768px) {
    padding: 16px 24px;
  }

  @media (max-width: 480px) {
    width: 100%;
    padding: 14px 16px;
    font-size: 14px;
    
    span {
      display: none;
    }
  }
`;

export const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 48px;

  &:hover {
    background-color: var(--primary-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 16px 24px;
  }

  @media (max-width: 480px) {
    width: 100%;
    padding: 14px 16px;
    font-size: 14px;
    
    span {
      font-size: 14px;
    }
  }
`;

export const InfoMessage = styled.div`
  padding: 15px 20px;
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  color: #856404;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;

  @media (max-width: 480px) {
    padding: 12px;
    font-size: 12px;
    line-height: 1.5;
  }
`;

export const InfoText = styled.span`
  font-size: 12px;
  color: var(--secondary-color);
  margin-top: 4px;
  display: block;
`;