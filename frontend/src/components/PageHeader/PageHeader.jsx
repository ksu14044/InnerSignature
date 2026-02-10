import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrentSubscription } from '../../api/subscriptionApi';
import * as S from './style';

/**
 * 공통 PageHeader 컴포넌트
 * @param {string} title - 페이지 제목
 * @param {string} subTitle - 페이지 서브 제목 (선택사항)
 * @param {ReactNode} subTitleActions - 서브 제목 옆에 표시할 액션 버튼들 (선택사항)
 * @param {Array} pendingApprovals - 서명 대기 건 목록
 * @param {Array} pendingUsers - 승인 대기 사용자 목록
 * @param {Function} onNotificationClick - 알림 아이콘 클릭 핸들러
 * @param {Function} onApprovalClick - 승인 모달 열기 핸들러 (선택사항)
 */
const PageHeader = ({ 
  title, 
  subTitle,
  subTitleActions,
  pendingApprovals = [], 
  pendingUsers = [],
  onNotificationClick,
  onApprovalClick
}) => {
  const navigate = useNavigate();
  const { user, logout, companies } = useAuth();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const dropdownRef = useRef(null);
  
  const totalNotifications = pendingApprovals.length + pendingUsers.length;

  // 구독 정보 로드
  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const response = await getCurrentSubscription();
        if (response.success && response.data) {
          setSubscription(response.data);
        }
      } catch (error) {
        // 권한이 없거나 구독이 없는 경우는 정상적인 상태
        setSubscription(null);
      }
    };
    
    if (user) {
      loadSubscription();
    }
  }, [user]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  const handleNotificationClick = () => {
    if (totalNotifications === 0) return;
    
    if (onNotificationClick) {
      onNotificationClick();
    } else {
      // 기본 동작: 서명 대기 건이 있으면 알림 모달, 없으면 승인 모달
      if (pendingApprovals.length > 0 && onNotificationClick) {
        onNotificationClick();
      } else if (pendingUsers.length > 0 && onApprovalClick) {
        onApprovalClick();
      }
    }
  };

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleMyInfoClick = () => {
    setIsProfileDropdownOpen(false);
    navigate('/profile');
  };

  const handleLogoutClick = async () => {
    setIsProfileDropdownOpen(false);
    await logout();
    navigate('/');
  };

  // 사용자 이름 첫글자 추출
  const getInitial = () => {
    if (!user?.koreanName) return '?';
    return user.koreanName.charAt(0).toUpperCase();
  };

  // 현재 회사 정보 가져오기
  const getCurrentCompany = () => {
    if (!companies || companies.length === 0) return null;
    // user.companyId와 일치하는 회사 찾기
    const currentCompany = companies.find(c => c.companyId === user?.companyId);
    return currentCompany || companies[0];
  };

  const currentCompany = getCurrentCompany();

  return (
    <>
      <S.PageHeader>
        <S.PageHeaderLeft>
          <S.PageTitle>{title}</S.PageTitle>
        </S.PageHeaderLeft>
        <S.PageHeaderRight>
          <S.NotificationContainer>
            <S.NotificationIconWrapper>
              <S.NotificationIcon
                onClick={handleNotificationClick}
                style={{ cursor: totalNotifications > 0 ? 'pointer' : 'default' }}
              >
                <img src="/이너사인_이미지 (1)/아이콘/24px_알림_사이드바/알림.png" alt="알림" />
              </S.NotificationIcon>
              {totalNotifications > 0 && (
                <S.NotificationBadgeCount>
                  {totalNotifications > 9 ? '9+' : totalNotifications}
                </S.NotificationBadgeCount>
              )}
            </S.NotificationIconWrapper>
            <S.ProfileBadge ref={dropdownRef} style={{ cursor: 'pointer' }}>
              <S.ProfileIcon onClick={handleProfileClick}>
                <S.ProfileInitial>{getInitial()}</S.ProfileInitial>
              </S.ProfileIcon>
              {isProfileDropdownOpen && (
                <S.ProfileDropdown>
                  <S.ProfileDropdownHeader>
                    <S.ProfileCircle>
                      <S.ProfileInitialLarge>{getInitial()}</S.ProfileInitialLarge>
                    </S.ProfileCircle>
                    <S.ProfileInfo>
                      <S.ProfileName>{user?.koreanName || user?.username || '사용자'}</S.ProfileName>
                      <S.ProfilePosition>{user?.position || '직책 없음'}</S.ProfilePosition>
                    </S.ProfileInfo>
                  </S.ProfileDropdownHeader>
                  
                  {currentCompany && (
                    <S.CompanyInfo>
                      <S.CompanyName>{currentCompany.companyName || '회사명 없음'}</S.CompanyName>
                    </S.CompanyInfo>
                  )}
                  
                  {subscription?.plan && (
                    <S.SubscriptionPlan>
                      <S.SubscriptionPlanText>{subscription.plan.planName || '플랜 없음'}</S.SubscriptionPlanText>
                    </S.SubscriptionPlan>
                  )}
                  
                  <S.ProfileDropdownMenu>
                    <S.ProfileMenuItem onClick={handleMyInfoClick}>
                      <S.ProfileMenuItemIcon>
                        <img src="/이너사인_이미지 (1)/아이콘/18px_프로필_내정보_로그아웃/프로필_내정보.png" alt="내 정보" />
                      </S.ProfileMenuItemIcon>
                      <S.ProfileMenuItemText>내 정보</S.ProfileMenuItemText>
                    </S.ProfileMenuItem>
                    <S.ProfileMenuItem onClick={handleLogoutClick} isLogout>
                      <S.ProfileMenuItemIcon>
                        <img src="/이너사인_이미지 (1)/아이콘/18px_프로필_내정보_로그아웃/프로필_로그아웃.png" alt="로그아웃" />
                      </S.ProfileMenuItemIcon>
                      <S.ProfileMenuItemText>로그아웃</S.ProfileMenuItemText>
                    </S.ProfileMenuItem>
                  </S.ProfileDropdownMenu>
                </S.ProfileDropdown>
              )}
            </S.ProfileBadge>
          </S.NotificationContainer>
        </S.PageHeaderRight>
      </S.PageHeader>
      {(subTitle || subTitleActions) && (
        <S.PageSubHeader>
          {subTitle && (
            <S.PageSubHeaderText>{subTitle}</S.PageSubHeaderText>
          )}
          {subTitleActions && (
            <S.PageSubHeaderActions>
              {subTitleActions}
            </S.PageSubHeaderActions>
          )}
        </S.PageSubHeader>
      )}
    </>
  );
};

export default PageHeader;
