import { useEffect, useState } from 'react';
import { fetchExpenseList, deleteExpense, fetchPendingApprovals } from '../../api/expenseApi';
import * as S from './style';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaPlus, FaSignOutAlt, FaTrash, FaEye, FaBell, FaChevronLeft, FaChevronRight, FaFilter, FaTimes, FaUser } from 'react-icons/fa';
import { STATUS_KOREAN, EXPENSE_STATUS } from '../../constants/status';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';

const ExpenseListPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deletingExpenseId, setDeletingExpenseId] = useState(null);
  
  // 필터 상태
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    status: [],
    category: '',
    taxProcessed: null, // null: 전체, true: 완료, false: 미완료
    isSecret: null // null: 전체, true: 비밀글만, false: 일반글만
  });

  const pageSize = 10;
  const navigate = useNavigate(); // 페이지 이동 훅
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    navigate('/');  // 먼저 로그인 페이지로 이동
    await logout();  // 그 다음 로그아웃 처리
  };

  // 삭제 권한 체크 함수 (작성자 본인, ADMIN, 또는 ACCOUNTANT만 삭제 가능)
  const canDeleteExpense = (expense) => {
    if (!user) return false;

    // 작성자 본인인 경우
    if (expense.drafterId === user.userId) return true;

    // ADMIN 권한인 경우
    if (user.role === 'ADMIN') return true;

    // ACCOUNTANT 권한인 경우
    if (user.role === 'ACCOUNTANT') return true;

    return false;
  };

  // 목록 조회 함수
  const loadExpenseList = async (page = 1, filterParams = filters) => {
    try {
      setLoading(true);
      const response = await fetchExpenseList(page, pageSize, filterParams);
      if (response.success && response.data) {
        setList(response.data.content || []);
        setCurrentPage(response.data.page || 1);
        setTotalPages(response.data.totalPages || 1);
        setTotalElements(response.data.totalElements || 0);
      }
      setLoading(false);
    } catch (error) {
      console.error('목록 조회 실패:', error);
      setLoading(false);
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      loadExpenseList(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 필터 상태 변경 핸들러
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 상태 체크박스 변경 핸들러
  const handleStatusChange = (status) => {
    setFilters(prev => {
      const statusList = prev.status || [];
      if (statusList.includes(status)) {
        return {
          ...prev,
          status: statusList.filter(s => s !== status)
        };
      } else {
        return {
          ...prev,
          status: [...statusList, status]
        };
      }
    });
  };

  // 필터 적용 핸들러
  const handleApplyFilters = () => {
    setCurrentPage(1);
    loadExpenseList(1, filters);
    setIsFilterOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 필터 초기화 핸들러
  const handleResetFilters = () => {
    const emptyFilters = {
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      status: [],
      category: '',
      taxProcessed: null,
      isSecret: null
    };
    setFilters(emptyFilters);
    setCurrentPage(1);
    loadExpenseList(1, emptyFilters);
    setIsFilterOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 페이지 번호 배열 생성 (최대 5개 표시)
  const getPageNumbers = () => {
    const pages = [];
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  // 삭제 핸들러
  const handleDeleteExpense = async (expenseId) => {
    if (deletingExpenseId === expenseId) return;
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!window.confirm('정말로 이 지출결의서를 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.')) {
      return;
    }

    try {
      setDeletingExpenseId(expenseId);
      const response = await deleteExpense(expenseId, user.userId);
      if (response.success) {
        alert('지출결의서가 삭제되었습니다.');
        // 현재 페이지의 아이템이 모두 삭제되어 빈 페이지가 되면 이전 페이지로 이동
        if (list.length === 1 && currentPage > 1) {
          loadExpenseList(currentPage - 1);
        } else {
          // 목록 새로고침 (현재 페이지 유지)
          loadExpenseList(currentPage);
        }
      } else {
        alert('삭제 실패: ' + response.message);
      }
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setDeletingExpenseId(null);
    }
  };

  useEffect(() => {
    loadExpenseList(1);

    // 미서명 건 조회 (알람)
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
  }, [user]);

  if (loading) return <LoadingOverlay fullScreen={true} message="로딩 중..." />;

  return (
    <S.Container>
      <S.Header>
        <S.HeaderLeft>
          <S.Title>지출결의서 목록</S.Title>
          <S.WelcomeText>환영합니다, {user?.koreanName}님</S.WelcomeText>
        </S.HeaderLeft>
        <S.HeaderRight>
          {pendingApprovals.length > 0 && (
            <S.NotificationBadge 
              onClick={() => setIsNotificationModalOpen(true)}
              title={`서명 대기: ${pendingApprovals.length}건`}
            >
              <FaBell />
              <S.NotificationCount>{pendingApprovals.length}</S.NotificationCount>
            </S.NotificationBadge>
          )}
          {(user?.role === 'ADMIN' || user?.role === 'ACCOUNTANT') && (
            <S.FilterButton 
              variant="primary" 
              onClick={() => navigate('/dashboard')}
            >
              <span>대시보드</span>
            </S.FilterButton>
          )}
          {user?.role === 'TAX_ACCOUNTANT' && (
            <S.FilterButton 
              variant="primary" 
              onClick={() => navigate('/tax/summary')}
            >
              <span>세무사 요약</span>
            </S.FilterButton>
          )}
          <S.ProfileButton onClick={() => navigate('/profile')}>
            <FaUser />
            <span>내 정보</span>
          </S.ProfileButton>
          {user?.role === 'SUPERADMIN' && (
            <S.AdminButton onClick={() => navigate('/users')}>
              사용자 관리
            </S.AdminButton>
          )}
          <S.LogoutButton onClick={handleLogout}>
            <FaSignOutAlt />
            <span>로그아웃</span>
          </S.LogoutButton>
        </S.HeaderRight>
      </S.Header>

      <S.ActionBar>
        <S.CreateButton onClick={() => navigate('/expenses/create')}>
          <FaPlus />
          <span>새 결의서 작성</span>
        </S.CreateButton>
        <S.FilterButton 
          variant="secondary" 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <FaFilter />
          <span>필터</span>
        </S.FilterButton>
      </S.ActionBar>

      {/* 필터 UI */}
      {isFilterOpen && (
        <S.FilterContainer>
          <S.FilterTitle>
            <FaFilter />
            필터 조건
          </S.FilterTitle>
          <S.FilterGrid>
            <S.FilterGroup>
              <S.FilterLabel>작성일 시작일</S.FilterLabel>
              <S.FilterInput
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </S.FilterGroup>
            <S.FilterGroup>
              <S.FilterLabel>작성일 종료일</S.FilterLabel>
              <S.FilterInput
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                min={filters.startDate || undefined}
              />
            </S.FilterGroup>
            <S.FilterGroup>
              <S.FilterLabel>최소 금액 (원)</S.FilterLabel>
              <S.FilterInput
                type="number"
                placeholder="0"
                value={filters.minAmount}
                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                min="0"
              />
            </S.FilterGroup>
            <S.FilterGroup>
              <S.FilterLabel>최대 금액 (원)</S.FilterLabel>
              <S.FilterInput
                type="number"
                placeholder="무제한"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                min={filters.minAmount || 0}
              />
            </S.FilterGroup>
            <S.FilterGroup>
              <S.FilterLabel>카테고리</S.FilterLabel>
              <S.FilterSelect
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">전체</option>
                <option value="식대">식대</option>
                <option value="교통비">교통비</option>
                <option value="비품비">비품비</option>
                <option value="기타">기타</option>
              </S.FilterSelect>
            </S.FilterGroup>
            {/* 세무처리 필터 (USER 역할이 아닌 경우에만 표시) */}
            {user && user.role !== 'USER' && (
              <S.FilterGroup>
                <S.FilterLabel>세무처리</S.FilterLabel>
                <S.FilterSelect
                  value={filters.taxProcessed === null ? '' : filters.taxProcessed ? 'true' : 'false'}
                  onChange={(e) => {
                    const value = e.target.value === '' ? null : e.target.value === 'true';
                    handleFilterChange('taxProcessed', value);
                  }}
                >
                  <option value="">전체</option>
                  <option value="true">완료</option>
                  <option value="false">미완료</option>
                </S.FilterSelect>
              </S.FilterGroup>
            )}
            {/* 비밀글 필터 (USER 역할이 아닌 경우에만 표시) */}
            {user && user.role !== 'USER' && (
              <S.FilterGroup>
                <S.FilterLabel>비밀글</S.FilterLabel>
                <S.FilterSelect
                  value={filters.isSecret === null ? '' : filters.isSecret ? 'true' : 'false'}
                  onChange={(e) => {
                    const value = e.target.value === '' ? null : e.target.value === 'true';
                    handleFilterChange('isSecret', value);
                  }}
                >
                  <option value="">전체</option>
                  <option value="true">비밀글만</option>
                  <option value="false">일반글만</option>
                </S.FilterSelect>
              </S.FilterGroup>
            )}
          </S.FilterGrid>
          <S.FilterGroup>
            <S.FilterLabel>상태</S.FilterLabel>
            <S.StatusCheckboxGroup>
              {Object.entries(STATUS_KOREAN).map(([status, label]) => {
                // DRAFT와 PENDING은 제외 (실제 사용되는 상태만 표시)
                if (status === 'DRAFT' || status === 'PENDING') return null;
                return (
                  <S.StatusCheckboxLabel key={status}>
                    <input
                      type="checkbox"
                      checked={filters.status.includes(status)}
                      onChange={() => handleStatusChange(status)}
                    />
                    <span>{label}</span>
                  </S.StatusCheckboxLabel>
                );
              })}
            </S.StatusCheckboxGroup>
          </S.FilterGroup>
          <S.FilterActions>
            <S.FilterButton variant="secondary" onClick={handleResetFilters}>
              <FaTimes />
              초기화
            </S.FilterButton>
            <S.FilterButton variant="primary" onClick={handleApplyFilters}>
              적용
            </S.FilterButton>
          </S.FilterActions>
        </S.FilterContainer>
      )}

      <S.TableContainer>
        <S.Table>
          <S.Thead>
            <tr>
              <th>번호</th>
              <th>제목</th>
              <th>작성자</th>
              <th>작성일</th>
              <th>금액</th>
              <th>상태</th>
              {user && user.role !== 'USER' && <th>세무처리</th>}
              <th>관리</th>
            </tr>
          </S.Thead>
          <tbody>
            {list.map((item) => (
              <S.Tr key={item.expenseReportId}>
                <td>{item.expenseReportId}</td>
                <S.TitleTd>
                  <S.StyledLink to={`/detail/${item.expenseReportId}`}>
                    {item.title}
                    {item.isSecret && (
                      <S.SecretBadge>비밀</S.SecretBadge>
                    )}
                  </S.StyledLink>
                </S.TitleTd>
                <td>{item.drafterName}</td>
                <td>{item.reportDate}</td>
                <td>{item.totalAmount.toLocaleString()}원</td>
                <td>
                  <S.StatusBadge status={item.status}>
                    {STATUS_KOREAN[item.status] || item.status}
                  </S.StatusBadge>
                </td>
                {user && user.role !== 'USER' && (
                  <td>
                    {item.taxProcessed !== null && item.taxProcessed !== undefined ? (
                      item.taxProcessed ? (
                        <span style={{ color: '#28a745', fontWeight: 'bold', fontSize: '0.9em' }}>
                          완료
                        </span>
                      ) : (
                        <span style={{ color: '#6c757d', fontSize: '0.9em' }}>
                          미완료
                        </span>
                      )
                    ) : (
                      <span style={{ color: '#6c757d', fontSize: '0.9em' }}>-</span>
                    )}
                  </td>
                )}
                <td>
                  <S.ActionButtons>
                    <S.ViewButton to={`/detail/${item.expenseReportId}`}>
                      <FaEye />
                    </S.ViewButton>
                    {canDeleteExpense(item) && (
                      <S.DeleteButton 
                        onClick={() => handleDeleteExpense(item.expenseReportId)}
                        disabled={deletingExpenseId === item.expenseReportId || deletingExpenseId !== null}
                        title={deletingExpenseId === item.expenseReportId ? '삭제 중...' : '삭제'}
                      >
                        <FaTrash />
                      </S.DeleteButton>
                    )}
                  </S.ActionButtons>
                </td>
              </S.Tr>
            ))}
          </tbody>
        </S.Table>
      </S.TableContainer>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <S.PaginationContainer>
          <S.PaginationInfo>
            전체 {totalElements}개 중 {((currentPage - 1) * pageSize + 1)}-{Math.min(currentPage * pageSize, totalElements)}개 표시
          </S.PaginationInfo>
          <S.Pagination>
            <S.PaginationButton
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FaChevronLeft />
            </S.PaginationButton>
            {getPageNumbers().map((pageNum) => (
              <S.PaginationButton
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                active={pageNum === currentPage}
              >
                {pageNum}
              </S.PaginationButton>
            ))}
            <S.PaginationButton
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <FaChevronRight />
            </S.PaginationButton>
          </S.Pagination>
        </S.PaginationContainer>
      )}

      {/* 모바일용 카드 뷰 */}
      <S.MobileCardContainer>
        {list.map((item) => (
          <S.ExpenseCard key={item.expenseReportId}>
            <S.CardHeader>
              <S.CardTitle>
                <S.StyledLink to={`/detail/${item.expenseReportId}`}>
                  {item.title}
                  {item.isSecret && (
                    <S.SecretBadge>비밀</S.SecretBadge>
                  )}
                </S.StyledLink>
              </S.CardTitle>
              <S.StatusBadge status={item.status}>
                {STATUS_KOREAN[item.status] || item.status}
              </S.StatusBadge>
            </S.CardHeader>

            <S.CardContent>
              <S.CardRow>
                <S.CardLabel>번호:</S.CardLabel>
                <S.CardValue>{item.expenseReportId}</S.CardValue>
              </S.CardRow>
              <S.CardRow>
                <S.CardLabel>작성자:</S.CardLabel>
                <S.CardValue>{item.drafterName}</S.CardValue>
              </S.CardRow>
              <S.CardRow>
                <S.CardLabel>작성일:</S.CardLabel>
                <S.CardValue>{item.reportDate}</S.CardValue>
              </S.CardRow>
              <S.CardRow>
                <S.CardLabel>금액:</S.CardLabel>
                <S.CardValue>{item.totalAmount.toLocaleString()}원</S.CardValue>
              </S.CardRow>
              {user && user.role !== 'USER' && (
                <S.CardRow>
                  <S.CardLabel>세무처리:</S.CardLabel>
                  <S.CardValue>
                    {item.taxProcessed !== null && item.taxProcessed !== undefined ? (
                      item.taxProcessed ? (
                        <span style={{ color: '#28a745', fontWeight: 'bold' }}>완료</span>
                      ) : (
                        <span style={{ color: '#6c757d' }}>미완료</span>
                      )
                    ) : (
                      <span style={{ color: '#6c757d' }}>-</span>
                    )}
                  </S.CardValue>
                </S.CardRow>
              )}
            </S.CardContent>

            <S.CardActions>
              <S.ViewButton to={`/detail/${item.expenseReportId}`}>
                <FaEye />
                <span>보기</span>
              </S.ViewButton>
              {canDeleteExpense(item) && (
                <S.DeleteButton 
                  onClick={() => handleDeleteExpense(item.expenseReportId)}
                  disabled={deletingExpenseId === item.expenseReportId || deletingExpenseId !== null}
                  title={deletingExpenseId === item.expenseReportId ? '삭제 중...' : '삭제'}
                >
                  <FaTrash />
                  <span>{deletingExpenseId === item.expenseReportId ? '삭제 중...' : '삭제'}</span>
                </S.DeleteButton>
              )}
            </S.CardActions>
          </S.ExpenseCard>
        ))}
      </S.MobileCardContainer>

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
                      <S.NotificationItemTitle>{item.title}</S.NotificationItemTitle>
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
    </S.Container>
  );
};

export default ExpenseListPage;