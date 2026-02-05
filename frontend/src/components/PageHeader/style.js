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
  background-color: #d9d9d9;
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
