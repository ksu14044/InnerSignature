import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fetchExpenseList, fetchPendingApprovals } from '../../api/expenseApi';
import { getPendingUsers, getUserCompanies, approveUser } from '../../api/userApi';
import { getCurrentSubscription } from '../../api/subscriptionApi';
import { getTotalAvailableAmount } from '../../api/creditApi';
import { STATUS_KOREAN } from '../../constants/status';
import * as S from './style';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import CompanyRegistrationModal from '../../components/CompanyRegistrationModal/CompanyRegistrationModal';
import UserDashboardSection from '../../components/DashboardSections/UserDashboardSection';
import AccountantDashboardSection from '../../components/DashboardSections/AccountantDashboardSection';
import TaxAccountantDashboardSection from '../../components/DashboardSections/TaxAccountantDashboardSection';
import AdminDashboardSection from '../../components/DashboardSections/AdminDashboardSection';
import CEODashboardSection from '../../components/DashboardSections/CEODashboardSection';
import { FaBell, FaUser, FaSignOutAlt, FaBuilding, FaChevronDown, FaCheck, FaCog, FaTimesCircle, FaList, FaPlus, FaChartLine, FaEye, FaChevronUp } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const MainDashboardPage = () => {
  const { user, logout, companies, switchCompany } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalAmount: 0,
    waitCount: 0,
    rejectedCount: 0,
    approvedCount: 0,
    paidCount: 0
  });
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isManagementDropdownOpen, setIsManagementDropdownOpen] = useState(false);
  const checkedCompanyModalRef = useRef(false);
  const [selectedStatus, setSelectedStatus] = useState(null); // 선택된 상태
  const [statusExpenses, setStatusExpenses] = useState([]); // 선택된 상태의 결의서 목록
  const [loadingStatusExpenses, setLoadingStatusExpenses] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' 또는 'detailed'
  const [subscription, setSubscription] = useState(null);
  const [totalCredit, setTotalCredit] = useState(0);
  
  // 기간 필터 (기본값: 전체 기간)
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  });

  const handleLogout = async () => {
    navigate('/');
    await logout();
  };

  // 대시보드 데이터 로드
  useEffect(() => {
    if (!user) return;
    
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // 일반 사용자는 자신이 작성한 글만 조회
        const filterParams = {
          ...filters,
          drafterName: user.role === 'USER' ? user.koreanName : ''
        };
        
        const response = await fetchExpenseList(1, 1000, filterParams); // 큰 수로 설정하여 모든 데이터 조회
        
        if (response.success && response.data) {
          const expenses = response.data.content || [];
          
          // 일반 사용자는 자신이 작성한 글만 필터링 (이중 체크)
          const filteredExpenses = user.role === 'USER' 
            ? expenses.filter(exp => exp.drafterId === user.userId)
            : expenses;
          
          // 통계 계산
          const totalAmount = filteredExpenses.reduce((sum, exp) => sum + (exp.totalAmount || 0), 0);
          const waitCount = filteredExpenses.filter(exp => exp.status === 'WAIT').length;
          const rejectedCount = filteredExpenses.filter(exp => exp.status === 'REJECTED').length;
          const approvedCount = filteredExpenses.filter(exp => exp.status === 'APPROVED').length;
          const paidCount = filteredExpenses.filter(exp => exp.status === 'PAID').length;
          
          setStats({
            totalAmount,
            waitCount,
            rejectedCount,
            approvedCount,
            paidCount
          });
        }
      } catch (error) {
        console.error('대시보드 데이터 로드 실패:', error);
        alert('대시보드 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [user, filters]);

  // 미서명 건 조회 (알람)
  useEffect(() => {
    if (user?.userId) {
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
  }, [user?.userId]);

  // 승인 대기 사용자 조회 (CEO, ADMIN만)
  useEffect(() => {
    if (user && (user.role === 'CEO' || user.role === 'ADMIN')) {
      getPendingUsers()
        .then((response) => {
          if (response.success) {
            setPendingUsers(response.data || []);
          } else {
            console.error('승인 대기 사용자 조회 실패:', response.message);
            setPendingUsers([]);
          }
        })
        .catch((error) => {
          console.error('승인 대기 사용자 조회 실패:', error);
          setPendingUsers([]);
        });
    }
  }, [user?.userId]);

  // 구독 및 크레딧 정보 로드
  useEffect(() => {
    const loadCommonData = async () => {
      try {
        const [subscriptionRes, creditRes] = await Promise.all([
          getCurrentSubscription().catch(() => ({ success: false, data: null })),
          getTotalAvailableAmount().catch(() => ({ success: false, data: null }))
        ]);

        if (subscriptionRes.success && subscriptionRes.data) {
          setSubscription(subscriptionRes.data);
        }
        if (creditRes.success && creditRes.data) {
          setTotalCredit(creditRes.data.totalAmount || 0);
        }
      } catch (err) {
        console.error('공통 데이터 로드 실패:', err);
      }
    };

    if (user) {
      loadCommonData();
    }
  }, [user]);

  // CEO이고 회사가 하나도 없으면 회사 등록 여부를 먼저 확인 후 모달 표시
  useEffect(() => {
    if (user && user.role === 'CEO' && !checkedCompanyModalRef.current) {
      checkedCompanyModalRef.current = true;

      (async () => {
        try {
          const companiesRes = await getUserCompanies();
          const hasNoCompanies =
            !companiesRes.success || !companiesRes.data || companiesRes.data.length === 0;

          if (hasNoCompanies) {
            const shouldOpen = window.confirm(
              '등록된 회사가 없습니다.\n지금 회사를 등록하시겠습니까?'
            );

            if (shouldOpen) {
              setIsCompanyModalOpen(true);
            }
          }
        } catch (error) {
          console.error('회사 목록 조회 실패:', error);
          const shouldOpen = window.confirm(
            '회사 정보를 불러오지 못했습니다.\n지금 새 회사를 등록하시겠습니까?'
          );
          if (shouldOpen) {
            setIsCompanyModalOpen(true);
          }
        }
      })();
    }
  }, [user?.userId]);

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

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 통계 카드 클릭 핸들러 - 해당 상태의 결의서 목록 로드
  const handleStatCardClick = async (status) => {
    // 같은 상태를 다시 클릭하면 닫기
    if (selectedStatus === status) {
      setSelectedStatus(null);
      setStatusExpenses([]);
      return;
    }

    setSelectedStatus(status);
    setLoadingStatusExpenses(true);

    try {
      // 일반 사용자는 자신이 작성한 글만 조회
      const filterParams = {
        ...filters,
        status: [status],
        drafterName: user.role === 'USER' ? user.koreanName : ''
      };

      const response = await fetchExpenseList(1, 100, filterParams);
      
      if (response.success && response.data) {
        const expenses = response.data.content || [];
        
        // 일반 사용자는 자신이 작성한 글만 필터링 (이중 체크)
        const filteredExpenses = user.role === 'USER' 
          ? expenses.filter(exp => exp.drafterId === user.userId)
          : expenses;
        
        setStatusExpenses(filteredExpenses);
      } else {
        setStatusExpenses([]);
      }
    } catch (error) {
      console.error('결의서 목록 로드 실패:', error);
      setStatusExpenses([]);
    } finally {
      setLoadingStatusExpenses(false);
    }
  };

  if (!user) {
    return (
      <S.Container>
        <S.Alert>로그인이 필요합니다.</S.Alert>
        <S.Button onClick={() => navigate('/')}>로그인 페이지로 이동</S.Button>
      </S.Container>
    );
  }

  if (loading) {
    return <LoadingOverlay fullScreen={true} message="로딩 중..." />;
  }

  return (
    <S.Container>
      <S.Header data-tourid="tour-header">
        <S.HeaderLeft>
          <S.Title>대시보드</S.Title>
          <S.WelcomeText>환영합니다, {user.koreanName}님</S.WelcomeText>
        </S.HeaderLeft>
        <S.HeaderRight>
          {pendingApprovals.length > 0 && (
            <S.NotificationBadge 
              data-tourid="tour-notification-badge"
              onClick={() => setIsNotificationModalOpen(true)}
              title={`서명 대기: ${pendingApprovals.length}건`}
            >
              <FaBell />
              <S.NotificationCount>{pendingApprovals.length}</S.NotificationCount>
            </S.NotificationBadge>
          )}
          {/* 승인 대기 배지 (CEO, ADMIN만 표시) */}
          {(user?.role === 'CEO' || user?.role === 'ADMIN') && pendingUsers.length > 0 && (
            <S.NotificationBadge 
              onClick={() => setIsApprovalModalOpen(true)}
              title={`승인 대기: ${pendingUsers.length}건`}
              style={{ backgroundColor: '#4caf50', marginRight: '12px' }}
            >
              <FaUser />
              <S.NotificationCount>{pendingUsers.length}</S.NotificationCount>
            </S.NotificationBadge>
          )}
          {/* 결의서 목록으로 이동 버튼 - 모든 사용자에게 표시 */}
          <S.FilterButton 
            variant="secondary" 
            onClick={() => navigate('/expenses')}
            title="결의서 목록으로 이동"
          >
            <FaList />
            <span>결의서 목록</span>
          </S.FilterButton>
          {user?.role === 'TAX_ACCOUNTANT' && (
            <S.FilterButton 
              variant="primary" 
              onClick={() => navigate('/tax/summary')}
            >
              <span>세무사 요약</span>
            </S.FilterButton>
          )}
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
          <S.ProfileButton onClick={() => navigate('/profile')}>
            <FaUser />
            <span>내 정보</span>
          </S.ProfileButton>
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
                <S.ManagementMenuItem onClick={() => { navigate('/signatures'); setIsManagementDropdownOpen(false); }}>
                  ✍️ 도장/서명 관리
                </S.ManagementMenuItem>
                <S.ManagementMenuItem onClick={() => { navigate('/cards'); setIsManagementDropdownOpen(false); }}>
                  💳 카드 관리
                </S.ManagementMenuItem>
                <S.ManagementMenuItem onClick={() => { navigate('/my-approvers'); setIsManagementDropdownOpen(false); }}>
                  👤 담당 결재자 설정
                </S.ManagementMenuItem>
                {(user?.role === 'ADMIN' || user?.role === 'CEO') && (
                  <S.ManagementMenuItem onClick={() => { navigate('/subscriptions/manage'); setIsManagementDropdownOpen(false); }}>
                    📦 구독 관리
                  </S.ManagementMenuItem>
                )}
              </S.ManagementMenu>
            )}
          </S.ManagementDropdown>
          <S.LogoutButton onClick={handleLogout}>
            <FaSignOutAlt />
            <span>로그아웃</span>
          </S.LogoutButton>
        </S.HeaderRight>
      </S.Header>

      {/* 탭 버튼 */}
      <S.TabSection>
        <S.TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
          개요
        </S.TabButton>
        <S.TabButton active={activeTab === 'detailed'} onClick={() => setActiveTab('detailed')}>
          상세 분석
        </S.TabButton>
      </S.TabSection>

      {/* 기간 필터 */}
      <S.FilterSection>
        <S.FilterGroup>
          <S.FilterLabel>시작일</S.FilterLabel>
          <S.FilterInput
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
          />
        </S.FilterGroup>
        <S.FilterGroup>
          <S.FilterLabel>종료일</S.FilterLabel>
          <S.FilterInput
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
          />
        </S.FilterGroup>
      </S.FilterSection>

      {/* 구독 및 크레딧 카드 */}
      {(subscription || totalCredit > 0) && (
        <S.InfoCardsSection>
          {subscription && (
            <S.SubscriptionCard onClick={() => navigate('/subscriptions/manage')}>
              <S.SubscriptionCardHeader>
                <S.SubscriptionCardTitle>구독 상태</S.SubscriptionCardTitle>
                {subscription.status === 'ACTIVE' && (
                  <S.SubscriptionStatusBadge status={subscription.status}>활성</S.SubscriptionStatusBadge>
                )}
              </S.SubscriptionCardHeader>
              <S.SubscriptionPlanName>{subscription.plan?.planName || '알 수 없음'} 플랜</S.SubscriptionPlanName>
              {subscription.endDate && (
                <S.SubscriptionExpiry>
                  <S.SubscriptionExpiryLabel>만료일:</S.SubscriptionExpiryLabel>
                  <S.SubscriptionExpiryDate>{subscription.endDate}</S.SubscriptionExpiryDate>
                </S.SubscriptionExpiry>
              )}
              <S.SubscriptionCardFooter>구독 관리로 이동 →</S.SubscriptionCardFooter>
            </S.SubscriptionCard>
          )}
          {totalCredit > 0 && (
            <S.CreditCard onClick={() => navigate('/credits')}>
              <S.CreditCardHeader>
                <S.CreditCardTitle>사용 가능한 크레딧</S.CreditCardTitle>
              </S.CreditCardHeader>
              <S.CreditAmount>{totalCredit.toLocaleString()}원</S.CreditAmount>
              <S.CreditCardFooter>크레딧 내역 보기 →</S.CreditCardFooter>
            </S.CreditCard>
          )}
        </S.InfoCardsSection>
      )}

      {/* 개요 탭 */}
      {activeTab === 'overview' && (
        <>
          {/* 통계 카드 */}
          <S.StatsGrid>
        <S.StatCard>
          <S.StatLabel>합계 금액</S.StatLabel>
          <S.StatValue>{stats.totalAmount.toLocaleString()}원</S.StatValue>
        </S.StatCard>
        
        <S.StatCard 
          status="wait" 
          onClick={() => handleStatCardClick('WAIT')}
          style={{ cursor: 'pointer' }}
          title="대기 상태 결의서 보기"
          selected={selectedStatus === 'WAIT'}
        >
          <S.StatLabel>대기</S.StatLabel>
          <S.StatValue>{stats.waitCount}건</S.StatValue>
          {selectedStatus === 'WAIT' && <FaChevronUp style={{ marginTop: '8px', fontSize: '14px', opacity: 0.7 }} />}
        </S.StatCard>
        
        <S.StatCard 
          status="rejected" 
          onClick={() => handleStatCardClick('REJECTED')}
          style={{ cursor: 'pointer' }}
          title="반려 상태 결의서 보기"
          selected={selectedStatus === 'REJECTED'}
        >
          <S.StatLabel>반려</S.StatLabel>
          <S.StatValue>{stats.rejectedCount}건</S.StatValue>
          {selectedStatus === 'REJECTED' && <FaChevronUp style={{ marginTop: '8px', fontSize: '14px', opacity: 0.7 }} />}
        </S.StatCard>
        
        <S.StatCard 
          status="approved" 
          onClick={() => handleStatCardClick('APPROVED')}
          style={{ cursor: 'pointer' }}
          title="승인 상태 결의서 보기"
          selected={selectedStatus === 'APPROVED'}
        >
          <S.StatLabel>승인</S.StatLabel>
          <S.StatValue>{stats.approvedCount}건</S.StatValue>
          {selectedStatus === 'APPROVED' && <FaChevronUp style={{ marginTop: '8px', fontSize: '14px', opacity: 0.7 }} />}
        </S.StatCard>
        
        <S.StatCard 
          status="paid" 
          onClick={() => handleStatCardClick('PAID')}
          style={{ cursor: 'pointer' }}
          title="지출완료 상태 결의서 보기"
          selected={selectedStatus === 'PAID'}
        >
          <S.StatLabel>지출완료</S.StatLabel>
          <S.StatValue>{stats.paidCount}건</S.StatValue>
          {selectedStatus === 'PAID' && <FaChevronUp style={{ marginTop: '8px', fontSize: '14px', opacity: 0.7 }} />}
        </S.StatCard>
      </S.StatsGrid>

      {/* 선택된 상태의 결의서 목록 */}
      {selectedStatus && (
        <S.StatusExpenseSection>
          <S.StatusExpenseHeader>
            <S.StatusExpenseTitle>
              {STATUS_KOREAN[selectedStatus]} 상태 결의서 ({statusExpenses.length}건)
            </S.StatusExpenseTitle>
            <S.ViewAllButton onClick={() => {
              const params = new URLSearchParams();
              params.append('status', selectedStatus);
              if (filters.startDate) params.append('startDate', filters.startDate);
              if (filters.endDate) params.append('endDate', filters.endDate);
              navigate(`/expenses?${params.toString()}`);
            }}>
              전체 보기
            </S.ViewAllButton>
          </S.StatusExpenseHeader>
          
          {loadingStatusExpenses ? (
            <S.LoadingMessage>로딩 중...</S.LoadingMessage>
          ) : statusExpenses.length === 0 ? (
            <S.EmptyMessage>해당 상태의 결의서가 없습니다.</S.EmptyMessage>
          ) : (
            <S.ExpenseListContainer>
              {statusExpenses.slice(0, 10).map((item) => {
                // 지급 요청일 계산
                const paymentReqDate = item.details && item.details.length > 0
                  ? item.details
                      .map(d => d.paymentReqDate)
                      .filter(d => d)
                      .sort()[0] || item.paymentReqDate || item.reportDate
                  : item.paymentReqDate || item.reportDate;
                
                // 적요(내용) 표시
                const descriptionDisplay = (item.summaryDescription && item.summaryDescription.trim() !== '') 
                  ? item.summaryDescription 
                  : (item.firstDescription && item.firstDescription.trim() !== '') 
                    ? item.firstDescription 
                    : '-';
                
                return (
                  <S.ExpenseListItem key={item.expenseReportId}>
                    <S.ExpenseListItemLink to={`/detail/${item.expenseReportId}`}>
                      <S.ExpenseListItemDate>{paymentReqDate}</S.ExpenseListItemDate>
                      <S.ExpenseListItemContent>
                        <S.ExpenseListItemTitle>
                          {descriptionDisplay}
                          {item.isSecret && <S.SecretBadge>비밀</S.SecretBadge>}
                        </S.ExpenseListItemTitle>
                        <S.ExpenseListItemMeta>
                          <span>{item.drafterName}</span>
                          <span>{item.totalAmount.toLocaleString()}원</span>
                        </S.ExpenseListItemMeta>
                      </S.ExpenseListItemContent>
                      <S.ExpenseListItemAction>
                        <FaEye />
                      </S.ExpenseListItemAction>
                    </S.ExpenseListItemLink>
                  </S.ExpenseListItem>
                );
              })}
              {statusExpenses.length > 10 && (
                <S.ViewMoreButton onClick={() => {
                  const params = new URLSearchParams();
                  params.append('status', selectedStatus);
                  if (filters.startDate) params.append('startDate', filters.startDate);
                  if (filters.endDate) params.append('endDate', filters.endDate);
                  navigate(`/expenses?${params.toString()}`);
                }}>
                  더 보기 ({statusExpenses.length - 10}건 더)
                </S.ViewMoreButton>
              )}
            </S.ExpenseListContainer>
          )}
        </S.StatusExpenseSection>
      )}

          {/* 빠른 액션 */}
          <S.ActionSection>
            <S.ActionButton onClick={() => navigate('/expenses/create')}>
              <FaPlus />
              <span>새 결의서 작성</span>
            </S.ActionButton>
            <S.ActionButton onClick={() => navigate('/expenses')} variant="secondary">
              <FaList />
              <span>결의서 목록</span>
            </S.ActionButton>
          </S.ActionSection>
        </>
      )}

      {/* 상세 분석 탭 - 권한별 섹션 */}
      {activeTab === 'detailed' && (
        <>
          {user?.role === 'USER' && <UserDashboardSection filters={filters} />}
          {user?.role === 'ACCOUNTANT' && <AccountantDashboardSection filters={filters} />}
          {user?.role === 'TAX_ACCOUNTANT' && <TaxAccountantDashboardSection filters={filters} />}
          {user?.role === 'ADMIN' && <AdminDashboardSection filters={filters} />}
          {user?.role === 'CEO' && <CEODashboardSection filters={filters} />}
        </>
      )}

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

      {/* CEO이면서 소속 회사가 없을 때 회사 등록 모달 */}
      <CompanyRegistrationModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onSuccess={() => {
          window.location.reload();
        }}
      />
    </S.Container>
  );
};

export default MainDashboardPage;

