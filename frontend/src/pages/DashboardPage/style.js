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
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--primary-color);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  @media (max-width: 480px) {
    display: none;
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

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  color: #fff;
  background: ${({ variant }) => {
    if (variant === 'secondary') return '#6c757d';
    if (variant === 'danger') return '#dc3545';
    return 'var(--primary-color)';
  }};
  transition: transform 0.15s ease, opacity 0.2s;
  min-height: 48px;

  &:hover {
    transform: translateY(-1px);
    opacity: 0.95;
  }

  @media (max-width: 480px) {
    width: 100%;
    padding: 12px 16px;
    font-size: 12px;
    justify-content: center;
  }
`;

export const FilterCard = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);

  @media (max-width: 480px) {
    padding: 12px 16px;
    margin-bottom: 8px;
    border-radius: 0;
    border: none;
    border-bottom: 1px solid #f0f0f0;
    box-shadow: none;
  }
`;

export const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

export const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: var(--secondary-color);
  margin-bottom: 6px;
  display: block;
`;

export const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
  min-height: 48px;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  @media (max-width: 480px) {
    padding: 12px;
    font-size: 14px;
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-bottom: 16px;
    padding: 0 8px;
  }
`;

export const StatCard = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }

  @media (max-width: 480px) {
    padding: 16px 12px;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: none;
  }
`;

export const StatLabel = styled.div`
  font-size: 13px;
  color: var(--secondary-color);
  font-weight: 600;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 480px) {
    font-size: 11px;
    margin-bottom: 6px;
  }
`;

export const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: var(--dark-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

export const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 480px) {
    gap: 8px;
    margin-bottom: 16px;
    padding: 0 8px;
  }
`;

export const ChartCard = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);

  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: none;
    margin-bottom: 8px;
  }
`;

export const ChartTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--dark-color);
  margin: 0 0 16px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;

  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 12px;
  }
`;

export const ChartContainer = styled.div`
  width: 100%;
  height: 300px;

  @media (max-width: 480px) {
    height: 280px;
    min-height: 280px;
  }
`;

export const Alert = styled.div`
  padding: 16px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  color: #856404;
  margin-bottom: 20px;
  text-align: center;
`;

export const Loading = styled.div`
  text-align: center;
  padding: 40px;
  color: var(--secondary-color);
`;

export const Empty = styled.div`
  text-align: center;
  padding: 40px;
  color: var(--secondary-color);
`;

export const CompanyRegisterButton = styled.button`
  margin-left: 16px;
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  
  &:hover {
    background-color: #218838;
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    margin-left: 0;
    margin-top: 12px;
  }
`;

export const SubscriptionCard = styled.div`
  background: ${props => 
    props.danger ? '#fff5f5' :
    props.warning ? '#fffbf0' : 
    '#f0f8ff'};
  border: 2px solid ${props => 
    props.danger ? '#f8d7da' :
    props.warning ? '#fff3cd' : 
    '#d1ecf1'};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    border-color: ${props => 
      props.danger ? '#f5c6cb' :
      props.warning ? '#ffeaa7' : 
      '#bee5eb'};
  }

  @media (max-width: 480px) {
    padding: 16px;
    margin-bottom: 16px;
    border-radius: 16px;
  }
`;

export const SubscriptionCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

export const SubscriptionCardTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: var(--dark-color);
  margin: 0;
`;

export const SubscriptionStatusBadge = styled.span`
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

export const SubscriptionPlanName = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: #007bff;
  margin-bottom: 12px;
`;

export const SubscriptionExpiry = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
`;

export const SubscriptionExpiryLabel = styled.span`
  font-size: 14px;
  color: #666;
  font-weight: 500;
`;

export const SubscriptionExpiryDate = styled.span`
  font-size: 14px;
  color: #333;
  font-weight: 600;
`;

export const SubscriptionExpiryWarning = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => props.danger ? '#f8d7da' : '#fff3cd'};
  color: ${props => props.danger ? '#721c24' : '#856404'};
`;

export const SubscriptionExpiryInfo = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background-color: #d1ecf1;
  color: #0c5460;
`;

export const SubscriptionCardFooter = styled.div`
  font-size: 12px;
  color: #007bff;
  font-weight: 500;
  margin-top: 8px;
  text-align: right;
`;

export const CreditCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 480px) {
    margin: 0 8px 16px 8px;
    padding: 16px;
    border-radius: 16px;
  }
`;

export const CreditCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

export const CreditCardTitle = styled.div`
  font-size: 16px;
  opacity: 0.9;
  font-weight: 600;
`;

export const CreditAmount = styled.div`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 10px;

  @media (max-width: 480px) {
    font-size: 28px;
  }
`;

export const CreditCardFooter = styled.div`
  font-size: 14px;
  opacity: 0.8;
  text-align: right;
`;

