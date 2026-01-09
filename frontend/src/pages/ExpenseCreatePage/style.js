import styled from '@emotion/styled';

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
  min-height: 100vh;
  padding-bottom: 120px; /* 하단 고정 버튼 공간 확보 */

  @media (max-width: 768px) {
    padding: var(--spacing-md);
    padding-bottom: 100px;
  }

  @media (max-width: 480px) {
    padding: 0;
    width: 100%;
    max-width: 100%;
    min-height: auto;
    background: var(--bg-light);
    padding-top: 56px;
    padding-bottom: 80px; /* 하단 네비게이션 + FAB 공간 */
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
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  position: relative;
  transition: all var(--transition-base);

  &:hover {
    box-shadow: var(--shadow);
  }

  @media (max-width: 768px) {
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-md);
  }

  @media (max-width: 480px) {
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-sm);
    border-radius: 0;
    box-shadow: none;
    border: none;
    border-bottom: 1px solid var(--border-light);
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
    display: none;
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: white;

  @media (max-width: 768px) {
    font-size: 14px;
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
`;

export const TableRow = styled.tr`
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f8f9fa;
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
  padding: 8px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  min-width: 40px;
  min-height: 40px;

  &:hover {
    background-color: var(--primary-hover);
    transform: scale(1.05);
  }

  @media (max-width: 480px) {
    min-width: 40px;
    min-height: 40px;
    padding: 8px;
    font-size: 14px;
    border-radius: 8px;
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
    min-width: 40px;
    min-height: 40px;
    padding: 8px;
    font-size: 14px;
    border-radius: 8px;
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
  gap: var(--spacing-md);
  justify-content: flex-end;
  margin-top: var(--spacing-xl);
  padding-bottom: var(--spacing-2xl);

  @media (max-width: 768px) {
    flex-direction: row;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-lg);
    padding-bottom: var(--spacing-xl);
  }

  @media (max-width: 480px) {
    position: relative;
    background: white;
    padding: var(--spacing-md);
    margin: var(--spacing-md);
    margin-bottom: calc(var(--spacing-md) + 80px); /* FAB 공간 확보 */
    box-shadow: var(--shadow-sm);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-light);
    flex-direction: row;
    gap: var(--spacing-sm);
  }
`;

export const CancelButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: white;
  color: var(--text-primary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all var(--transition-base);
  min-height: 48px;
  flex: 1;
  max-width: 200px;

  &:hover:not(:disabled) {
    background-color: var(--bg-hover);
    border-color: var(--secondary-color);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: var(--spacing-md) var(--spacing-lg);
    max-width: none;
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
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all var(--transition-base);
  min-height: 48px;
  flex: 2;
  max-width: 300px;

  &:hover:not(:disabled) {
    background-color: var(--primary-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
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
    padding: var(--spacing-md) var(--spacing-lg);
    max-width: none;
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

export const UploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
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
  border-radius: 8px;
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
  padding: 10px 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: var(--primary-hover);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);
  }

  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
    padding: 12px;
  }
`;

export const SelectedApproversDisplay = styled.div`
  margin-top: 20px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid var(--border-color);
`;

export const SelectedApproversTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: var(--dark-color);
  margin-bottom: 12px;
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
  padding: 12px;
  background-color: white;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary-color);
    box-shadow: 0 2px 4px rgba(0, 123, 255, 0.1);
  }
`;

export const ApproverOrderBadge = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 600;
`;

export const SelectedApproverInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const SelectedApproverName = styled.span`
  font-weight: 600;
  font-size: 16px;
  color: var(--dark-color);
`;

export const SelectedApproverPosition = styled.span`
  font-size: 14px;
  color: var(--secondary-color);
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
  color: var(--secondary-color);
  font-size: 14px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed var(--border-color);
  margin-top: 20px;
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
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

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
  border-bottom: 1px solid var(--border-color);
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
  border-radius: 8px;
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
  border-radius: 8px;
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
  color: #999;
  font-size: 14px;
  background-color: #f8f9fa;
  border-radius: 8px;
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
  border-radius: 8px;
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