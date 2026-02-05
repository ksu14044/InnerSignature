import styled from '@emotion/styled';

export const Container = styled.div`
  width: 100%;
  padding: 24px 24px 24px 40px;
  min-height: 100vh;
  background: #f8f9fa;

  @media (max-width: 768px) {
    padding: 16px 16px 16px 40px;
  }

  @media (max-width: 480px) {
    padding: 0;
    width: 100%;
    max-width: 100%;
    min-height: auto;
    background: #f5f5f5;
    padding-top: 56px;
    padding-bottom: 80px;
    padding-left: 40px;
  }
`;

export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: white;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 16px;
  }
`;

export const PageHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #333333;
  margin: 0;
`;

export const PageHeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const PageSubHeader = styled.div`
  margin-bottom: 24px;
  padding: 0 24px;
  font-size: 20px;
  font-weight: 700;
  color: #333333;
  font-family: 'Noto Sans KR', sans-serif;
  line-height: 24px;

  @media (max-width: 480px) {
    padding: 0 16px;
    font-size: 18px;
  }
`;

export const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: var(--secondary-color);
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
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
  border-radius: 4px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  border: 1px solid #e0e0e0;
  position: relative;
  transition: all var(--transition-base);

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  @media (max-width: 768px) {
    padding: 20px;
    margin-bottom: 16px;
  }

  @media (max-width: 480px) {
    padding: 16px;
    margin-bottom: 8px;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: none;
  }
`;

export const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #333333;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  font-family: 'Noto Sans KR', sans-serif;
  line-height: 21.6px;

  @media (max-width: 768px) {
    font-size: 18px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 0;
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

export const FormRow = styled.div`
  display: flex;
  gap: 24px;
  align-items: flex-start;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }

  @media (max-width: 480px) {
    gap: 12px;
  }
`;

export const FormGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (max-width: 480px) {
    width: 100%;
  }
`;

export const Label = styled.label`
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  margin-bottom: var(--spacing-sm);

  input[type="checkbox"] {
    cursor: pointer;
    width: 18px;
    height: 18px;
  }
`;

export const HelpText = styled.small`
  font-size: 12px;
  color: var(--secondary-color);
  margin-top: 4px;
  line-height: 1.5;
`;

export const Value = styled.span`
  font-size: 16px;
  color: var(--secondary-color);
  padding: 12px;
  background-color: var(--light-color);
  border-radius: 4px;
  border: 1px solid var(--border-color);
`;

export const Input = styled.input`
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
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
  border-radius: 4px;
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
  border-radius: 4px;
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
  padding: 8px 16px;
  background-color: white;
  color: #333333;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  font-size: 15px;
  font-family: 'Noto Sans KR', sans-serif;
  line-height: 18px;
  cursor: pointer;
  transition: all 0.2s;
  height: 36px;

  &:hover {
    background-color: #f8f9fa;
  }
`;

export const TableContainer = styled.div`
  overflow-x: auto;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);

  @media (max-width: 480px) {
    display: none;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border: none;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

export const Th = styled.th`
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  padding: 16px 12px;
  text-align: ${props => props.width === '12%' && props.children === '금액' ? 'right' : 'left'};
  font-weight: 500;
  color: #333333;
  font-size: 14px;
  font-family: 'Noto Sans KR', sans-serif;
  line-height: 16.8px;

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
  border: 1px solid #e0e0e0;
  padding: 12px 8px;
  text-align: ${props => props.style?.textAlign || 'left'};
  vertical-align: middle;
  color: #666666;
  font-size: 16px;
  font-family: 'Noto Sans KR', sans-serif;
  line-height: 19.2px;
`;

export const TableRow = styled.tr`
  cursor: pointer;
  transition: all 0.2s;
  background-color: white;

  &:hover {
    background-color: #f8f9fa;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #e0e0e0;
  }
`;

export const ActionButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
`;

export const EditButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  width: 30px;
  height: 30px;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &:hover {
    opacity: 0.7;
    transform: scale(1.05);
  }

  @media (max-width: 480px) {
    width: 48px;
    height: 48px;
    padding: 4px;
  }
`;

export const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  width: 30px;
  height: 30px;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &:hover {
    opacity: 0.7;
    transform: scale(1.05);
  }

  @media (max-width: 480px) {
    width: 48px;
    height: 48px;
    padding: 4px;
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
  background: linear-gradient(135deg, #74dbed 0%, #489bff 100%);
  color: white;
  padding: 24px;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    text-align: center;
    padding: 20px;
  }

  @media (max-width: 480px) {
    border-radius: 4px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

export const TotalLabel = styled.span`
  font-size: 18px;
  font-weight: 500;
  font-family: 'Noto Sans KR', sans-serif;
  line-height: 21.6px;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

