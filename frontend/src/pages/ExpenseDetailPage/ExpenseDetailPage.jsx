import { useEffect, useState, useRef, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchExpenseDetail, approveExpense, rejectExpense, cancelApproval, cancelRejection, updateExpenseStatus, uploadReceipt, getReceipts, deleteReceipt, downloadReceipt, updateExpenseDetailTaxInfo, deleteExpense } from '../../api/expenseApi';
import { getExpenseDetailForSuperAdmin } from '../../api/superAdminApi';
import { getMySignatures } from '../../api/signatureApi';
import * as S from './style'; // 스타일 가져오기
import { useAuth } from '../../contexts/AuthContext';
import { STATUS_KOREAN } from '../../constants/status';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';

// Lazy load 모달 컴포넌트
const SignatureModal = lazy(() => import('../../components/SignatureModal/SignatureModal'));


const ExpenseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // 결재 모달 열림 여부
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false); // 반려 모달 열림 여부
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false); // 결제 완료 모달 열림 여부
  const [rejectionReason, setRejectionReason] = useState(''); // 반려 사유
  const [detailActualPaidAmounts, setDetailActualPaidAmounts] = useState({}); // 상세 항목별 실제 지급 금액 {expenseDetailId: amount}
  const [detailPaymentMethods, setDetailPaymentMethods] = useState({}); // 상세 항목별 결제수단 {expenseDetailId: paymentMethod}
  const [amountDifferenceReason, setAmountDifferenceReason] = useState(''); // 금액 차이 사유
  const [receipts, setReceipts] = useState([]); // 영수증 목록
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isCancelingApproval, setIsCancelingApproval] = useState(false);
  const [isCancelingRejection, setIsCancelingRejection] = useState(false);
  const [isMarkingAsPaid, setIsMarkingAsPaid] = useState(false);
  const [isCompletingTax, setIsCompletingTax] = useState(false);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [deletingReceiptId, setDeletingReceiptId] = useState(null);
  const [editingTaxInfo, setEditingTaxInfo] = useState(null);
  const [isDeletingExpense, setIsDeletingExpense] = useState(false);
  const [taxInfoForm, setTaxInfoForm] = useState({ isTaxDeductible: true, nonDeductibleReason: '' });
  const [isAddApproverModalOpen, setIsAddApproverModalOpen] = useState(false);
  const [availableApprovers, setAvailableApprovers] = useState([]);
  const [selectedAdditionalApprover, setSelectedAdditionalApprover] = useState(null);
  const [isAddingApprover, setIsAddingApprover] = useState(false);
  const [savedSignatures, setSavedSignatures] = useState([]);
  const paymentModalReceiptInputRef = useRef(null);
  const {user} = useAuth();

  useEffect(() => {
    // SUPERADMIN인 경우 SUPERADMIN 전용 API 사용
    const fetchDetail = user?.role === 'SUPERADMIN' 
      ? getExpenseDetailForSuperAdmin(id)
      : fetchExpenseDetail(id);
    
    fetchDetail
      .then((res) => {
        if (res.success) {
          setDetail(res.data);
          // 영수증 목록 설정 (상세 조회에서 이미 포함됨)
          if (res.data.receipts) {
            setReceipts(res.data.receipts || []);
          }
          console.log('Loaded expense detail:', res.data); // 데이터 확인용 로그
          console.log('Approval lines:', res.data.approvalLines); // approvalLines 확인용 로그
        } else navigate('/');
      })
      .catch(() => navigate('/'));
  }, [id, navigate, user]);

  // 저장된 서명/도장 조회
  useEffect(() => {
    if (user) {
      getMySignatures()
        .then((res) => {
          if (res.success) {
            setSavedSignatures(res.data || []);
          }
        })
        .catch((error) => {
          console.error('서명/도장 조회 실패:', error);
        });
    }
  }, [user]);

  if (!detail) return <LoadingOverlay fullScreen={true} message="로딩 중..." />;

  // 급여 카테고리 포함 여부 확인
  const hasSalaryCategory = detail.details && detail.details.some(detailItem => detailItem.category === '급여');
  
  // 급여인 경우 결재 불필요 (기밀 사항)

  const handleOpenModal = () => {
    // 저장된 서명이 있고 기본 서명이 있으면 바로 결재할지 물어봄
    const defaultSignature = savedSignatures.find(sig => sig.isDefault);
    if (defaultSignature) {
      if (confirm('저장된 기본 서명/도장을 사용하여 결재하시겠습니까?\n(취소를 누르면 서명을 선택하거나 새로 그릴 수 있습니다.)')) {
        handleSaveSignature(defaultSignature.signatureData);
        return;
      }
    }
    // 그렇지 않으면 모달 열기
    setIsModalOpen(true);
  }

  const handleOpenRejectModal = () => {
    setIsRejectModalOpen(true);
  }

  const handleCloseRejectModal = () => {
    setIsRejectModalOpen(false);
    setRejectionReason('');
  }

  // 추가 결재자 추가 모달 열기
  const handleOpenAddApproverModal = async () => {
    if (!user) return;
    
    try {
      // 첫 결재자의 담당 결재자 목록 조회
      const firstApproverId = detail.approvalLines[0].approverId;
      const { getActiveApprovers } = await import('../../api/userApproverApi');
      const response = await getActiveApprovers(firstApproverId);
      
      if (response.success && response.data && response.data.length > 0) {
        // 이미 추가된 결재자 ID 목록
        const existingApproverIds = detail.approvalLines.map(line => line.approverId);
        
        // 이미 추가된 결재자 제외
        const filteredApprovers = response.data.filter(
          approver => !existingApproverIds.includes(approver.userId)
        );
        
        if (filteredApprovers.length > 0) {
          setAvailableApprovers(filteredApprovers);
          // 담당 결재자가 1명이면 자동 선택
          if (filteredApprovers.length === 1) {
            setSelectedAdditionalApprover(filteredApprovers[0].userId);
          }
          setIsAddApproverModalOpen(true);
        } else {
          alert('추가할 수 있는 담당 결재자가 없습니다.');
        }
      } else {
        alert('추가할 수 있는 담당 결재자가 없습니다.');
      }
    } catch (error) {
      console.error('담당 결재자 조회 실패:', error);
      alert('담당 결재자 조회 중 오류가 발생했습니다.');
    }
  };

  // 추가 결재자 추가 모달 닫기
  const handleCloseAddApproverModal = () => {
    setIsAddApproverModalOpen(false);
    setSelectedAdditionalApprover(null);
    setAvailableApprovers([]);
  };

  // 추가 결재자 추가 처리
  const handleAddApprover = async () => {
    if (!selectedAdditionalApprover) {
      alert('결재자를 선택해주세요.');
      return;
    }

    try {
      setIsAddingApprover(true);
      const { addApprovalLine } = await import('../../api/expenseApi');
      const response = await addApprovalLine(id, {
        approverId: selectedAdditionalApprover,
        approverPosition: availableApprovers.find(a => a.userId === selectedAdditionalApprover)?.position || '관리자',
        approverName: availableApprovers.find(a => a.userId === selectedAdditionalApprover)?.koreanName || '관리자',
        status: 'WAIT'
      });

      if (response.success) {
        alert('추가 결재자가 설정되었습니다.');
        handleCloseAddApproverModal();
        window.location.reload();
      } else {
        alert('추가 결재자 설정 실패: ' + response.message);
      }
    } catch (error) {
      console.error('추가 결재자 설정 실패:', error);
      alert('추가 결재자 설정 중 오류가 발생했습니다.');
    } finally {
      setIsAddingApprover(false);
    }
  };

  // 결재 권한이 있는지 확인하는 함수
  const hasApprovalPermission = () => {
    if (!user || !detail?.approvalLines) return false;

    return detail.approvalLines.some(line => line.approverId === user.userId);
  };

  // 결재자 서명 여부 확인 (하나라도 서명이 있으면 true)
  const hasAnyApprovalSignature = () => {
    if (!detail?.approvalLines) return false;
    return detail.approvalLines.some(line => line.signatureData != null && line.signatureData.trim() !== '');
  };

  // 수정/삭제 가능 여부 확인 (반려인 경우만 가능)
  const canEditOrDelete = () => {
    if (!user || !detail) return false;
    // 작성자 본인이 아니면 불가
    if (detail.drafterId !== user.userId) return false;
    // WAIT 상태가 아니면 불가
    if (detail.status !== 'WAIT' && detail.status !== 'REJECTED') return false;

    // 세무 수집된 문서는 수정 불가 (세무 수정 요청 기능 비활성화됨)
    if (detail.taxCollectedAt) {
      return false;
    }
    
    // 결재자 서명이 있으면 반려인 경우만 가능
    if (hasAnyApprovalSignature() && detail.status !== 'REJECTED') return false;
    
    return true;
  };

  // 삭제 핸들러
  const handleDeleteExpense = async () => {
    if (isDeletingExpense) return;
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!window.confirm('정말로 이 지출결의서를 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.')) {
      return;
    }

    try {
      setIsDeletingExpense(true);
      const response = await deleteExpense(id, user.userId);
      if (response.success) {
        alert('지출결의서가 삭제되었습니다.');
        navigate('/expenses');
      } else {
        alert('삭제 실패: ' + response.message);
      }
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeletingExpense(false);
    }
  };

  // 결재 라인에 있는 결재자가 추가 결재자를 추가할 수 있는지 확인
  const canAddApprover = () => {
    if (!user || !detail?.approvalLines || detail.approvalLines.length === 0) return false;

    // 첫 결재자가 결재했는지 확인
    const firstLine = detail.approvalLines[0];
    const hasFirstApproverSigned = firstLine.signatureData != null && firstLine.signatureData.trim() !== '';

    // 현재 사용자가 결재 라인에 있는지 확인
    const isCurrentUserInApprovalLine = detail.approvalLines.some(line => line.approverId === user.userId);

    return hasFirstApproverSigned && isCurrentUserInApprovalLine;
  };

  const handleSaveSignature = (signatureData) => {
    if(isApproving) return;
    if(!user) {
        alert("로그인 후 결재할 수 있습니다.");
        return;
    }
    const requestData = {
        approverId: user.userId,
        signatureData: signatureData
    };

    setIsApproving(true);
    approveExpense(id, requestData)
    .then((res) => {
        if(res.success) {
            setIsModalOpen(false);
            // 상세 데이터 다시 불러오기
            const fetchDetail = user?.role === 'SUPERADMIN' 
              ? getExpenseDetailForSuperAdmin(id)
              : fetchExpenseDetail(id);
            
            fetchDetail.then((detailRes) => {
                if (detailRes.success) {
                    setDetail(detailRes.data);
                    if (detailRes.data.receipts) {
                        setReceipts(detailRes.data.receipts || []);
                    }
                    alert("✅ 결재가 완료되었습니다!\n서명이 정상적으로 저장되었습니다. 아래에서 확인하세요.");
                }
            }).catch(() => {
                alert("결재는 완료되었으나 데이터를 새로고침하는데 실패했습니다.");
            });
        } else {
            alert("결재 실패: " + res.message);
        }
    })
    .catch(() => alert("오류가 발생했습니다."))
    .finally(() => setIsApproving(false));
  };

  const handleRejectExpense = () => {
    if(isRejecting) return;
    if(!user) {
        alert("로그인 후 결재할 수 있습니다.");
        return;
    }

    if(!rejectionReason.trim()) {
        alert("반려 사유를 입력해주세요.");
        return;
    }

    const requestData = {
        approverId: user.userId,
        rejectionReason: rejectionReason.trim()
    };

    setIsRejecting(true);
    rejectExpense(id, requestData)
    .then((res) => {
        if(res.success) {
            handleCloseRejectModal();
            // 상세 데이터 다시 불러오기
            const fetchDetail = user?.role === 'SUPERADMIN' 
              ? getExpenseDetailForSuperAdmin(id)
              : fetchExpenseDetail(id);
            
            fetchDetail.then((detailRes) => {
                if (detailRes.success) {
                    setDetail(detailRes.data);
                    if (detailRes.data.receipts) {
                        setReceipts(detailRes.data.receipts || []);
                    }
                    alert("❌ 결재가 반려되었습니다!\n반려 사유가 정상적으로 저장되었습니다.");
                }
            }).catch(() => {
                alert("반려는 완료되었으나 데이터를 새로고침하는데 실패했습니다.");
            });
        } else {
            alert("반려 실패: " + res.message);
        }
    })
    .catch(() => alert("오류가 발생했습니다."))
    .finally(() => setIsRejecting(false));
  };

  // 결재 취소 처리
  const handleCancelApproval = () => {
    if(isCancelingApproval) return;
    if(!user) {
        alert("로그인 후 진행할 수 있습니다.");
        return;
    }

    if(window.confirm("정말로 결재를 취소하시겠습니까?")) {
        setIsCancelingApproval(true);
        cancelApproval(id)
        .then((res) => {
            if(res.success) {
                alert("결재가 취소되었습니다!");
                window.location.reload();
            } else {
                alert("결재 취소 실패: " + res.message);
            }
        })
        .catch((error) => {
            const errorMessage = error?.response?.data?.message || error?.message || "오류가 발생했습니다.";
            alert(errorMessage);
        })
        .finally(() => setIsCancelingApproval(false));
    }
  };

  // 반려 취소 처리
  const handleCancelRejection = () => {
    if(isCancelingRejection) return;
    if(!user) {
        alert("로그인 후 진행할 수 있습니다.");
        return;
    }

    if(window.confirm("정말로 반려를 취소하시겠습니까?")) {
        setIsCancelingRejection(true);
        cancelRejection(id)
        .then((res) => {
            if(res.success) {
                alert("반려가 취소되었습니다!");
                window.location.reload();
            } else {
                alert("반려 취소 실패: " + res.message);
            }
        })
        .catch((error) => {
            const errorMessage = error?.response?.data?.message || error?.message || "오류가 발생했습니다.";
            alert(errorMessage);
        })
        .finally(() => setIsCancelingRejection(false));
    }
  };

  // 결제 완료 모달 열기
  const handleOpenPaymentModal = () => {
    if (!user || user.role !== 'ACCOUNTANT') {
      alert("ACCOUNTANT 권한만 결제 완료 처리가 가능합니다.");
      return;
    }
    setAmountDifferenceReason('');
    
    // 상세 항목별 초기값 설정 (결재 금액으로)
    const initialDetailAmounts = {};
    const initialPaymentMethods = {};
    if (detail.details && detail.details.length > 0) {
      detail.details.forEach(item => {
        initialDetailAmounts[item.expenseDetailId] = item.amount ? item.amount.toString() : '';
        // 기존 결제수단이 있으면 사용, 없으면 기본값 'CASH'
        initialPaymentMethods[item.expenseDetailId] = item.paymentMethod || 'CASH';
      });
    }
    setDetailActualPaidAmounts(initialDetailAmounts);
    setDetailPaymentMethods(initialPaymentMethods);
    
    setIsPaymentModalOpen(true);
  };

  // 결제 완료 모달 닫기
  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setDetailActualPaidAmounts({});
    setDetailPaymentMethods({});
    setAmountDifferenceReason('');
  };


  // 금액 포맷팅 (천 단위 콤마)
  const formatAmount = (value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (!numericValue) return '';
    return parseInt(numericValue).toLocaleString();
  };
  
  // 상세 항목별 금액 입력 핸들러
  const handleDetailAmountChange = (expenseDetailId, value) => {
    const formatted = formatAmount(value);
    setDetailActualPaidAmounts(prev => ({
      ...prev,
      [expenseDetailId]: formatted
    }));
  };

  // 항목 합계 계산 함수
  const calculateTotalAmount = () => {
    if (!detail.details || detail.details.length === 0) return 0;
    return detail.details.reduce((sum, item) => {
      const detailAmountStr = detailActualPaidAmounts[item.expenseDetailId];
      if (detailAmountStr && detailAmountStr.trim()) {
        const num = parseInt(detailAmountStr.replace(/,/g, ''));
        return sum + (num || 0);
      }
      return sum + (item.amount || 0);
    }, 0);
  };

  // 상세 항목별 결제수단 변경 핸들러
  const handleDetailPaymentMethodChange = (expenseDetailId, paymentMethod) => {
    setDetailPaymentMethods(prev => ({
      ...prev,
      [expenseDetailId]: paymentMethod
    }));
  };

  // 세무 수정 요청 처리 (TAX_ACCOUNTANT 전용) - 기능 비활성화됨
  // const handleRequestTaxRevision = () => {
  //   if(!user) {
  //       alert("로그인 후 진행할 수 있습니다.");
  //       return;
  //   }

  //   if(user.role !== 'TAX_ACCOUNTANT') {
  //       alert("TAX_ACCOUNTANT 권한만 수정 요청이 가능합니다.");
  //       return;
  //   }

  //   if(!detail || !detail.taxCollectedAt) {
  //       alert("세무 수집된 문서만 수정 요청할 수 있습니다.");
  //       return;
  //   }

  //   // 재요청 가능하므로 이미 수정 요청된 경우 체크 제거
  //   const promptMessage = detail.taxRevisionRequested
  //     ? '수정 요청 사유를 입력해주세요.\n(재요청: 이전 요청 사유를 덮어씁니다)\n(예: 영수증과 작성 금액 불일치)'
  //     : '수정 요청 사유를 입력해주세요.\n(예: 영수증과 작성 금액 불일치)';
  //
  //   const reason = prompt(promptMessage);
  //   if (!reason || !reason.trim()) {
  //       return;
  //   }

  //   if(!window.confirm("정말로 수정 요청을 보내시겠습니까?")) {
  //       return;
  //   }

  //   requestTaxRevision(id, reason)
  //   .then((res) => {
  //       if(res.success) {
  //           alert("수정 요청이 전송되었습니다.");
  //           window.location.reload();
  //       } else {
  //           alert("수정 요청 실패: " + res.message);
  //       }
  //   })
  //   .catch((error) => {
  //       const errorMessage = error?.response?.data?.message || error?.message || "오류가 발생했습니다.";
  //       alert(errorMessage);
  //   });
  // };

  // 영수증 업로드 처리
  const handleReceiptUpload = (event) => {
    if(isUploadingReceipt) return;
    if(!user) {
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

    setIsUploadingReceipt(true);
    uploadReceipt(id, user.userId, file)
    .then((res) => {
        if(res.success) {
            alert("영수증이 업로드되었습니다!");
            // 상세 정보 다시 조회하여 영수증 목록 갱신
            const fetchDetail = user?.role === 'SUPERADMIN' 
              ? getExpenseDetailForSuperAdmin(id)
              : fetchExpenseDetail(id);
            fetchDetail
            .then((res) => {
                if (res.success && res.data) {
                    setDetail(res.data);
                    if (res.data.receipts) {
                        setReceipts(res.data.receipts || []);
                    }
                }
            });
        } else {
            alert("영수증 업로드 실패: " + res.message);
        }
    })
    .catch(() => alert("오류가 발생했습니다."))
    .finally(() => {
        setIsUploadingReceipt(false);
        // 파일 input 초기화
        event.target.value = '';
    });
  };

  // 영수증 다운로드
  const handleReceiptDownload = (receiptId, filename) => {
    if (!receiptId) return;
    downloadReceipt(receiptId, filename)
    .then(() => {
        // 다운로드 성공 (브라우저가 자동으로 다운로드 처리)
    })
    .catch((err) => {
        const msg = err?.userMessage || err?.message || "영수증 다운로드 중 오류가 발생했습니다.";
        alert(msg);
    });
  };

  // 영수증 삭제
  const handleReceiptDelete = (receiptId) => {
    if(deletingReceiptId === receiptId) return;
    if(!user) {
        alert("로그인 후 진행할 수 있습니다.");
        return;
    }

    if(window.confirm("정말로 이 영수증을 삭제하시겠습니까?")) {
        setDeletingReceiptId(receiptId);
        deleteReceipt(receiptId, user.userId)
        .then((res) => {
            if(res.success) {
                alert("영수증이 삭제되었습니다!");
                // 상세 정보 다시 조회하여 영수증 목록 갱신
                const fetchDetail = user?.role === 'SUPERADMIN' 
                  ? getExpenseDetailForSuperAdmin(id)
                  : fetchExpenseDetail(id);
                fetchDetail
                .then((res) => {
                    if (res.success && res.data) {
                        setDetail(res.data);
                        if (res.data.receipts) {
                            setReceipts(res.data.receipts || []);
                        }
                    }
                });
            } else {
                alert("영수증 삭제 실패: " + res.message);
            }
        })
        .catch(() => alert("오류가 발생했습니다."))
        .finally(() => setDeletingReceiptId(null));
    }
  };

  // 영수증 첨부 권한 체크
  const canUploadReceipt = () => {
    if (!user || !detail) return false;
    if (detail.status !== 'APPROVED') return false;
    
    // 작성자 본인 또는 ACCOUNTANT
    const isOwner = detail.drafterId === user.userId;
    const isAccountant = user.role === 'ACCOUNTANT';
    
    return isOwner || isAccountant;
  };

  // 영수증 조회 권한 체크 (작성자, 결재자, ACCOUNTANT, CEO 등)
  const canViewReceipt = () => {
    if (!user || !detail) return false;
    
    // 작성자는 항상 볼 수 있음
    if (detail.drafterId === user.userId) return true;
    
    // ACCOUNTANT, CEO, ADMIN은 항상 볼 수 있음
    if (user.role === 'ACCOUNTANT' || user.role === 'CEO' || user.role === 'ADMIN') return true;
    
    // TAX_ACCOUNTANT는 항상 볼 수 있음
    if (user.role === 'TAX_ACCOUNTANT') return true;
    
    // 결재 라인에 있는 결재자는 볼 수 있음 (서명 전후 모두)
    if (detail.approvalLines && detail.approvalLines.length > 0) {
      const isApprover = detail.approvalLines.some(line => line.approverId === user.userId);
      if (isApprover) return true;
    }
    
    return false;
  };

  // console.log(detail);
  return (
    <S.Container>
      {/* 1. 상단 헤더 */}
      <S.Header>
        <S.TitleInfo>
          <h1>
            지출결의서
            {hasSalaryCategory && (
              <S.SecretBadge>비밀</S.SecretBadge>
            )}
          </h1>
          <p><strong>문서번호:</strong> {detail.expenseReportId}</p>
          <p><strong>작성자:</strong> {detail.drafterName}</p>
          <p><strong>작성일:</strong> {detail.reportDate}</p>
          {/* 세무처리 완료 상태 표시 (USER는 숨김) */}
          {user && user.role !== 'USER' && detail.taxProcessed !== null && detail.taxProcessed !== undefined && (
            <p>
              <strong>세무처리:</strong> {detail.taxProcessed ? (
                <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                  완료 {detail.taxProcessedAt ? `(${new Date(detail.taxProcessedAt).toLocaleDateString('ko-KR')})` : ''}
                </span>
              ) : (
                <span style={{ color: '#6c757d' }}>미완료</span>
              )}
            </p>
          )}
        </S.TitleInfo>

        <S.StampArea>
          {hasSalaryCategory ? (
            // 급여 결의서는 결재 불필요
            <S.StampBox>
              <S.StampPosition>결재 정보</S.StampPosition>
              <S.StampContent>
                <span style={{ color: '#28a745', fontWeight: 'bold' }}>결재 불필요<br />(지급완료)</span>
              </S.StampContent>
              <S.StampDate></S.StampDate>
            </S.StampBox>
          ) : detail.approvalLines && detail.approvalLines.length > 0 ? (
            detail.approvalLines.map((line) => {
              // 현재 사용자가 해당 결재자인지 확인
              const isCurrentUser = user && line.approverId === user.userId;
              // APPROVED 상태가 아니고, 현재 사용자가 해당 결재자인 경우 취소 가능
              const canCancel = detail.status !== 'APPROVED' && isCurrentUser;
              
              return (
                <S.StampBox key={line.approvalLineId}>
                  <S.StampPosition>{line.approverPosition}</S.StampPosition>
                  <S.StampContent>
                    {line.signatureData ? (
                      <img src={line.signatureData} alt="서명" />
                    ) : line.status === 'REJECTED' ? (
                      <span>
                        {line.approverName}<br />
                        ({STATUS_KOREAN[line.status] || line.status})
                        {line.rejectionReason && (
                          <div style={{ fontSize: '9px', color: '#666', marginTop: '2px', lineHeight: '1.2' }}>
                            사유: {line.rejectionReason}
                          </div>
                        )}
                      </span>
                    ) : (
                      <span>{line.approverName}<br />({STATUS_KOREAN[line.status] || line.status})</span>
                    )}
                  </S.StampContent>
                  <S.StampDate>
                    {line.approvalDate ? line.approvalDate.split('T')[0] : ''}
                  </S.StampDate>
                  {/* 결재 취소/반려 취소 버튼 */}
                  {canCancel && line.status === 'APPROVED' && (
                    <div style={{ marginTop: '8px' }}>
                      <button
                        onClick={handleCancelApproval}
                        disabled={isCancelingApproval || isCancelingRejection || isApproving || isRejecting || isMarkingAsPaid || isCompletingTax}
                        style={{
                          fontSize: '11px',
                          padding: '4px 8px',
                          backgroundColor: '#ffc107',
                          color: '#000',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        {isCancelingApproval ? '취소 중...' : '결재 취소'}
                      </button>
                    </div>
                  )}
                  {/* 결재 라인에 있는 모든 결재자가 추가 결재자 추가 버튼 */}
                  {canAddApprover() && line.approverId === user.userId && detail.status !== 'REJECTED' && (
                    <div style={{ marginTop: '8px' }}>
                      <button
                        onClick={handleOpenAddApproverModal}
                        disabled={isAddingApprover}
                        style={{
                          fontSize: '11px',
                          padding: '4px 8px',
                          backgroundColor: '#17a2b8',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        추가 결재자
                      </button>
                    </div>
                  )}
                  {canCancel && line.status === 'REJECTED' && (
                    <div style={{ marginTop: '8px' }}>
                      <button
                        onClick={handleCancelRejection}
                        disabled={isCancelingApproval || isCancelingRejection || isApproving || isRejecting || isMarkingAsPaid || isCompletingTax}
                        style={{
                          fontSize: '11px',
                          padding: '4px 8px',
                          backgroundColor: '#ffc107',
                          color: '#000',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        {isCancelingRejection ? '취소 중...' : '반려 취소'}
                      </button>
                    </div>
                  )}
                </S.StampBox>
              );
            })
          ) : (
            // approvalLines가 없을 때 기본 결재 라인 표시
            <S.StampBox>
              <S.StampPosition>담당자</S.StampPosition>
              <S.StampContent>
                <span>결재 대기중</span>
              </S.StampContent>
              <S.StampDate></S.StampDate>
            </S.StampBox>
          )}
        </S.StampArea>
      </S.Header>

      {/* 2. 본문 내용 */}
      <S.ContentArea>
        <S.TotalAmount>
          총 합계: <span>{detail.totalAmount.toLocaleString()}</span> 원
        </S.TotalAmount>
        {/* 실제 지급 금액이 있는 경우 표시 */}
        {detail.actualPaidAmount !== null && detail.actualPaidAmount !== undefined && detail.actualPaidAmount !== detail.totalAmount && (
          <div style={{ 
            marginTop: '12px', 
            padding: '12px', 
            backgroundColor: '#fff3cd', 
            border: '1px solid #ffc107', 
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>결재 금액:</strong> {detail.totalAmount.toLocaleString()}원
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>실제 지급 금액:</strong> <span style={{ color: '#dc3545', fontWeight: '600' }}>{detail.actualPaidAmount.toLocaleString()}원</span>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>차이액:</strong> 
              <span style={{ 
                color: detail.totalAmount > detail.actualPaidAmount ? '#dc3545' : '#28a745',
                fontWeight: '600',
                marginLeft: '8px'
              }}>
                {Math.abs(detail.totalAmount - detail.actualPaidAmount).toLocaleString()}원
                {detail.totalAmount > detail.actualPaidAmount ? ' (감액)' : ' (증액)'}
              </span>
            </div>
            {detail.amountDifferenceReason && (
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #ffc107' }}>
                <strong>차이 사유:</strong> {detail.amountDifferenceReason}
              </div>
            )}
          </div>
        )}

        <S.DetailTable>
          <thead>
            <tr>
              <th>항목</th>
              <th>상호명</th>
              <th>적요</th>
              <th style={{ textAlign: 'right' }}>금액</th>
              {detail.status === 'APPROVED' && (
                <>
                  <th style={{ textAlign: 'right' }}>승인 금액</th>
                  <th>결제수단</th>
                  <th>카드번호</th>
                </>
              )}
              <th>비고</th>
              {user?.role === 'TAX_ACCOUNTANT' && (
                <>
                  <th>부가세 공제</th>
                  <th>불공제 사유</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {detail.details.map((item) => {
              const getPaymentMethodLabel = (method) => {
                const labels = {
                  'CASH': '현금',
                  'BANK_TRANSFER': '계좌이체',
                  'TRANSFER': '계좌이체',
                  'CARD': '카드',
                  'CREDIT_CARD': '카드',
                  'DEBIT_CARD': '카드',
                  'CHECK': '수표'
                };
                return labels[method] || method || '-';
              };

              // 상호명 6글자 제한 + 호버 시 풀네임 표시
              const merchantName = item.merchantName || '-';
              const displayMerchantName = merchantName.length > 6 ? merchantName.substring(0, 6) + '...' : merchantName;

              return (
              <tr key={item.expenseDetailId}>
                <td style={{ textAlign: 'center' }} data-label="항목">{item.category}</td>
                <S.MerchantNameCell
                  data-label="상호명"
                  title={merchantName !== '-' && merchantName.length > 6 ? merchantName : ''}
                  hasTooltip={merchantName !== '-' && merchantName.length > 6}
                >
                  {displayMerchantName}
                </S.MerchantNameCell>
                <td data-label="적요">{item.description}</td>
                <td style={{ textAlign: 'right' }} data-label="금액">{item.amount.toLocaleString()}원</td>
                {detail.status === 'APPROVED' && (
                  <>
                    <td style={{ textAlign: 'right' }} data-label="승인 금액">
                      {item.actualPaidAmount !== null && item.actualPaidAmount !== undefined 
                        ? item.actualPaidAmount.toLocaleString() + '원'
                        : item.amount.toLocaleString() + '원'}
                    </td>
                    <td style={{ textAlign: 'center' }} data-label="결제수단">
                      {getPaymentMethodLabel(item.paymentMethod)}
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '13px', color: '#666' }} data-label="카드번호">
                      {(item.paymentMethod === 'CARD' || item.paymentMethod === 'COMPANY_CARD' || 
                        item.paymentMethod === 'CREDIT_CARD' || item.paymentMethod === 'DEBIT_CARD') 
                        && item.cardNumber 
                        ? item.cardNumber 
                        : '-'}
                    </td>
                  </>
                )}
                <td style={{ textAlign: 'center' }} data-label="비고">{item.note || '-'}</td>
                {user?.role === 'TAX_ACCOUNTANT' && (
                  <>
                    <td style={{ textAlign: 'center' }} data-label="부가세 공제">
                      {editingTaxInfo === item.expenseDetailId ? (
                        <select
                          value={taxInfoForm.isTaxDeductible ? 'true' : 'false'}
                          onChange={(e) => setTaxInfoForm(prev => ({ ...prev, isTaxDeductible: e.target.value === 'true' }))}
                          style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        >
                          <option value="true">공제</option>
                          <option value="false">불공제</option>
                        </select>
                      ) : (
                        <span 
                          style={{ 
                            color: item.isTaxDeductible === false ? '#dc3545' : '#28a745', 
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            setEditingTaxInfo(item.expenseDetailId);
                            setTaxInfoForm({
                              isTaxDeductible: item.isTaxDeductible !== false,
                              nonDeductibleReason: item.nonDeductibleReason || ''
                            });
                          }}
                        >
                          {item.isTaxDeductible === false ? '불공제' : '공제'}
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }} data-label="불공제 사유">
                      {editingTaxInfo === item.expenseDetailId ? (
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <select
                            value={taxInfoForm.nonDeductibleReason || ''}
                            onChange={(e) => setTaxInfoForm(prev => ({ ...prev, nonDeductibleReason: e.target.value }))}
                            disabled={taxInfoForm.isTaxDeductible}
                            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd', flex: 1 }}
                          >
                            <option value="">선택하세요</option>
                            <option value="BUSINESS_UNRELATED">사업 무관</option>
                            <option value="ENTERTAINMENT">접대비</option>
                            <option value="SMALL_CAR">비영업용 소형승용차</option>
                            <option value="OTHER">기타</option>
                          </select>
                          <button
                            onClick={async () => {
                              try {
                                await updateExpenseDetailTaxInfo(
                                  item.expenseDetailId,
                                  taxInfoForm.isTaxDeductible,
                                  taxInfoForm.isTaxDeductible ? null : taxInfoForm.nonDeductibleReason || null
                                );
                                alert('부가세 공제 정보가 업데이트되었습니다.');
                                setEditingTaxInfo(null);
                                window.location.reload();
                              } catch (error) {
                                alert(error?.userMessage || error?.response?.data?.message || '업데이트 중 오류가 발생했습니다.');
                              }
                            }}
                            style={{ padding: '4px 8px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            저장
                          </button>
                          <button
                            onClick={() => setEditingTaxInfo(null)}
                            style={{ padding: '4px 8px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <span
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            setEditingTaxInfo(item.expenseDetailId);
                            setTaxInfoForm({
                              isTaxDeductible: item.isTaxDeductible !== false,
                              nonDeductibleReason: item.nonDeductibleReason || ''
                            });
                          }}
                        >
                          {item.nonDeductibleReason || '-'}
                        </span>
                      )}
                    </td>
                  </>
                )}
              </tr>
            );
            })}
          </tbody>
        </S.DetailTable>
      </S.ContentArea>

      {/* 3. 버튼 */}
      <S.ButtonGroup>
         <button className="back" onClick={() => navigate('/expenses')}>목록으로</button>
         {/* 수정/삭제 가능한 경우에만 수정 버튼 표시 */}
         {canEditOrDelete() && (
           <>
             <button
               className="edit"
               onClick={() => navigate(`/expenses/edit/${id}`)}
               style={{ backgroundColor: '#17a2b8', color: 'white' }}
             >
               수정하기
             </button>
             <button
               className="delete"
               onClick={handleDeleteExpense}
               disabled={isDeletingExpense}
               style={{ backgroundColor: '#dc3545', color: 'white' }}
             >
               {isDeletingExpense ? '삭제 중...' : '삭제하기'}
             </button>
           </>
         )}
         {/* 세무 수집된 문서는 수정 불가 안내 메시지 */}
         {detail && detail.taxCollectedAt && user && detail.drafterId === user.userId && detail.status === 'WAIT' && (
           <span style={{
             color: '#dc3545',
             fontSize: '14px',
             marginLeft: '12px',
             padding: '8px 12px',
             backgroundColor: '#fff3cd',
             border: '1px solid #ffc107',
             borderRadius: '4px'
           }}>
             ⚠️ 세무 수집된 문서는 수정할 수 없습니다.
           </span>
         )}
         {/* 결재 권한이 있고, 문서가 반려되지 않고 결제가 완료되지 않은 경우에만 결재하기/반려하기 버튼 표시 */}
         {hasApprovalPermission() && detail.status !== 'REJECTED' && detail.status !== 'APPROVED' && (
           <>
             <button 
               className="approve" 
               onClick={handleOpenModal} 
               disabled={isApproving || isRejecting || isCancelingApproval || isCancelingRejection || isMarkingAsPaid || isCompletingTax}
               aria-label="결재하기"
             >
               {isApproving ? '처리 중...' : '결재하기'}
             </button>
             <button 
               className="reject" 
               onClick={handleOpenRejectModal} 
               disabled={isApproving || isRejecting || isCancelingApproval || isCancelingRejection || isMarkingAsPaid || isCompletingTax}
               aria-label="반려하기"
             >
               {isRejecting ? '처리 중...' : '반려하기'}
             </button>
           </>
         )}
        {/* 세무 수정 요청 버튼 - 기능 비활성화됨 */}
        {/* TAX_ACCOUNTANT 권한을 가진 사용자가 세무 수집된 문서에 대해 수정 요청 가능 */}
        {/* APPROVED 상태(처음 요청) 또는 WAIT 상태(재요청)에서 가능 */}
        {false && user && user.role === 'TAX_ACCOUNTANT' && detail.taxCollectedAt && (detail.status === 'APPROVED' || detail.status === 'WAIT') && (
           <button
             className="edit"
             onClick={handleRequestTaxRevision}
             disabled={isApproving || isRejecting || isCancelingApproval || isCancelingRejection || isMarkingAsPaid || isCompletingTax}
             aria-label={detail.taxRevisionRequested ? '수정 요청 재전송' : '수정 요청 보내기'}
           >
             {detail.taxRevisionRequested ? '수정 요청 재전송' : '수정 요청 보내기'}
           </button>
         )}
       </S.ButtonGroup>

      {/* 4. 영수증 섹션 */}
      {canViewReceipt() && (
        <S.ReceiptSection>
           <S.ReceiptSectionHeader>
             <S.SectionTitle>영수증</S.SectionTitle>
             {canUploadReceipt() && (
               <label>
                 <S.UploadButton disabled={isUploadingReceipt || isApproving || isRejecting || isCancelingApproval || isCancelingRejection || isMarkingAsPaid || isCompletingTax}>
                   {isUploadingReceipt ? '업로드 중...' : '영수증 추가'}
                 </S.UploadButton>
                 <input
                   type="file"
                   accept="image/*,application/pdf"
                   onChange={handleReceiptUpload}
                   disabled={isUploadingReceipt || isApproving || isRejecting || isCancelingApproval || isCancelingRejection || isMarkingAsPaid || isCompletingTax}
                   style={{ display: 'none' }}
                 />
               </label>
             )}
           </S.ReceiptSectionHeader>
           {receipts.length > 0 ? (
             <S.ReceiptList>
              {receipts.map((receipt) => (
                <S.ReceiptItem key={receipt.receiptId}>
                   <S.ReceiptInfo>
                     <div><strong>{receipt.originalFilename}</strong></div>
                     <div>업로드: {receipt.uploadedByName} ({receipt.uploadedAt ? new Date(receipt.uploadedAt).toLocaleString('ko-KR') : ''})</div>
                     {receipt.fileSize && (
                       <div>크기: {(receipt.fileSize / 1024).toFixed(2)} KB</div>
                     )}
                   </S.ReceiptInfo>
                   <S.ReceiptActions>
                     <button onClick={() => handleReceiptDownload(receipt.receiptId, receipt.originalFilename)} disabled={isUploadingReceipt || deletingReceiptId !== null}>다운로드</button>
                     {canUploadReceipt() && (
                       <button onClick={() => handleReceiptDelete(receipt.receiptId)} disabled={isUploadingReceipt || deletingReceiptId === receipt.receiptId || deletingReceiptId !== null}>
                         {deletingReceiptId === receipt.receiptId ? '삭제 중...' : '삭제'}
                       </button>
                     )}
                   </S.ReceiptActions>
                 </S.ReceiptItem>
               ))}
             </S.ReceiptList>
           ) : (
             <S.ReceiptEmpty>
               <p>영수증이 아직 첨부되지 않았습니다.</p>
             </S.ReceiptEmpty>
           )}
         </S.ReceiptSection>
       )}

       {isModalOpen && (
         <Suspense fallback={<div>로딩 중...</div>}>
           <SignatureModal
             isOpen={isModalOpen}
             onClose={() => setIsModalOpen(false)}
             onSave={handleSaveSignature}
             isSaving={isApproving}
             savedSignatures={savedSignatures}
           />
         </Suspense>
       )}

       {/* 반려 모달 */}
       {isRejectModalOpen && (
         <S.RejectModal>
           <S.RejectModalContent>
             <S.RejectModalHeader>
               <h3>결제 반려</h3>
               <button onClick={handleCloseRejectModal}>×</button>
             </S.RejectModalHeader>
             <S.RejectModalBody>
               <label htmlFor="rejectionReason">반려 사유:</label>
               <textarea
                 id="rejectionReason"
                 value={rejectionReason}
                 onChange={(e) => setRejectionReason(e.target.value)}
                 placeholder="반려 사유를 입력해주세요."
                 rows={4}
               />
             </S.RejectModalBody>
             <S.RejectModalFooter>
               <button onClick={handleCloseRejectModal} disabled={isRejecting}>취소</button>
               <button onClick={handleRejectExpense} disabled={isRejecting}>
                 {isRejecting ? '처리 중...' : '반려'}
               </button>
             </S.RejectModalFooter>
           </S.RejectModalContent>
         </S.RejectModal>
       )}

       {/* 결제 완료 모달 */}
       {isPaymentModalOpen && detail && (
         <S.PaymentModal>
           <S.PaymentModalContent>
             <S.PaymentModalHeader>
               <h3>결제 완료 처리</h3>
               <button onClick={handleClosePaymentModal}>×</button>
             </S.PaymentModalHeader>
            <S.PaymentModalBody>
              {/* 영수증 첨부 섹션 */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold' }}>
                  영수증 첨부 <span style={{ color: '#ef4444' }}>*</span>
                </label>
                {(!receipts || receipts.length === 0) && (
                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#fff3cd', 
                    border: '1px solid #ffc107', 
                    borderRadius: '4px',
                    marginBottom: '12px',
                    color: '#856404'
                  }}>
                    ⚠️ <strong>영수증을 반드시 첨부해야 결제 완료 처리가 가능합니다.</strong>
                  </div>
                )}
                
                {/* 영수증 업로드 버튼 */}
                <div>
                  <button
                    type="button"
                    disabled={isUploadingReceipt || isMarkingAsPaid}
                    onClick={() => paymentModalReceiptInputRef.current?.click()}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: isUploadingReceipt ? '#ccc' : '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: isUploadingReceipt ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '12px'
                    }}
                  >
                    {isUploadingReceipt ? '업로드 중...' : '영수증 추가'}
                  </button>
                  <input
                    ref={paymentModalReceiptInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleReceiptUpload}
                    disabled={isUploadingReceipt || isMarkingAsPaid}
                    style={{ display: 'none' }}
                  />
                </div>
                
                {/* 영수증 목록 */}
                {receipts && receipts.length > 0 && (
                  <div style={{ 
                    marginTop: '12px', 
                    padding: '12px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>
                      첨부된 영수증 ({receipts.length}개)
                    </div>
                    {receipts.map((receipt) => (
                      <div 
                        key={receipt.receiptId} 
                        style={{ 
                          padding: '8px', 
                          marginBottom: '4px', 
                          backgroundColor: 'white', 
                          borderRadius: '4px',
                          fontSize: '13px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span>{receipt.originalFilename}</span>
                        {receipt.fileSize && (
                          <span style={{ color: '#666', fontSize: '12px' }}>
                            {(receipt.fileSize / 1024).toFixed(2)} KB
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="amount-info">
                <div className="amount-row">
                  <span>결재 금액:</span>
                  <strong>{detail.totalAmount.toLocaleString()}원</strong>
                </div>
              </div>
              
              {/* 상세 항목별 실제 지급 금액 입력 */}
              {detail.details && detail.details.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold' }}>
                    항목별 실제 지급 금액:
                  </label>
                  <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                    {detail.details.map((item) => {
                      const detailAmount = detailActualPaidAmounts[item.expenseDetailId] ?? item.amount.toString();
                      const detailAmountNum = detailAmount ? parseInt(detailAmount.replace(/,/g, '')) : 0;
                      const isDifferent = detailAmountNum !== item.amount && detailAmountNum > 0;
                      
                      return (
                        <div key={item.expenseDetailId} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <div>
                              <strong>{item.category}</strong>
                              {item.description && <span style={{ color: '#666', marginLeft: '8px', fontSize: '13px' }}>({item.description})</span>}
                            </div>
                            <span style={{ fontSize: '13px', color: '#666' }}>
                              결재: {item.amount.toLocaleString()}원
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                            <input
                              type="text"
                              value={detailAmount}
                              onChange={(e) => handleDetailAmountChange(item.expenseDetailId, e.target.value)}
                              placeholder={item.amount.toString()}
                              style={{
                                flex: 1,
                                padding: '8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '14px'
                              }}
                            />
                            <span style={{ fontSize: '13px', color: '#666', minWidth: '60px' }}>원</span>
                            {isDifferent && (
                              <span style={{ 
                                fontSize: '12px', 
                                color: detailAmountNum < item.amount ? '#dc3545' : '#28a745',
                                fontWeight: 'bold'
                              }}>
                                {detailAmountNum < item.amount ? '▼' : '▲'} {Math.abs(item.amount - detailAmountNum).toLocaleString()}
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <label style={{ fontSize: '13px', color: '#666', minWidth: '70px' }}>결제수단:</label>
                            <select
                              value={detailPaymentMethods[item.expenseDetailId] || 'CASH'}
                              onChange={(e) => handleDetailPaymentMethodChange(item.expenseDetailId, e.target.value)}
                              style={{
                                flex: 1,
                                padding: '8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '14px',
                                backgroundColor: 'white'
                              }}
                            >
                              <option value="CASH">현금</option>
                              <option value="BANK_TRANSFER">계좌이체</option>
                              <option value="CARD">카드</option>
                              <option value="CHECK">수표</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* 상세 항목 합계 표시 */}
                  <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 'bold' }}>항목 합계:</span>
                      <span style={{ fontWeight: 'bold' }}>
                        {calculateTotalAmount().toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 금액 차이 사유 입력 */}
              {(() => {
                const totalAmount = calculateTotalAmount();
                const hasDifference = totalAmount !== detail.totalAmount || 
                  (detail.details && detail.details.some(item => {
                    const detailAmount = detailActualPaidAmounts[item.expenseDetailId];
                    return detailAmount && parseInt(detailAmount.replace(/,/g, '')) !== item.amount;
                  }));
                
                return hasDifference ? (
                  <>
                    <label htmlFor="amountDifferenceReason" style={{ marginTop: '20px', display: 'block' }}>
                      금액 차이 사유 <span style={{ color: '#ef4444' }}>*</span>:
                    </label>
                    <textarea
                      id="amountDifferenceReason"
                      value={amountDifferenceReason}
                      onChange={(e) => setAmountDifferenceReason(e.target.value)}
                      placeholder="결재 금액과 실제 지급 금액이 다른 이유를 입력해주세요."
                      rows={4}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit' }}
                    />
                  </>
                ) : null;
              })()}
              
              {/* 최종 요약 */}
              <div className="amount-info" style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <div className="amount-row">
                  <span>결재 금액:</span>
                  <span>{detail.totalAmount.toLocaleString()}원</span>
                </div>
                <div className="amount-row">
                  <span>실제 지급 금액:</span>
                  <span style={{ fontWeight: 'bold' }}>{calculateTotalAmount().toLocaleString()}원</span>
                </div>
                {calculateTotalAmount() !== detail.totalAmount && (
                  <div className="amount-row">
                    <span>차이액:</span>
                    <span style={{ 
                      fontWeight: 'bold',
                      color: detail.totalAmount > calculateTotalAmount() ? '#dc3545' : '#28a745'
                    }}>
                      {Math.abs(detail.totalAmount - calculateTotalAmount()).toLocaleString()}원
                      {detail.totalAmount > calculateTotalAmount() ? ' (감액)' : ' (증액)'}
                    </span>
                  </div>
                )}
              </div>
            </S.PaymentModalBody>
             <S.PaymentModalFooter>
               <button onClick={handleClosePaymentModal} disabled={isMarkingAsPaid}>취소</button>
               <button onClick={handleMarkAsPaid} disabled={isMarkingAsPaid || (!receipts || receipts.length === 0)}>
                 {isMarkingAsPaid ? '처리 중...' : '결제 완료'}
               </button>
             </S.PaymentModalFooter>
           </S.PaymentModalContent>
         </S.PaymentModal>
       )}

       {/* 추가 결재자 추가 모달 */}
       {isAddApproverModalOpen && (
         <S.RejectModal>
           <S.RejectModalContent>
             <S.RejectModalHeader>
               <h3>추가 결재자 선택</h3>
               <button onClick={handleCloseAddApproverModal}>×</button>
             </S.RejectModalHeader>
             <S.RejectModalBody>
               <label htmlFor="additionalApprover">결재자 선택:</label>
               {availableApprovers.length === 1 ? (
                 <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                   <strong>{availableApprovers[0].koreanName}</strong> ({availableApprovers[0].position}) - 자동 선택됨
                 </div>
               ) : (
                 <select
                   id="additionalApprover"
                   value={selectedAdditionalApprover || ''}
                   onChange={(e) => setSelectedAdditionalApprover(Number(e.target.value))}
                   style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                 >
                   <option value="">선택하세요</option>
                   {availableApprovers.map(approver => (
                     <option key={approver.userId} value={approver.userId}>
                       {approver.koreanName} ({approver.position})
                     </option>
                   ))}
                 </select>
               )}
             </S.RejectModalBody>
             <S.RejectModalFooter>
               <button onClick={handleCloseAddApproverModal} disabled={isAddingApprover}>취소</button>
               <button onClick={handleAddApprover} disabled={isAddingApprover || !selectedAdditionalApprover}>
                 {isAddingApprover ? '처리 중...' : '추가'}
               </button>
             </S.RejectModalFooter>
           </S.RejectModalContent>
         </S.RejectModal>
       )}

    </S.Container>
  );
};

export default ExpenseDetailPage;