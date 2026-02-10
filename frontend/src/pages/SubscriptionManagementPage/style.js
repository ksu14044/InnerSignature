import styled from '@emotion/styled';

// 지출결의서 목록 페이지와 동일한 전체 레이아웃 컨테이너
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

// PageHeader는 별도 컴포넌트 사용

export const ErrorMessage = styled.div`
  background-color: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
`;

// 현재 구독 정보 카드 (피그마 디자인)
export const SubscriptionInfo = styled.div`
  background: white;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  padding: 0;
  margin-bottom: 24px;
`;

export const SubscriptionCardHeader = styled.div`
  background: #f8f9fa;
  padding: 20px 24px;
  border-bottom: 1px solid #e4e4e4;
`;

export const SubscriptionCardTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #333333;
  margin: 0;
  line-height: 21.6px;
`;

export const SubscriptionCardContent = styled.div`
  padding: 24px;
`;

export const InfoSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e4e4e4;
  
  &:last-child {
    border-bottom: none;
  }
`;

export const InfoLabel = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #333333;
  line-height: 19.2px;
`;

export const InfoValue = styled.div`
  font-size: 16px;
  font-weight: 400;
  color: #666666;
  text-align: right;
  line-height: 19.2px;
`;

// 구독 상태 배지 (피그마 디자인: 활성 상태는 #f8ebff 배경, #a133e0 텍스트)
export const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 400;
  line-height: 14px;
  background-color: ${props => 
    props.status === 'ACTIVE' ? '#f8ebff' :
    props.status === 'EXPIRED' ? '#ffefef' :
    props.status === 'CANCELLED' ? '#fff3cd' : '#e2e3e5'};
  color: ${props => 
    props.status === 'ACTIVE' ? '#a133e0' :
    props.status === 'EXPIRED' ? '#d72d30' :
    props.status === 'CANCELLED' ? '#856404' : '#383d41'};
`;

// 플랜 변경 섹션 (피그마 디자인)
export const PlanChangeSection = styled.div`
  background: white;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  padding: 0;
  margin-bottom: 24px;
`;

export const PlanChangeHeader = styled.div`
  background: #f8f9fa;
  padding: 20px 24px;
  border-bottom: 1px solid #e4e4e4;
`;

export const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #333333;
  margin: 0;
  line-height: 21.6px;
`;

export const PlanChangeContent = styled.div`
  padding: 24px;
`;

// 구독 취소 버튼 (피그마 디자인: 흰색 배경, 회색 테두리)
export const CancelButton = styled.button`
  background-color: white;
  color: #333333;
  border: 1px solid #e4e4e4;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  height: 40px;
  
  &:hover {
    background-color: #f8f9fa;
    border-color: #d0d0d0;
  }
`;

export const NoSubscription = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #e4e4e4;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    padding: 60px 20px;
  }

  @media (max-width: 480px) {
    padding: 40px 16px;
  }
`;

export const NoSubscriptionText = styled.div`
  font-size: 15px;
  font-weight: 350;
  color: #666666;
  line-height: 18px;
  margin-bottom: 24px;
`;

export const CreateButton = styled.button`
  background-color: #489bff;
  color: white;
  border: 1px solid #489bff;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 15px;
  font-weight: 500;
  line-height: 18px;
  cursor: pointer;
  transition: all 0.2s;
  height: 40px;
  
  &:hover {
    background-color: #3a8aef;
    border-color: #3a8aef;
  }
`;

// 만료일 컨테이너 (피그마 디자인)
export const ExpiryContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

// 만료일 배지 (피그마 디자인: #ffefef 배경, #d72d30 텍스트)
export const WarningBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 400;
  line-height: 14px;
  background-color: #ffefef;
  color: #d72d30;
`;

export const DangerBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 400;
  line-height: 14px;
  background-color: #ffefef;
  color: #d72d30;
`;

export const InfoBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 400;
  line-height: 14px;
  background-color: #ffefef;
  color: #d72d30;
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

// 크레딧 금액 및 링크 (피그마 디자인)
export const CreditAmount = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: #666666;
  margin-right: 8px;
  line-height: 21.6px;