export const TotalAmount = styled.span`
  font-size: 32px;
  font-weight: 700;
  font-family: 'Noto Sans KR', sans-serif;
  line-height: 38.4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;

  @media (max-width: 768px) {
    font-size: 28px;
  }

  @media (max-width: 480px) {
    font-size: 24px;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-bottom: 40px;

  @media (max-width: 768px) {
    flex-direction: row;
    gap: 8px;
    margin-top: 24px;
    padding-bottom: 32px;
  }

  @media (max-width: 480px) {
    position: relative;
    background: white;
    padding: 16px;
    margin: 16px;
    margin-bottom: calc(16px + 80px); /* FAB 공간 확보 */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    border: none;
    flex-direction: row;
    gap: 8px;
  }
`;

export const CancelButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: white;
  color: #333333;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  font-weight: 500;
  font-size: 15px;
  font-family: 'Noto Sans KR', sans-serif;
  line-height: 18px;
  cursor: pointer;
  transition: all var(--transition-base);
  min-height: 36px;
  width: 90px;

  &:hover:not(:disabled) {
    background-color: #f8f9fa;
    border-color: #d0d0d0;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 8px 16px;
    width: auto;
  }

  @media (max-width: 480px) {
    flex: 1;
    padding: var(--spacing-md);
    font-size: var(--font-size-sm);
    
    span {
      display: inline;
    }
  }
`;

export const DraftButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: white;
  color: #333333;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  font-weight: 500;
  font-size: 15px;
  font-family: 'Noto Sans KR', sans-serif;
  line-height: 18px;
  cursor: pointer;
  transition: all var(--transition-base);
  min-height: 36px;
  width: 122px;

  &:hover:not(:disabled) {
    background-color: #f8f9fa;
    border-color: #d0d0d0;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 8px 16px;
    width: auto;
  }

  @media (max-width: 480px) {
    flex: 1;
    padding: var(--spacing-md);
    font-size: var(--font-size-sm);
    
    span {
      display: inline;
    }
  }
`;

export const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #489bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  font-size: 15px;
  font-family: 'Noto Sans KR', sans-serif;
  line-height: 18px;
  cursor: pointer;
  transition: all var(--transition-base);
  min-height: 36px;
  width: 122px;

  &:hover:not(:disabled) {
    background-color: #3a8ae6;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(72, 155, 255, 0.2);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    padding: 8px 16px;
    width: auto;
  }

  @media (max-width: 480px) {
    flex: 2;
    padding: var(--spacing-md);
    font-size: var(--font-size-sm);
    
    span {
      font-size: var(--font-size-sm);
    }
  }
`;

export const ListButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 24px;
  padding-bottom: 32px;

  @media (max-width: 480px) {
    margin-top: 16px;
    padding-bottom: 16px;
  }
`;

export const ListButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #333333;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  font-size: 15px;
  font-family: 'Noto Sans KR', sans-serif;
  line-height: 22.5px;
  cursor: pointer;
  transition: all var(--transition-base);
  width: 90px;
  height: 40px;

  &:hover:not(:disabled) {
    background-color: #222222;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 480px) {
    width: 90px;
    height: 40px;
  }
`;

export const InfoMessage = styled.div`
  padding: 15px 20px;
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 4px;
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

export const UploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background-color: var(--primary-hover);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
    padding: 14px 16px;
  }
`;

export const ReceiptList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
`;

export const ReceiptItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #f8f9fa;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary-color);
    box-shadow: 0 2px 4px rgba(0, 123, 255, 0.1);
  }

  @media (max-width: 480px) {
    padding: 12px;
  }
`;

export const ReceiptInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const SelectApproverButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: white;
  color: #333333;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  font-size: 15px;
  font-family: 'Noto Sans KR', sans-serif;
  line-height: 18px;
  cursor: pointer;
  transition: all 0.2s;
  height: 36px;

  &:hover {
    background-color: #f8f9fa;
  }

  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 15px;
  }

  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
    padding: 12px;
  }
`;

export const SelectedApproversDisplay = styled.div`
  margin-top: 20px;
  padding: 0;
  background-color: transparent;
  border-radius: 0;
  border: none;
`;

export const SelectedApproversTitle = styled.div`
  font-weight: 500;
  font-size: 16px;
  color: #333333;
  margin-bottom: 12px;
  font-family: 'Noto Sans KR', sans-serif;
`;

