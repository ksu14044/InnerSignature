import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaTrash, FaSave, FaArrowLeft, FaUserCheck } from 'react-icons/fa';

// 스타일 컴포넌트들을 한꺼번에 'S'라는 이름으로 가져옵니다.
import * as S from './style';
import { useAuth } from '../../contexts/AuthContext';
import { setApprovalLines, fetchApprovers } from '../../api/expenseApi';
import { API_CONFIG } from '../../config/api';
import { EXPENSE_STATUS, APPROVAL_STATUS } from '../../constants/status';
import { getCategoriesByRole } from '../../constants/categories';
import { DEFAULT_VALUES } from '../../constants/defaults';
import TourButton from '../../components/TourButton/TourButton';
import ApproverSelectionModal from '../../components/ApproverSelectionModal/ApproverSelectionModal';

const ExpenseCreatePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. 문서 기본 정보 상태
  const [report, setReport] = useState({
    title: '',
    paymentReqDate: '',
    reportDate: new Date().toISOString().split('T')[0],
    isSecret: false, // 비밀글 여부
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

  // 결재자 목록 불러오기
  useEffect(() => {
    const loadApprovers = async () => {
      try {
        setLoadingApprovers(true);
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

    loadApprovers();
  }, []);

  // --- 이벤트 핸들러 ---

  const handleReportChange = (e) => {
    const { name, value } = e.target;
    setReport({ ...report, [name]: value });
  };

  const handleDetailChange = (index, e) => {
    const { name, value } = e.target;
    const newDetails = [...details];
    newDetails[index][name] = value;
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
    
    // 1. 제목 확인
    if (!report.title || report.title.trim() === '') {
      missingFields.push('제목');
      if (!firstMissingField) {
        firstMissingField = { type: 'title', ref: titleInputRef };
      }
    }
    
    // 2. 지급 요청일 확인
    if (!report.paymentReqDate || report.paymentReqDate.trim() === '') {
      missingFields.push('지급 요청일');
      if (!firstMissingField) {
        firstMissingField = { type: 'paymentReqDate', ref: paymentReqDateInputRef };
      }
    }
    
    // 3. 상세 내역 확인
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
      }
    }
    
    // 4. 결재자 선택 확인 (비밀글이거나 급여가 아닌 경우)
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

    const payload = {
      drafterId: user.userId,
      drafterName: user.koreanName,
      title: report.title,
      reportDate: report.reportDate,
      paymentReqDate: report.paymentReqDate,
      status: isSecretOrSalary ? EXPENSE_STATUS.PAID : EXPENSE_STATUS.WAIT,
      totalAmount: totalAmount,
      details: details,
      isSecret: report.isSecret || false,
    };

    try {
      setIsSubmitting(true);
      const response = await axios.post(`${API_CONFIG.EXPENSES_BASE_URL}/create`, payload);

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
    } catch (error) {
      console.error('에러 발생:', error);
      alert('서버 통신 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <S.Container>
      <S.Header>
        <S.BackButton onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </S.BackButton>
        <S.Title>지출결의서 작성</S.Title>
        <div style={{ marginLeft: 'auto' }}>
          <TourButton />
        </div>
      </S.Header>

      {/* 1. 기본 정보 입력 섹션 */}
      <S.Section data-tourid="tour-basic-info">
        <S.SectionTitle>기본 정보</S.SectionTitle>
        <S.FormGrid>
          <S.InputGroup>
            <S.Label>제목</S.Label>
            <S.Input
              ref={titleInputRef}
              type="text"
              name="title"
              value={report.title}
              onChange={handleReportChange}
              placeholder="예: 12월 회식비 지출"
            />
          </S.InputGroup>

          <S.InputGroup>
            <S.Label>지급 요청일</S.Label>
            <S.Input
              ref={paymentReqDateInputRef}
              type="date"
              name="paymentReqDate"
              value={report.paymentReqDate}
              onChange={handleReportChange}
            />
          </S.InputGroup>

          <S.InputGroup>
            <S.Label>작성자</S.Label>
            <S.Value>{user?.koreanName || '로딩중...'}</S.Value>
          </S.InputGroup>

          {/* CEO, ADMIN 또는 ACCOUNTANT만 비밀글 설정 가능 */}
          {(user?.role === 'CEO' || user?.role === 'ADMIN' || user?.role === 'ACCOUNTANT') && (
            <S.InputGroup>
              <S.Label>
                <input
                  type="checkbox"
                  name="isSecret"
                  checked={report.isSecret}
                  onChange={(e) => setReport({ ...report, isSecret: e.target.checked })}
                  style={{ marginRight: '8px' }}
                />
                비밀글 설정
              </S.Label>
              <S.InfoText>
                비밀글로 설정된 결의서는 작성자와 세무사만 조회할 수 있으며, 결재 없이 바로 지급완료 처리됩니다.
              </S.InfoText>
            </S.InputGroup>
          )}
        </S.FormGrid>
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
                <S.Th width="30%">적요 (내용)</S.Th>
                <S.Th width="20%">금액</S.Th>
                <S.Th width="25%">비고</S.Th>
                <S.Th width="10%">관리</S.Th>
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
                      ref={(el) => (descriptionInputRefs.current[index] = el)}
                      type="text"
                      name="description"
                      value={detail.description}
                      onChange={(e) => handleDetailChange(index, e)}
                    />
                  </S.Td>
                  <S.Td>
                    <S.Input
                      ref={(el) => (amountInputRefs.current[index] = el)}
                      type="number"
                      name="amount"
                      value={detail.amount}
                      onChange={(e) => handleDetailChange(index, e)}
                      onWheel={(e) => e.target.blur()}
                    />
                  </S.Td>
                  <S.Td>
                    <S.Input
                      type="text"
                      name="note"
                      value={detail.note}
                      onChange={(e) => handleDetailChange(index, e)}
                    />
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
                    type="number"
                    name="amount"
                    value={detail.amount}
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