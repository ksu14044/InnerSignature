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

export const PlanCard = styled.div`
  border: 2px solid ${props => props.selected ? '#007bff' : '#ddd'};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: ${props => props.selected ? 'default' : 'pointer'};
  background-color: ${props => props.selected ? '#f0f8ff' : 'white'};
  transition: all 0.2s;
  
  &:hover {
    border-color: ${props => props.selected ? '#007bff' : '#007bff'};
    background-color: ${props => props.selected ? '#f0f8ff' : '#f8f9fa'};
  }
`;

export const PlanName = styled.div`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
`;

export const PlanPrice = styled.div`
  font-size: 16px;
  color: #007bff;
  font-weight: 600;
  margin-bottom: 4px;
`;

export const PlanUsers = styled.div`
  font-size: 14px;
  color: #666;
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

