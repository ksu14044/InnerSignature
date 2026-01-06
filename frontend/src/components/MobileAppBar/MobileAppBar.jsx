import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaBars, FaBell, FaUser, FaSignOutAlt, FaBuilding, FaChevronDown, FaCheck, FaEdit } from 'react-icons/fa';
import { fetchPendingApprovals, fetchTaxRevisionRequestsForDrafter } from '../../api/expenseApi';
import { getPendingUsers } from '../../api/userApi';
import * as S from './style';

const MobileAppBar = ({ title, onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, companies, switchCompany } = useAuth();
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [taxRevisionRequests, setTaxRevisionRequests] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const companyDropdownRef = useRef(null);
  const isLoginPage = location.pathname === '/' || location.pathname.startsWith('/find-') || location.pathname.startsWith('/reset-password');

  // 외부 클릭 시 드롭다운 닫기 - early return 전에 모든 Hooks 호출
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target)) {
        setIsCompanyDropdownOpen(false);
      }
    };

    if (isCompanyDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isCompanyDropdownOpen]);

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

    // 세무 수정 요청 알림 (작성자용)
    fetchTaxRevisionRequestsForDrafter()
      .then((response) => {
        if (response.success) {
          setTaxRevisionRequests(response.data || []);
        } else {
          setTaxRevisionRequests([]);
        }
      })
      .catch((error) => {
        console.error('세무 수정 요청 알림 조회 실패:', error);
        setTaxRevisionRequests([]);
      });
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
    if (location.pathname.startsWith('/detail/') || location.pathname === '/expenses/create') {
      navigate('/expenses');
    } else {
      navigate(-1);
    }
  };

  const handleLogout = async () => {
    navigate('/');
    await logout();
  };

  const showBackButton = location.pathname.startsWith('/detail/') || 
                         location.pathname === '/expenses/create' ||
                         location.pathname === '/users' ||
                         location.pathname === '/profile' ||
                         location.pathname === '/dashboard' ||
                         location.pathname === '/tax/summary' ||
                         location.pathname.startsWith('/subscriptions');

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
            {/* 알림 배지 */}
            {pendingApprovals.length > 0 && (
              <S.NotificationBadge 
                onClick={() => {
                  if (location.pathname === '/expenses') {
                    // 이미 expenses 페이지에 있으면 쿼리 파라미터만 추가
                    navigate('/expenses?openNotifications=true', { replace: true });
                    // 페이지 새로고침 없이 모달 열기 위해 약간의 지연
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('openNotificationModal'));
                    }, 100);
                  } else {
                    navigate('/expenses?openNotifications=true');
                  }
                }}
                title={`서명 대기: ${pendingApprovals.length}건`}
              >
                <FaBell />
                <S.NotificationCount>{pendingApprovals.length}</S.NotificationCount>
              </S.NotificationBadge>
            )}
            {/* 세무 수정 요청 알림 배지 (작성자용) */}
            {taxRevisionRequests.length > 0 && (
              <S.NotificationBadge
                onClick={() => {
                  if (location.pathname === '/expenses') {
                    navigate('/expenses?openTaxRevisions=true', { replace: true });
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('openTaxRevisionModal'));
                    }, 100);
                  } else {
                    navigate('/expenses?openTaxRevisions=true');
                  }
                }}
                title={`세무 수정 요청: ${taxRevisionRequests.length}건`}
                style={{ backgroundColor: '#ffc107', marginRight: '4px' }}
              >
                <FaEdit />
                <S.NotificationCount>{taxRevisionRequests.length}</S.NotificationCount>
              </S.NotificationBadge>
            )}
            {/* 승인 대기 배지 (CEO, ADMIN만 표시) */}
            {(user.role === 'CEO' || user.role === 'ADMIN') && pendingUsers.length > 0 && (
              <S.NotificationBadge 
                onClick={() => {
                  if (location.pathname === '/expenses') {
                    navigate('/expenses?openApprovals=true', { replace: true });
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('openApprovalModal'));
                    }, 100);
                  } else {
                    navigate('/expenses?openApprovals=true');
                  }
                }}
                title={`승인 대기: ${pendingUsers.length}건`}
                style={{ backgroundColor: '#4caf50', marginRight: '4px' }}
              >
                <FaUser />
                <S.NotificationCount>{pendingUsers.length}</S.NotificationCount>
              </S.NotificationBadge>
            )}
            {companies && companies.length > 1 && (
              <S.CompanySelector ref={companyDropdownRef}>
                <S.CompanyButton onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}>
                  <FaBuilding />
                </S.CompanyButton>
                {isCompanyDropdownOpen && (
                  <S.CompanyDropdown>
                    {companies.map((company) => (
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
            {location.pathname !== '/profile' && (
              <S.IconButton onClick={() => navigate('/profile')}>
                <FaUser />
              </S.IconButton>
            )}
            <S.IconButton onClick={handleLogout}>
              <FaSignOutAlt />
            </S.IconButton>
          </>
        )}
      </S.RightSection>
    </S.AppBar>
  );
};

export default MobileAppBar;

