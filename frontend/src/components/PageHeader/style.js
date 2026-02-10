import styled from '@emotion/styled';

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

export const NotificationContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const NotificationIconWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const NotificationIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  cursor: pointer;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

export const ProfileBadge = styled.div`
  position: relative;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ProfileIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #ffed81;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

export const ProfileInitial = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #333333;
  font-family: 'Noto Sans KR', sans-serif;
`;

export const ProfileDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 300px;
  background: #ffffff;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow: hidden;
`;

export const ProfileDropdownHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
`;

export const ProfileCircle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #ffed81;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const ProfileInitialLarge = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: #333333;
  font-family: 'Noto Sans KR', sans-serif;
`;

export const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
`;

export const ProfileName = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #333333;
  font-family: 'Noto Sans KR', sans-serif;
  line-height: 19.2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ProfilePosition = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: #666666;
  font-family: 'Noto Sans KR', sans-serif;
  line-height: 16.8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const CompanyInfo = styled.div`
  margin: 0 24px 8px 24px;
  padding: 8px 16px;
  background: #ffffff;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  display: flex;
  align-items: center;
  height: 32px;
`;

export const CompanyName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  font-family: 'Noto Sans KR', sans-serif;
  line-height: 16.8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
`;

export const SubscriptionPlan = styled.div`
  margin: 0 24px 8px 24px;
  padding: 8px 16px;
  background: #489bff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  height: 32px;
`;

export const SubscriptionPlanText = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  font-family: 'Noto Sans KR', sans-serif;
  line-height: 16.8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
`;

export const ProfileDropdownMenu = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0;
`;

export const ProfileMenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: ${props => props.isLogout ? '#f8f9fa' : '#ffffff'};
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  &:first-of-type {
    border-top: 1px solid #e4e4e4;
  }
`;

export const ProfileMenuItemIcon = styled.div`
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

export const ProfileMenuItemText = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #666666;
  font-family: 'Noto Sans KR', sans-serif;
  line-height: 14px;
`;

export const NotificationBadgeCount = styled.span`
  position: absolute;
  top: -1px;
  right: -1px;
  background-color: #d72d30;
  color: #ffffff;
  border-radius: 9px;
  padding: 2px 6px;
  font-size: 12px;
  font-weight: 400;
  min-width: 22px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const PageSubHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 24px;
  font-family: 'Noto Sans KR', sans-serif;

  @media (max-width: 480px) {
    padding: 0 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

export const PageSubHeaderText = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #333333;
  line-height: 24px;

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

export const PageSubHeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;

  @media (max-width: 480px) {
    width: 100%;
    justify-content: flex-end;
  }
`;