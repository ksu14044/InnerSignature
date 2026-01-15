import React, { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { FaPlus, FaTrash, FaSave, FaArrowLeft, FaUserCheck, FaEdit, FaFileUpload, FaFile } from 'react-icons/fa';

// 스타일 컴포넌트들을 한꺼번에 'S'라는 이름으로 가져옵니다.
import * as S from './style';
import { useAuth } from '../../contexts/AuthContext';
import { setApprovalLines, fetchApprovers, fetchExpenseDetail, updateExpense, uploadReceipt, getReceipts, uploadReceiptForDetail } from '../../api/expenseApi';
import { API_CONFIG } from '../../config/api';
import { EXPENSE_STATUS, APPROVAL_STATUS } from '../../constants/status';
import { getCategoriesByRole, filterCategoriesByRole } from '../../constants/categories';
import { DEFAULT_VALUES } from '../../constants/defaults';
import { getMergedCategories } from '../../api/expenseCategoryApi';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import { formatNumber, parseFormattedNumber } from '../../utils/numberUtils';

// Lazy load 모달 컴포넌트
const ApproverSelectionModal = lazy(() => import('../../components/ApproverSelectionModal/ApproverSelectionModal'));
const ExpenseDetailModal = lazy(() => import('../../components/ExpenseDetailModal/ExpenseDetailModal'));

const ExpenseCreatePage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // 수정 모드일 때 expenseId
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!id; // id가 있으면 수정 모드

  // 1. 문서 기본 정보 상태
  const [report, setReport] = useState({
    reportDate: new Date().toISOString().split('T')[0],
  });

  // 2. 상세 내역 리스트 상태 - 초기값을 빈 배열로 변경
  const [details, setDetails] = useState([]);

  // 2-1. 기존 상세 내역 (수정 모드에서 변경사항 비교용)
  const [originalDetails, setOriginalDetails] = useState([]);

  // 3. 결재자 관련 상태
  const [adminUsers, setAdminUsers] = useState([]);
  const [selectedApprovers, setSelectedApprovers] = useState([]); // 선택된 결재자 ID들 (순서 보장)
  const [loadingApprovers, setLoadingApprovers] = useState(true); // 결재자 목록 로딩 상태
  const [isApproverModalOpen, setIsApproverModalOpen] = useState(false); // 결재자 선택 모달 열림 상태

  // 5. 상세 내역 모달 상태
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingDetailIndex, setEditingDetailIndex] = useState(null);

  // 6. 영수증 관련 상태
  const [receipts, setReceipts] = useState([]); // 서버에 업로드된 영수증 목록 (수정 모드)
  const [pendingReceipts, setPendingReceipts] = useState([]); // 생성 전에 선택한 영수증 파일들
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  
  // 6-1. 항목 단위 영수증 업로드 관련 상태 (수정 모드)
  const [isReceiptDetailSelectModalOpen, setIsReceiptDetailSelectModalOpen] = useState(false);
  const [selectedReceiptFile, setSelectedReceiptFile] = useState(null);
  const [savedDetailsForReceipt, setSavedDetailsForReceipt] = useState([]); // 영수증 업로드용 저장된 상세 내역

  // 7. 토스트 메시지 상태
  const [toastMessage, setToastMessage] = useState(null);

  // 4. 필드 참조 (스크롤 이동용)
  const titleInputRef = useRef(null);
  const descriptionInputRefs = useRef([]);
  const amountInputRefs = useRef([]);
  const approverSectionRef = useRef(null);
  const detailsSectionRef = useRef(null);
  const receiptSectionRef = useRef(null);
  const receiptFileInputRef = useRef(null);
  const receiptUploadInputRef = useRef(null);

  // 입력이 완료된 항목만 필터링하는 함수
  const isValidDetail = (detail) => {
    return detail.category &&
           detail.description &&
           detail.description.trim() !== '' &&
           detail.amount &&
           Number(detail.amount) > 0 &&
           detail.paymentMethod &&
           (detail.paymentMethod !== 'CARD' && detail.paymentMethod !== 'COMPANY_CARD' || detail.cardNumber);
  };

  // 변경사항 비교 함수 (결제수단 변경 포함)
  const hasAnyChanges = () => {
    if (!isEditMode) return true; // 생성 모드에서는 항상 변경사항 있음

    // 상세 내역 비교
    if (originalDetails.length !== details.length) {
      return true; // 항목 개수가 다름
    }

    for (let i = 0; i < details.length; i++) {
      const original = originalDetails[i];
      const current = details[i];

      // 주요 필드 비교 (결제수단 및 지급 요청일 포함)
      if (original.category !== current.category ||
          original.merchantName !== current.merchantName ||
          original.description !== current.description ||
          original.amount !== current.amount ||
          original.paymentMethod !== current.paymentMethod || // 결제수단 변경 감지
          original.paymentReqDate !== current.paymentReqDate || // 지급 요청일 변경 감지
          original.cardNumber !== current.cardNumber ||
          original.cardId !== current.cardId ||
          original.note !== current.note) {
        return true; // 변경사항 발견
      }
    }

    return false; // 변경사항 없음
  };

  // 입력이 완료된 항목만 필터링
  const completedDetails = useMemo(() => {
    return details.filter(isValidDetail);
  }, [details]);

  // 총 금액 자동 계산 (완료된 항목만)
  const totalAmount = completedDetails.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  // 급여 카테고리 포함 여부 확인 (완료된 항목만)
  const hasSalaryCategory = useMemo(() => {
    return completedDetails.some(detail => detail.category === '급여');
  }, [completedDetails]);

  // 급여인 경우 결재 불필요 (기밀 사항)

  // 카테고리 목록 상태 (API에서 동적으로 불러옴)
  const [categoryList, setCategoryList] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // API에서 카테고리 목록 불러오기
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await getMergedCategories();
        if (response.success && response.data) {
          const filtered = filterCategoriesByRole(response.data, user?.role);
          setCategoryList(filtered);
        } else {
          // API 실패 시 폴백 카테고리 사용
          setCategoryList(getCategoriesByRole(user?.role));
        }
      } catch (error) {
        console.error('카테고리 목록 불러오기 실패:', error);
        // API 실패 시 폴백 카테고리 사용
        setCategoryList(getCategoriesByRole(user?.role));
      } finally {
        setLoadingCategories(false);
      }
    };

    if (user) {
      loadCategories();
    }
  }, [user]);

  // 사용자 역할에 따른 카테고리 목록 (API에서 불러온 데이터 사용)
  const availableCategories = useMemo(() => {
    return categoryList.length > 0 ? categoryList : getCategoriesByRole(user?.role);
  }, [categoryList, user?.role]);

  // 담당 결재자 목록 불러오기
  useEffect(() => {
    const loadApprovers = async () => {
      try {
        setLoadingApprovers(true);
        // 먼저 담당 결재자 조회 시도
        try {
          const { getActiveApprovers } = await import('../../api/userApproverApi');
          const approversResponse = await getActiveApprovers(user?.userId);
          if (approversResponse.success && approversResponse.data && approversResponse.data.length > 0) {
            setAdminUsers(approversResponse.data);
            // 담당 결재자가 1명이면 자동 선택
            if (approversResponse.data.length === 1) {
              setSelectedApprovers([approversResponse.data[0].userId]);
            }
            return;
          }
        } catch (error) {
          console.warn('담당 결재자 조회 실패, 전체 결재자 목록 조회:', error);
        }
        
        // 담당 결재자가 없으면 전체 결재자 목록 조회
        const response = await fetchApprovers();
        if (response.success) {
          setAdminUsers(response.data);
        }
      } catch (error) {
        console.error('결재자 목록 불러오기 실패:', error);
        setAdminUsers([]);
      } finally {
        setLoadingApprovers(false);
      }
    };

    if (user?.userId) {
      loadApprovers();
    }
  }, [user]);

  // 수정 모드일 때 기존 데이터 불러오기
  useEffect(() => {
    if (isEditMode && id) {
      const loadExpenseData = async () => {
        try {
          setIsLoading(true);
          const response = await fetchExpenseDetail(id);
          if (response.success && response.data) {
            const expense = response.data;
            
            // WAIT 상태가 아니면 수정 불가
            if (expense.status !== 'WAIT') {
              alert('WAIT 상태의 문서만 수정할 수 있습니다.');
              navigate(`/detail/${id}`);
              return;
            }

            // 작성자 본인이 아니면 수정 불가
            if (expense.drafterId !== user?.userId) {
              alert('작성자 본인만 수정할 수 있습니다.');
              navigate(`/detail/${id}`);
              return;
            }

            // 기본 정보 설정
            setReport({
              title: expense.title || '',
              reportDate: expense.reportDate || new Date().toISOString().split('T')[0],
            });

            // 상세 내역 설정 (원본 데이터도 저장)
            if (expense.details && expense.details.length > 0) {
              setDetails(expense.details);
              setOriginalDetails(JSON.parse(JSON.stringify(expense.details))); // 깊은 복사
            } else {
              setOriginalDetails([]);
            }

            // 결재 라인 설정
            if (expense.approvalLines && expense.approvalLines.length > 0) {
              const approverIds = expense.approvalLines.map(line => line.approverId);
              setSelectedApprovers(approverIds);
            }

            // 영수증 목록 설정
            if (expense.receipts && expense.receipts.length > 0) {
              setReceipts(expense.receipts);
            } else {
              // 영수증 목록 별도 조회
              try {
                const receiptsResponse = await getReceipts(id);
                if (receiptsResponse.success) {
                  setReceipts(receiptsResponse.data || []);
                }
              } catch (error) {
                console.error('영수증 목록 불러오기 실패:', error);
              }
            }
            
            // 수정 모드에서는 pendingReceipts 초기화
            setPendingReceipts([]);
          } else {
            alert('문서를 불러올 수 없습니다.');
            navigate('/expenses');
          }
        } catch (error) {
          console.error('문서 불러오기 실패:', error);
          alert('문서를 불러오는 중 오류가 발생했습니다.');
          navigate('/expenses');
        } finally {
          setIsLoading(false);
        }
      };

      loadExpenseData();
    }
  }, [isEditMode, id, user, navigate]);

  // --- 이벤트 핸들러 ---


  const handleDetailChange = (index, e) => {
    const { name, value } = e.target;
    const newDetails = [...details];
    
    // 금액 필드인 경우 포맷팅 적용
    if (name === 'amount') {
      // 입력값에서 콤마 제거 후 숫자로 변환하여 저장
      const numericValue = parseFormattedNumber(value);
      newDetails[index][name] = numericValue;
    } else {
      newDetails[index][name] = value;
    }
    
    setDetails(newDetails);
  };

  // 필드로 스크롤 이동하는 함수
  const scrollToField = (ref, behavior = 'smooth') => {
    if (ref) {
      // ref가 직접 DOM 요소인 경우 (함수형 ref)
      if (ref.focus) {
        ref.scrollIntoView({ behavior, block: 'center' });
        setTimeout(() => {
          ref.focus();
          if (ref.select) {
            ref.select();
          }
        }, 300);
      } 
      // ref가 ref 객체인 경우 (useRef로 생성된 경우)
      else if (ref.current) {
        ref.current.scrollIntoView({ behavior, block: 'center' });
        setTimeout(() => {
          if (ref.current && ref.current.focus) {
            ref.current.focus();
            if (ref.current.select) {
              ref.current.select();
            }
          }
        }, 300);
      }
    }
  };

  const addDetailRow = () => {
    setEditingDetailIndex(null);
    setIsDetailModalOpen(true);
  };

  const openEditModal = (index) => {
    setEditingDetailIndex(index);
    setIsDetailModalOpen(true);
  };

  const handleDetailSave = (savedData) => {
    if (editingDetailIndex !== null) {
      // 수정 모드
      const newDetails = [...details];
      newDetails[editingDetailIndex] = savedData;
      setDetails(newDetails);
    } else {
      // 추가 모드
      setDetails([...details, savedData]);
    }
    setEditingDetailIndex(null);
  };

  const removeDetailRow = (index) => {
    if (details.length === 0) return;
    const newDetails = details.filter((_, i) => i !== index);
    setDetails(newDetails);
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      'CASH': '현금',
      'BANK_TRANSFER': '계좌이체',
      'CARD': '개인카드',
      'COMPANY_CARD': '회사카드'
    };
    return labels[method] || method || '-';
  };

  // 영수증 파일 선택 처리 (생성 전)
  const handleReceiptFileSelect = (event) => {
    if (!user) {
      alert("로그인 후 진행할 수 있습니다.");
      return;
    }

    const files = Array.from(event.target.files);
    if (files.length === 0) {
      return;
    }

    // 각 파일 검증
    const validFiles = [];
    for (const file of files) {
      // 파일 크기 제한 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name}: 파일 크기는 10MB를 초과할 수 없습니다.`);
        continue;
      }

      // 파일 타입 검증
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name}: 지원하지 않는 파일 형식입니다. (jpg, jpeg, png, gif, pdf만 허용)`);
        continue;
      }

      validFiles.push(file);
    }

    // 유효한 파일들을 pendingReceipts에 추가
    setPendingReceipts([...pendingReceipts, ...validFiles]);
    event.target.value = '';
  };

  // 영수증 파일 제거 (생성 전)
  const handleRemovePendingReceipt = (index) => {
    const newPendingReceipts = pendingReceipts.filter((_, i) => i !== index);
    setPendingReceipts(newPendingReceipts);
  };

  // 영수증 업로드 처리 (수정 모드) - 항목 단위 업로드로 변경
  const handleReceiptUpload = async (event) => {
    if (isUploadingReceipt) return;
    if (!user) {
      alert("로그인 후 진행할 수 있습니다.");
      return;
    }

    const file = event.target.files[0];
    if (!file) {
      return;
    }

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("파일 크기는 10MB를 초과할 수 없습니다.");
      return;
    }

    // 파일 타입 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert("지원하지 않는 파일 형식입니다. (jpg, jpeg, png, gif, pdf만 허용)");
      return;
    }

    // 수정 모드이고 expenseId가 있는 경우에만 업로드 가능
    if (!isEditMode || !id) {
      alert("지출결의서를 먼저 저장한 후 영수증을 업로드할 수 있습니다.");
      return;
    }

    // 상세 내역이 없는 경우 경고
    if (!details || details.length === 0) {
      alert("영수증을 첨부할 상세 내역이 없습니다. 먼저 상세 내역을 추가해주세요.");
      event.target.value = '';
      return;
    }

    // 저장된 상세 내역 조회하여 expenseDetailId 확인
    try {
      const detailResponse = await fetchExpenseDetail(id);
      if (!detailResponse.success || !detailResponse.data || !detailResponse.data.details) {
        alert("상세 내역을 조회할 수 없습니다.");
        event.target.value = '';
        return;
      }

      const savedDetails = detailResponse.data.details;
      if (savedDetails.length === 0) {
        alert("영수증을 첨부할 상세 내역이 없습니다.");
        event.target.value = '';
        return;
      }

      // 상세 내역이 하나만 있으면 바로 업로드
      if (savedDetails.length === 1) {
        await uploadReceiptToDetail(savedDetails[0].expenseDetailId, file);
      } else {
        // 여러 항목이 있으면 선택 모달 표시
        setSavedDetailsForReceipt(savedDetails);
        setSelectedReceiptFile(file);
        setIsReceiptDetailSelectModalOpen(true);
      }
    } catch (error) {
      console.error("상세 내역 조회 오류:", error);
      alert("상세 내역을 조회하는 중 오류가 발생했습니다.");
    }

    event.target.value = '';
  };

  // 선택한 항목에 영수증 업로드
  const uploadReceiptToDetail = async (expenseDetailId, file) => {
    if (!expenseDetailId || !file || !id) return;

    setIsUploadingReceipt(true);
    try {
      const response = await uploadReceiptForDetail(expenseDetailId, id, user.userId, file);
      if (response.success) {
        alert("영수증이 업로드되었습니다!");
        // 상세 정보 다시 조회하여 영수증 목록 갱신
        const detailResponse = await fetchExpenseDetail(id);
        if (detailResponse.success && detailResponse.data) {
          // 상세 내역별 영수증은 data.details[].receipts에 포함됨
          // 문서 단위 영수증도 확인
          if (detailResponse.data.receipts && detailResponse.data.receipts.length > 0) {
            setReceipts(detailResponse.data.receipts || []);
          }
        }
      } else {
        alert("영수증 업로드 실패: " + response.message);
      }
    } catch (error) {
      console.error("영수증 업로드 오류:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "영수증 업로드 중 오류가 발생했습니다.";
      alert(errorMessage);
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  // 영수증 첨부할 항목 선택 핸들러
  const handleReceiptDetailSelect = async (expenseDetailId) => {
    if (!selectedReceiptFile) return;
    
    setIsReceiptDetailSelectModalOpen(false);
    await uploadReceiptToDetail(expenseDetailId, selectedReceiptFile);
    setSelectedReceiptFile(null);
  };

  // 결재자 선택 핸들러 (순서 보장)
  const handleApproverToggle = (userId) => {
    const index = selectedApprovers.indexOf(userId);
    if (index > -1) {
      // 이미 선택된 경우 제거
      setSelectedApprovers(selectedApprovers.filter(id => id !== userId));
    } else {
      // 선택되지 않은 경우 추가 (순서대로)
      setSelectedApprovers([...selectedApprovers, userId]);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    if (!user) {
      alert("로그인 정보가 없습니다.");
      return;
    }

    // 급여 카테고리는 ADMIN 또는 ACCOUNTANT만 사용 가능
    if (hasSalaryCategory && user.role !== 'ADMIN' && user.role !== 'ACCOUNTANT') {
      alert("급여 카테고리는 ADMIN 또는 ACCOUNTANT 권한만 사용할 수 있습니다.");
      return;
    }

    // 유효성 검사: 완료된 상세 내역 확인
    let firstMissingField = null;
    const missingFields = [];
    
    // 1. 완료된 상세 내역 확인
    if (!completedDetails || completedDetails.length === 0) {
      missingFields.push('지출 상세 내역 (최소 1개 이상 필요)');
      if (!firstMissingField) {
        firstMissingField = { type: 'detailsSection', ref: detailsSectionRef };
      }
    }
    
    // 2. 결재자 선택 확인 (급여가 아닌 경우)
    if (!hasSalaryCategory && (!selectedApprovers || selectedApprovers.length === 0)) {
      missingFields.push('결재자 선택');
      if (!firstMissingField) {
        firstMissingField = { type: 'approver', ref: approverSectionRef };
      }
    }
    
    // 3. (생성 모드에서만) 각 상세 내역별 영수증 첨부 필수 확인
    // 수정 모드에서는 기존에 업로드된 영수증을 그대로 사용하는 것을 허용
    if (!isEditMode) {
      const allDetailsHaveReceipts = completedDetails.every(detail => 
        detail.receiptFiles && detail.receiptFiles.length > 0
      );

      if (!allDetailsHaveReceipts) {
        missingFields.push('모든 지출 상세 내역에 영수증을 첨부해야 합니다');
        if (!firstMissingField) {
          firstMissingField = { type: 'detailsSection', ref: detailsSectionRef };
        }
      }
    }
    
    // 누락된 항목이 있으면 해당 필드로 스크롤하고 토스트 메시지 표시
    if (firstMissingField) {
      // 토스트 메시지 표시
      setToastMessage(missingFields);
      
      // 5초 후 자동으로 메시지 숨김
      setTimeout(() => {
        setToastMessage(null);
      }, 5000);
      
      // 해당 필드로 스크롤
      if (firstMissingField.ref) {
        scrollToField(firstMissingField.ref);
      } else if (firstMissingField.type === 'description' && firstMissingField.index !== undefined) {
        // descriptionInputRefs가 아직 설정되지 않은 경우 섹션으로 이동
        scrollToField(detailsSectionRef);
      } else if (firstMissingField.type === 'amount' && firstMissingField.index !== undefined) {
        // amountInputRefs가 아직 설정되지 않은 경우 섹션으로 이동
        scrollToField(detailsSectionRef);
      } else if (firstMissingField.type === 'detailsSection') {
        scrollToField(detailsSectionRef);
      } else if (firstMissingField.type === 'approver') {
        scrollToField(approverSectionRef);
      } else if (firstMissingField.type === 'receipt') {
        scrollToField(receiptSectionRef);
      }
      return;
    }

    // 완료된 항목만 제출 (금액을 숫자로 변환, receiptFiles는 별도로 보관)
    const formattedDetails = completedDetails.map(detail => {
      const { receiptFiles, ...restDetail } = detail;
      return {
        ...restDetail,
        amount: detail.amount ? Number(parseFormattedNumber(detail.amount)) : 0
      };
    });
    
    // receiptFiles 매핑: completedDetails의 인덱스 -> receiptFiles
    const receiptFilesByIndex = completedDetails.map(detail => detail.receiptFiles || []);

    // 담당 결재자 자동 설정 (급여가 아닌 경우)
    let finalApprovers = selectedApprovers;
    if (!hasSalaryCategory && (!selectedApprovers || selectedApprovers.length === 0)) {
      try {
        const { getActiveApprovers } = await import('../../api/userApproverApi');
        const approversResponse = await getActiveApprovers(user.userId);
        if (approversResponse.success && approversResponse.data && approversResponse.data.length > 0) {
          // 담당 결재자가 1명이면 자동 설정
          if (approversResponse.data.length === 1) {
            finalApprovers = [approversResponse.data[0].userId];
          } else {
            // 2명 이상이면 선택하도록 (이미 결재자 선택 모달이 열려있을 수 있음)
            // 여기서는 첫 번째 담당 결재자를 기본값으로 설정
            finalApprovers = [approversResponse.data[0].userId];
          }
        }
      } catch (error) {
        console.error('담당 결재자 조회 실패:', error);
        // 담당 결재자 조회 실패 시 계속 진행 (수동 선택 가능)
      }
    }

    // 상세 항목에서 isPreApproval 제거 (결의서 단위로만 사용), paymentReqDate는 항목별로 사용
    const cleanedDetails = formattedDetails.map(detail => {
      const { isPreApproval, ...rest } = detail;
      return rest;
    });

    const payload = {
      drafterId: user.userId,
      drafterName: user.koreanName,
      reportDate: report.reportDate,
      status: hasSalaryCategory ? EXPENSE_STATUS.APPROVED : EXPENSE_STATUS.WAIT,
      totalAmount: totalAmount,
      details: cleanedDetails,
      approvalLines: !hasSalaryCategory ? finalApprovers.map(userId => {
        const adminUser = adminUsers.find(user => user.userId === userId);
        return {
          approverId: userId,
          approverPosition: adminUser?.position || DEFAULT_VALUES.APPROVER_DEFAULTS.position,
          approverName: adminUser?.koreanName || DEFAULT_VALUES.APPROVER_DEFAULTS.name,
          status: APPROVAL_STATUS.WAIT
        };
      }) : [],
    };

    try {
      setIsSubmitting(true);

      if (isEditMode) {
        // 수정 모드
        const response = await updateExpense(id, payload);
        if (response.success) {
          // 저장 후 영수증 업로드 (생성 모드와 동일한 방식)
          const hasReceiptFiles = receiptFilesByIndex.some(files => files && files.length > 0);
          
          if (hasReceiptFiles) {
            setIsUploadingReceipt(true);
            let totalUploadSuccessCount = 0;
            let totalUploadFailCount = 0;

            // 상세 내역 ID 조회를 위해 상세 정보 다시 가져오기
            try {
              console.log('수정 후 상세 내역 조회 시작, expenseId:', id);
              const detailResponse = await fetchExpenseDetail(id);
              
              if (!detailResponse.success) {
                console.error('상세 내역 조회 실패:', detailResponse);
                alert('상세 내역 조회에 실패했습니다. 영수증은 상세 페이지에서 업로드해주세요.');
                setIsUploadingReceipt(false);
                navigate(`/detail/${id}`);
                return;
              }
              
              if (!detailResponse.data || !detailResponse.data.details) {
                console.error('상세 내역 데이터가 없습니다:', detailResponse.data);
                alert('상세 내역 데이터를 찾을 수 없습니다. 영수증은 상세 페이지에서 업로드해주세요.');
                setIsUploadingReceipt(false);
                navigate(`/detail/${id}`);
                return;
              }
              
              const savedDetails = detailResponse.data.details;
              console.log('저장된 상세 내역:', savedDetails.map(d => ({
                id: d.expenseDetailId,
                category: d.category,
                description: d.description,
                amount: d.amount
              })));
              console.log('업로드할 영수증이 있는 내역:', formattedDetails.map((d, idx) => ({
                index: idx,
                category: d.category,
                description: d.description,
                amount: d.amount,
                receiptCount: receiptFilesByIndex[idx]?.length || 0
              })));

              // 각 상세 내역별로 영수증 업로드 (인덱스 기반 매칭 - 생성 모드와 동일)
              for (let i = 0; i < formattedDetails.length; i++) {
                const detail = formattedDetails[i];
                const receiptFiles = receiptFilesByIndex[i];
                
                if (receiptFiles && receiptFiles.length > 0) {
                  // 인덱스 기반 매칭 (저장된 상세 내역은 저장 순서대로 반환되므로 인덱스로 매칭 가능)
                  const savedDetail = savedDetails[i];
                  
                  if (!savedDetail) {
                    console.error(`상세 내역을 찾을 수 없습니다 (인덱스: ${i}):`, {
                      category: detail.category,
                      description: detail.description,
                      amount: detail.amount
                    });
                    totalUploadFailCount += receiptFiles.length;
                    continue;
                  }
                  
                  if (!savedDetail.expenseDetailId) {
                    console.error(`expenseDetailId가 없습니다 (인덱스: ${i}):`, savedDetail);
                    totalUploadFailCount += receiptFiles.length;
                    continue;
                  }
                  
                  console.log(`영수증 업로드 시작: expenseDetailId=${savedDetail.expenseDetailId}, 파일 수=${receiptFiles.length}`);
                  
                  for (const file of receiptFiles) {
                    try {
                      console.log(`영수증 업로드 시도: expenseDetailId=${savedDetail.expenseDetailId}, filename=${file.name}`);
                      const uploadResponse = await uploadReceiptForDetail(
                        savedDetail.expenseDetailId, 
                        id, 
                        user.userId, 
                        file
                      );
                      if (uploadResponse.success) {
                        totalUploadSuccessCount++;
                        console.log(`영수증 업로드 성공: ${file.name}`);
                      } else {
                        totalUploadFailCount++;
                        console.error('영수증 업로드 실패:', uploadResponse.message);
                      }
                    } catch (error) {
                      totalUploadFailCount++;
                      console.error('영수증 업로드 오류:', error);
                      console.error('에러 상세:', error.response?.data || error.message);
                    }
                  }
                }
              }
              
              setIsUploadingReceipt(false);

              if (totalUploadSuccessCount > 0) {
                if (totalUploadFailCount > 0) {
                  alert(`⚠️ 지출결의서가 수정되었습니다!\n${totalUploadSuccessCount}개의 영수증이 업로드되었습니다.\n${totalUploadFailCount}개의 영수증 업로드에 실패했습니다.\n상세 페이지에서 다시 업로드해주세요.`);
                } else {
                  alert('지출결의서가 수정되고 모든 영수증이 업로드되었습니다!');
                }
              } else if (totalUploadFailCount > 0) {
                alert(`⚠️ 지출결의서가 수정되었습니다.\n❌ 모든 영수증 업로드에 실패했습니다.\n상세 페이지에서 다시 업로드해주세요.\n\n실패한 영수증 수: ${totalUploadFailCount}개`);
              } else {
                alert('지출결의서가 수정되었습니다!');
              }
            } catch (error) {
              console.error('상세 내역 조회 실패:', error);
              alert('지출결의서가 수정되었으나 영수증 업로드 중 오류가 발생했습니다. 상세 페이지에서 다시 업로드해주세요.');
              setIsUploadingReceipt(false);
            }
          } else {
            alert('지출결의서가 수정되었습니다!');
          }
          
          navigate(`/detail/${id}`);
        } else {
          alert('수정 실패: ' + response.message);
        }
      } else {
        // 생성 모드
        const response = await axiosInstance.post(`${API_CONFIG.EXPENSES_BASE_URL}/create`, payload);

        if (response.data.success) {
          // 생성된 지출 결의서의 ID를 받아서 Detail 페이지로 이동
          const expenseId = response.data.data;

          if (expenseId) {
            // 급여가 아닌 경우에만 결재 라인 설정
            if (!hasSalaryCategory) {
              // 선택된 결재자들을 approvalLines로 변환 (순서 보장)
              const approvalLines = selectedApprovers.map(userId => {
                const adminUser = adminUsers.find(user => user.userId === userId);
                return {
                  approverId: userId,
                  approverPosition: adminUser?.position || DEFAULT_VALUES.APPROVER_DEFAULTS.position,
                  approverName: adminUser?.koreanName || DEFAULT_VALUES.APPROVER_DEFAULTS.name,
                  status: APPROVAL_STATUS.WAIT
                };
              });

              try {
                await setApprovalLines(expenseId, approvalLines);
              } catch (approvalError) {
                console.error('결재 라인 설정 실패:', approvalError);
                alert('지출결의서는 작성되었으나 결재 라인 설정에 실패했습니다.');
              }
            }

            // 각 상세 내역의 영수증 파일들을 업로드
            setIsUploadingReceipt(true);
            let totalUploadSuccessCount = 0;
            let totalUploadFailCount = 0;

            // 상세 내역 ID 조회를 위해 상세 정보 다시 가져오기
            try {
              console.log('상세 내역 조회 시작, expenseId:', expenseId);
              const detailResponse = await fetchExpenseDetail(expenseId);
              
              if (!detailResponse.success) {
                console.error('상세 내역 조회 실패:', detailResponse);
                alert('상세 내역 조회에 실패했습니다. 영수증은 상세 페이지에서 업로드해주세요.');
                setIsUploadingReceipt(false);
                return;
              }
              
              if (!detailResponse.data || !detailResponse.data.details) {
                console.error('상세 내역 데이터가 없습니다:', detailResponse.data);
                alert('상세 내역 데이터를 찾을 수 없습니다. 영수증은 상세 페이지에서 업로드해주세요.');
                setIsUploadingReceipt(false);
                return;
              }
              
              const savedDetails = detailResponse.data.details;
              console.log('저장된 상세 내역:', savedDetails.map(d => ({
                id: d.expenseDetailId,
                category: d.category,
                description: d.description,
                amount: d.amount
              })));
              console.log('업로드할 영수증이 있는 내역:', formattedDetails.map((d, idx) => ({
                index: idx,
                category: d.category,
                description: d.description,
                amount: d.amount,
                receiptCount: receiptFilesByIndex[idx]?.length || 0
              })));

              // 각 상세 내역별로 영수증 업로드 (description, category, amount로 매칭)
              for (let i = 0; i < formattedDetails.length; i++) {
                const detail = formattedDetails[i];
                const receiptFiles = receiptFilesByIndex[i];
                
                if (receiptFiles && receiptFiles.length > 0) {
                  // description, category, amount로 매칭하여 더 정확한 내역 찾기
                  const savedDetail = savedDetails.find(saved => 
                    saved.description === detail.description && 
                    saved.category === detail.category &&
                    Math.abs(saved.amount - detail.amount) < 1 // 금액이 정확히 일치하는지 확인
                  );
                  
                  if (!savedDetail) {
                    console.error(`상세 내역을 찾을 수 없습니다:`, {
                      category: detail.category,
                      description: detail.description,
                      amount: detail.amount
                    });
                    totalUploadFailCount += receiptFiles.length;
                    continue;
                  }
                  
                  if (!savedDetail.expenseDetailId) {
                    console.error(`expenseDetailId가 없습니다:`, savedDetail);
                    totalUploadFailCount += receiptFiles.length;
                    continue;
                  }
                  
                  console.log(`영수증 업로드 시작: expenseDetailId=${savedDetail.expenseDetailId}, 파일 수=${receiptFiles.length}`);
                  
                  for (const file of receiptFiles) {
                    try {
                      console.log(`영수증 업로드 시도: expenseDetailId=${savedDetail.expenseDetailId}, filename=${file.name}`);
                      const uploadResponse = await uploadReceiptForDetail(
                        savedDetail.expenseDetailId, 
                        expenseId, 
                        user.userId, 
                        file
                      );
                      if (uploadResponse.success) {
                        totalUploadSuccessCount++;
                        console.log(`영수증 업로드 성공: ${file.name}`);
                      } else {
                        totalUploadFailCount++;
                        console.error('영수증 업로드 실패:', uploadResponse.message);
                      }
                    } catch (error) {
                      totalUploadFailCount++;
                      console.error('영수증 업로드 오류:', error);
                      console.error('에러 상세:', error.response?.data || error.message);
                    }
                  }
                }
              }
            } catch (error) {
              console.error('상세 내역 조회 실패:', error);
              alert('상세 내역 조회에 실패했습니다. 영수증은 상세 페이지에서 업로드해주세요.');
            }

            setIsUploadingReceipt(false);

            if (totalUploadSuccessCount > 0) {
              if (totalUploadFailCount > 0) {
                alert(`⚠️ ${totalUploadSuccessCount}개의 영수증이 업로드되었습니다.\n${totalUploadFailCount}개의 영수증 업로드에 실패했습니다.\n상세 페이지에서 다시 업로드해주세요.`);
              }
            } else if (totalUploadFailCount > 0) {
              alert(`❌ 모든 영수증 업로드에 실패했습니다.\n상세 페이지에서 다시 업로드해주세요.\n\n실패한 영수증 수: ${totalUploadFailCount}개`);
            }

            // 성공 메시지
            if (!hasSalaryCategory) {
              alert('지출결의서가 작성되고 결재 라인이 설정되었습니다!');
            } else {
              alert('급여 지출결의서가 작성되었습니다!');
            }

            navigate(`/detail/${expenseId}`);
          } else {
            alert('지출결의서가 작성되었으나 ID를 확인할 수 없습니다.');
            navigate('/expenses');
          }
        } else {
          alert('작성 실패: ' + response.data.message);
        }
      }
    } catch (error) {
      console.error('에러 발생:', error);
      const errorMessage = error?.response?.data?.message || error?.message || '서버 통신 중 오류가 발생했습니다.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingOverlay fullScreen={true} message="로딩 중..." />;
  }

  return (
    <S.Container>
      {/* 2. 결재자 선택 섹션 - 급여가 아닌 경우에만 표시 */}
      {!hasSalaryCategory && (
        <S.Section ref={approverSectionRef} data-tourid="tour-approver-selection">
          <S.SectionHeader>
            <S.SectionTitle>결재자 선택</S.SectionTitle>
            <S.SelectApproverButton onClick={() => setIsApproverModalOpen(true)}>
              <FaUserCheck />
              <span>결재자 선택</span>
            </S.SelectApproverButton>
          </S.SectionHeader>
          
          {selectedApprovers.length > 0 ? (
            <S.SelectedApproversDisplay>
              <S.SelectedApproversTitle>선택된 결재 순서:</S.SelectedApproversTitle>
              <S.SelectedApproversList>
                {selectedApprovers.map((userId, index) => {
                  const adminUser = adminUsers.find(user => user.userId === userId);
                  return (
                    <S.SelectedApproverItem key={userId}>
                      <S.ApproverOrderBadge>{index + 1}</S.ApproverOrderBadge>
                      <S.SelectedApproverInfo>
                        <S.SelectedApproverName>{adminUser?.koreanName || '알 수 없음'}</S.SelectedApproverName>
                        <S.SelectedApproverPosition>{adminUser?.position || '관리자'}</S.SelectedApproverPosition>
                      </S.SelectedApproverInfo>
                      <S.RemoveApproverButton 
                        onClick={() => handleApproverToggle(userId)}
                        title="제거"
                      >
                        ×
                      </S.RemoveApproverButton>
                    </S.SelectedApproverItem>
                  );
                })}
              </S.SelectedApproversList>
            </S.SelectedApproversDisplay>
          ) : (
            <S.EmptyApproversMessage>
              결재자를 선택해주세요. 우측 상단의 "결재자 선택" 버튼을 클릭하세요.
            </S.EmptyApproversMessage>
          )}
        </S.Section>
      )}

      {/* 급여 카테고리 선택 시 안내 메시지 */}
      {hasSalaryCategory && (
        <S.Section>
          <S.SectionTitle>결재자 정보</S.SectionTitle>
          <S.InfoMessage>
            급여 항목은 기밀 사항으로 결재자가 지정되지 않습니다. 작성자와 세무사만 조회할 수 있습니다.
          </S.InfoMessage>
        </S.Section>
      )}

      {/* 3. 상세 내역 입력 섹션 */}
      <S.Section ref={detailsSectionRef} data-tourid="tour-expense-details">
        <S.SectionHeader>
          <S.SectionTitle>지출 상세 내역</S.SectionTitle>
          <S.AddButton onClick={addDetailRow}>
            <FaPlus />
            <span>행 추가</span>
          </S.AddButton>
        </S.SectionHeader>

        {/* 데스크톱 테이블 뷰 - 간소화된 요약 뷰 */}
        <S.TableContainer>
          <S.Table>
            <thead>
              <tr>
                <S.Th width="5%">#</S.Th>
                <S.Th width="12%">사용일자</S.Th>
                <S.Th width="12%">항목</S.Th>
                <S.Th width="10%">상호명</S.Th>
                <S.Th width="15%">적요 (내용)</S.Th>
                <S.Th width="12%">금액</S.Th>
                <S.Th width="12%">결제수단</S.Th>
                <S.Th width="20%">관리</S.Th>
              </tr>
            </thead>
            <tbody>
              {completedDetails.length === 0 ? (
                <tr>
                  <S.Td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    지출 상세 내역이 없습니다. "행 추가" 버튼을 클릭하여 추가하세요.
                  </S.Td>
                </tr>
              ) : (
                completedDetails.map((detail, index) => {
                  // 원본 배열에서의 인덱스 찾기
                  const originalIndex = details.findIndex(d => d === detail);
                  return (
                    <S.TableRow key={originalIndex} onClick={() => openEditModal(originalIndex)}>
                      <S.Td>{index + 1}</S.Td>
                      <S.Td>{detail.paymentReqDate || '-'}</S.Td>
                      <S.Td>{detail.category || '-'}</S.Td>
                      <S.Td>{detail.merchantName || '-'}</S.Td>
                      <S.Td>{detail.description || '-'}</S.Td>
                      <S.Td style={{ textAlign: 'right', fontWeight: '600' }}>
                        {detail.amount ? formatNumber(detail.amount) + '원' : '-'}
                      </S.Td>
                      <S.Td>{getPaymentMethodLabel(detail.paymentMethod)}</S.Td>
                      <S.Td onClick={(e) => e.stopPropagation()}>
                        <S.ActionButtonGroup>
                          <S.EditButton onClick={() => openEditModal(originalIndex)} title="수정">
                            <FaEdit />
                          </S.EditButton>
                          <S.DeleteButton onClick={() => removeDetailRow(originalIndex)} title="삭제">
                            <FaTrash />
                          </S.DeleteButton>
                        </S.ActionButtonGroup>
                      </S.Td>
                    </S.TableRow>
                  );
                })
              )}
            </tbody>
          </S.Table>
        </S.TableContainer>

        {/* 모바일 카드 뷰 - 간소화된 요약 뷰 */}
        <S.MobileCardContainer>
          {completedDetails.length === 0 ? (
            <S.EmptyDetailMessage>
              지출 상세 내역이 없습니다. "행 추가" 버튼을 클릭하여 추가하세요.
            </S.EmptyDetailMessage>
          ) : (
            completedDetails.map((detail, index) => {
              // 원본 배열에서의 인덱스 찾기
              const originalIndex = details.findIndex(d => d === detail);
              return (
                <S.DetailCard key={originalIndex} onClick={() => openEditModal(originalIndex)}>
                  <S.CardHeader>
                    <S.CardRowNumber>#{index + 1}</S.CardRowNumber>
                    <S.ActionButtonGroup>
                      <S.EditButton onClick={(e) => { e.stopPropagation(); openEditModal(originalIndex); }} title="수정">
                        <FaEdit />
                      </S.EditButton>
                      <S.DeleteButton onClick={(e) => { e.stopPropagation(); removeDetailRow(originalIndex); }} title="삭제">
                        <FaTrash />
                      </S.DeleteButton>
                    </S.ActionButtonGroup>
                  </S.CardHeader>
                  <S.CardBody>
                    <S.MobileSummaryRow>
                      <S.MobileLabel>사용일자</S.MobileLabel>
                      <S.MobileValue>{detail.paymentReqDate || '-'}</S.MobileValue>
                    </S.MobileSummaryRow>
                    <S.MobileSummaryRow>
                      <S.MobileLabel>항목</S.MobileLabel>
                      <S.MobileValue>{detail.category || '-'}</S.MobileValue>
                    </S.MobileSummaryRow>
                    {detail.merchantName && (
                      <S.MobileSummaryRow>
                        <S.MobileLabel>상호명</S.MobileLabel>
                        <S.MobileValue>{detail.merchantName}</S.MobileValue>
                      </S.MobileSummaryRow>
                    )}
                    <S.MobileSummaryRow>
                      <S.MobileLabel>적요</S.MobileLabel>
                      <S.MobileValue>{detail.description || '-'}</S.MobileValue>
                    </S.MobileSummaryRow>
                    <S.MobileSummaryRow>
                      <S.MobileLabel>금액</S.MobileLabel>
                      <S.MobileValue style={{ fontWeight: '600', color: '#007bff' }}>
                        {detail.amount ? formatNumber(detail.amount) + '원' : '-'}
                      </S.MobileValue>
                    </S.MobileSummaryRow>
                    <S.MobileSummaryRow>
                      <S.MobileLabel>결제수단</S.MobileLabel>
                      <S.MobileValue>{getPaymentMethodLabel(detail.paymentMethod)}</S.MobileValue>
                    </S.MobileSummaryRow>
                  </S.CardBody>
                </S.DetailCard>
              );
            })
          )}
        </S.MobileCardContainer>
      </S.Section>


      {/* 5. 하단 총계 및 버튼 */}
      <S.TotalSection data-tourid="tour-total-amount">
        <S.TotalCard>
          <S.TotalLabel>총 합계</S.TotalLabel>
          <S.TotalAmount>{totalAmount.toLocaleString()} 원</S.TotalAmount>
        </S.TotalCard>
      </S.TotalSection>

      <S.ButtonGroup>
        <S.CancelButton onClick={() => navigate(-1)} disabled={isSubmitting}>
          <FaArrowLeft />
          <span>취소</span>
        </S.CancelButton>
        <S.SubmitButton data-tourid="tour-submit-button" onClick={handleSubmit} disabled={isSubmitting}>
          <FaSave />
          <span>{isSubmitting ? '처리 중...' : '결재 요청 (저장)'}</span>
        </S.SubmitButton>
      </S.ButtonGroup>

      {/* 결재자 선택 모달 */}
      {!hasSalaryCategory && isApproverModalOpen && (
        <Suspense fallback={<div>로딩 중...</div>}>
          <ApproverSelectionModal
            isOpen={isApproverModalOpen}
            onClose={() => setIsApproverModalOpen(false)}
            adminUsers={adminUsers}
            selectedApprovers={selectedApprovers}
            onToggleApprover={handleApproverToggle}
            loadingApprovers={loadingApprovers}
          />
        </Suspense>
      )}

      {/* 상세 내역 입력/수정 모달 */}
      {isDetailModalOpen && (
        <Suspense fallback={<div>로딩 중...</div>}>
          <ExpenseDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false);
              setEditingDetailIndex(null);
            }}
            detail={editingDetailIndex !== null ? details[editingDetailIndex] : null}
            onSave={handleDetailSave}
            availableCategories={availableCategories}
            descriptionInputRef={descriptionInputRefs.current[editingDetailIndex || 0]}
            amountInputRef={amountInputRefs.current[editingDetailIndex || 0]}
          />
        </Suspense>
      )}

      {/* 영수증 첨부할 항목 선택 모달 (수정 모드) */}
      {isReceiptDetailSelectModalOpen && isEditMode && id && (
        <S.ModalOverlay onClick={() => {
          setIsReceiptDetailSelectModalOpen(false);
          setSelectedReceiptFile(null);
        }}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle>영수증을 첨부할 항목 선택</S.ModalTitle>
              <S.ModalCloseButton onClick={() => {
                setIsReceiptDetailSelectModalOpen(false);
                setSelectedReceiptFile(null);
              }}>
                ×
              </S.ModalCloseButton>
            </S.ModalHeader>
            <S.ModalBody>
              <p style={{ marginBottom: '16px', color: '#666', fontSize: '14px' }}>
                다음 항목 중 영수증을 첨부할 항목을 선택하세요.
              </p>
              {savedDetailsForReceipt.length > 0 ? (
                <S.DetailSelectList>
                  {savedDetailsForReceipt.map((detail, index) => (
                    <S.DetailSelectItem
                      key={detail.expenseDetailId}
                      onClick={() => handleReceiptDetailSelect(detail.expenseDetailId)}
                      disabled={isUploadingReceipt}
                    >
                      <S.DetailSelectItemInfo>
                        <S.DetailSelectItemTitle>
                          #{index + 1} - {detail.category || '항목 없음'}
                        </S.DetailSelectItemTitle>
                        <S.DetailSelectItemDesc>
                          {detail.description || '적요 없음'} | {detail.amount ? formatNumber(detail.amount) + '원' : '금액 없음'}
                        </S.DetailSelectItemDesc>
                      </S.DetailSelectItemInfo>
                      {isUploadingReceipt && (
                        <span style={{ color: '#999', fontSize: '12px' }}>업로드 중...</span>
                      )}
                    </S.DetailSelectItem>
                  ))}
                </S.DetailSelectList>
              ) : (
                <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                  저장된 상세 내역이 없습니다. 먼저 결의서를 저장해주세요.
                </p>
              )}
            </S.ModalBody>
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      {/* 토스트 메시지 */}
      {toastMessage && (
        <S.ToastMessage onClick={() => setToastMessage(null)}>
          <S.ToastIcon>⚠️</S.ToastIcon>
          <S.ToastContent>
            <S.ToastTitle>다음 항목이 누락되었습니다:</S.ToastTitle>
            <S.ToastList>
              {toastMessage.map((field, index) => (
                <S.ToastListItem key={index}>{field}</S.ToastListItem>
              ))}
            </S.ToastList>
          </S.ToastContent>
        </S.ToastMessage>
      )}
    </S.Container>
  );
};

export default ExpenseCreatePage;