`;

export const CreditLink = styled.button`
  background: none;
  border: none;
  color: #666666;
  cursor: pointer;
  font-size: 14px;
  font-weight: 400;
  text-decoration: none;
  padding: 0;
  line-height: 16.8px;

  &:hover {
    color: #333333;
    text-decoration: underline;
  }
`;

// 탭 헤더 바 (지출결의서 목록 페이지와 동일한 스타일)
export const TabHeaderBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: white;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 16px;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 16px;
    margin-bottom: 16px;
  }
`;

export const TabSection = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
  flex: 1;
  
  @media (max-width: 768px) {
    gap: 24px;
    width: 100%;
  }
  
  @media (max-width: 480px) {
    gap: 16px;
    width: 100%;
    flex-wrap: wrap;
  }
`;

// 피그마 디자인에 맞춘 탭 버튼 (활성: #333333, 비활성: #999999, 폰트 크기 20px)
export const TabButton = styled.span`
  font-size: 20px;
  font-weight: ${props => props.active ? '700' : '500'};
  color: ${props => props.active ? '#333333' : '#999999'};
  line-height: 24px;
  cursor: pointer;
  transition: color 0.2s;
  
  &:hover {
    color: ${props => props.active ? '#333333' : '#666666'};
  }
  
  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

// 플랜 선택 탭 콘텐츠
export const PlansTabContent = styled.div`
  background: transparent;
  padding: 0;

  @media (max-width: 480px) {
    padding: 0;
  }
`;

// 플랜 그리드 (피그마 디자인: 2개 플랜 나란히)
export const PlansGrid = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 24px;
  margin-top: 24px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
`;

// 플랜 카드 아이템 래퍼 (뱃지를 위한 컨테이너)
export const PlanCardItemWrapper = styled.div`
  position: relative;
`;

// 플랜 카드 컨테이너
export const PlanCardContainer = styled.div`
  position: relative;
  width: 360px;
  height: 381px;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

// 플랜 카드 래퍼
export const PlanCardWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  ${props => props.featured && `
    background: linear-gradient(180deg, #74dbed 0%, #489bff 100%);
    border-radius: 4px;
    padding: 1px;
    box-sizing: border-box;
  `}
`;

// Rectangle 4172 디자인을 적용한 추천 뱃지 (PlanCardContainer 위에 배치)
export const RecommendedBadge = styled.div`
  position: absolute;
  top: -27px;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, #74dbed 0%, #489bff 100%);
  border-radius: 4px 4px 0 0;
  padding: 8px 0;
  z-index: 10;
  pointer-events: none;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const RecommendedText = styled.span`
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  line-height: 14px;
`;

// 플랜 카드 (피그마 디자인)
export const PlanCard = styled.div`
  position: relative;
  padding: 32px 24px 24px;
  border: ${props => {
    if (props.featured) return 'none';
    return '1px solid #e4e4e4';
  }};
  border-radius: ${props => props.featured ? '4px' : '4px'};
  background: white;
  transition: all 0.2s;
  cursor: pointer;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 0;

  &:hover {
    ${props => !props.featured && `
      border-color: #489bff;
      box-shadow: 0 4px 12px rgba(72, 155, 255, 0.15);
    `}
  }
  
  @media (max-width: 768px) {
    width: 100%;
    height: auto;
    min-height: 381px;
  }
`;

// 현재 플랜 배지 (피그마 디자인: 그라데이션 배경 위에 흰색 텍스트)
export const CurrentPlanBadge = styled.div`
  position: absolute;
  top: 9px;
  right: 9px;
  background: transparent;
  color: #333333;
  padding: 0;
  border-radius: 0;
  font-size: 14px;
  font-weight: 500;
  line-height: 14px;
`;

// 플랜 헤더 (피그마 디자인)
export const PlanHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
`;

export const PlanName = styled.h3`
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #333333;
  line-height: 27px;
`;

export const PlanPrice = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 0;
  margin-left: auto;
`;

