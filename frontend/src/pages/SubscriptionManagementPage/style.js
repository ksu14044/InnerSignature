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
    min-height: auto;
    background: #f5f5f5;
    padding-top: 56px;
    padding-bottom: 64px;
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
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #0056b3;
  }
`;

export const ErrorMessage = styled.div`
  background-color: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
`;

export const SubscriptionInfo = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const InfoSection = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

export const InfoLabel = styled.div`
  font-weight: 600;
  color: #666;
`;

export const InfoValue = styled.div`
  color: #333;
`;

export const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => 
    props.status === 'ACTIVE' ? '#d4edda' :
    props.status === 'EXPIRED' ? '#f8d7da' :
    props.status === 'CANCELLED' ? '#fff3cd' : '#e2e3e5'};
  color: ${props => 
    props.status === 'ACTIVE' ? '#155724' :
    props.status === 'EXPIRED' ? '#721c24' :
    props.status === 'CANCELLED' ? '#856404' : '#383d41'};
`;

export const Actions = styled.div`
  margin-top: 30px;
  padding-top: 30px;
  border-top: 2px solid #eee;
`;

export const PlanChangeSection = styled.div`
  margin-bottom: 30px;
`;

export const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
`;


export const CancelButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #c82333;
  }
`;

export const NoSubscription = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const NoSubscriptionText = styled.div`
  font-size: 18px;
  color: #666;
  margin-bottom: 24px;
`;

export const CreateButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #0056b3;
  }
`;

export const ExpiryContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

export const WarningBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background-color: #fff3cd;
  color: #856404;
`;

export const DangerBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background-color: #f8d7da;
  color: #721c24;
`;

export const InfoBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background-color: #d1ecf1;
  color: #0c5460;
`;

export const PendingPlanNotice = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 20px;
  padding: 16px;
  background-color: #e7f3ff;
  border-left: 4px solid #007bff;
  border-radius: 4px;
`;

export const NoticeIcon = styled.div`
  font-size: 20px;
  flex-shrink: 0;
`;

export const NoticeContent = styled.div`
  flex: 1;
`;

export const NoticeTitle = styled.div`
  font-weight: 600;
  color: #0056b3;
  margin-bottom: 4px;
  font-size: 14px;
`;

export const NoticeText = styled.div`
  font-size: 13px;
  color: #004085;
  line-height: 1.5;
  
  strong {
    font-weight: 600;
    color: #003d7a;
  }
`;

export const CreditAmount = styled.span`
  font-size: 20px;
  font-weight: bold;
  color: #28a745;
  margin-right: 12px;
`;

export const CreditLink = styled.button`
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 14px;
  text-decoration: underline;
  padding: 0;

  &:hover {
    color: #0056b3;
  }
`;

export const TabSection = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid #e5e7eb;
  padding: 0;

  @media (max-width: 480px) {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    margin: 8px;
    padding: 0;
  }
`;

export const TabButton = styled.button`
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 3px solid ${props => props.active ? '#007bff' : 'transparent'};
  color: ${props => props.active ? '#007bff' : '#6b7280'};
  font-weight: ${props => props.active ? '600' : '500'};
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    color: #007bff;
  }

  @media (max-width: 480px) {
    padding: 10px 16px;
    font-size: 14px;
  }
`;

export const PlansTabContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 480px) {
    margin: 8px;
    padding: 16px;
  }
`;

export const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const PlanCard = styled.div`
  position: relative;
  padding: 24px;
  border: 2px solid ${props => props.selected ? '#007bff' : props.featured ? '#28a745' : '#e5e7eb'};
  border-radius: 12px;
  background: white;
  transition: all 0.2s;
  cursor: ${props => props.selected ? 'default' : 'pointer'};

  &:hover {
    border-color: ${props => props.selected ? '#007bff' : '#007bff'};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  ${props => props.featured && `
    border-color: #28a745;
    background: linear-gradient(135deg, #f8fff9 0%, #ffffff 100%);
  `}
`;

export const FeaturedBadge = styled.div`
  position: absolute;
  top: -10px;
  right: 20px;
  background: #28a745;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

export const PlanHeader = styled.div`
  margin-bottom: 16px;
`;

export const PlanName = styled.h3`
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #1f2937;
`;

export const PlanPrice = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 8px;
  font-size: 16px;
  color: #007bff;
  font-weight: 600;
`;

export const PlanUsers = styled.div`
  font-size: 14px;
  color: #666;
`;

export const PriceAmount = styled.span`
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
`;

export const PriceUnit = styled.span`
  font-size: 16px;
  color: #6b7280;
`;

export const FreePrice = styled.span`
  font-size: 32px;
  font-weight: 700;
  color: #28a745;
`;

export const PlanFeatures = styled.div`
  margin-bottom: 20px;
`;

export const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #374151;
`;

export const FeatureIcon = styled.span`
  color: #28a745;
  font-weight: 700;
`;

export const FeatureText = styled.span`
  flex: 1;
`;

export const PlanAction = styled.div`
  margin-top: 20px;
`;

export const SelectButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #0056b3;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const CurrentButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #e5e7eb;
  color: #6b7280;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: default;
`;

export const PaymentsTabContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 480px) {
    margin: 8px;
    padding: 16px;
  }
`;

export const PaymentsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;

export const TableHeader = styled.thead`
  background: #f9fafb;
`;

export const TableRow = styled.tr`
  border-bottom: 1px solid #e5e7eb;
`;

export const TableHeaderCell = styled.th`
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
`;

export const TableBody = styled.tbody``;

export const TableCell = styled.td`
  padding: 12px;
  color: #1f2937;
  font-size: 14px;
`;

export const PaymentMethod = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.color || '#e5e7eb'};
  color: white;
`;

export const CreditsTabContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 480px) {
    margin: 8px;
    padding: 16px;
  }
`;

export const TotalCreditCard = styled.div`
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  margin-bottom: 24px;
  color: white;
`;

export const TotalCreditLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
`;

export const TotalCreditAmount = styled.div`
  font-size: 36px;
  font-weight: 700;
  color: white;
`;

export const CreditsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;

export const AvailableAmount = styled.span`
  font-weight: 600;
  color: ${props => props.available ? '#28a745' : '#6b7280'};
`;

export const ExpiryDate = styled.span`
  color: ${props => props.expired ? '#dc3545' : props.expiringSoon ? '#ffc107' : '#1f2937'};
  font-weight: ${props => (props.expired || props.expiringSoon) ? '600' : 'normal'};
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const ExpiryWarning = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #ffc107;
  margin-left: 4px;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const EmptyText = styled.div`
  font-size: 18px;
  color: #666;
`;

