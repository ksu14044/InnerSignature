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
  const loadExpenseList = useCallback(async (page = 1, filterParams = filters) => {
    try {
      setLoading(true);
      const response = await fetchExpenseList(page, pageSize, filterParams);
      if (response.success && response.data) {
        setList(response.data.content || []);
        updatePagination({
          page: response.data.page || 1,
          totalPages: response.data.totalPages || 1,
          totalElements: response.data.totalElements || 0
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('목록 조회 실패:', error);
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
  const loadDraftList = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      // 작성자 본인만 조회하도록 필터 추가
      const draftFilters = {
        status: ['DRAFT'],
        drafterName: user?.koreanName || ''
      };
      const response = await fetchExpenseList(page, pageSize, draftFilters);
      if (response.success && response.data) {
        setDraftList(response.data.content || []);
        updatePagination({
          page: response.data.page || 1,
          totalPages: response.data.totalPages || 1,
          totalElements: response.data.totalElements || 0
        });
      } else {
        setDraftList([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('임시 보관함 조회 실패:', error);
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
