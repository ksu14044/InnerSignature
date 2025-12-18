import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchExpenseDetail, approveExpense, rejectExpense, updateExpenseStatus, uploadReceipt, getReceipts, deleteReceipt, downloadReceipt, completeTaxProcessing } from '../../api/expenseApi';
import * as S from './style'; // 스타일 가져오기
import SignatureModal from '../../components/SignatureModal/SignatureModal';
import { useAuth } from '../../contexts/AuthContext';
import { STATUS_KOREAN } from '../../constants/status';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';


const ExpenseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // 결재 모달 열림 여부
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false); // 반려 모달 열림 여부
  const [rejectionReason, setRejectionReason] = useState(''); // 반려 사유
  const [receipts, setReceipts] = useState([]); // 영수증 목록
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isMarkingAsPaid, setIsMarkingAsPaid] = useState(false);
  const [isCompletingTax, setIsCompletingTax] = useState(false);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [deletingReceiptId, setDeletingReceiptId] = useState(null);
  const {user} = useAuth();

  useEffect(() => {
    fetchExpenseDetail(id)
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
  }, [id, navigate]);

  if (!detail) return <LoadingOverlay fullScreen={true} message="로딩 중..." />;

  // 급여 카테고리 포함 여부 확인
  const hasSalaryCategory = detail.details && detail.details.some(detailItem => detailItem.category === '급여');
  
  // 비밀글이거나 급여인 경우 결재 불필요
  const isSecretOrSalary = detail.isSecret || hasSalaryCategory;

  const handleOpenModal = () => {
    setIsModalOpen(true);
  }

  const handleOpenRejectModal = () => {
    setIsRejectModalOpen(true);
  }

  const handleCloseRejectModal = () => {
    setIsRejectModalOpen(false);
    setRejectionReason('');
  }

  // 결재 권한이 있는지 확인하는 함수
  const hasApprovalPermission = () => {
    if (!user || !detail?.approvalLines) return false;

    return detail.approvalLines.some(line => line.approverId === user.userId);
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
            alert("결제가 완료되었습니다!");
            setIsModalOpen(false);
            window.location.reload();
        } else {
            alert("결제 실패: " + res.message);
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
            alert("결제가 반려되었습니다!");
            handleCloseRejectModal();
            window.location.reload();
        } else {
            alert("반려 실패: " + res.message);
        }
    })
    .catch(() => alert("오류가 발생했습니다."))
    .finally(() => setIsRejecting(false));
  };

  // 결제 완료 처리 (ACCOUNTANT 전용)
  const handleMarkAsPaid = () => {
    if(isMarkingAsPaid) return;
    if(!user) {
        alert("로그인 후 진행할 수 있습니다.");
        return;
    }

    if(user.role !== 'ACCOUNTANT') {
        alert("ACCOUNTANT 권한만 결제 완료 처리가 가능합니다.");
        return;
    }

    if(window.confirm("정말로 결제를 완료 처리하시겠습니까?")) {
        setIsMarkingAsPaid(true);
        updateExpenseStatus(id, user.userId, 'PAID')
        .then((res) => {
            if(res.success) {
                alert("결제가 완료되었습니다!");
                window.location.reload();
            } else {
                alert("결제 완료 처리 실패: " + res.message);
            }
        })
        .catch(() => alert("오류가 발생했습니다."))
        .finally(() => setIsMarkingAsPaid(false));
    }
  };

  // 세무처리 완료 처리 (TAX_ACCOUNTANT 전용)
  const handleCompleteTaxProcessing = () => {
    if(isCompletingTax) return;
    if(!user) {
        alert("로그인 후 진행할 수 있습니다.");
        return;
    }

    if(user.role !== 'TAX_ACCOUNTANT') {
        alert("TAX_ACCOUNTANT 권한만 세무처리 완료가 가능합니다.");
        return;
    }

    if(window.confirm("정말로 세무처리를 완료 처리하시겠습니까?")) {
        setIsCompletingTax(true);
        completeTaxProcessing(id)
        .then((res) => {
            if(res.success) {
                alert("세무처리가 완료되었습니다!");
                window.location.reload();
            } else {
                alert("세무처리 완료 실패: " + res.message);
            }
        })
        .catch((error) => {
            const errorMessage = error?.response?.data?.message || error?.message || "오류가 발생했습니다.";
            alert(errorMessage);
        })
        .finally(() => setIsCompletingTax(false));
    }
  };

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
            fetchExpenseDetail(id)
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
                fetchExpenseDetail(id)
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
    if (detail.status !== 'PAID') return false;
    
    // 작성자 본인 또는 ACCOUNTANT
    const isOwner = detail.drafterId === user.userId;
    const isAccountant = user.role === 'ACCOUNTANT';
    
    return isOwner || isAccountant;
  };

  // 영수증 이미지 URL 생성 함수
  const getReceiptImageUrl = (filePath) => {
    const isProd = import.meta.env.MODE === 'production';
    
    if (isProd) {
      // 프로덕션: /api를 통해 접근
      return `/api/${filePath}`;
    } else {
      // 개발 환경: localhost 사용
      return `http://localhost:8080/${filePath}`;
    }
  };

  console.log(detail);
  return (
    <S.Container>
      {/* 1. 상단 헤더 */}
      <S.Header>
        <S.TitleInfo>
          <h1>
            지출결의서
            {(detail.isSecret || hasSalaryCategory) && (
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
          {isSecretOrSalary ? (
            // 비밀글이거나 급여 결의서는 결재 불필요
            <S.StampBox>
              <S.StampPosition>결재 정보</S.StampPosition>
              <S.StampContent>
                <span style={{ color: '#28a745', fontWeight: 'bold' }}>결재 불필요<br />(지급완료)</span>
              </S.StampContent>
              <S.StampDate></S.StampDate>
            </S.StampBox>
          ) : detail.approvalLines && detail.approvalLines.length > 0 ? (
            detail.approvalLines.map((line) => (
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
              </S.StampBox>
            ))
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
        <S.SectionTitle>건명: {detail.title}</S.SectionTitle>
        <S.TotalAmount>
          총 합계: <span>{detail.totalAmount.toLocaleString()}</span> 원
        </S.TotalAmount>

        <S.DetailTable>
          <thead>
            <tr>
              <th>항목</th>
              <th>적요</th>
              <th style={{ textAlign: 'right' }}>금액</th>
              <th>비고</th>
            </tr>
          </thead>
          <tbody>
            {detail.details.map((item) => (
              <tr key={item.expenseDetailId}>
                <td style={{ textAlign: 'center' }}>{item.category}</td>
                <td>{item.description}</td>
                <td style={{ textAlign: 'right' }}>{item.amount.toLocaleString()}</td>
                <td style={{ textAlign: 'center' }}>{item.note}</td>
              </tr>
            ))}
          </tbody>
        </S.DetailTable>
      </S.ContentArea>

      {/* 3. 버튼 */}
      <S.ButtonGroup>
         <button className="back" onClick={() => navigate('/expenses')}>목록으로</button>
         {/* 결재 권한이 있고, 문서가 반려되지 않고 결제가 완료되지 않은 경우에만 결재하기/반려하기 버튼 표시 */}
         {hasApprovalPermission() && detail.status !== 'REJECTED' && detail.status !== 'PAID' && (
           <>
             <button className="approve" onClick={handleOpenModal} disabled={isApproving || isRejecting || isMarkingAsPaid || isCompletingTax}>
               {isApproving ? '처리 중...' : '결재하기'}
             </button>
             <button className="reject" onClick={handleOpenRejectModal} disabled={isApproving || isRejecting || isMarkingAsPaid || isCompletingTax}>
               {isRejecting ? '처리 중...' : '반려하기'}
             </button>
           </>
         )}
         {/* ACCOUNTANT 권한을 가진 사용자가 APPROVED 상태의 문서를 PAID로 변경 가능 */}
         {user && user.role === 'ACCOUNTANT' && detail.status === 'APPROVED' && (
           <button className="paid" onClick={handleMarkAsPaid} disabled={isApproving || isRejecting || isMarkingAsPaid || isCompletingTax}>
             {isMarkingAsPaid ? '처리 중...' : '결제 완료'}
           </button>
         )}
         {/* TAX_ACCOUNTANT 권한을 가진 사용자가 PAID 상태의 문서를 세무처리 완료 가능 */}
         {user && user.role === 'TAX_ACCOUNTANT' && detail.status === 'PAID' && !detail.taxProcessed && (
           <button className="tax" onClick={handleCompleteTaxProcessing} disabled={isApproving || isRejecting || isMarkingAsPaid || isCompletingTax} style={{ backgroundColor: '#17a2b8', color: 'white' }}>
             {isCompletingTax ? '처리 중...' : '세무처리 완료'}
           </button>
         )}
       </S.ButtonGroup>

       {/* 4. 영수증 섹션 */}
       {detail.status === 'PAID' && (
         <S.ReceiptSection>
           <S.ReceiptSectionHeader>
             <S.SectionTitle>영수증</S.SectionTitle>
             {canUploadReceipt() && (
               <label>
                 <S.UploadButton disabled={isUploadingReceipt || isApproving || isRejecting || isMarkingAsPaid || isCompletingTax}>
                   {isUploadingReceipt ? '업로드 중...' : '영수증 추가'}
                 </S.UploadButton>
                 <input
                   type="file"
                   accept="image/*,application/pdf"
                   onChange={handleReceiptUpload}
                   disabled={isUploadingReceipt || isApproving || isRejecting || isMarkingAsPaid || isCompletingTax}
                   style={{ display: 'none' }}
                 />
               </label>
             )}
           </S.ReceiptSectionHeader>
           {receipts.length > 0 ? (
             <S.ReceiptList>
               {receipts.map((receipt) => (
                 <S.ReceiptItem key={receipt.receiptId}>
                  <S.ReceiptPreview>
                    <S.ReceiptImage 
                      src={getReceiptImageUrl(receipt.filePath)} 
                      alt={receipt.originalFilename}
                      onError={(e) => {
                        // 이미지가 아닌 경우 PDF 아이콘 표시
                        e.target.style.display = 'none';
                      }}
                    />
                   </S.ReceiptPreview>
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

       <SignatureModal
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         onSave={handleSaveSignature}
         isSaving={isApproving}
       />

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

    </S.Container>
  );
};

export default ExpenseDetailPage;