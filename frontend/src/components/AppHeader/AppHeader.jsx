import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fetchPendingApprovals } from '../../api/expenseApi';
import { getPendingUsers, approveUser } from '../../api/userApi';
import { 
  FaBell, 
  FaUser, 
  FaSignOutAlt, 
  FaBuilding, 
  FaChevronDown, 
  FaCheck, 
  FaCog,
  FaTimesCircle
} from 'react-icons/fa';
import * as S from './style';

/**
 * 공통 애플리케이션 헤더 컴포넌트
 * @param {string} title - 페이지 제목
 * @param {string} subtitle - 부제목 (선택사항)
 * @param {React.ReactNode} additionalButtons - 추가 버튼들 (선택사항)
 * @param {boolean} showNotifications - 알림 배지 표시 여부 (기본값: true)
 * @param {boolean} showSettings - 설정 드롭다운 표시 여부 (기본값: true)
 */
const AppHeader = ({ 
  title = '대시보드', 
  subtitle, 
  additionalButtons,
  showNotifications = true,
  showSettings = true
}) => {
  const { user, logout, companies, switchCompany } = useAuth();
  const navigate = useNavigate();
  
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [isManagementDropdownOpen, setIsManagementDropdownOpen] = useState(false);

  const handleLogout = async () => {
    navigate('/');
    await logout();
  };

  // 미서명 건 조회
  useEffect(() => {
    if (showNotifications && user?.userId) {
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
  }, [user?.userId, showNotifications]);

  // 승인 대기 사용자 조회 (CEO, ADMIN만)
  useEffect(() => {
    if (showNotifications && user && (user.role === 'CEO' || user.role === 'ADMIN')) {
      getPendingUsers()
        .then((response) => {
          if (response.success) {
            setPendingUsers(response.data || []);
          }
        })
        .catch((error) => {
          console.error('승인 대기 사용자 조회 실패:', error);
          setPendingUsers([]);
        });
    }
  }, [user?.userId, user?.role, showNotifications]);

  // 관리 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isManagementDropdownOpen && !event.target.closest('[data-management-dropdown]')) {
        setIsManagementDropdownOpen(false);
      }
    };

    if (isManagementDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isManagementDropdownOpen]);

  return (
    <>
      <S.Header>
        <S.HeaderLeft>
          <S.Title>{title}</S.Title>
          {subtitle && <S.WelcomeText>{subtitle}</S.WelcomeText>}
        </S.HeaderLeft>
        <S.HeaderRight>
          {/* 서명 대기 알림 배지 */}
          {showNotifications && pendingApprovals.length > 0 && (
            <S.NotificationBadge 
              onClick={() => setIsNotificationModalOpen(true)}
              title={`서명 대기: ${pendingApprovals.length}건`}
            >
              <FaBell />
              <S.NotificationCount>{pendingApprovals.length}</S.NotificationCount>
            </S.NotificationBadge>
          )}
          
          {/* 승인 대기 배지 (CEO, ADMIN만 표시) */}
          {showNotifications && (user?.role === 'CEO' || user?.role === 'ADMIN') && pendingUsers.length > 0 && (
            <S.NotificationBadge 
              onClick={() => setIsApprovalModalOpen(true)}
              title={`승인 대기: ${pendingUsers.length}건`}
              style={{ backgroundColor: '#4caf50', marginRight: '12px' }}
            >
              <FaUser />
              <S.NotificationCount>{pendingUsers.length}</S.NotificationCount>
            </S.NotificationBadge>
          )}

          {/* 추가 버튼들 (페이지별 커스터마이즈) */}
          {additionalButtons}

          {/* 회사 선택 드롭다운 */}
          {companies && companies.length > 1 && (
            <S.CompanySelector>
              <S.CompanySelectorButton onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}>
                <FaBuilding />
                <span>
                  현재: {companies.find(c => c.companyId === user.companyId)?.companyName || '회사 선택'}
                </span>
                <FaChevronDown />
              </S.CompanySelectorButton>
              {isCompanyDropdownOpen && (
                <S.CompanyDropdown>
                  {companies.map((company) => (
                    <S.CompanyDropdownItem
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
                    </S.CompanyDropdownItem>
                  ))}
                </S.CompanyDropdown>
              )}
            </S.CompanySelector>
          )}

          {/* 내 정보 버튼 */}
          <S.ProfileButton onClick={() => navigate('/profile')}>
            <FaUser />
            <span>내 정보</span>
          </S.ProfileButton>

          {/* 설정 드롭다운 */}
          {showSettings && (
            <S.ManagementDropdown data-management-dropdown>
              <S.ManagementButton onClick={() => setIsManagementDropdownOpen(!isManagementDropdownOpen)}>
                <FaCog />
                <span>설정</span>
                <FaChevronDown style={{ fontSize: '12px', marginLeft: '4px' }} />
              </S.ManagementButton>
              {isManagementDropdownOpen && (
                <S.ManagementMenu>
                  {(user?.role === 'ADMIN' || user?.role === 'CEO') && (
                    <S.ManagementMenuItem onClick={() => { navigate('/users'); setIsManagementDropdownOpen(false); }}>
                      👥 사용자 관리
                    </S.ManagementMenuItem>
                  )}
                  {user?.role !== 'TAX_ACCOUNTANT' && (
                    <>
                      <S.ManagementMenuItem onClick={() => { navigate('/signatures'); setIsManagementDropdownOpen(false); }}>
                        ✍️ 도장/서명 관리
                      </S.ManagementMenuItem>
                      <S.ManagementMenuItem onClick={() => { navigate('/cards'); setIsManagementDropdownOpen(false); }}>
                        💳 카드 관리
                      </S.ManagementMenuItem>
                      <S.ManagementMenuItem onClick={() => { navigate('/my-approvers'); setIsManagementDropdownOpen(false); }}>
                        👤 담당 결재자 설정
                      </S.ManagementMenuItem>
                    </>
                  )}
                  {(user?.role === 'ACCOUNTANT' || user?.role === 'ADMIN' || user?.role === 'CEO' || user?.role === 'TAX_ACCOUNTANT') && (
                    <S.ManagementMenuItem onClick={() => { navigate('/expense-categories'); setIsManagementDropdownOpen(false); }}>
                      🏷️ 지출 항목 관리
                    </S.ManagementMenuItem>
                  )}
                  {(user?.role === 'ADMIN' || user?.role === 'CEO') && (
                    <S.ManagementMenuItem onClick={() => { navigate('/subscriptions/manage'); setIsManagementDropdownOpen(false); }}>
                      📦 구독 관리
                    </S.ManagementMenuItem>
                  )}
                </S.ManagementMenu>
              )}
            </S.ManagementDropdown>
          )}

          {/* 로그아웃 버튼 */}
          <S.LogoutButton onClick={handleLogout}>
            <FaSignOutAlt />
            <span>로그아웃</span>
          </S.LogoutButton>
        </S.HeaderRight>
      </S.Header>

      {/* 알람 모달 */}
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

      {/* 승인 대기 모달 */}
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
                      <S.NotificationItemTitle>{pendingUser.koreanName} ({pendingUser.username})</S.NotificationItemTitle>
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
                                setPendingUsers(pendingUsers.filter(u => u.userId !== pendingUser.userId));
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
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <FaCheck /> 승인
                        </button>
                        <button
                          onClick={async () => {
                            if (!window.confirm(`${pendingUser.koreanName}(${pendingUser.username}) 사용자를 거부하시겠습니까?`)) {
                              return;
                            }
                            try {
                              const response = await approveUser(pendingUser.userId, 'REJECT');
                              if (response.success) {
                                setPendingUsers(pendingUsers.filter(u => u.userId !== pendingUser.userId));
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
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <FaTimesCircle /> 거부
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

export default AppHeader;
