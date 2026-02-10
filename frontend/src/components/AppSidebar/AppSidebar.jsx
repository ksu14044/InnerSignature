import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fetchPendingApprovals } from '../../api/expenseApi';
import { getPendingUsers, approveUser } from '../../api/userApi';
import { FaChevronDown, FaCheck } from 'react-icons/fa';
import * as S from './style';

const ICON_BASE = '/이너사인_이미지 (1)/아이콘/24px_알림_사이드바';

const iconSrc = (active, baseName) => `${ICON_BASE}/${baseName}_${active ? '02' : '01'}.png`;

const isDashboardPathActive = (pathname) => pathname === '/dashboard' || pathname === '/dashboard/main';
const isExpensePathActive = (pathname) =>
  pathname === '/expenses' ||
  pathname.startsWith('/detail/') ||
  pathname === '/expenses/create' ||
  pathname.startsWith('/expenses/edit/');

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, companies, switchCompany } = useAuth();

  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);

  const canManageUsers = user?.role === 'CEO' || user?.role === 'ADMIN';
  const canSeeManagementSection = user?.role !== 'TAX_ACCOUNTANT';
  const canManageExpenseCategories =
    user?.role === 'ACCOUNTANT' || user?.role === 'ADMIN' || user?.role === 'CEO' || user?.role === 'TAX_ACCOUNTANT';

  const companyName = useMemo(() => {
    if (!companies?.length || !user?.companyId) return '회사 선택';
    return companies.find((c) => c.companyId === user.companyId)?.companyName || '회사 선택';
  }, [companies, user?.companyId]);

  const handleLogout = async () => {
    navigate('/');
    await logout();
  };

  // 알림 데이터 로드 (데스크톱 사이드바용)
  useEffect(() => {
    if (!user?.userId) return;

    fetchPendingApprovals(user.userId)
      .then((response) => {
        if (response?.success) setPendingApprovals(response.data || []);
      })
      .catch((error) => {
        console.error('미서명 건 조회 실패:', error);
      });
  }, [user?.userId]);

  useEffect(() => {
    if (!user || !(user.role === 'CEO' || user.role === 'ADMIN')) return;

    getPendingUsers()
      .then((response) => {
        if (response?.success) setPendingUsers(response.data || []);
        else setPendingUsers([]);
      })
      .catch((error) => {
        console.error('승인 대기 사용자 조회 실패:', error);
        setPendingUsers([]);
      });
  }, [user?.userId, user?.role]);

  // 외부 클릭 시 회사 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isCompanyDropdownOpen && !event.target.closest('[data-company-dropdown]')) {
        setIsCompanyDropdownOpen(false);
      }
    };

    if (isCompanyDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCompanyDropdownOpen]);

  if (!user) return null;

  const dashboardActive = isDashboardPathActive(location.pathname);
  const expenseActive = isExpensePathActive(location.pathname);

  return (
    <>
      <S.Sidebar>
        {/* 로고 영역 */}
        <S.LogoSpacer>
          <S.LogoImage src="/favicon6.png" alt="InnerSignature Logo" />
          {companies && companies.length >= 1 && (
            <S.SidebarCompanySelector data-company-dropdown>
              <S.SidebarCompanySelectorButton
                onClick={companies.length > 1 ? () => setIsCompanyDropdownOpen(!isCompanyDropdownOpen) : undefined}
                style={{ cursor: companies.length > 1 ? 'pointer' : 'default' }}
              >
                <span>{companyName}</span>
                {companies.length > 1 && <FaChevronDown style={{ fontSize: '12px', marginLeft: '4px' }} />}
              </S.SidebarCompanySelectorButton>
              {companies.length > 1 && isCompanyDropdownOpen && (
                <S.SidebarCompanyDropdown>
                  {companies.map((company) => (
                    <S.SidebarCompanyDropdownItem
                      key={company.companyId}
                      selected={company.companyId === user.companyId}
                      onClick={async () => {
                        try {
                          await switchCompany(company.companyId);
                          setIsCompanyDropdownOpen(false);
                          window.location.reload();
                        } catch (error) {
                          alert('회사 전환에 실패했습니다.');
                        }
                      }}
                    >
                      {company.companyId === user.companyId && <FaCheck style={{ marginRight: '8px', color: '#007bff' }} />}
                      {company.companyName}
                    </S.SidebarCompanyDropdownItem>
                  ))}
                </S.SidebarCompanyDropdown>
              )}
            </S.SidebarCompanySelector>
          )}
        </S.LogoSpacer>
        <S.Menu>
          <S.MenuItem
            as={NavLink}
            to="/dashboard/main"
            data-active={dashboardActive ? 'true' : 'false'}
            end={false}
          >
            <S.MenuIcon>
              <img src={iconSrc(dashboardActive, '01_대시보드')} alt="" />
            </S.MenuIcon>
            <span>대시보드</span>
          </S.MenuItem>

          <S.MenuItem as={NavLink} to="/expenses" data-active={expenseActive ? 'true' : 'false'} end={false}>
            <S.MenuIcon>
              <img src={iconSrc(expenseActive, '02_지출결의서')} alt="" />
            </S.MenuIcon>
            <span>지출결의서</span>
          </S.MenuItem>

          <S.Divider />

          {/* 관리 섹션(기존 헤더 설정 드롭다운을 사이드바 섹션으로 전개) */}
          <S.SectionTitle>관리</S.SectionTitle>

          {canSeeManagementSection && (
            <>
              <S.SubMenuItem as={NavLink} to="/signatures" data-active={location.pathname === '/signatures' ? 'true' : 'false'}>
                <S.MenuIcon>
                  <img src={iconSrc(location.pathname === '/signatures', '04_도장서명')} alt="" />
                </S.MenuIcon>
                <span>도장·서명</span>
              </S.SubMenuItem>

              <S.SubMenuItem as={NavLink} to="/cards" data-active={location.pathname === '/cards' ? 'true' : 'false'}>
                <S.MenuIcon>
                  <img src={iconSrc(location.pathname === '/cards', '05_카드')} alt="" />
                </S.MenuIcon>
                <span>카드</span>
              </S.SubMenuItem>

              <S.SubMenuItem as={NavLink} to="/my-approvers" data-active={location.pathname === '/my-approvers' ? 'true' : 'false'}>
                <S.MenuIcon>
                  <img src={iconSrc(location.pathname === '/my-approvers', '06_담당결재자')} alt="" />
                </S.MenuIcon>
                <span>담당 결재자 설정</span>
              </S.SubMenuItem>
            </>
          )}

          {canManageExpenseCategories && (
            <S.SubMenuItem
              as={NavLink}
              to="/expense-categories"
              data-active={location.pathname === '/expense-categories' ? 'true' : 'false'}
            >
              <S.MenuIcon>
                <img src={iconSrc(location.pathname === '/expense-categories', '07_지출항목')} alt="" />
              </S.MenuIcon>
              <span>지출 항목 관리</span>
            </S.SubMenuItem>
          )}

          {canManageUsers && (
            <S.SubMenuItem as={NavLink} to="/users" data-active={location.pathname === '/users' ? 'true' : 'false'}>
              <S.MenuIcon>
                <img src={iconSrc(location.pathname === '/users', '03_사용자')} alt="" />
              </S.MenuIcon>
              <span>사용자 관리</span>
            </S.SubMenuItem>
          )}

          {(user?.role === 'ADMIN' || user?.role === 'CEO') && (
            <S.SubMenuItem
              as={NavLink}
              to="/subscriptions/manage"
              data-active={location.pathname.startsWith('/subscriptions') ? 'true' : 'false'}
            >
              <S.MenuIcon>
                <img src={iconSrc(location.pathname.startsWith('/subscriptions'), '08_구독')} alt="" />
              </S.MenuIcon>
              <span>구독 관리</span>
            </S.SubMenuItem>
          )}

          {/* TAX_ACCOUNTANT 전용: 세무요약 빠른 이동 */}
          {user?.role === 'TAX_ACCOUNTANT' && (
            <S.SubMenuItem as={NavLink} to="/tax/summary" data-active={location.pathname === '/tax/summary' ? 'true' : 'false'}>
              <S.MenuIcon>
                <img src={iconSrc(location.pathname === '/tax/summary', '10_세무요약')} alt="" />
              </S.MenuIcon>
              <span>세무 요약</span>
            </S.SubMenuItem>
          )}

          <S.Divider />

          <S.MenuItem as={NavLink} to="/profile" data-active={location.pathname === '/profile' ? 'true' : 'false'}>
            <S.MenuIcon>
              <img src={iconSrc(location.pathname === '/profile', '09_내정보')} alt="" />
            </S.MenuIcon>
            <span>내 정보</span>
          </S.MenuItem>
        </S.Menu>

        <S.BottomArea>
          <S.LogoutButton type="button" onClick={handleLogout}>
            로그아웃
          </S.LogoutButton>
        </S.BottomArea>
      </S.Sidebar>

      {/* 서명 대기 모달 (기존 AppHeader 로직 유지) */}
      {isNotificationModalOpen && (
        <S.NotificationModal onClick={() => setIsNotificationModalOpen(false)}>
          <S.NotificationModalContent onClick={(e) => e.stopPropagation()}>
            <S.NotificationModalHeader>
              <h3>서명 대기 건 ({pendingApprovals.length}건)</h3>
              <button onClick={() => setIsNotificationModalOpen(false)}>×</button>
            </S.NotificationModalHeader>
            <S.NotificationModalBody>
              {pendingApprovals.length === 0 ? (
                <p>서명 대기 중인 건이 없습니다.</p>
              ) : (
                <S.NotificationList>
                  {pendingApprovals.map((item) => (
                    <S.NotificationItem
                      key={item.expenseReportId}
                      onClick={() => {
                        navigate(`/detail/${item.expenseReportId}`);
                        setIsNotificationModalOpen(false);
                      }}
                    >
                      <S.NotificationItemTitle>
                        {(item.summaryDescription && item.summaryDescription.trim() !== '')
                          ? item.summaryDescription
                          : (item.firstDescription && item.firstDescription.trim() !== '')
                            ? item.firstDescription
                            : '-'}
                      </S.NotificationItemTitle>
                      <S.NotificationItemInfo>
                        <span>문서번호: {item.expenseReportId}</span>
                        <span>작성자: {item.drafterName}</span>
                        <span>작성일: {item.reportDate}</span>
                        <span>금액: {item.totalAmount.toLocaleString()}원</span>
                      </S.NotificationItemInfo>
                    </S.NotificationItem>
                  ))}
                </S.NotificationList>
              )}
            </S.NotificationModalBody>
          </S.NotificationModalContent>
        </S.NotificationModal>
      )}

      {/* 승인 대기 모달 (CEO/ADMIN) */}
      {isApprovalModalOpen && (
        <S.NotificationModal onClick={() => setIsApprovalModalOpen(false)}>
          <S.NotificationModalContent onClick={(e) => e.stopPropagation()}>
            <S.NotificationModalHeader>
              <h3>승인 대기 사용자 ({pendingUsers.length}건)</h3>
              <button onClick={() => setIsApprovalModalOpen(false)}>×</button>
            </S.NotificationModalHeader>
            <S.NotificationModalBody>
              {pendingUsers.length === 0 ? (
                <p>승인 대기 중인 사용자가 없습니다.</p>
              ) : (
                <S.NotificationList>
                  {pendingUsers.map((pendingUser) => (
                    <S.NotificationItem key={pendingUser.userId}>
                      <S.NotificationItemTitle>
                        {pendingUser.koreanName} ({pendingUser.username})
                      </S.NotificationItemTitle>
                      <S.NotificationItemInfo>
                        <span>역할: {pendingUser.role}</span>
                        <span>직급: {pendingUser.position || '-'}</span>
                        <span>이메일: {pendingUser.email || '-'}</span>
                      </S.NotificationItemInfo>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button
                          onClick={async () => {
                            try {
                              const response = await approveUser(pendingUser.userId, 'APPROVE');
                              if (response.success) {
                                setPendingUsers(pendingUsers.filter((u) => u.userId !== pendingUser.userId));
                                const refreshResponse = await getPendingUsers();
                                if (refreshResponse.success) {
                                  setPendingUsers(refreshResponse.data || []);
                                }
                                alert('사용자가 승인되었습니다.');
                              } else {
                                alert(response.message || '승인에 실패했습니다.');
                              }
                            } catch (error) {
                              console.error('승인 실패:', error);
                              alert(error?.response?.data?.message || error?.message || '승인에 실패했습니다.');
                            }
                          }}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#4caf50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          승인
                        </button>
                        <button
                          onClick={async () => {
                            if (!window.confirm(`${pendingUser.koreanName}(${pendingUser.username}) 사용자를 거부하시겠습니까?`)) {
                              return;
                            }
                            try {
                              const response = await approveUser(pendingUser.userId, 'REJECT');
                              if (response.success) {
                                setPendingUsers(pendingUsers.filter((u) => u.userId !== pendingUser.userId));
                                const refreshResponse = await getPendingUsers();
                                if (refreshResponse.success) {
                                  setPendingUsers(refreshResponse.data || []);
                                }
                                alert('사용자가 거부되었습니다.');
                              } else {
                                alert(response.message || '거부에 실패했습니다.');
                              }
                            } catch (error) {
                              console.error('거부 실패:', error);
                              alert(error?.response?.data?.message || error?.message || '거부에 실패했습니다.');
                            }
                          }}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          거부
                        </button>
                      </div>
                    </S.NotificationItem>
                  ))}
                </S.NotificationList>
              )}
            </S.NotificationModalBody>
          </S.NotificationModalContent>
        </S.NotificationModal>
      )}
    </>
  );
};

export default AppSidebar;

