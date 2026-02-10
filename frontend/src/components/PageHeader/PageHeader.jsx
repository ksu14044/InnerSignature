import { useNavigate } from 'react-router-dom';
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
  
  const totalNotifications = pendingApprovals.length + pendingUsers.length;

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
    navigate('/profile');
  };

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
            <S.ProfileBadge onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
              <S.ProfileIcon />
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
