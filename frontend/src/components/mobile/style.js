import styled from '@emotion/styled';

export const MobileContainer = styled.div`
  padding-top: 56px; /* 상단 앱바 공간 */
  padding-bottom: 80px; /* 하단 네비게이션 공간 확보 */
  background-color: #f5f5f5;
  min-height: calc(100vh - 136px); /* 전체 높이에서 헤더+푸터 제외 */
`;

export const AlertBanner = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px;
  margin: 12px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  cursor: pointer;
  transition: transform 0.2s;
  
  &:active {
    transform: scale(0.98);
  }
`;

export const AlertIcon = styled.div`
  font-size: 32px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
`;

export const AlertContent = styled.div`
  flex: 1;
  color: white;
`;

export const AlertTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  opacity: 0.9;
  margin-bottom: 4px;
`;

export const AlertCount = styled.div`
  font-size: 20px;
  font-weight: 700;
`;

export const AlertArrow = styled.div`
  font-size: 24px;
  color: white;
`;

export const Section = styled.div`
  margin-bottom: 20px;
`;

export const SectionHeader = styled.div`
  padding: 16px 16px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
`;

export const StatCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 20px 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border-left: 4px solid ${props => props.color || 'var(--primary-color)'};
  min-height: 140px;
  justify-content: center;
`;

export const StatIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
`;

export const StatLabel = styled.div`
  font-size: 12px;
  color: #666;
  font-weight: 500;
  text-align: center;
`;

export const StatValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  text-align: center;
  word-break: break-all;
`;

export const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  padding: 0 16px;
  margin-bottom: 16px;
`;

export const Tab = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.active ? 'var(--primary-color)' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  box-shadow: ${props => props.active ? '0 2px 8px rgba(0, 123, 255, 0.3)' : '0 1px 4px rgba(0, 0, 0, 0.1)'};
  
  &:active {
    transform: scale(0.98);
  }
`;

export const ChartSection = styled.div`
  background: white;
  border-radius: 20px;
  padding: 20px 16px;
  margin: 0 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
`;

export const StatusItem = styled.div`
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const StatusInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

export const StatusName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
`;

export const StatusCount = styled.div`
  font-size: 14px;
  color: #666;
`;

export const StatusBar = styled.div`
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
`;

export const StatusBarFill = styled.div`
  width: ${props => props.width}%;
  height: 100%;
  background: ${props => props.color};
  border-radius: 4px;
  transition: width 0.3s ease;
`;

export const StatusAmount = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: var(--primary-color);
  text-align: right;
`;

export const CategoryItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

export const CategoryIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.color}15;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;

export const CategoryInfo = styled.div`
  flex: 1;
`;

export const CategoryName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
`;

export const CategoryAmount = styled.div`
  font-size: 13px;
  color: #666;
`;

export const CategoryRatio = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: var(--primary-color);
`;

export const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 0 16px;
`;

export const ActionCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:active {
    transform: scale(0.95);
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.12);
  }
`;

export const ActionIcon = styled.div`
  font-size: 40px;
`;

export const ActionLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  text-align: center;
`;

// Swiper 커스텀 스타일
export const SwiperWrapper = styled.div`
  padding: 0 16px 24px;
  
  .swiper {
    padding-bottom: 32px;
  }
  
  .swiper-pagination {
    bottom: 0;
  }
  
  .swiper-pagination-bullet {
    background: var(--primary-color);
    opacity: 0.3;
  }
  
  .swiper-pagination-bullet-active {
    opacity: 1;
  }
`;

// 회계사 대시보드 전용 스타일
export const PendingSection = styled.div`
  background: white;
  border-radius: 20px;
  padding: 16px;
  margin: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
`;

export const PendingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

export const PendingTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const PendingBadge = styled.span`
  background: var(--primary-color);
  color: white;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 12px;
`;

export const PendingItem = styled.div`
  padding: 12px;
  background: #f9f9f9;
  border-radius: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &:active {
    transform: scale(0.98);
    background: #f0f0f0;
  }
`;

export const PendingItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

export const PendingItemName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
`;

export const PendingItemAmount = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: var(--primary-color);
`;

export const PendingItemInfo = styled.div`
  font-size: 12px;
  color: #666;
  line-height: 1.4;
`;

export const ViewAllButton = styled.button`
  width: 100%;
  padding: 12px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 12px;
  transition: all 0.2s;
  
  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #999;
`;

export const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

export const EmptyText = styled.div`
  font-size: 14px;
  color: #666;
`;