export const SelectedApproversList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const SelectedApproverItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0;
  background-color: transparent;
  border-radius: 0;
  border: none;
  transition: all 0.2s;
  margin-bottom: 8px;

  &:hover {
    border: none;
    box-shadow: none;
  }
`;

export const ApproverOrderBadge = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 46px;
  height: 22px;
  background-color: #ebf4ff;
  color: #489bff;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 400;
  font-family: 'Noto Sans KR', sans-serif;
  padding: 0 8px;
`;

export const SelectedApproverInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const SelectedApproverName = styled.span`
  font-weight: 700;
  font-size: 18px;
  color: #333333;
  font-family: 'Noto Sans KR', sans-serif;
  line-height: 21.6px;
`;

export const SelectedApproverPosition = styled.span`
  font-size: 14px;
  color: var(--secondary-color);
`;

export const RewriteIcon = styled.img`
  width: 20px;
  height: 20px;
  object-fit: contain;
  flex-shrink: 0;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }
`;

export const RemoveApproverButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  line-height: 1;

  &:hover {
    background-color: #c82333;
    transform: scale(1.1);
  }
`;

export const EmptyApproversMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: #666666;
  font-size: 15px;
  font-weight: 350;
  font-family: 'Noto Sans KR', sans-serif;
  line-height: 18px;
  background-color: transparent;
  border: none;
  margin-top: 0;
`;

/* 모바일 카드 뷰 스타일 */
export const MobileCardContainer = styled.div`
  display: none;

  @media (max-width: 480px) {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
`;

export const DetailCard = styled.div`
  background-color: white;
  border-radius: 4px;
  border: none;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 480px) {
    display: block;
  }
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
`;

export const CardRowNumber = styled.span`
  font-weight: 600;
  font-size: 14px;
  color: var(--primary-color);
`;

export const CardBody = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const MobileInputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const MobileLabel = styled.label`
  font-weight: 600;
  font-size: 14px;
  color: var(--dark-color);
`;

export const MobileInput = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  font-size: 16px;
  transition: all 0.2s;
  -webkit-appearance: none;
  appearance: none;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

export const MobileSelect = styled.select`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  font-size: 16px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
  -webkit-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 40px;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

export const EmptyDetailMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: #666666;
  font-size: 15px;
  font-weight: 350;
  font-family: 'Noto Sans KR', sans-serif;
  line-height: 18px;
  background-color: transparent;
  border-radius: 4px;

  @media (max-width: 480px) {
    border-radius: 4px;
  }
`;

export const MobileSummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;

export const MobileValue = styled.span`
  font-size: 14px;
  color: #333;
  text-align: right;
  word-break: break-word;
`;

export const EmptyMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
`;

// 토스트 메시지 스타일
export const ToastMessage = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #dc3545;
  color: white;
  padding: 16px 24px;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 90%;
  animation: slideDown 0.3s ease-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  @media (max-width: 480px) {
    top: 10px;
    left: 10px;
    right: 10px;
    transform: none;
    max-width: none;
    padding: 14px 20px;
    font-size: 14px;

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }
`;

export const ToastIcon = styled.span`
  font-size: 20px;
  flex-shrink: 0;
`;

export const ToastContent = styled.div`
  flex: 1;
  line-height: 1.5;
`;

export const ToastTitle = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 15px;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

export const ToastList = styled.ul`
  margin: 8px 0 0 0;
  padding-left: 20px;
  list-style-type: disc;
  font-size: 14px;
  line-height: 1.6;

  @media (max-width: 480px) {
    font-size: 13px;
    padding-left: 18px;
  }
`;

export const ToastListItem = styled.li`
  margin-bottom: 4px;
`;

// 영수증 첨부할 항목 선택 모달 스타일
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

export const ModalContent = styled.div`
  background: white;
  border-radius: 4px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
`;

export const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

export const ModalCloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f0f0f0;
    color: #333;
  }
`;

export const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
`;

export const DetailSelectList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const DetailSelectItem = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;

  &:hover:not(:disabled) {
    background: #e9ecef;
    border-color: var(--primary-color, #007bff);
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const DetailSelectItemInfo = styled.div`
  flex: 1;
`;

export const DetailSelectItemTitle = styled.div`
  font-weight: 600;
  font-size: 15px;
  color: #333;
  margin-bottom: 4px;
`;

export const DetailSelectItemDesc = styled.div`
  font-size: 13px;
  color: #666;
  line-height: 1.4;
`;