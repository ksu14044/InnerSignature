import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getDashboardSummary, 
  getAllUsersForSuperAdmin, 
  getAllCompanies, 
  getAllSubscriptions, 
  getAllPayments,
  updateCompanyStatus,
  getExpenseListForSuperAdmin,
  getExpenseDetailForSuperAdmin,
  downloadExpensesExcelForSuperAdmin
} from '../../api/superAdminApi';
import { FaSignOutAlt, FaUsers, FaBuilding, FaCreditCard, FaChartLine, FaFileInvoice, FaFileExcel } from 'react-icons/fa';
import { STATUS_KOREAN } from '../../constants/status';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import * as S from './style';

const SuperAdminDashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [expensePage, setExpensePage] = useState(1);
  const [expenseTotalPages, setExpenseTotalPages] = useState(1);
  const [expenseTotalElements, setExpenseTotalElements] = useState(0);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [expenseFilters, setExpenseFilters] = useState({
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    status: [],
    category: '',
    drafterName: ''
  });
  const [loading, setLoading] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [updatingCompanyId, setUpdatingCompanyId] = useState(null);
  const [subscriptionFilters, setSubscriptionFilters] = useState({
    companyId: '',
    status: '',
    planName: '',
  });

  const navigate = useNavigate();
  const { logout, user } = useAuth();

  useEffect(() => {
    if (!user || user.role !== 'SUPERADMIN') {
      alert('SUPERADMIN 권한이 필요합니다.');
      navigate('/expenses');
      return;
    }
    loadDashboardData();
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === 'expenses') {
      loadExpenses();
    }
  }, [activeTab, expensePage, selectedCompanyId, expenseFilters]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, usersRes, companiesRes, subscriptionsRes, paymentsRes, expensesRes] = await Promise.allSettled([
        getDashboardSummary(),
        getAllUsersForSuperAdmin(),
        getAllCompanies(),
        getAllSubscriptions(),
        getAllPayments(),
        // 초기 로드 시 지출결의서 총 개수만 조회 (page=1, size=1로 최소한의 데이터만 가져옴)
        getExpenseListForSuperAdmin({ page: 1, size: 1 })
      ]);

      // 각 응답 처리 (에러가 발생해도 다른 데이터는 로드)
      if (summaryRes.status === 'fulfilled' && summaryRes.value.success) {
        setSummary(summaryRes.value.data);
      }
      if (usersRes.status === 'fulfilled' && usersRes.value.success) {
        setUsers(usersRes.value.data || []);
      }
      if (companiesRes.status === 'fulfilled' && companiesRes.value.success) {
        setCompanies(companiesRes.value.data || []);
      }
      if (subscriptionsRes.status === 'fulfilled' && subscriptionsRes.value.success) {
        setSubscriptions(subscriptionsRes.value.data || []);
      }
      if (paymentsRes.status === 'fulfilled' && paymentsRes.value.success) {
        setPayments(paymentsRes.value.data || []);
      }
      // 지출결의서 총 개수 설정
      if (expensesRes.status === 'fulfilled' && expensesRes.value.success && expensesRes.value.data) {
        setExpenseTotalElements(expensesRes.value.data.totalElements || 0);
        setExpenseTotalPages(expensesRes.value.data.totalPages || 1);
      } else if (expensesRes.status === 'rejected') {
        console.error('지출결의서 개수 조회 실패:', expensesRes.reason);
        // 에러가 발생해도 기본값 유지 (0)
      }
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
      alert(error?.response?.data?.message || '데이터 로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadExpenses = async () => {
    try {
      setLoadingExpenses(true);
      const params = {
        page: expensePage,
        size: 20
      };
      
      if (selectedCompanyId) {
        params.companyId = selectedCompanyId;
      }
      if (expenseFilters.startDate) params.startDate = expenseFilters.startDate;
      if (expenseFilters.endDate) params.endDate = expenseFilters.endDate;
      if (expenseFilters.minAmount) params.minAmount = expenseFilters.minAmount;
      if (expenseFilters.maxAmount) params.maxAmount = expenseFilters.maxAmount;
      if (expenseFilters.status && expenseFilters.status.length > 0) {
        params.status = expenseFilters.status;
      }
      if (expenseFilters.category) params.category = expenseFilters.category;
      if (expenseFilters.drafterName) params.drafterName = expenseFilters.drafterName;

      const response = await getExpenseListForSuperAdmin(params);
      if (response.success && response.data) {
        setExpenses(response.data.content || []);
        setExpenseTotalPages(response.data.totalPages || 1);
        setExpenseTotalElements(response.data.totalElements || 0);
      }
    } catch (error) {
      console.error('지출결의서 목록 조회 실패:', error);
      alert(error?.response?.data?.message || '지출결의서 목록 조회 중 오류가 발생했습니다.');
    } finally {
      setLoadingExpenses(false);
    }
  };

  const handleExpenseFilterChange = (key, value) => {
    setExpenseFilters(prev => ({ ...prev, [key]: value }));
    setExpensePage(1); // 필터 변경 시 첫 페이지로
  };

  const handleExpenseFilterReset = () => {
    setExpenseFilters({
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      status: [],
      category: '',
      drafterName: ''
    });
    setSelectedCompanyId(null);
    setExpensePage(1);
  };

  const handleExpenseDetailClick = async (expenseReportId) => {
    try {
      const response = await getExpenseDetailForSuperAdmin(expenseReportId);
      if (response.success && response.data) {
        // 상세 페이지로 이동 (기존 상세 페이지 사용)
        navigate(`/detail/${expenseReportId}`);
      } else {
        alert(response.message || '상세 정보를 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('상세 조회 실패:', error);
      alert(error?.response?.data?.message || '상세 정보를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const handleExcelDownload = async () => {
    if (!selectedCompanyId) {
      alert('엑셀 다운로드를 하려면 회사를 선택해주세요.');
      return;
    }
    
    try {
      await downloadExpensesExcelForSuperAdmin(
        expenseFilters.startDate || null,
        expenseFilters.endDate || null,
        selectedCompanyId
      );
      alert('엑셀 다운로드가 시작됩니다.');
    } catch (error) {
      console.error('엑셀 다운로드 실패:', error);
      alert(error?.userMessage || error?.message || '엑셀 다운로드 중 오류가 발생했습니다.');
    }
  };

  const handleLogout = async () => {
    navigate('/');
    await logout();
  };

  const handleCompanyStatusToggle = async (companyId, currentStatus) => {
    if (!window.confirm(`회사 상태를 ${currentStatus ? '비활성화' : '활성화'}하시겠습니까?`)) {
      return;
    }

    try {
      setUpdatingCompanyId(companyId);
      const response = await updateCompanyStatus(companyId, !currentStatus);
      if (response.success) {
        alert('회사 상태가 변경되었습니다.');
        loadDashboardData();
      } else {
        alert(response.message || '상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('회사 상태 변경 실패:', error);
      alert(error?.response?.data?.message || '상태 변경 중 오류가 발생했습니다.');
    } finally {
      setUpdatingCompanyId(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount || 0);
  };

  const getCompanyDisplay = (companyId) => {
    const company = companies.find((c) => c.companyId === companyId);
    if (!company) return companyId || '-';
    return `${company.companyName} (${company.companyCode || '코드 없음'})`;
  };

  const filteredSubscriptions = subscriptions.filter((s) => {
    if (subscriptionFilters.companyId && s.companyId !== Number(subscriptionFilters.companyId)) {
      return false;
    }
    if (subscriptionFilters.status && s.status !== subscriptionFilters.status) {
      return false;
    }
    if (subscriptionFilters.planName && s.plan?.planName !== subscriptionFilters.planName) {
      return false;
    }
    return true;
  });

  const subscriptionPlanNames = Array.from(
    new Set(
      subscriptions
        .map((s) => s.plan?.planName)
        .filter((name) => !!name)
    )
  );

  if (!user || user.role !== 'SUPERADMIN') {
    return null;
  }

  if (loading) {
    return <LoadingOverlay fullScreen={true} message="로딩 중..." />;
  }

  return (
    <S.Container>
      <S.Header>
        <S.HeaderLeft>
          <S.Title>SUPERADMIN 대시보드</S.Title>
          <S.WelcomeText>{user.koreanName}님 환영합니다</S.WelcomeText>
        </S.HeaderLeft>
        <S.HeaderRight>
          <S.Button onClick={handleLogout}>
            <FaSignOutAlt /> 로그아웃
          </S.Button>
        </S.HeaderRight>
      </S.Header>

      <S.TabContainer>
        <S.Tab active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>
          <FaChartLine /> 대시보드
        </S.Tab>
        <S.Tab active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
          <FaUsers /> 사용자 ({users.length})
        </S.Tab>
        <S.Tab active={activeTab === 'companies'} onClick={() => setActiveTab('companies')}>
          <FaBuilding /> 회사 ({companies.length})
        </S.Tab>
        <S.Tab active={activeTab === 'subscriptions'} onClick={() => setActiveTab('subscriptions')}>
          <FaCreditCard /> 구독 ({subscriptions.length})
        </S.Tab>
        <S.Tab active={activeTab === 'payments'} onClick={() => setActiveTab('payments')}>
          <FaCreditCard /> 결제 ({payments.length})
        </S.Tab>
        <S.Tab active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')}>
          <FaFileInvoice /> 지출결의서 ({expenseTotalElements})
        </S.Tab>
      </S.TabContainer>

      {activeTab === 'dashboard' && summary && (
        <S.DashboardGrid>
          <S.StatCard>
            <S.StatIcon><FaUsers /></S.StatIcon>
            <S.StatContent>
              <S.StatLabel>전체 사용자</S.StatLabel>
              <S.StatValue>{summary.totalUsers}</S.StatValue>
              <S.StatSubtext>활성: {summary.activeUsers}</S.StatSubtext>
            </S.StatContent>
          </S.StatCard>

          <S.StatCard>
            <S.StatIcon><FaBuilding /></S.StatIcon>
            <S.StatContent>
              <S.StatLabel>전체 회사</S.StatLabel>
              <S.StatValue>{summary.totalCompanies}</S.StatValue>
              <S.StatSubtext>활성: {summary.activeCompanies}</S.StatSubtext>
            </S.StatContent>
          </S.StatCard>

          <S.StatCard>
            <S.StatIcon><FaCreditCard /></S.StatIcon>
            <S.StatContent>
              <S.StatLabel>활성 구독</S.StatLabel>
              <S.StatValue>{summary.activeSubscriptions}</S.StatValue>
            </S.StatContent>
          </S.StatCard>

          <S.StatCard>
            <S.StatIcon><FaChartLine /></S.StatIcon>
            <S.StatContent>
              <S.StatLabel>오늘 매출</S.StatLabel>
              <S.StatValue>{formatCurrency(summary.todayRevenue)}</S.StatValue>
            </S.StatContent>
          </S.StatCard>

          <S.StatCard>
            <S.StatIcon><FaChartLine /></S.StatIcon>
            <S.StatContent>
              <S.StatLabel>이번 달 매출</S.StatLabel>
              <S.StatValue>{formatCurrency(summary.monthRevenue)}</S.StatValue>
            </S.StatContent>
          </S.StatCard>
        </S.DashboardGrid>
      )}

      {activeTab === 'users' && (
        <S.Table>
          <thead>
            <tr>
              <th>ID</th>
              <th>아이디</th>
              <th>이름</th>
              <th>이메일</th>
              <th>권한</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.userId}>
                <td>{u.userId}</td>
                <td>{u.username}</td>
                <td>{u.koreanName}</td>
                <td>{u.email || '-'}</td>
                <td>{u.role}</td>
                <td>
                  <S.StatusBadge active={u.isActive}>
                    {u.isActive ? '활성' : '비활성'}
                  </S.StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </S.Table>
      )}

      {activeTab === 'companies' && (
        <S.Table>
          <thead>
            <tr>
              <th>ID</th>
              <th>회사명</th>
              <th>회사 코드</th>
              <th>상태</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.companyId}>
                <td>{c.companyId}</td>
                <td>{c.companyName}</td>
                <td>{c.companyCode}</td>
                <td>
                  <S.StatusBadge active={c.isActive}>
                    {c.isActive ? '활성' : '비활성'}
                  </S.StatusBadge>
                </td>
                <td>
                  <S.Button
                    onClick={() => handleCompanyStatusToggle(c.companyId, c.isActive)}
                    disabled={updatingCompanyId === c.companyId}
                  >
                    {c.isActive ? '비활성화' : '활성화'}
                  </S.Button>
                </td>
              </tr>
            ))}
          </tbody>
        </S.Table>
      )}

      {activeTab === 'subscriptions' && (
        <>
          <S.FilterSection>
            <S.FilterRow>
              <S.FilterGroup>
                <label>회사</label>
                <S.Select
                  value={subscriptionFilters.companyId}
                  onChange={(e) =>
                    setSubscriptionFilters((prev) => ({
                      ...prev,
                      companyId: e.target.value,
                    }))
                  }
                >
                  <option value="">전체</option>
                  {companies.map((c) => (
                    <option key={c.companyId} value={c.companyId}>
                      {c.companyName} ({c.companyCode || '코드 없음'})
                    </option>
                  ))}
                </S.Select>
              </S.FilterGroup>

              <S.FilterGroup>
                <label>플랜</label>
                <S.Select
                  value={subscriptionFilters.planName}
                  onChange={(e) =>
                    setSubscriptionFilters((prev) => ({
                      ...prev,
                      planName: e.target.value,
                    }))
                  }
                >
                  <option value="">전체</option>
                  {subscriptionPlanNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </S.Select>
              </S.FilterGroup>

              <S.FilterGroup>
                <label>상태</label>
                <S.Select
                  value={subscriptionFilters.status}
                  onChange={(e) =>
                    setSubscriptionFilters((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                >
                  <option value="">전체</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="EXPIRED">EXPIRED</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="TRIAL">TRIAL</option>
                </S.Select>
              </S.FilterGroup>

              <S.FilterGroup>
                <S.Button
                  onClick={() =>
                    setSubscriptionFilters({
                      companyId: '',
                      status: '',
                      planName: '',
                    })
                  }
                >
                  필터 초기화
                </S.Button>
              </S.FilterGroup>
            </S.FilterRow>
          </S.FilterSection>

          <S.Table>
            <thead>
              <tr>
                <th>ID</th>
                <th>회사</th>
                <th>플랜</th>
                <th>상태</th>
                <th>시작일</th>
                <th>종료일</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.map((s) => (
                <tr key={s.subscriptionId}>
                  <td>{s.subscriptionId}</td>
                  <td>{getCompanyDisplay(s.companyId)}</td>
                  <td>{s.plan?.planName || '-'}</td>
                  <td>
                    <S.StatusBadge active={s.status === 'ACTIVE'}>
                      {s.status}
                    </S.StatusBadge>
                  </td>
                  <td>{s.startDate ? new Date(s.startDate).toLocaleDateString() : '-'}</td>
                  <td>{s.endDate ? new Date(s.endDate).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </S.Table>
        </>
      )}

      {activeTab === 'payments' && (
        <S.Table>
          <thead>
            <tr>
              <th>ID</th>
              <th>구독 ID</th>
              <th>금액</th>
              <th>결제 방법</th>
              <th>상태</th>
              <th>결제일</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.paymentId}>
                <td>{p.paymentId}</td>
                <td>{p.subscriptionId}</td>
                <td>{formatCurrency(p.amount)}</td>
                <td>{p.paymentMethod || '-'}</td>
                <td>
                  <S.StatusBadge active={p.paymentStatus === 'COMPLETED'}>
                    {p.paymentStatus}
                  </S.StatusBadge>
                </td>
                <td>{p.paymentDate ? new Date(p.paymentDate).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </S.Table>
      )}

      {activeTab === 'expenses' && (
        <>
          <S.FilterSection>
            <S.FilterRow>
              <S.FilterGroup>
                <label>회사 선택</label>
                <S.Select
                  value={selectedCompanyId || ''}
                  onChange={(e) => {
                    const companyId = e.target.value ? Number(e.target.value) : null;
                    setSelectedCompanyId(companyId);
                    setExpensePage(1);
                  }}
                >
                  <option value="">전체 회사</option>
                  {companies.map((c) => (
                    <option key={c.companyId} value={c.companyId}>
                      {c.companyName}
                    </option>
                  ))}
                </S.Select>
              </S.FilterGroup>
              
              <S.FilterGroup>
                <label>시작일</label>
                <S.Input
                  type="date"
                  value={expenseFilters.startDate}
                  onChange={(e) => handleExpenseFilterChange('startDate', e.target.value)}
                />
              </S.FilterGroup>
              
              <S.FilterGroup>
                <label>종료일</label>
                <S.Input
                  type="date"
                  value={expenseFilters.endDate}
                  onChange={(e) => handleExpenseFilterChange('endDate', e.target.value)}
                />
              </S.FilterGroup>
              
              <S.FilterGroup>
                <label>작성자명</label>
                <S.Input
                  type="text"
                  placeholder="작성자명 검색"
                  value={expenseFilters.drafterName}
                  onChange={(e) => handleExpenseFilterChange('drafterName', e.target.value)}
                />
              </S.FilterGroup>
              
              <S.FilterGroup>
                <label>상태</label>
                <S.Select
                  value={expenseFilters.status[0] || ''}
                  onChange={(e) => {
                    const status = e.target.value ? [e.target.value] : [];
                    handleExpenseFilterChange('status', status);
                  }}
                >
                  <option value="">전체</option>
                  <option value="DRAFT">초안</option>
                  <option value="WAIT">대기</option>
                  <option value="APPROVED">승인</option>
                  <option value="REJECTED">반려</option>
                  <option value="PAID">지급완료</option>
                </S.Select>
              </S.FilterGroup>
              
              <S.FilterGroup>
                <S.Button onClick={handleExpenseFilterReset}>필터 초기화</S.Button>
                <S.Button onClick={handleExcelDownload}>
                  <FaFileExcel /> 엑셀 다운로드
                </S.Button>
              </S.FilterGroup>
            </S.FilterRow>
          </S.FilterSection>

          {loadingExpenses ? (
            <LoadingOverlay fullScreen={false} message="로딩 중..." />
          ) : (
            <>
              <S.Table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>회사명</th>
                    <th>제목</th>
                    <th>작성자</th>
                    <th>작성일</th>
                    <th>총액</th>
                    <th>상태</th>
                    <th>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.expenseReportId}>
                      <td>{expense.expenseReportId}</td>
                      <td>{expense.companyName || '-'}</td>
                      <td>
                        {expense.title}
                        {expense.isSecret && (
                          <S.SecretBadge>비밀</S.SecretBadge>
                        )}
                      </td>
                      <td>{expense.drafterName || '-'}</td>
                      <td>{expense.reportDate ? new Date(expense.reportDate).toLocaleDateString() : '-'}</td>
                      <td>{formatCurrency(expense.totalAmount)}</td>
                      <td>
                        <S.StatusBadge active={expense.status === 'PAID' || expense.status === 'APPROVED'}>
                          {STATUS_KOREAN[expense.status] || expense.status}
                        </S.StatusBadge>
                      </td>
                      <td>
                        <S.Button onClick={() => handleExpenseDetailClick(expense.expenseReportId)}>
                          상세보기
                        </S.Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </S.Table>
              
              {expenseTotalPages > 1 && (
                <S.Pagination>
                  <S.Button 
                    onClick={() => setExpensePage(p => Math.max(1, p - 1))}
                    disabled={expensePage === 1}
                  >
                    이전
                  </S.Button>
                  <span>페이지 {expensePage} / {expenseTotalPages} (전체 {expenseTotalElements}건)</span>
                  <S.Button 
                    onClick={() => setExpensePage(p => Math.min(expenseTotalPages, p + 1))}
                    disabled={expensePage === expenseTotalPages}
                  >
                    다음
                  </S.Button>
                </S.Pagination>
              )}
            </>
          )}
        </>
      )}
    </S.Container>
  );
};

export default SuperAdminDashboardPage;

