import styled from '@emotion/styled';

export const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: var(--dark-color);
  margin-bottom: 16px;
  margin-top: 24px;
  
  @media (max-width: 480px) {
    font-size: 18px;
    margin-bottom: 12px;
    margin-top: 16px;
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
  border-left: 4px solid ${props => {
    switch(props.status) {
      case 'wait': return 'var(--warning-color)';
      case 'rejected': return 'var(--danger-color)';
      case 'approved': return '#17a2b8';
      case 'paid': return 'var(--success-color)';
      default: return 'var(--primary-color)';
    }
  }};

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
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 480px) {
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    gap: 16px;
    margin-bottom: 8px;
    padding: 0 16px;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
    
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

export const ChartCard = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);

  @media (max-width: 480px) {
    flex: 0 0 calc(100vw - 32px);
    min-width: calc(100vw - 32px);
    max-width: calc(100vw - 32px);
    padding: 20px;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: none;
    margin-bottom: 8px;
    scroll-snap-align: center;
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

export const AlertSection = styled.div`
  background: #fff3cd;
  border: 2px solid #ffc107;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
    margin: 8px;
    margin-bottom: 16px;
  }
`;

export const AlertTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #856404;
`;

export const AlertButton = styled.button`
  padding: 8px 16px;
  background: #ffc107;
  color: #856404;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #ffb300;
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

export const ManagementSection = styled.div`
  margin-bottom: 32px;
  
  @media (max-width: 480px) {
    margin-bottom: 24px;
  }
`;

export const ManagementGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    padding: 0 8px;
  }
`;

export const ManagementCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-color: var(--primary-color);
  }
  
  @media (max-width: 480px) {
    padding: 16px 12px;
  }
`;

export const ManagementIcon = styled.div`
  font-size: 32px;
  margin-bottom: 12px;
  text-align: center;
  
  @media (max-width: 480px) {
    font-size: 24px;
    margin-bottom: 8px;
  }
`;

export const ManagementTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--dark-color);
  margin-bottom: 8px;
  text-align: center;
  
  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 4px;
  }
`;

export const ManagementDesc = styled.p`
  font-size: 12px;
  color: var(--secondary-color);
  text-align: center;
  line-height: 1.4;
  margin: 0;
  
  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

export const RecentSection = styled.div`
  margin-bottom: 24px;
`;

export const ExpenseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

export const ExpenseItem = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary-color);
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

export const ExpenseItemDate = styled.div`
  min-width: 100px;
  font-weight: 600;
  color: var(--dark-color);
  font-size: 14px;

  @media (max-width: 768px) {
    min-width: auto;
  }
`;

export const ExpenseItemContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

export const ExpenseItemTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--dark-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ExpenseItemMeta = styled.div`
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: var(--secondary-color);

  span:first-child {
    font-weight: 600;
    color: var(--primary-color);
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 4px;
  }
`;

export const ExpenseItemAction = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: var(--primary-color);
  font-size: 18px;
  flex-shrink: 0;
`;

export const ActionSection = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 32px;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 12px;
    margin: 8px;
    margin-top: 24px;
  }
`;

export const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  background: ${props => props.variant === 'secondary' ? 'var(--secondary-color)' : 'var(--primary-color)'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 48px;
  
  svg {
    font-size: 16px;
  }
  
  &:hover {
    background: ${props => props.variant === 'secondary' ? '#5a6268' : 'var(--primary-hover)'};
    transform: translateY(-1px);
    box-shadow: var(--shadow);
  }

  @media (max-width: 480px) {
    width: 100%;
    padding: 14px 20px;
    font-size: 14px;
    
    svg {
      font-size: 14px;
    }
  }
`;

export const LoadingMessage = styled.div`
  padding: 40px;
  text-align: center;
  color: var(--secondary-color);
  font-size: 16px;
`;

export const SummarySection = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);

  @media (max-width: 480px) {
    margin: 8px;
    padding: 16px;
  }
`;

export const SummaryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;

  thead {
    background: #f5f5f5;
  }

  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
  }

  th {
    font-weight: 600;
    color: var(--dark-color);
  }

  tbody tr:hover {
    background: #f9f9f9;
  }

  @media (max-width: 480px) {
    font-size: 14px;
    
    th, td {
      padding: 10px 8px;
    }
    
    th {
      font-size: 13px;
    }
  }
`;

export const ViewMoreButton = styled.button`
  width: 100%;
  padding: 12px;
  margin-top: 12px;
  background-color: var(--light-color);
  color: var(--dark-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #e5e7eb;
    border-color: var(--primary-color);
  }
`;

export const RecentActivitySection = styled.div`
  margin-bottom: 24px;

  @media (max-width: 480px) {
    margin-bottom: 16px;
    padding: 0 8px;
  }
`;

export const RecentActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: 480px) {
    gap: 8px;
  }
`;

export const RecentActivityItem = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary-color);
    box-shadow: 0 2px 8px rgba(0,123,255,0.1);
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    border-radius: 12px;
  }
`;

export const ActivityInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

export const ActivityTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--dark-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

export const ActivityMeta = styled.div`
  font-size: 14px;
  color: var(--secondary-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

export const ActivityDate = styled.div`
  font-size: 14px;
  color: var(--secondary-color);
  font-weight: 500;
  white-space: nowrap;

  @media (max-width: 480px) {
    font-size: 12px;
    align-self: flex-end;
  }
`;

// 모바일 차트용 스타일 컴포넌트
export const Section = styled.div`
  margin-bottom: 24px;

  @media (max-width: 480px) {
    margin-bottom: 16px;
    padding: 0 8px;
  }
`;

export const ChartSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;

  @media (max-width: 480px) {
    gap: 8px;
    margin-top: 12px;
  }
`;

export const StatusItem = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);

  @media (max-width: 480px) {
    padding: 12px;
    border-radius: 16px;
  }
`;

export const StatusInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

export const StatusName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--dark-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

export const StatusCount = styled.div`
  font-size: 14px;
  color: var(--secondary-color);
`;

export const StatusBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin: 8px 0;
`;

export const StatusBarFill = styled.div`
  height: 100%;
  width: ${props => props.width || 0}%;
  background-color: ${props => props.color || '#8884d8'};
  border-radius: 4px;
  transition: width 0.3s ease;
`;

export const StatusAmount = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: var(--dark-color);
  text-align: right;
  margin-top: 4px;

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

export const PaginationDots = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  margin-bottom: 12px;
  padding: 0 8px;

  @media (min-width: 481px) {
    display: none;
  }
`;

export const PaginationDot = styled.button`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  border: none;
  background-color: ${props => props.active ? 'var(--primary-color)' : '#d0d0d0'};
  cursor: pointer;
  padding: 0;
  transition: all 0.3s ease;
  min-width: 4px;
  min-height: 4px;
  
  &:hover {
    background-color: ${props => props.active ? 'var(--primary-hover)' : '#a0a0a0'};
  }
  
  @media (min-width: 481px) {
    display: none;
  }
`;

export const ScrollSpacer = styled.div`
  flex: 0 0 16px;
  min-width: 16px;
  scroll-snap-align: start;
  
  @media (min-width: 481px) {
    display: none;
  }
`;

