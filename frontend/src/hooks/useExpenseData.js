import { useState, useCallback, useEffect } from 'react';
import {
  fetchExpenseList,
  deleteExpense,
  fetchMyApprovedReports,
  fetchPendingApprovals
} from '../api/expenseApi';
import { getUserCompanies, getPendingUsers } from '../api/userApi';

export const useExpenseData = (user, filters, pagination) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myApprovedList, setMyApprovedList] = useState([]);
  const [draftList, setDraftList] = useState([]);
  const [paymentPendingList, setPaymentPendingList] = useState([]);
  const [paymentPendingPage, setPaymentPendingPage] = useState(1);
  const [paymentPendingTotalPages, setPaymentPendingTotalPages] = useState(1);
  const [paymentPendingTotalElements, setPaymentPendingTotalElements] = useState(0);

  const { pageSize, updatePagination } = pagination;

  // 목록 조회 함수 (useCallback으로 최적화)
  const loadExpenseList = useCallback(async (page = 1, filterParams = null) => {
    console.log('[ExpenseData] loadExpenseList 시작:', { page, filterParams, filters });
    try {
      setLoading(true);
      // filterParams가 전달되지 않으면 현재 filters 사용
      const actualFilters = filterParams !== null ? filterParams : filters;
      console.log('[ExpenseData] 실제 사용할 필터:', actualFilters);
      
      const response = await fetchExpenseList(page, pageSize, actualFilters);
      console.log('[ExpenseData] API 응답:', {
        success: response.success,
        hasData: !!response.data,
        data: response.data ? {
          page: response.data.page,
          totalPages: response.data.totalPages,
          totalElements: response.data.totalElements,
          contentLength: response.data.content?.length
        } : null
      });
      
      if (response.success && response.data) {
        setList(response.data.content || []);
        // totalPages가 명시적으로 전달되도록 함 (0도 유효한 값)
        const totalPages = response.data.totalPages !== undefined && response.data.totalPages !== null 
          ? response.data.totalPages 
          : 0;
        console.log('[ExpenseData] 계산된 totalPages:', totalPages, '원본:', response.data.totalPages);
        
        updatePagination({
          page: response.data.page || 1,
          totalPages: totalPages,
          totalElements: response.data.totalElements || 0
        });
      } else {
        console.log('[ExpenseData] 응답 실패 또는 데이터 없음, 페이지네이션 초기화');
        // 응답이 실패하거나 데이터가 없을 때도 페이지네이션 초기화
        updatePagination({
          page: 1,
          totalPages: 0,
          totalElements: 0
        });
      }
      setLoading(false);
      console.log('[ExpenseData] loadExpenseList 완료, loading = false');
    } catch (error) {
      console.error('[ExpenseData] 목록 조회 실패:', error);
      // 에러 발생 시에도 페이지네이션 초기화
      updatePagination({
        page: 1,
        totalPages: 0,
        totalElements: 0
      });
      setLoading(false);
    }
  }, [filters, pageSize, updatePagination]);

  // 내가 결재한 문서 이력 조회 함수
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

  // 임시 보관함 조회 함수 (DRAFT 상태만)
  const loadDraftList = useCallback(async (page = 1, shouldUpdatePagination = false) => {
    console.log('[ExpenseData] loadDraftList 시작:', { page, shouldUpdatePagination, user: user?.koreanName });
    try {
      setLoading(true);
      // 작성자 본인만 조회하도록 필터 추가
      const draftFilters = {
        status: ['DRAFT'],
        drafterName: user?.koreanName || ''
      };
      const response = await fetchExpenseList(page, pageSize, draftFilters);
      console.log('[ExpenseData] loadDraftList API 응답:', {
        success: response.success,
        hasData: !!response.data,
        data: response.data ? {
          page: response.data.page,
          totalPages: response.data.totalPages,
          totalElements: response.data.totalElements,
          contentLength: response.data.content?.length
        } : null
      });
      
      if (response.success && response.data) {
        setDraftList(response.data.content || []);
        // 임시 보관함 탭일 때만 페이지네이션 업데이트
        if (shouldUpdatePagination) {
          const totalPages = response.data.totalPages !== undefined && response.data.totalPages !== null 
            ? response.data.totalPages 
            : 0;
          console.log('[ExpenseData] loadDraftList - 페이지네이션 업데이트:', { totalPages });
          updatePagination({
            page: response.data.page || 1,
            totalPages: totalPages,
            totalElements: response.data.totalElements || 0
          });
        } else {
          console.log('[ExpenseData] loadDraftList - 페이지네이션 업데이트 스킵 (임시 보관함 탭이 아님)');
        }
      } else {
        setDraftList([]);
        if (shouldUpdatePagination) {
          updatePagination({
            page: 1,
            totalPages: 0,
            totalElements: 0
          });
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('[ExpenseData] 임시 보관함 조회 실패:', error);
      setDraftList([]);
      setLoading(false);
    }
  }, [user?.koreanName, pageSize, updatePagination]);

  // 결제 대기 건 조회 함수 (ACCOUNTANT용)
  const loadPaymentPendingList = useCallback(async (page = 1) => {
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
  }, [pageSize]);


  return {
    data: {
      list,
      loading,
      myApprovedList,
      draftList,
      paymentPendingList,
      paymentPendingPage,
      paymentPendingTotalPages,
      paymentPendingTotalElements
    },
    actions: {
      loadExpenseList,
      loadMyApprovedReports,
      loadDraftList,
      loadPaymentPendingList
    }
  };
};
