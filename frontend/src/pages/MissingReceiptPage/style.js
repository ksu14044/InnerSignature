import styled from '@emotion/styled';

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  
  @media (max-width: 480px) {
    padding: 16px;
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

export const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: var(--dark-color);
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  
  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

export const Button = styled.button`
  padding: 10px 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: var(--primary-hover);
  }
  
  @media (max-width: 480px) {
    width: 100%;
  }
`;

export const FilterCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: var(--shadow);
`;

export const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: var(--dark-color);
`;

export const Select = styled.select`
  padding: 10px 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

export const ReceiptList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const ReceiptCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow);
  border-left: 4px solid #ffc107;
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

export const ReceiptHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

export const ReceiptTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--dark-color);
  margin: 0;
`;

export const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background-color: #fff3cd;
  color: #856404;
`;

export const ReceiptInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
`;

export const InfoRow = styled.div`
  display: flex;
  gap: 8px;
  font-size: 14px;
`;

export const InfoLabel = styled.span`
  font-weight: 600;
  color: var(--secondary-color);
`;

export const InfoValue = styled.span`
  color: var(--dark-color);
`;

export const ViewButton = styled.button`
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: var(--primary-hover);
  }
`;

export const UserGroupList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const UserGroup = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow);
`;

export const UserHeader = styled.div`
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--border-color);
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const UserName = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: var(--dark-color);
`;

export const CountBadge = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background-color: #dc3545;
  color: white;
`;

export const ReceiptItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: var(--light-color);
  border-radius: 8px;
  margin-bottom: 8px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

export const ReceiptDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
`;

export const DetailItem = styled.div`
  display: flex;
  gap: 8px;
  font-size: 13px;
`;

export const DetailLabel = styled.span`
  font-weight: 500;
  color: var(--secondary-color);
`;

export const DetailValue = styled.span`
  color: var(--dark-color);
`;

export const EmptyMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: var(--secondary-color);
  font-size: 16px;
`;

export const Alert = styled.div`
  padding: 16px;
  background-color: #f8d7da;
  color: #721c24;
  border-radius: 8px;
  margin-bottom: 16px;
  text-align: center;
`;

