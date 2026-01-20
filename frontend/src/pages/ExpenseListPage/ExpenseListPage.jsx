import { useEffect, useState, useRef, useMemo, lazy, Suspense } from 'react';
import { deleteExpense, downloadTaxReviewList, fetchPendingApprovals, startTaxReviewExport, downloadTaxReviewFile, getExpenseCreationProgress } from '../../api/expenseApi';
import { getUserCompanies, getPendingUsers, approveUser } from '../../api/userApi';
import * as S from './style';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaPlus, FaFilter, FaTimes, FaFileExcel, FaCheck, FaTimesCircle, FaTrash } from 'react-icons/fa';
import { STATUS_KOREAN } from '../../constants/status';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';

// 커스텀 훅들
import { useExpenseFilters } from '../../hooks/useExpenseFilters';
import { useExpensePagination } from '../../hooks/useExpensePagination';
import { useExpenseModals } from '../../hooks/useExpenseModals';
import { useExpenseData } from '../../hooks/useExpenseData';

// 분리된 컴포넌트들
import ExpenseFilters from '../../components/ExpenseFilters/ExpenseFilters';
import ExpenseTable from '../../components/ExpenseTable/ExpenseTable';
import ExpensePagination from '../../components/ExpensePagination/ExpensePagination';

// Lazy load 모달 컴포넌트
const CompanyRegistrationModal = lazy(() => import('../../components/CompanyRegistrationModal/CompanyRegistrationModal'));

const ExpenseListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  // 상태 관리 훅들
  const filtersHook = useExpenseFilters();
  const paginationHook = useExpensePagination();
  const modalsHook = useExpenseModals();
  const dataHook = useExpenseData(user, filtersHook.filters, paginationHook);

  // 추가 상태들
  const [deletingExpenseId, setDeletingExpenseId] = useState(null);
  const [activeTab, setActiveTab] = useState('MY_REPORTS');
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingApprovalsLoading, setPendingApprovalsLoading] = useState(false);
  const checkedCompanyModalRef = useRef(false);
  const [isDownloadingTaxReview, setIsDownloadingTaxReview] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('세무 자료를 다운로드하는 중...');

  // 편의 변수들
  const { filters, setFilters, filterRefs, localStatus, handleStatusChange, handleApplyFilters, handleResetFilters, handleFilterToggle } = filtersHook;
  const { currentPage, setCurrentPage, totalPages, totalElements, handlePageChange } = paginationHook;
  const { modals, handlers } = modalsHook;
  const { data, actions } = dataHook;
  const { list, loading, myApprovedList, paymentPendingList, paymentPendingPage, paymentPendingTotalPages, paymentPendingTotalElements } = data;
  const { loadExpenseList, loadMyApprovedReports, loadPaymentPendingList } = actions;

  // 삭제 권한 체크 함수 (작성자 본인, CEO, ADMIN, 또는 ACCOUNTANT만 삭제 가능)
  const canDeleteExpense = (expense) => {
    if (!user) return false;

    // 작성자 본인이 아니면 삭제 불가
    if (expense.drafterId !== user.userId) return false;

    // WAIT 상태가 아니고 반려 상태가 아니면 삭제 불가
    if (expense.status !== 'WAIT' && expense.status !== 'REJECTED') return false;

    // 결재자 서명이 있으면 반려인 경우만 삭제 가능
    const hasAnyApprovalSignature = expense.approvalLines && expense.approvalLines.some(
      line => line.signatureData != null && line.signatureData.trim() !== ''
    );
    if (hasAnyApprovalSignature && expense.status !== 'REJECTED') return false;

    return true;
  };

  // 내가 쓴 글만 보기 토글 핸들러
  const handleMyPostsToggle = () => {
    const isMyPostsMode = filters.drafterName === user?.koreanName;
    const newFilters = {
      ...filters,
      drafterName: isMyPostsMode ? '' : (user?.koreanName || '')
    };
    filtersHook.setFilters(newFilters);
    paginationHook.handlePageChange(1, loadExpenseList);
  };

  // 필터 적용 핸들러들 (커스텀 훅에서 가져온 함수들을 래핑)
  const handleApplyFiltersWrapper = () => {
    handleApplyFilters(loadExpenseList);
    handlers.toggleFilter();
  };

  const handleResetFiltersWrapper = () => {
    handleResetFilters(loadExpenseList);
    handlers.toggleFilter();
  };

  const handleFilterToggleWrapper = () => {
    handleFilterToggle(modals.isFilterOpen);
    handlers.toggleFilter();
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

  // 세무 자료 다운로드 핸들러 (비동기 작업, 진행률 추적)
  const handleExportTaxReview = async () => {
    if (
      !user ||
      (user.role !== 'ACCOUNTANT' && user.role !== 'TAX_ACCOUNTANT')
    ) {
      alert('세무 자료 다운로드는 ACCOUNTANT 또는 TAX_ACCOUNTANT 권한만 가능합니다.');
      return;
    }

    try {
      setIsDownloadingTaxReview(true);
      setDownloadProgress(0);
      setProgressMessage('세무 자료 다운로드를 시작하는 중...');
      
      // 현재 필터 조건의 기간을 사용
      const startDate = filters.startDate || null;
      const endDate = filters.endDate || null;
      
      // 1. 작업 시작
      const startResponse = await startTaxReviewExport(startDate, endDate);
      if (!startResponse.success || !startResponse.data?.jobId) {
        throw new Error('작업 시작에 실패했습니다.');
      }
      
      const jobId = startResponse.data.jobId;
      
      // 2. 진행률 폴링
      const pollProgress = async () => {
        const maxAttempts = 120; // 최대 120번 시도 (약 60초)
        let attempts = 0;
        
        const interval = setInterval(async () => {
          try {
            attempts++;
            const progressResponse = await getExpenseCreationProgress(jobId);
            
            if (progressResponse.success && progressResponse.data) {
              const progress = progressResponse.data;
              
              // 진행률 업데이트
              setDownloadProgress(progress.percentage || 0);
              setProgressMessage(progress.message || '처리 중...');
              
              // 완료 또는 실패 시
              if (progress.completed) {
                clearInterval(interval);
                
                // 3. 파일 다운로드
                try {
                  await downloadTaxReviewFile(jobId, startDate, endDate);
                  
                  // 4. 성공창 표시
                  setDownloadProgress(100);
                  setProgressMessage('완료!');
                  
                  setTimeout(() => {
                    alert('✅ 세무 자료 다운로드가 완료되었습니다.');
                    setIsDownloadingTaxReview(false);
                    setDownloadProgress(0);
                  }, 500);
                } catch (downloadError) {
                  setIsDownloadingTaxReview(false);
                  setDownloadProgress(0);
                  alert(downloadError.userMessage || '파일 다운로드 중 오류가 발생했습니다.');
                }
              } else if (progress.failed) {
                clearInterval(interval);
                setIsDownloadingTaxReview(false);
                setDownloadProgress(0);
                alert(progress.errorMessage || '세무 자료 생성 중 오류가 발생했습니다.');
              }
            }
            
            // 최대 시도 횟수 초과
            if (attempts >= maxAttempts) {
              clearInterval(interval);
              setIsDownloadingTaxReview(false);
              setDownloadProgress(0);
              alert('작업 시간이 초과되었습니다. 다시 시도해주세요.');
            }
          } catch (error) {
            console.error('진행률 조회 실패:', error);
            // 에러가 발생해도 계속 시도 (네트워크 오류 등)
            if (attempts >= maxAttempts) {
              clearInterval(interval);
              setIsDownloadingTaxReview(false);
              setDownloadProgress(0);
              alert('진행률 조회 중 오류가 발생했습니다.');
            }
          }
        }, 500); // 0.5초마다 조회
      };
      
      // 폴링 시작
      pollProgress();
      
    } catch (error) {
      setIsDownloadingTaxReview(false);
      setDownloadProgress(0);
      alert(error.userMessage || error.message || '세무 자료 다운로드 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    // SUPERADMIN은 지출결의서 목록 페이지에 접근할 수 없도록 리다이렉트
    if (user?.role === 'SUPERADMIN') {
      navigate('/superadmin/dashboard');
      return;
    }

    // URL 파라미터에서 탭 및 필터 읽기 및 적용
    const tabParam = searchParams.get('tab');
    if (tabParam === 'MY_APPROVALS' || tabParam === 'MY_APPROVAL_HISTORY') {
      setActiveTab(tabParam);
    } else {
      setActiveTab('MY_REPORTS');
    }

    // URL 파라미터에서 필터 읽기 및 적용
    const statusParam = searchParams.get('status');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    
    if (statusParam || startDateParam || endDateParam) {
      const newFilters = {
        startDate: startDateParam || '',
        endDate: endDateParam || '',
        minAmount: '',
        maxAmount: '',
        status: statusParam ? [statusParam] : [],
        category: '',
        taxProcessed: null,
        drafterName: '',
        paymentMethod: ''
      };
      
      setFilters(newFilters);
      setCurrentPage(1);
      loadExpenseList(1, newFilters);
      
      // URL 파라미터 제거 (한 번만 적용되도록)
      const newSearchParams = new URLSearchParams(searchParams);
      if (statusParam) newSearchParams.delete('status');
      if (startDateParam) newSearchParams.delete('startDate');
      if (endDateParam) newSearchParams.delete('endDate');
      setSearchParams(newSearchParams, { replace: true });
    } else {
      // URL 파라미터가 없을 때 기본 로드
      loadExpenseList(1);
    }

    // 미서명 건 조회 (내 결재함용)
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

      // 내가 결재한 문서 이력 로드
      loadMyApprovedReports();

    }

    // CEO이고 회사가 하나도 없으면 회사 등록 여부를 먼저 확인 후 모달 표시
    if (user && user.role === 'CEO' && !checkedCompanyModalRef.current) {
      // StrictMode에서 useEffect가 두 번 호출되어도 한 번만 실행되도록 즉시 플래그 설정
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
              handlers.openCompanyModal(); // "예"일 때만 회사 등록 모달 표시
            }
          }
        } catch (error) {
          console.error('회사 목록 조회 실패:', error);
          // 조회 실패 시에도 안내 후 회사 등록 여부를 확인
          const shouldOpen = window.confirm(
            '회사 정보를 불러오지 못했습니다.\n지금 새 회사를 등록하시겠습니까?'
          );
          if (shouldOpen) {
            handlers.openCompanyModal();
          }
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]); // user 전체 대신 user?.userId만 사용

  // URL 파라미터로 알림 모달 열기
  useEffect(() => {
    const openNotifications = searchParams.get('openNotifications');
    const openApprovals = searchParams.get('openApprovals');
    // const openTaxRevisions = searchParams.get('openTaxRevisions');
    
    if (openNotifications === 'true') {
      handlers.openNotificationModal();
      // URL에서 파라미터 제거
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('openNotifications');
      setSearchParams(newSearchParams, { replace: true });
    }

    if (openApprovals === 'true') {
      handlers.openApprovalModal();
      // URL에서 파라미터 제거
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('openApprovals');
      setSearchParams(newSearchParams, { replace: true });
    }

  }, [searchParams, setSearchParams]);

  // 커스텀 이벤트로 모달 열기 (이미 expenses 페이지에 있을 때)
  useEffect(() => {
    const handleOpenNotificationModal = () => handlers.openNotificationModal();
    const handleOpenApprovalModal = () => handlers.openApprovalModal();

    window.addEventListener('openNotificationModal', handleOpenNotificationModal);
    window.addEventListener('openApprovalModal', handleOpenApprovalModal);

    return () => {
      window.removeEventListener('openNotificationModal', handleOpenNotificationModal);
      window.removeEventListener('openApprovalModal', handleOpenApprovalModal);
    };
  }, [handlers]);

  // 결재 대기 건 조회 (서명 대기)
  useEffect(() => {
    if (!user?.userId) {
      setPendingApprovals([]);
      setPendingApprovalsLoading(false);
      return;
    }

    setPendingApprovalsLoading(true);
    fetchPendingApprovals(user.userId)
      .then((response) => {
        if (response.success) {
          setPendingApprovals(response.data || []);
        } else {
          setPendingApprovals([]);
        }
      })
      .catch((error) => {
        console.error('결재 대기 건 조회 실패:', error);
        setPendingApprovals([]);
      })
      .finally(() => {
        setPendingApprovalsLoading(false);
      });
  }, [user?.userId]);

  // 승인 대기 사용자 조회 (CEO, ADMIN만)
  useEffect(() => {
    if (!user || (user.role !== 'CEO' && user.role !== 'ADMIN')) {
      setPendingUsers([]);
      return;
    }

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
  }, [user?.userId, user?.role]);

  // 승인 대기 사용자 조회 (CEO, ADMIN만)
  useEffect(() => {
    if (!user || (user.role !== 'CEO' && user.role !== 'ADMIN')) {
      setPendingUsers([]);
      return;
    }

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
  }, [user?.userId, user?.role]);

  // 세무 수정 요청 알림 데이터 로드 - 기능 비활성화됨
  // useEffect(() => {
  //   if (!user?.userId) {
  //     setTaxRevisionRequests([]);
  //     return;
  //   }

  //   fetchTaxRevisionRequestsForDrafter()
  //     .then((response) => {
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
  // }, [user?.userId]);

  // useMemo로 displayedList 메모이제이션 (Hook은 조건문 이전에 호출)
  const displayedList = useMemo(() => {
    switch (activeTab) {
      case 'MY_REPORTS':
        return list;
      case 'MY_APPROVALS':
        return pendingApprovals;
      default:
        // 'MY_APPROVAL_HISTORY' 포함
        return myApprovedList;
    }
  }, [activeTab, list, pendingApprovals, myApprovedList]);

  const isMyReportsTab = activeTab === 'MY_REPORTS';

  if (loading) return <LoadingOverlay fullScreen={true} message="로딩 중..." />;

  return (
    <S.Container>
      <S.ActionBar>
        <S.TabContainer>
          <S.TabButton
            type="button"
            active={isMyReportsTab}
            onClick={() => setActiveTab('MY_REPORTS')}
            aria-label="내 결의서"
          >
            지출 결의서
          </S.TabButton>
          <S.TabButton
            type="button"
            active={activeTab === 'MY_APPROVALS'}
            onClick={() => setActiveTab('MY_APPROVALS')}
            aria-label="내 결재함"
          >
            내 결재함
          </S.TabButton>
          <S.TabButton
            type="button"
            active={activeTab === 'MY_APPROVAL_HISTORY'}
            onClick={() => setActiveTab('MY_APPROVAL_HISTORY')}
            aria-label="내가 결재한 문서"
          >
            내가 결재한 문서
          </S.TabButton>
        </S.TabContainer>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {isMyReportsTab && (
            <>
              {user?.role !== 'TAX_ACCOUNTANT' && (
                <S.CreateButton onClick={() => navigate('/expenses/create')}>
                  <FaPlus />
                  <span>결의서 작성</span>
                </S.CreateButton>
              )}
              <S.ToggleContainer data-tourid="tour-my-posts-toggle">
                <S.ToggleLabel>
                  <S.ToggleSwitch
                    active={filters.drafterName === user?.koreanName}
                    onClick={handleMyPostsToggle}
                    role="switch"
                    aria-checked={filters.drafterName === user?.koreanName}
                    aria-label="내가 쓴 글만 보기"
                  />
                  <span>내가 쓴 글만 보기</span>
                </S.ToggleLabel>
              </S.ToggleContainer>
              <S.FilterButton
                data-tourid="tour-filter-button"
                variant={modals.isFilterOpen ? 'primary' : 'secondary'}
                onClick={handleFilterToggleWrapper}
                aria-label="필터"
                aria-pressed={modals.isFilterOpen}
              >
                <FaFilter />
                <span>필터</span>
              </S.FilterButton>
            </>
          )}
          {user && (user.role === 'ACCOUNTANT' || user.role === 'TAX_ACCOUNTANT') && (
            <S.ExportButton onClick={handleExportTaxReview} aria-label="세무 자료 다운로드">
              <FaFileExcel />
              <span>세무 자료 다운로드</span>
            </S.ExportButton>
          )}
        </div>
      </S.ActionBar>

      {/* 필터 UI */}
      {isMyReportsTab && (
        <ExpenseFilters
          isOpen={modals.isFilterOpen}
          filterRefs={filterRefs}
          localStatus={localStatus}
          onStatusChange={handleStatusChange}
          onApply={handleApplyFiltersWrapper}
          onReset={handleResetFiltersWrapper}
          onClose={handlers.toggleFilter}
        />
      )}

      <ExpenseTable
        expenses={displayedList}
        loading={loading}
      />

      {/* 페이지네이션 */}
      {isMyReportsTab && totalPages > 1 && (
        <ExpensePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={paginationHook.pageSize}
          onPageChange={(page) => handlePageChange(page, loadExpenseList)}
        />
      )}

      {/* 결제 대기 탭 페이지네이션 제거 (ACCOUNTANT 전용 탭 사용 중단) */}

      {/* 모바일용 카드 뷰 */}
      <S.MobileCardContainer>
        {displayedList.map((item) => {
          // 지급 요청일 계산
          const paymentReqDate = item.details && item.details.length > 0
            ? item.details
                .map(d => d.paymentReqDate)
                .filter(d => d)
                .sort()[0] || item.paymentReqDate || item.reportDate
            : item.paymentReqDate || item.reportDate;
          
          // 적요(내용) 표시
          const descriptionDisplay = item.details && item.details.length > 0
            ? item.details[0].description || '-'
            : '-';
          
          return (
            <S.ExpenseCard 
              key={item.expenseReportId}
              onClick={(e) => {
                // 버튼 클릭이 아닌 경우에만 상세 페이지로 이동
                if (!e.target.closest('button') && !e.target.closest('a')) {
                  navigate(`/detail/${item.expenseReportId}`);
                }
              }}
            >
              <S.CardHeader>
                <S.CardTitle title={`지급 요청일: ${paymentReqDate}`}>
                  지급 요청일: {paymentReqDate}
                </S.CardTitle>
                <S.StatusBadge status={item.status}>
                  {STATUS_KOREAN[item.status] || item.status}
                </S.StatusBadge>
              </S.CardHeader>

              <S.CardContent>
                <S.CardRow>
                  <S.CardLabel>작성자</S.CardLabel>
                  <S.CardValue>{item.drafterName}</S.CardValue>
                </S.CardRow>
                <S.CardRow>
                  <S.CardLabel>적요(내용)</S.CardLabel>
                  <S.CardValue title={descriptionDisplay} style={{ 
                    maxWidth: '200px', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap' 
                  }}>{descriptionDisplay}</S.CardValue>
                </S.CardRow>
                <S.CardRow>
                  <S.CardLabel>금액</S.CardLabel>
                  <S.CardValue style={{ fontWeight: '600', color: 'var(--primary-color)', fontSize: '16px' }}>
                    {item.totalAmount.toLocaleString()}원
                  </S.CardValue>
                </S.CardRow>
              </S.CardContent>

              <S.CardActions>
                {canDeleteExpense(item) && (
                  <S.DeleteButton 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteExpense(item.expenseReportId);
                    }}
                    disabled={deletingExpenseId === item.expenseReportId || deletingExpenseId !== null}
                    title={deletingExpenseId === item.expenseReportId ? '삭제 중...' : '삭제'}
                  >
                    <FaTrash />
                  </S.DeleteButton>
                )}
              </S.CardActions>
            </S.ExpenseCard>
          );
        })}
      </S.MobileCardContainer>



      {/* 서명 대기 건 모달 */}
      {modals.isNotificationModalOpen && (
        <S.NotificationModal onClick={handlers.closeNotificationModal}>
          <S.NotificationModalContent onClick={(e) => e.stopPropagation()}>
            <S.NotificationModalHeader>
              <h3>서명 대기 건 ({pendingApprovals.length}건)</h3>
              <button onClick={handlers.closeNotificationModal}>×</button>
            </S.NotificationModalHeader>
            <S.NotificationModalBody>
              {pendingApprovalsLoading ? (
                <p>로딩 중...</p>
              ) : pendingApprovals.length === 0 ? (
                <p>서명 대기 중인 건이 없습니다.</p>
              ) : (
                <S.NotificationList>
                  {pendingApprovals.map((item) => (
                    <S.NotificationItem
                      key={item.expenseReportId}
                      onClick={() => {
                        navigate(`/detail/${item.expenseReportId}`);
                        handlers.closeNotificationModal();
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

      {/* 승인 대기 사용자 모달 (CEO, ADMIN만) */}
      {modals.isApprovalModalOpen && (
        <S.NotificationModal onClick={handlers.closeApprovalModal}>
          <S.NotificationModalContent onClick={(e) => e.stopPropagation()}>
            <S.NotificationModalHeader>
              <h3>승인 대기 사용자 ({pendingUsers.length}건)</h3>
              <button onClick={handlers.closeApprovalModal}>×</button>
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
                          onClick={async (e) => {
                            e.stopPropagation();
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
                          onClick={async (e) => {
                            e.stopPropagation();
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
      {modals.isCompanyModalOpen && (
        <Suspense fallback={<div>로딩 중...</div>}>
          <CompanyRegistrationModal
            isOpen={modals.isCompanyModalOpen}
            onClose={handlers.closeCompanyModal}
            onSuccess={() => {
              // 모달 내부에서 성공 alert를 이미 보여주므로 여기서는 새로고침만 수행
              window.location.reload(); // 회사 등록 후 회사/권한 정보 갱신
            }}
          />
        </Suspense>
      )}
      
      {/* 세무 자료 다운로드 중일 때 로딩 모달 표시 */}
      {isDownloadingTaxReview && (
        <LoadingOverlay 
          modal={true}
          message={progressMessage} 
          progress={downloadProgress > 0 ? downloadProgress : null}
        />
      )}
    </S.Container>
  );
};

export default ExpenseListPage;