export const PriceAmount = styled.span`
  font-size: 32px;
  font-weight: 700;
  color: ${props => {
    if (props.featured) return '#489bff';
    return '#333333';
  }};
  line-height: 48px;
`;

export const PriceUnit = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #666666;
  line-height: 16.8px;
  margin-left: 4px;
`;

export const FreePrice = styled.span`
  font-size: 32px;
  font-weight: 700;
  color: #333333;
  line-height: 48px;
`;

// 플랜 기능 목록 (피그마 디자인)
export const PlanFeatures = styled.div`
  flex: 1;
  margin-bottom: 24px;
`;

export const Feature = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0;
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 400;
  color: #666666;
  line-height: 19.2px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const FeatureIcon = styled.span`
  color: #666666;
  font-weight: 400;
  margin-right: 0;
`;

export const FeatureText = styled.span`
  flex: 1;
  color: #666666;
`;

// 플랜 액션 버튼 (피그마 디자인)
export const PlanAction = styled.div`
  margin-top: 24px;
`;

export const SelectButton = styled.button`
  width: 100%;
  padding: 10px 20px;
  background: ${props => props.featured ? '#489bff' : '#333333'};
  color: white;
  border: ${props => props.featured ? '1px solid #489bff' : '1px solid #333333'};
  border-radius: 4px;
  font-weight: 500;
  font-size: 15px;
  line-height: 18px;
  cursor: pointer;
  transition: all 0.2s;
  height: 36px;

  &:hover:not(:disabled) {
    background: ${props => props.featured ? '#3a8aef' : '#222222'};
    border-color: ${props => props.featured ? '#3a8aef' : '#222222'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const CurrentButton = styled.button`
  width: 100%;
  padding: 10px 20px;
  background: white;
  color: #333333;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  font-weight: 500;
  font-size: 15px;
  line-height: 18px;
  cursor: default;
  height: 36px;
`;

// 결제 내역 탭 콘텐츠 (피그마 디자인)
export const PaymentsTabContent = styled.div`
  background: white;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  padding: 0;
  overflow: hidden;

  @media (max-width: 480px) {
    margin: 0;
  }
`;

export const PaymentsTableHeader = styled.div`
  background: #f8f9fa;
  padding: 16px 24px;
  border-bottom: 1px solid #e4e4e4;
`;

export const PaymentsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const TableHeader = styled.thead`
  background: #f8f9fa;
`;

export const TableRow = styled.tr`
  border-bottom: 1px solid #e4e4e4;
  
  &:last-child {
    border-bottom: none;
  }
`;

export const TableHeaderCell = styled.th`
  padding: 12px 24px;
  text-align: left;
  font-weight: 500;
  color: #333333;
  font-size: 14px;
  line-height: 16.8px;
  
  &:last-child {
    text-align: left;
  }
`;

export const TableBody = styled.tbody``;

export const TableCell = styled.td`
  padding: 20px 24px;
  color: #666666;
  font-size: 16px;
  font-weight: 400;
  line-height: 19.2px;
  
  &:first-child {
    color: #666666;
  }
`;

export const PaymentMethod = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.color || '#e5e7eb'};
  color: white;
`;

// 크레딧 관리 탭 콘텐츠 (피그마 디자인)
export const CreditsTabContent = styled.div`
  background: white;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  padding: 0;
  overflow: hidden;

  @media (max-width: 480px) {
    margin: 0;
  }
`;

export const TotalCreditCard = styled.div`
  padding: 24px;
  background: white;
  border-bottom: 1px solid #e4e4e4;
`;

export const TotalCreditLabel = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #333333;
  margin-bottom: 16px;
  line-height: 21.6px;
`;

export const TotalCreditAmount = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #333333;
  line-height: 28.8px;
`;

export const CreditsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
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

// 빈 상태 (피그마 디자인)
export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #e4e4e4;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    padding: 60px 20px;
  }

  @media (max-width: 480px) {
    padding: 40px 16px;
  }
`;

export const EmptyText = styled.div`
  font-size: 15px;
  font-weight: 350;
  color: #666666;
  line-height: 18px;
  margin: 0;
`;

