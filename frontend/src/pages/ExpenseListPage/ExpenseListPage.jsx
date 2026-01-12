import { useEffect, useState, useRef, useMemo, useCallback, lazy, Suspense } from 'react';
import { fetchExpenseList, deleteExpense, downloadTaxReviewList, fetchMyApprovedReports, fetchPendingApprovals } from '../../api/expenseApi';
import { getUserCompanies, getPendingUsers, approveUser } from '../../api/userApi';
import * as S from './style';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaPlus, FaTrash, FaEye, FaChevronLeft, FaChevronRight, FaFilter, FaTimes, FaFileExcel, FaChartLine, FaEdit, FaCheck, FaTimesCircle } from 'react-icons/fa';
import { STATUS_KOREAN, EXPENSE_STATUS } from '../../constants/status';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import AppHeader from '../../components/AppHeader/AppHeader';

// Lazy load 모달 컴포넌트
const CompanyRegistrationModal = lazy(() => import('../../components/CompanyRegistrationModal/CompanyRegistrationModal'));

const ExpenseListPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  // const [taxRevisionRequests, setTaxRevisionRequests] = useState([]);
  // const [isTaxRevisionModalOpen, setIsTaxRevisionModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deletingExpenseId, setDeletingExpenseId] = useState(null);
  const [myApprovedList, setMyApprovedList] = useState([]);
  const [paymentPendingList, setPaymentPendingList] = useState([]);
  const [paymentPendingPage, setPaymentPendingPage] = useState(1);
  const [paymentPendingTotalPages, setPaymentPendingTotalPages] = useState(1);
  const [paymentPendingTotalElements, setPaymentPendingTotalElements] = useState(0);
  
  // 필터 상태 (실제 적용된 필터)
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    status: [],
    category: '',
    taxProcessed: null, // null: 전체, true: 완료, false: 미완료
    drafterName: '', // 작성자(기안자) 이름
    paymentMethod: '', // 결제수단 필터
    cardNumber: '' // 카드번호 필터
  });

  // 상태 체크박스용 로컬 상태 (체크박스는 제어 컴포넌트로 유지)
  const [localStatus, setLocalStatus] = useState([]);

  // 필터 입력 필드 ref (비제어 컴포넌트로 사용)
  const filterRefs = useRef({
    startDate: null,
    endDate: null,
    minAmount: null,
    maxAmount: null,
    category: null,
    drafterName: null,
    paymentMethod: null,
    cardNumber: null
  });

  const pageSize = 10;
  const navigate = useNavigate(); // 페이지 이동 훅
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const checkedCompanyModalRef = useRef(false);
  const [activeTab, setActiveTab] = useState('MY_REPORTS'); // MY_REPORTS | MY_APPROVALS | MY_APPROVAL_HISTORY | PAYMENT_PENDING

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

  // 목록 조회 함수 (useCallback으로 최적화)
  const loadExpenseList = useCallback(async (page = 1, filterParams = filters) => {
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
  }, [filters]);

  // 내가 결재한 문서 이력 조회 함수 (useCallback으로 최적화)
  const loadMyApprovedReports = useCallback(async () => {
    try {
      const response = await fetchMyApprovedReports();
      if (response.success && response.data) {
        setMyApprovedList(response.data || []);
      } else {
        setMyApprovedList([]);
      }
    } catch (error) {
      console.error('내 결재 문서 조회 실패:', error);
      setMyApprovedList([]);
    }
  }, []);

  // 결제 대기 건 조회 함수 (ACCOUNTANT용)
  const loadPaymentPendingList = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetchExpenseList(page, pageSize, { status: ['APPROVED'] });
      if (response.success && response.data) {
        setPaymentPendingList(response.data.content || []);
        setPaymentPendingPage(response.data.page || 1);
        setPaymentPendingTotalPages(response.data.totalPages || 1);
        setPaymentPendingTotalElements(response.data.totalElements || 0);
      }
      setLoading(false);
    } catch (error) {
      console.error('결제 대기 건 조회 실패:', error);
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

  // 상태 체크박스 변경 핸들러 (상태만 제어 컴포넌트로 유지)
  const handleStatusChange = (status) => {
    setLocalStatus(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  // 필터 열기/닫기 핸들러 (열 때 ref 값을 현재 필터로 동기화)
  const handleFilterToggle = () => {
    if (!isFilterOpen) {
      // 필터를 열 때 ref에 현재 적용된 필터 값 설정
      if (filterRefs.current.startDate) filterRefs.current.startDate.value = filters.startDate;
      if (filterRefs.current.endDate) filterRefs.current.endDate.value = filters.endDate;
      if (filterRefs.current.minAmount) filterRefs.current.minAmount.value = filters.minAmount;
      if (filterRefs.current.maxAmount) filterRefs.current.maxAmount.value = filters.maxAmount;
      if (filterRefs.current.category) filterRefs.current.category.value = filters.category;
      if (filterRefs.current.drafterName) filterRefs.current.drafterName.value = filters.drafterName;
      if (filterRefs.current.paymentMethod) filterRefs.current.paymentMethod.value = filters.paymentMethod;
      setLocalStatus(filters.status || []);
    }
    setIsFilterOpen(!isFilterOpen);
  };

  // 필터 적용 핸들러 (ref에서 값을 읽어 적용)
  const handleApplyFilters = () => {
    const newFilters = {
      startDate: filterRefs.current.startDate?.value || '',
      endDate: filterRefs.current.endDate?.value || '',
      minAmount: filterRefs.current.minAmount?.value || '',
      maxAmount: filterRefs.current.maxAmount?.value || '',
      status: localStatus,
      category: filterRefs.current.category?.value || '',
      taxProcessed: null,
      drafterName: filterRefs.current.drafterName?.value || '',
      paymentMethod: filterRefs.current.paymentMethod?.value || '',
      cardNumber: filterRefs.current.cardNumber?.value || ''
    };
    
    setFilters(newFilters);
    setCurrentPage(1);
    loadExpenseList(1, newFilters);
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
      drafterName: '',
      paymentMethod: '',
      cardNumber: ''
    };
    
    // ref 값들을 초기화
    if (filterRefs.current.startDate) filterRefs.current.startDate.value = '';
    if (filterRefs.current.endDate) filterRefs.current.endDate.value = '';
    if (filterRefs.current.minAmount) filterRefs.current.minAmount.value = '';
    if (filterRefs.current.maxAmount) filterRefs.current.maxAmount.value = '';
    if (filterRefs.current.category) filterRefs.current.category.value = '';
    if (filterRefs.current.drafterName) filterRefs.current.drafterName.value = '';
    if (filterRefs.current.paymentMethod) filterRefs.current.paymentMethod.value = '';
    if (filterRefs.current.cardNumber) filterRefs.current.cardNumber.value = '';
    setLocalStatus([]);
    
    setFilters(emptyFilters);
    setCurrentPage(1);
    loadExpenseList(1, emptyFilters);
    setIsFilterOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 내가 쓴 글만 보기 토글 핸들러
  const handleMyPostsToggle = () => {
    const isMyPostsMode = filters.drafterName === user?.koreanName;
    const newFilters = {
      ...filters,
      drafterName: isMyPostsMode ? '' : (user?.koreanName || '')
    };
    setFilters(newFilters);
    setCurrentPage(1);
    loadExpenseList(1, newFilters);
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

  // 세무 자료 다운로드 핸들러
  const handleExportTaxReview = async () => {
    if (
      !user ||
      (user.role !== 'ACCOUNTANT' && user.role !== 'TAX_ACCOUNTANT')
    ) {
      alert('세무 자료 다운로드는 ACCOUNTANT 또는 TAX_ACCOUNTANT 권한만 가능합니다.');
      return;
    }

    try {
      // 현재 필터 조건의 기간을 사용
      const startDate = filters.startDate || null;
      const endDate = filters.endDate || null;
      
      await downloadTaxReviewList(startDate, endDate, 'full');
      alert('세무 자료 다운로드가 시작되었습니다.');
    } catch (error) {
      alert(error.userMessage || '세무 자료 다운로드 중 오류가 발생했습니다.');
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
    if (tabParam === 'MY_APPROVALS' || tabParam === 'MY_APPROVAL_HISTORY' || tabParam === 'PAYMENT_PENDING') {
      setActiveTab(tabParam);
      // 결제 대기 탭인 경우 데이터 로드
      if (tabParam === 'PAYMENT_PENDING' && user?.role === 'ACCOUNTANT') {
        loadPaymentPendingList(1);
      }
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

      // ACCOUNTANT인 경우 결제 대기 건도 함께 로드
      if (user?.role === 'ACCOUNTANT') {
        loadPaymentPendingList(1);
      }
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
              setIsCompanyModalOpen(true); // "예"일 때만 회사 등록 모달 표시
            }
          }
        } catch (error) {
          console.error('회사 목록 조회 실패:', error);
          // 조회 실패 시에도 안내 후 회사 등록 여부를 확인
          const shouldOpen = window.confirm(
            '회사 정보를 불러오지 못했습니다.\n지금 새 회사를 등록하시겠습니까?'
          );
          if (shouldOpen) {
            setIsCompanyModalOpen(true);
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
      setIsNotificationModalOpen(true);
      // URL에서 파라미터 제거
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('openNotifications');
      setSearchParams(newSearchParams, { replace: true });
    }
    
    if (openApprovals === 'true') {
      setIsApprovalModalOpen(true);
      // URL에서 파라미터 제거
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('openApprovals');
      setSearchParams(newSearchParams, { replace: true });
    }

    // 세무 수정 요청 모달 열기 기능 비활성화됨
    // if (openTaxRevisions === 'true') {
    //   setIsTaxRevisionModalOpen(true);
    //   const newSearchParams = new URLSearchParams(searchParams);
    //   newSearchParams.delete('openTaxRevisions');
    //   setSearchParams(newSearchParams, { replace: true });
    // }
  }, [searchParams, setSearchParams]);

  // 커스텀 이벤트로 모달 열기 (이미 expenses 페이지에 있을 때)
  useEffect(() => {
    const handleOpenNotificationModal = () => setIsNotificationModalOpen(true);
    const handleOpenApprovalModal = () => setIsApprovalModalOpen(true);
    // const handleOpenTaxRevisionModal = () => setIsTaxRevisionModalOpen(true);

    window.addEventListener('openNotificationModal', handleOpenNotificationModal);
    window.addEventListener('openApprovalModal', handleOpenApprovalModal);
    // window.addEventListener('openTaxRevisionModal', handleOpenTaxRevisionModal);

    return () => {
      window.removeEventListener('openNotificationModal', handleOpenNotificationModal);
      window.removeEventListener('openApprovalModal', handleOpenApprovalModal);
      // window.removeEventListener('openTaxRevisionModal', handleOpenTaxRevisionModal);
    };
  }, []);

  // 결재 대기 건 조회 (서명 대기)
  useEffect(() => {
    if (!user?.userId) {
      setPendingApprovals([]);
      return;
    }

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
      case 'PAYMENT_PENDING':
        return paymentPendingList;
      default:
        return myApprovedList;
    }
  }, [activeTab, list, pendingApprovals, paymentPendingList, myApprovedList]);

  const isMyReportsTab = activeTab === 'MY_REPORTS';
  const isPaymentPendingTab = activeTab === 'PAYMENT_PENDING';

  if (loading) return <LoadingOverlay fullScreen={true} message="로딩 중..." />;

  return (
    <S.Container>
      <AppHeader 
        title="지출결의서 목록"
        subtitle={`환영합니다, ${user?.koreanName}님`}
        additionalButtons={
          <>
            {/* 세무 수정 요청 알림 배지 (작성자용) - 기능 비활성화됨 */}
            {false && taxRevisionRequests.length > 0 && (
              <S.NotificationBadge
                onClick={() => setIsTaxRevisionModalOpen(true)}
                title={`세무 수정 요청: ${taxRevisionRequests.length}건`}
                style={{ backgroundColor: '#ffc107', marginRight: '12px' }}
              >
                <FaEdit />
                <S.NotificationCount>{taxRevisionRequests.length}</S.NotificationCount>
              </S.NotificationBadge>
            )}
            {/* 모든 사용자가 대시보드로 이동 가능 */}
            <S.FilterButton 
              variant="primary" 
              onClick={() => navigate('/dashboard/main')}
              title="대시보드로 이동"
            >
              <FaChartLine />
              <span>대시보드</span>
            </S.FilterButton>
            {user?.role === 'TAX_ACCOUNTANT' && (
              <S.FilterButton 
                variant="primary" 
                onClick={() => navigate('/tax/summary')}
              >
                <span>세무사 요약</span>
              </S.FilterButton>
            )}
          </>
        }
      />

      <S.ActionBar>
        <S.TabContainer>
          <S.TabButton
            type="button"
            active={isMyReportsTab}
            onClick={() => setActiveTab('MY_REPORTS')}
            aria-label="내 결의서"
          >
            내 결의서
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
          {user?.role === 'ACCOUNTANT' && (
            <S.TabButton
              type="button"
              active={activeTab === 'PAYMENT_PENDING'}
              onClick={() => {
                setActiveTab('PAYMENT_PENDING');
                loadPaymentPendingList(1);
              }}
              aria-label="결제 대기"
            >
              결제 대기
            </S.TabButton>
          )}
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
                variant={isFilterOpen ? 'primary' : 'secondary'}
                onClick={handleFilterToggle}
                aria-label="필터"
                aria-pressed={isFilterOpen}
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
      {isMyReportsTab && isFilterOpen && (
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
                ref={(el) => (filterRefs.current.startDate = el)}
                defaultValue={filters.startDate}
              />
            </S.FilterGroup>
            <S.FilterGroup>
              <S.FilterLabel>작성일 종료일</S.FilterLabel>
              <S.FilterInput
                type="date"
                ref={(el) => (filterRefs.current.endDate = el)}
                defaultValue={filters.endDate}
              />
            </S.FilterGroup>
            <S.FilterGroup>
              <S.FilterLabel>최소 금액 (원)</S.FilterLabel>
              <S.FilterInput
                type="number"
                placeholder="0"
                ref={(el) => (filterRefs.current.minAmount = el)}
                defaultValue={filters.minAmount}
                min="0"
              />
            </S.FilterGroup>
            <S.FilterGroup>
              <S.FilterLabel>최대 금액 (원)</S.FilterLabel>
              <S.FilterInput
                type="number"
                placeholder="무제한"
                ref={(el) => (filterRefs.current.maxAmount = el)}
                defaultValue={filters.maxAmount}
                min="0"
              />
            </S.FilterGroup>
            <S.FilterGroup>
              <S.FilterLabel>카테고리</S.FilterLabel>
              <S.FilterSelect
                ref={(el) => (filterRefs.current.category = el)}
                defaultValue={filters.category}
              >
                <option value="">전체</option>
                <option value="식대">식대</option>
                <option value="교통비">교통비</option>
                <option value="비품비">비품비</option>
                <option value="기타">기타</option>
              </S.FilterSelect>
            </S.FilterGroup>
            {/* 세무처리 필터는 더 이상 사용하지 않으므로 UI에서 제거 */}
            {/* 작성자(기안자) 필터 (모든 사용자 사용 가능) */}
            <S.FilterGroup>
              <S.FilterLabel>작성자(기안자)</S.FilterLabel>
              <S.FilterInput
                type="text"
                ref={(el) => (filterRefs.current.drafterName = el)}
                defaultValue={filters.drafterName}
                placeholder="작성자 이름"
              />
            </S.FilterGroup>
            {/* 결제수단 필터 */}
            <S.FilterGroup>
              <S.FilterLabel>결제수단</S.FilterLabel>
              <S.FilterSelect
                ref={(el) => (filterRefs.current.paymentMethod = el)}
                defaultValue={filters.paymentMethod}
              >
                <option value="">전체</option>
                <option value="CASH">현금</option>
                <option value="BANK_TRANSFER">계좌이체</option>
                <option value="CARD">개인카드</option>
                <option value="COMPANY_CARD">회사카드</option>
              </S.FilterSelect>
            </S.FilterGroup>
            {/* 카드번호 필터 */}
            <S.FilterGroup>
              <S.FilterLabel>카드번호</S.FilterLabel>
              <S.FilterInput
                type="text"
                ref={(el) => (filterRefs.current.cardNumber = el)}
                defaultValue={filters.cardNumber}
                placeholder="카드번호 (뒷 4자리)"
              />
            </S.FilterGroup>
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
                      checked={localStatus.includes(status)}
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

      <S.TableContainer data-tourid="tour-expense-list">
        <S.Table>
          <S.Thead>
            <tr>
              <th>지급 요청일</th>
              <th>작성자</th>
              <th>적요(내용)</th>
              <S.AmountTh>금액</S.AmountTh>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </S.Thead>
          <tbody>
            {displayedList.map((item) => {
              // 지급 요청일 계산 (상세 항목 중 가장 빠른 날짜)
              const paymentReqDate = item.details && item.details.length > 0
                ? item.details
                    .map(d => d.paymentReqDate)
                    .filter(d => d)
                    .sort()[0] || item.paymentReqDate || item.reportDate
                : item.paymentReqDate || item.reportDate;
              
              // 항목 표시 (첫 번째 항목 외 n개)
              const categoryDisplay = item.details && item.details.length > 0
                ? item.details.length === 1
                  ? item.details[0].category
                  : `${item.details[0].category} 외 ${item.details.length - 1}개`
                : '-';
              
              // 적요(내용) 표시 - 목록 응답의 요약 필드 사용
              const descriptionDisplay =
                item.summaryDescription && item.summaryDescription.trim() !== ''
                  ? item.summaryDescription
                  : item.firstDescription && item.firstDescription.trim() !== ''
                    ? item.firstDescription
                    : '-';
              
              return (
                <S.Tr key={item.expenseReportId}>
                  <td>
                    <S.StyledLink to={`/detail/${item.expenseReportId}`}>
                      {paymentReqDate}
                    </S.StyledLink>
                  </td>
                  <td>{item.drafterName}</td>
                  <td title={descriptionDisplay} style={{ 
                    maxWidth: '200px', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap' 
                  }}>
                    {descriptionDisplay}
                  </td>
                  <S.AmountTd>{item.totalAmount.toLocaleString()}원</S.AmountTd>
                  <td>
                    <S.StatusBadge status={item.status}>
                      {STATUS_KOREAN[item.status] || item.status}
                    </S.StatusBadge>
                  </td>
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
              );
            })}
          </tbody>
        </S.Table>
      </S.TableContainer>

      {/* 페이지네이션 */}
      {isMyReportsTab && totalPages > 1 && (
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

      {/* 결제 대기 탭 페이지네이션 */}
      {isPaymentPendingTab && paymentPendingTotalPages > 1 && (
        <S.PaginationContainer>
          <S.PaginationInfo>
            전체 {paymentPendingTotalElements}개 중 {((paymentPendingPage - 1) * pageSize + 1)}-{Math.min(paymentPendingPage * pageSize, paymentPendingTotalElements)}개 표시
          </S.PaginationInfo>
          <S.Pagination>
            <S.PaginationButton
              onClick={() => {
                if (paymentPendingPage > 1) {
                  loadPaymentPendingList(paymentPendingPage - 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              disabled={paymentPendingPage === 1}
            >
              <FaChevronLeft />
            </S.PaginationButton>
            {(() => {
              const pages = [];
              const maxPages = 5;
              let startPage = Math.max(1, paymentPendingPage - Math.floor(maxPages / 2));
              let endPage = Math.min(paymentPendingTotalPages, startPage + maxPages - 1);
              
              if (endPage - startPage < maxPages - 1) {
                startPage = Math.max(1, endPage - maxPages + 1);
              }
              
              for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
              }
              
              return pages.map((pageNum) => (
                <S.PaginationButton
                  key={pageNum}
                  onClick={() => {
                    loadPaymentPendingList(pageNum);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  active={pageNum === paymentPendingPage}
                >
                  {pageNum}
                </S.PaginationButton>
              ));
            })()}
            <S.PaginationButton
              onClick={() => {
                if (paymentPendingPage < paymentPendingTotalPages) {
                  loadPaymentPendingList(paymentPendingPage + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              disabled={paymentPendingPage === paymentPendingTotalPages}
            >
              <FaChevronRight />
            </S.PaginationButton>
          </S.Pagination>
        </S.PaginationContainer>
      )}

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
                <S.CardTitle>
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


      {/* 세무 수정 요청 모달 (작성자용) - 기능 비활성화됨 */}
      {false && isTaxRevisionModalOpen && (
        <S.NotificationModal onClick={() => setIsTaxRevisionModalOpen(false)}>
          <S.NotificationModalContent onClick={(e) => e.stopPropagation()}>
            <S.NotificationModalHeader>
              <h3>세무 수정 요청 건 ({taxRevisionRequests.length}건)</h3>
              <button onClick={() => setIsTaxRevisionModalOpen(false)}>×</button>
            </S.NotificationModalHeader>
            <S.NotificationModalBody>
              {taxRevisionRequests.length === 0 ? (
                <p>세무 수정 요청이 들어온 결의서가 없습니다.</p>
              ) : (
                <S.NotificationList>
                  {taxRevisionRequests.map((item) => (
                    <S.NotificationItem
                      key={item.expenseReportId}
                      onClick={() => {
                        navigate(`/detail/${item.expenseReportId}`);
                        setIsTaxRevisionModalOpen(false);
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
                        <span>작성일: {item.reportDate}</span>
                        <span>금액: {item.totalAmount.toLocaleString()}원</span>
                        {item.taxRevisionRequestReason && (
                          <span>요청 사유: {item.taxRevisionRequestReason}</span>
                        )}
                      </S.NotificationItemInfo>
                    </S.NotificationItem>
                  ))}
                </S.NotificationList>
              )}
            </S.NotificationModalBody>
          </S.NotificationModalContent>
        </S.NotificationModal>
      )}

      {/* 서명 대기 건 모달 */}
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

      {/* 승인 대기 사용자 모달 (CEO, ADMIN만) */}
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
      {isCompanyModalOpen && (
        <Suspense fallback={<div>로딩 중...</div>}>
          <CompanyRegistrationModal
            isOpen={isCompanyModalOpen}
            onClose={() => setIsCompanyModalOpen(false)}
            onSuccess={() => {
              // 모달 내부에서 성공 alert를 이미 보여주므로 여기서는 새로고침만 수행
              window.location.reload(); // 회사 등록 후 회사/권한 정보 갱신
            }}
          />
        </Suspense>
      )}
    </S.Container>
  );
};

export default ExpenseListPage;