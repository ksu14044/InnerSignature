import styled from '@emotion/styled';

export const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;

  @media (max-width: 480px) {
    padding: 0;
    width: 100%;
    max-width: 100%;
    min-height: auto; /* 모바일에서는 컨텐츠 높이에 따라 조정 */
    background: #f5f5f5;
    padding-top: 56px;
    padding-bottom: 80px; /* 하단 네비게이션 + 여유 공간 */
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

export const HeaderLeft = styled.div`
  flex: 1;
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  margin: 0;
`;

export const ProfileButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: #0056b3;
  }
`;

export const TotalCreditCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

export const TotalCreditLabel = styled.div`
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 10px;
`;

export const TotalCreditAmount = styled.div`
  font-size: 36px;
  font-weight: bold;
`;

export const CreditsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const TableHeader = styled.thead`
  background-color: #f8f9fa;
`;

export const TableRow = styled.tr`
  &:nth-of-type(even) {
    background-color: #f8f9fa;
  }
`;

export const TableHeaderCell = styled.th`
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #dee2e6;
`;

export const TableBody = styled.tbody``;

export const TableCell = styled.td`
  padding: 16px;
  border-bottom: 1px solid #dee2e6;
  color: #555;
`;

export const AvailableAmount = styled.span`
  font-weight: ${props => props.available ? 'bold' : 'normal'};
  color: ${props => props.available ? '#28a745' : '#6c757d'};
`;

export const ExpiryDate = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => {
    if (props.expired) return '#dc3545';
    if (props.expiringSoon) return '#ffc107';
    return '#555';
  }};
`;

export const ExpiryWarning = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #ffc107;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const EmptyText = styled.p`
  font-size: 16px;
  color: #6c757d;
  margin: 0;
`;

