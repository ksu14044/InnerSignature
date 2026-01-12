import { useState, useRef, useCallback } from 'react';

export const useExpenseFilters = (initialFilters = {}) => {
  // 필터 상태 (실제 적용된 필터)
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    status: [],
    category: '',
    taxProcessed: null,
    drafterName: '',
    paymentMethod: '',
    cardNumber: '',
    ...initialFilters
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

  // 상태 체크박스 변경 핸들러
  const handleStatusChange = useCallback((status) => {
    setLocalStatus(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  }, []);

  // 필터 적용 핸들러 (ref에서 값을 읽어 적용)
  const handleApplyFilters = useCallback((onLoadList) => {
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
    onLoadList(1, newFilters);
  }, [localStatus]);

  // 필터 초기화 핸들러
  const handleResetFilters = useCallback((onLoadList) => {
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
    onLoadList(1, emptyFilters);
  }, []);

  // 필터 열기/닫기 핸들러 (열 때 ref 값을 현재 필터로 동기화)
  const handleFilterToggle = useCallback((isOpen) => {
    if (!isOpen) {
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
  }, [filters]);

  return {
    filters,
    setFilters,
    localStatus,
    filterRefs,
    handleStatusChange,
    handleApplyFilters,
    handleResetFilters,
    handleFilterToggle
  };
};
