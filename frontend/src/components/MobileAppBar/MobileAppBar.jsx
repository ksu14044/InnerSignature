import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaBars, FaBell, FaUser, FaSignOutAlt, FaBuilding, FaChevronDown, FaCheck, FaEdit } from 'react-icons/fa';
import { fetchPendingApprovals } from '../../api/expenseApi';
import { getPendingUsers } from '../../api/userApi';
import * as S from './style';

const MobileAppBar = ({ title, onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, companies, switchCompany } = useAuth();
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  // const [taxRevisionRequests, setTaxRevisionRequests] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const companyDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  const isLoginPage = location.pathname === '/' || location.pathname.startsWith('/find-') || location.pathname.startsWith('/reset-password');
  
  // 총 알림 개수 계산
  const totalNotifications = pendingApprovals.length + pendingUsers.length;

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target)) {
        setIsCompanyDropdownOpen(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setIsNotificationDropdownOpen(false);
      }
    };

    if (isCompanyDropdownOpen || isNotificationDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isCompanyDropdownOpen, isNotificationDropdownOpen]);

  // 알림 데이터 가져오기
  useEffect(() => {
    if (!user || isLoginPage) return;

    // 미서명 건 조회 (알람)
    if (user.userId) {
      fetchPendingApprovals(user.userId)
        .then((response) => {
          if (response.success) {
            setPendingApprovals(response.data || []);
          }
        })
        .catch((error) => {
          console.error('미서명 건 조회 실패:', error);
        });
    }

    // 승인 대기 사용자 조회 (CEO, ADMIN만)
    if (user.role === 'CEO' || user.role === 'ADMIN') {
      getPendingUsers()
        .then((response) => {
          if (response.success) {
            setPendingUsers(response.data || []);
          } else {
            setPendingUsers([]);
          }
        })
        .catch((error) => {
          console.error('승인 대기 사용자 조회 실패:', error);
          setPendingUsers([]);
        });
    }

    // 세무 수정 요청 알림 (작성자용) - 기능 비활성화됨
    // fetchTaxRevisionRequestsForDrafter()
    //   .then((response) => {
    //     if (response.success) {
    //       setTaxRevisionRequests(response.data || []);
    //     } else {
    //       setTaxRevisionRequests([]);
    //     }
    //   })
    //   .catch((error) => {
    //     console.error('세무 수정 요청 알림 조회 실패:', error);
    //     setTaxRevisionRequests([]);
    //   });
  }, [user, isLoginPage, location.pathname]);

  if (isLoginPage) {
    return null;
  }

  const getTitle = () => {
    if (title) return title;
    if (location.pathname === '/superadmin/dashboard') return 'SUPERADMIN 대시보드';
    if (location.pathname === '/expenses') return '지출결의서';
    if (location.pathname.startsWith('/detail/')) return '상세보기';
    if (location.pathname === '/expenses/create') return '새 결의서 작성';
    if (location.pathname === '/dashboard') return '대시보드';
    if (location.pathname === '/tax/summary') return '세무요약';
    if (location.pathname === '/users') return '사용자 관리';
    if (location.pathname === '/profile') return '내 정보';
    if (location.pathname === '/subscriptions/manage') return '구독 관리';
    if (location.pathname === '/subscriptions/plans') return '플랜 선택';
    if (location.pathname === '/subscriptions/payments') return '결제 내역';
    return '지출결의서';
  };

  const handleBack = () => {
    // 일관된 네비게이션 패턴: 이전 페이지로 이동
    navigate(-1);
  };

  const handleLogout = async () => {
    navigate('/');
    await logout();
  };

  // 뒤로가기 버튼 표시 규칙: 상세/작성/수정 페이지에서만 표시
  const showBackButton = location.pathname.startsWith('/detail/') || 
                         location.pathname === '/expenses/create' ||
                         location.pathname.startsWith('/expenses/edit/') ||
                         location.pathname === '/users' ||
                         location.pathname === '/profile' ||
                         location.pathname === '/dashboard' ||
                         location.pathname === '/dashboard/main' ||
                         location.pathname === '/tax/summary' ||
                         location.pathname.startsWith('/subscriptions') ||
                         location.pathname === '/cards' ||
                         location.pathname === '/my-approvers' ||
                         location.pathname === '/expense-categories' ||
                         location.pathname === '/budget' ||
                         location.pathname === '/audit-rules' ||
                         location.pathname === '/audit-logs' ||
                         location.pathname === '/missing-receipts' ||
                         location.pathname === '/account-codes' ||
                         location.pathname === '/monthly-closing' ||
                         location.pathname === '/credits';

  const handleCompanySwitch = async (companyId) => {
    try {
      await switchCompany(companyId);
      setIsCompanyDropdownOpen(false);
      window.location.reload(); // 페이지 새로고침하여 데이터 업데이트
    } catch (error) {
      alert('회사 전환에 실패했습니다.');
    }
  };

  return (
    <S.AppBar>
      <S.LeftSection>
        {showBackButton && (
          <S.MenuButton onClick={handleBack}>
            ←
          </S.MenuButton>
        )}
        <S.Title>{getTitle()}</S.Title>
      </S.LeftSection>
      <S.RightSection>
        {user && (
          <>
            {/* 통합 알림 배지 */}
            {totalNotifications > 0 && (
              <S.NotificationContainer ref={notificationDropdownRef}>
                <S.NotificationBadge 
                  onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
                  title={`알림 ${totalNotifications}건`}
                >
                  <FaBell />
                  {totalNotifications > 0 && (
                    <S.NotificationCount>{totalNotifications}</S.NotificationCount>
                  )}
                </S.NotificationBadge>
                {isNotificationDropdownOpen && (
                  <S.NotificationDropdown>
                    {pendingApprovals.length > 0 && (
                      <S.NotificationDropdownItem
                        onClick={() => {
                          setIsNotificationDropdownOpen(false);
                          if (location.pathname === '/expenses') {
                            navigate('/expenses?openNotifications=true', { replace: true });
                            setTimeout(() => {
                              window.dispatchEvent(new CustomEvent('openNotificationModal'));
                            }, 100);
                          } else {
                            navigate('/expenses?openNotifications=true');
                          }
                        }}
                      >
                        <S.NotificationIcon style={{ backgroundColor: 'var(--primary-color)' }}>
                          <FaBell />
                        </S.NotificationIcon>
                        <S.NotificationText>
                          <S.NotificationTitle>서명 대기</S.NotificationTitle>
                          <S.NotificationSubtitle>{pendingApprovals.length}건</S.NotificationSubtitle>
                        </S.NotificationText>
                      </S.NotificationDropdownItem>
                    )}
                    {false && taxRevisionRequests.length > 0 && (
                      <S.NotificationDropdownItem
                        onClick={() => {
                          setIsNotificationDropdownOpen(false);
                          if (location.pathname === '/expenses') {
                            navigate('/expenses?openTaxRevisions=true', { replace: true });
                            setTimeout(() => {
                              window.dispatchEvent(new CustomEvent('openTaxRevisionModal'));
                            }, 100);
                          } else {
                            navigate('/expenses?openTaxRevisions=true');
                          }
                        }}
                      >
                        <S.NotificationIcon style={{ backgroundColor: 'var(--warning-color)' }}>
                          <FaEdit />
                        </S.NotificationIcon>
                        <S.NotificationText>
                          <S.NotificationTitle>세무 수정 요청</S.NotificationTitle>
                          <S.NotificationSubtitle>{taxRevisionRequests.length}건</S.NotificationSubtitle>
                        </S.NotificationText>
                      </S.NotificationDropdownItem>
                    )}
                    {(user.role === 'CEO' || user.role === 'ADMIN') && pendingUsers.length > 0 && (
                      <S.NotificationDropdownItem
                        onClick={() => {
                          setIsNotificationDropdownOpen(false);
                          if (location.pathname === '/expenses') {
                            navigate('/expenses?openApprovals=true', { replace: true });
                            setTimeout(() => {
                              window.dispatchEvent(new CustomEvent('openApprovalModal'));
                            }, 100);
                          } else {
                            navigate('/expenses?openApprovals=true');
                          }
                        }}
                      >
                        <S.NotificationIcon style={{ backgroundColor: 'var(--success-color)' }}>
                          <FaUser />
                        </S.NotificationIcon>
                        <S.NotificationText>
                          <S.NotificationTitle>승인 대기</S.NotificationTitle>
                          <S.NotificationSubtitle>{pendingUsers.length}건</S.NotificationSubtitle>
                        </S.NotificationText>
                      </S.NotificationDropdownItem>
                    )}
                  </S.NotificationDropdown>
                )}
              </S.NotificationContainer>
            )}
            {/* 프로필 버튼 */}
            {location.pathname !== '/profile' && (
              <S.IconButton onClick={() => navigate('/profile')} aria-label="프로필">
                <FaUser />
              </S.IconButton>
            )}
            {/* 회사 선택 */}
            {companies && companies.length > 1 && (
              <S.CompanySelector ref={companyDropdownRef}>
                <S.CompanyButton
                  onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                  aria-label="회사 선택"
                >
                  <FaBuilding />
                </S.CompanyButton>
                {isCompanyDropdownOpen && (
                  <S.CompanyDropdown>
                    {companies && companies.map((company) => (
                      <S.CompanyDropdownItem
                        key={company.companyId}
                        selected={company.companyId === user.companyId}
                        onClick={() => handleCompanySwitch(company.companyId)}
                      >
                        {company.companyId === user.companyId && <FaCheck style={{ marginRight: '8px', color: '#007bff' }} />}
                        {company.companyName}
                      </S.CompanyDropdownItem>
                    ))}
                  </S.CompanyDropdown>
                )}
              </S.CompanySelector>
            )}
            {/* 로그아웃 버튼 */}
            <S.IconButton onClick={handleLogout} aria-label="로그아웃">
              <FaSignOutAlt />
            </S.IconButton>
          </>
        )}
      </S.RightSection>
    </S.AppBar>
  );
};

export default MobileAppBar;

