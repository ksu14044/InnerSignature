import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { FaPlus, FaTrash, FaSave, FaArrowLeft, FaUserCheck } from 'react-icons/fa';

// 스타일 컴포넌트들을 한꺼번에 'S'라는 이름으로 가져옵니다.
import * as S from './style';
import { useAuth } from '../../contexts/AuthContext';
import { setApprovalLines, fetchApprovers, fetchExpenseDetail, updateExpense } from '../../api/expenseApi';
import { API_CONFIG } from '../../config/api';
import { EXPENSE_STATUS, APPROVAL_STATUS } from '../../constants/status';
import { getCategoriesByRole } from '../../constants/categories';
import { DEFAULT_VALUES } from '../../constants/defaults';
import TourButton from '../../components/TourButton/TourButton';
import ApproverSelectionModal from '../../components/ApproverSelectionModal/ApproverSelectionModal';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';

const ExpenseCreatePage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // 수정 모드일 때 expenseId
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!id; // id가 있으면 수정 모드

  // 1. 문서 기본 정보 상태
  const [report, setReport] = useState({
    paymentReqDate: new Date().toISOString().split('T')[0], // 오늘 날짜로 디폴트 설정
    reportDate: new Date().toISOString().split('T')[0],
    isSecret: false, // 비밀글 여부
    isPreApproval: false, // 가승인 요청 여부 (결의서 단위)
  });

  // 2. 상세 내역 리스트 상태
  const [details, setDetails] = useState([
    { ...DEFAULT_VALUES.EXPENSE_DETAIL }
  ]);

  // 3. 결재자 관련 상태
  const [adminUsers, setAdminUsers] = useState([]);
  const [selectedApprovers, setSelectedApprovers] = useState([]); // 선택된 결재자 ID들 (순서 보장)
  const [loadingApprovers, setLoadingApprovers] = useState(true); // 결재자 목록 로딩 상태
  const [isApproverModalOpen, setIsApproverModalOpen] = useState(false); // 결재자 선택 모달 열림 상태

  // 5. 토스트 메시지 상태
  const [toastMessage, setToastMessage] = useState(null);

  // 4. 필드 참조 (스크롤 이동용)
  const titleInputRef = useRef(null);
  const paymentReqDateInputRef = useRef(null);
  const descriptionInputRefs = useRef([]);
  const amountInputRefs = useRef([]);
  const approverSectionRef = useRef(null);
  const detailsSectionRef = useRef(null);

  // 총 금액 자동 계산
  const totalAmount = details.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  // 급여 카테고리 포함 여부 확인
  const hasSalaryCategory = useMemo(() => {
    return details.some(detail => detail.category === '급여');
  }, [details]);

  // 비밀글이거나 급여인 경우 결재 불필요
  const isSecretOrSalary = report.isSecret || hasSalaryCategory;

  // 사용자 역할에 따른 카테고리 목록
  const availableCategories = useMemo(() => {
    return getCategoriesByRole(user?.role);
  }, [user?.role]);

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
              paymentReqDate: expense.paymentReqDate || '',
              reportDate: expense.reportDate || new Date().toISOString().split('T')[0],
              isSecret: expense.isSecret || false,
              isPreApproval: expense.isPreApproval || false,
            });

            // 상세 내역 설정
            if (expense.details && expense.details.length > 0) {
              setDetails(expense.details);
            }

            // 결재 라인 설정
            if (expense.approvalLines && expense.approvalLines.length > 0) {
              const approverIds = expense.approvalLines.map(line => line.approverId);
              setSelectedApprovers(approverIds);
            }
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

  const handleReportChange = (e) => {
    const { name, value } = e.target;
    setReport({ ...report, [name]: value });
  };

  // 숫자에 콤마 포맷팅 적용
  const formatNumber = (value) => {
    if (!value && value !== 0) return '';
    // 숫자인 경우 문자열로 변환
    const stringValue = String(value);
    // 숫자가 아닌 문자 제거
    const numericValue = stringValue.replace(/[^0-9]/g, '');
    if (!numericValue) return '';
    // 3자리마다 콤마 추가
    return Number(numericValue).toLocaleString('ko-KR');
  };

  // 콤마가 포함된 문자열을 숫자로 변환
  const parseFormattedNumber = (value) => {
    if (!value) return '';
    return value.replace(/,/g, '');
  };

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
    setDetails([...details, { ...DEFAULT_VALUES.EXPENSE_DETAIL }]);
  };

  const removeDetailRow = (index) => {
    if (details.length === 1) return;
    const newDetails = details.filter((_, i) => i !== index);
    setDetails(newDetails);
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

    // 유효성 검사: 누락된 항목 확인 및 첫 번째 누락 필드로 스크롤
    let firstMissingField = null;
    const missingFields = [];
    
    // 1. 상세 내역 확인
    if (!details || details.length === 0) {
      missingFields.push('지출 상세 내역 (최소 1개 이상 필요)');
      if (!firstMissingField) {
        firstMissingField = { type: 'detailsSection', ref: detailsSectionRef };
      }
    } else {
      // 각 상세 내역 항목 확인
      for (let index = 0; index < details.length; index++) {
        const detail = details[index];
        const rowNumber = index + 1;
        
        // 적요(내용) 확인
        if (!detail.description || detail.description.trim() === '') {
          missingFields.push(`상세 내역 ${rowNumber}행: 적요(내용)`);
          if (!firstMissingField) {
            firstMissingField = { 
              type: 'description', 
              ref: descriptionInputRefs.current[index],
              index 
            };
          }
        }
        
        // 금액 확인
        if (!detail.amount || detail.amount === '' || Number(detail.amount) <= 0) {
          missingFields.push(`상세 내역 ${rowNumber}행: 금액`);
          if (!firstMissingField) {
            firstMissingField = { 
              type: 'amount', 
              ref: amountInputRefs.current[index],
              index 
            };
          }
        }
        
        // 결제수단 확인
        if (!detail.paymentMethod || detail.paymentMethod.trim() === '') {
          missingFields.push(`상세 내역 ${rowNumber}행: 결제수단`);
          if (!firstMissingField) {
            firstMissingField = { 
              type: 'paymentMethod', 
              index 
            };
          }
        }
        
        // 카드 결제인 경우 카드번호 확인
        if ((detail.paymentMethod === 'CARD' || detail.paymentMethod === 'COMPANY_CARD') && 
            (!detail.cardNumber || detail.cardNumber.trim() === '')) {
          missingFields.push(`상세 내역 ${rowNumber}행: 카드번호`);
          if (!firstMissingField) {
            firstMissingField = { 
              type: 'cardNumber', 
              index 
            };
          }
        }
      }
    }
    
    // 2. 결재자 선택 확인 (비밀글이거나 급여가 아닌 경우)
    if (!isSecretOrSalary && (!selectedApprovers || selectedApprovers.length === 0)) {
      missingFields.push('결재자 선택');
      if (!firstMissingField) {
        firstMissingField = { type: 'approver', ref: approverSectionRef };
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
      }
      return;
    }

    // 금액을 숫자로 변환하여 제출
    const formattedDetails = details.map(detail => ({
      ...detail,
      amount: detail.amount ? Number(parseFormattedNumber(detail.amount)) : 0
    }));

    // 담당 결재자 자동 설정 (비밀글이거나 급여가 아닌 경우)
    let finalApprovers = selectedApprovers;
    if (!isSecretOrSalary && (!selectedApprovers || selectedApprovers.length === 0)) {
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

    // 상세 항목에서 paymentReqDate와 isPreApproval 제거 (결의서 단위로만 사용)
    const cleanedDetails = formattedDetails.map(detail => {
      const { paymentReqDate, isPreApproval, ...rest } = detail;
      return rest;
    });

    const payload = {
      drafterId: user.userId,
      drafterName: user.koreanName,
      reportDate: report.reportDate,
      paymentReqDate: report.paymentReqDate,
      isPreApproval: report.isPreApproval || false,
      status: isSecretOrSalary ? EXPENSE_STATUS.PAID : EXPENSE_STATUS.WAIT,
      totalAmount: totalAmount,
      details: cleanedDetails,
      isSecret: report.isSecret || false,
      approvalLines: !isSecretOrSalary ? finalApprovers.map(userId => {
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
          alert('지출결의서가 수정되었습니다!');
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
            // 비밀글이거나 급여가 아닌 경우에만 결재 라인 설정
            if (!isSecretOrSalary) {
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
                alert('지출결의서가 작성되고 결재 라인이 설정되었습니다!');
              } catch (approvalError) {
                console.error('결재 라인 설정 실패:', approvalError);
                alert('지출결의서는 작성되었으나 결재 라인 설정에 실패했습니다.');
              }
            } else {
              alert(report.isSecret ? '비밀글 지출결의서가 작성되었습니다!' : '급여 지출결의서가 작성되었습니다!');
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
      <S.Header>
        <S.BackButton onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </S.BackButton>
        <S.Title>{isEditMode ? '지출결의서 수정' : '지출결의서 작성'}</S.Title>
        <div style={{ marginLeft: 'auto' }}>
          <TourButton />
        </div>
      </S.Header>

      {/* 기본 정보 섹션 */}
      <S.Section>
        <S.SectionHeader>
          <S.SectionTitle>기본 정보</S.SectionTitle>
        </S.SectionHeader>
        <S.FormRow>
          <S.FormGroup>
            <S.Label>지급 요청일 *</S.Label>
            <S.Input
              type="date"
              name="paymentReqDate"
              value={report.paymentReqDate}
              onChange={handleReportChange}
              required
            />
          </S.FormGroup>
          <S.FormGroup>
            <S.Label>
              <input
                type="checkbox"
                name="isPreApproval"
                checked={report.isPreApproval || false}
                onChange={(e) => setReport({ ...report, isPreApproval: e.target.checked })}
              />
              가승인 요청
            </S.Label>
            <S.HelpText>영수증이 아직 없는 경우 가승인을 요청할 수 있습니다.</S.HelpText>
          </S.FormGroup>
        </S.FormRow>
      </S.Section>

      {/* 2. 결재자 선택 섹션 - 비밀글이거나 급여가 아닌 경우에만 표시 */}
      {!isSecretOrSalary && (
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

      {/* 비밀글이거나 급여 카테고리 선택 시 안내 메시지 */}
      {isSecretOrSalary && (
        <S.Section>
          <S.SectionTitle>결재자 정보</S.SectionTitle>
          <S.InfoMessage>
            {report.isSecret 
              ? '비밀글은 기밀 사항으로 결재자가 지정되지 않습니다. 작성자와 세무사만 조회할 수 있습니다.'
              : '급여 항목은 기밀 사항으로 결재자가 지정되지 않습니다. 작성자와 세무사만 조회할 수 있습니다.'}
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

        {/* 데스크톱 테이블 뷰 */}
        <S.TableContainer>
          <S.Table>
            <thead>
              <tr>
                <S.Th width="15%">항목</S.Th>
                <S.Th width="15%">상호명</S.Th>
                <S.Th width="25%">적요 (내용)</S.Th>
                <S.Th width="15%">금액</S.Th>
                <S.Th width="12%">결제수단</S.Th>
                <S.Th width="10%">카드번호</S.Th>
                <S.Th width="8%">관리</S.Th>
              </tr>
            </thead>
            <tbody>
              {details.map((detail, index) => (
                <tr key={index}>
                  <S.Td>
                    <S.Select name="category" value={detail.category} onChange={(e) => handleDetailChange(index, e)}>
                      {availableCategories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </S.Select>
                  </S.Td>
                  <S.Td>
                    <S.Input
                      type="text"
                      name="merchantName"
                      value={detail.merchantName || ''}
                      onChange={(e) => handleDetailChange(index, e)}
                      placeholder="상호명/업체명"
                      maxLength={200}
                    />
                  </S.Td>
                  <S.Td>
                    <S.Input
                      ref={(el) => (descriptionInputRefs.current[index] = el)}
                      type="text"
                      name="description"
                      value={detail.description}
                      onChange={(e) => handleDetailChange(index, e)}
                    />
                  </S.Td>
                  <S.Td>
                    <S.Input
                      type="date"
                      name="paymentReqDate"
                      value={detail.paymentReqDate || ''}
                      onChange={(e) => handleDetailChange(index, e)}
                    />
                  </S.Td>
                  <S.Td>
                    <S.Input
                      ref={(el) => (amountInputRefs.current[index] = el)}
                      type="text"
                      name="amount"
                      value={detail.amount ? formatNumber(detail.amount) : ''}
                      onChange={(e) => handleDetailChange(index, e)}
                      onWheel={(e) => e.target.blur()}
                      placeholder="금액을 입력하세요"
                    />
                  </S.Td>
                  <S.Td>
                    <S.Select 
                      name="paymentMethod" 
                      value={detail.paymentMethod || ''} 
                      onChange={(e) => handleDetailChange(index, e)}
                      required
                    >
                      <option value="">선택</option>
                      <option value="CASH">현금</option>
                      <option value="BANK_TRANSFER">계좌이체</option>
                      <option value="CARD">개인카드</option>
                      <option value="COMPANY_CARD">회사카드</option>
                    </S.Select>
                  </S.Td>
                  <S.Td>
                    {(detail.paymentMethod === 'CARD' || detail.paymentMethod === 'COMPANY_CARD') ? (
                      <S.Input
                        type="text"
                        name="cardNumber"
                        value={detail.cardNumber || ''}
                        onChange={(e) => handleDetailChange(index, e)}
                        placeholder="카드번호"
                        maxLength={19}
                      />
                    ) : (
                      <span>-</span>
                      )}
                  </S.Td>
                  <S.Td>
                    <S.DeleteButton onClick={() => removeDetailRow(index)}>
                      <FaTrash />
                    </S.DeleteButton>
                  </S.Td>
                </tr>
              ))}
            </tbody>
          </S.Table>
        </S.TableContainer>

        {/* 모바일 카드 뷰 */}
        <S.MobileCardContainer>
          {details.map((detail, index) => (
            <S.DetailCard key={index}>
              <S.CardHeader>
                <S.CardRowNumber>#{index + 1}</S.CardRowNumber>
                <S.DeleteButton onClick={() => removeDetailRow(index)}>
                  <FaTrash />
                </S.DeleteButton>
              </S.CardHeader>
              <S.CardBody>
                <S.MobileInputGroup>
                  <S.MobileLabel>항목</S.MobileLabel>
                  <S.MobileSelect name="category" value={detail.category} onChange={(e) => handleDetailChange(index, e)}>
                    {availableCategories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </S.MobileSelect>
                </S.MobileInputGroup>
                <S.MobileInputGroup>
                  <S.MobileLabel>적요 (내용)</S.MobileLabel>
                  <S.MobileInput
                    ref={(el) => (descriptionInputRefs.current[index] = el)}
                    type="text"
                    name="description"
                    value={detail.description}
                    onChange={(e) => handleDetailChange(index, e)}
                    placeholder="지출 내용을 입력하세요"
                  />
                </S.MobileInputGroup>
                <S.MobileInputGroup>
                  <S.MobileLabel>금액</S.MobileLabel>
                  <S.MobileInput
                    ref={(el) => (amountInputRefs.current[index] = el)}
                    type="text"
                    name="amount"
                    value={detail.amount ? formatNumber(detail.amount) : ''}
                    onChange={(e) => handleDetailChange(index, e)}
                    onWheel={(e) => e.target.blur()}
                    placeholder="금액을 입력하세요"
                  />
                </S.MobileInputGroup>
                <S.MobileInputGroup>
                  <S.MobileLabel>비고</S.MobileLabel>
                  <S.MobileInput
                    type="text"
                    name="note"
                    value={detail.note}
                    onChange={(e) => handleDetailChange(index, e)}
                    placeholder="비고를 입력하세요 (선택사항)"
                  />
                </S.MobileInputGroup>
              </S.CardBody>
            </S.DetailCard>
          ))}
        </S.MobileCardContainer>
      </S.Section>

      {/* 4. 하단 총계 및 버튼 */}
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
      {!isSecretOrSalary && (
        <ApproverSelectionModal
          isOpen={isApproverModalOpen}
          onClose={() => setIsApproverModalOpen(false)}
          adminUsers={adminUsers}
          selectedApprovers={selectedApprovers}
          onToggleApprover={handleApproverToggle}
          loadingApprovers={loadingApprovers}
        />
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