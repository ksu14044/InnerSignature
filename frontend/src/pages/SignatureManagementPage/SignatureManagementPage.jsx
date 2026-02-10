import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaStar, FaStamp, FaPen } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getMySignatures, 
  createSignature, 
  updateSignature, 
  deleteSignature, 
  setDefaultSignature 
} from '../../api/signatureApi';
import SignatureModal from '../../components/SignatureModal/SignatureModal';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import PageHeader from '../../components/PageHeader/PageHeader';
import * as S from './style';

const SignatureManagementPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [savedSignatures, setSavedSignatures] = useState([]);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isSavingSignature, setIsSavingSignature] = useState(false);
  const [editingSignature, setEditingSignature] = useState(null);
  const [isTypeSelectModalOpen, setIsTypeSelectModalOpen] = useState(false);
  const [selectedSignatureType, setSelectedSignatureType] = useState(null);
  const [uploadedImageData, setUploadedImageData] = useState(null);
  const hasModalBeenOpen = useRef(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadSignatures();
  }, [user, navigate]);

  // 모달이 열렸는지 추적
  useEffect(() => {
    if (isSignatureModalOpen) {
      hasModalBeenOpen.current = true;
    }
  }, [isSignatureModalOpen]);

  // 모달이 닫힌 후 목록 새로고침
  useEffect(() => {
    if (!isSignatureModalOpen && !isSavingSignature && hasModalBeenOpen.current && user) {
      // 모달이 한 번이라도 열렸고, 닫히고 저장이 완료된 후 목록 새로고침
      loadSignatures();
    }
  }, [isSignatureModalOpen, isSavingSignature, user]);

  const loadSignatures = async () => {
    try {
      setLoading(true);
      const response = await getMySignatures();
      if (response.success) {
        setSavedSignatures(response.data || []);
      }
    } catch (error) {
      console.error('서명/도장 목록 조회 실패:', error);
      alert('서명/도장 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSignatureType = (type) => {
    setSelectedSignatureType(type);
    setIsTypeSelectModalOpen(false);
    
    // 서명/도장 모두 모달로 열기
    setIsSignatureModalOpen(true);
  };


  const handleSaveSignatureData = async (signatureData, signatureType, signatureName, isDefault) => {
    if (isSavingSignature) return;
    
    try {
      setIsSavingSignature(true);

      if (editingSignature) {
        const response = await updateSignature(editingSignature.signatureId, {
          signatureName,
          signatureType,
          signatureData,
          isDefault
        });
        if (response.success) {
          // 모달만 닫기 (목록 새로고침은 onClose에서 처리)
          setIsSignatureModalOpen(false);
          
          // alert 표시
          alert('서명/도장이 수정되었습니다.');
        } else {
          alert('서명/도장 수정 실패: ' + response.message);
        }
      } else {
        const response = await createSignature({
          signatureName,
          signatureType,
          signatureData,
          isDefault
        });
        if (response.success) {
          // 모달만 닫기 (목록 새로고침은 onClose에서 처리)
          setIsSignatureModalOpen(false);
          
          // alert 표시
          alert('서명/도장이 저장되었습니다.');
        } else {
          alert('서명/도장 저장 실패: ' + response.message);
        }
      }
    } catch (error) {
      console.error('서명/도장 저장 실패:', error);
      alert('서명/도장 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSavingSignature(false);
    }
  };

  const handleSaveSignature = async (signatureData, signatureName, isDefault) => {
    await handleSaveSignatureData(signatureData, selectedSignatureType || 'SIGNATURE', signatureName, isDefault);
  };

  const handleAddNewSignature = () => {
    setEditingSignature(null);
    setSelectedSignatureType(null);
    setIsTypeSelectModalOpen(true);
  };

  const handleDeleteSignature = async (signatureId) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await deleteSignature(signatureId);
      if (response.success) {
        alert('서명/도장이 삭제되었습니다.');
        loadSignatures();
      } else {
        alert('서명/도장 삭제 실패: ' + response.message);
      }
    } catch (error) {
      console.error('서명/도장 삭제 실패:', error);
      alert('서명/도장 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleSetDefaultSignature = async (signatureId) => {
    try {
      const response = await setDefaultSignature(signatureId);
      if (response.success) {
        alert('기본 서명/도장이 설정되었습니다.');
        loadSignatures();
      } else {
        alert('기본 서명/도장 설정 실패: ' + response.message);
      }
    } catch (error) {
      console.error('기본 서명/도장 설정 실패:', error);
      alert('기본 서명/도장 설정 중 오류가 발생했습니다.');
    }
  };

  const handleEditSignature = (signature) => {
    setEditingSignature(signature);
    setSelectedSignatureType(signature.signatureType);
    
    // 수정 모드일 때는 서명/도장 모두 모달로 열기
    setIsSignatureModalOpen(true);
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <S.Container>
      <PageHeader
        title="도장·서명"
        subTitle="내 도장·서명"
        subTitleActions={
          <S.AddButton onClick={handleAddNewSignature}>
            <FaPlus /> 도장·서명 추가
          </S.AddButton>
        }
        pendingApprovals={[]}
        pendingUsers={[]}
        onNotificationClick={() => {}}
        onApprovalClick={() => {}}
      />

      {savedSignatures.length === 0 ? (
        <S.EmptyState>
          <S.EmptyText>등록된 서명/도장이 없습니다.</S.EmptyText>
        </S.EmptyState>
      ) : (
        <S.SignaturesGrid>
          {savedSignatures.map(sig => (
            <S.SignatureCard key={sig.signatureId}>
              <S.SignatureHeader>
                <S.SignatureHeaderLeft>
                  {sig.isDefault ? (
                    <S.DefaultBadge>기본</S.DefaultBadge>
                  ) : (
                    <S.SetDefaultButton onClick={() => handleSetDefaultSignature(sig.signatureId)}>
                      기본으로 설정
                    </S.SetDefaultButton>
                  )}
                </S.SignatureHeaderLeft>
                <S.SignatureHeaderRight>
                  <S.EditButton onClick={() => handleEditSignature(sig)}>
                    <img src="/이너사인_이미지 (1)/아이콘/24px_팝업창_페이지넘기기_수정삭제/수정.png" alt="수정" />
                  </S.EditButton>
                  <S.DeleteButton onClick={() => handleDeleteSignature(sig.signatureId)}>
                    <img src="/이너사인_이미지 (1)/아이콘/24px_팝업창_페이지넘기기_수정삭제/삭제.png" alt="삭제" />
                  </S.DeleteButton>
                </S.SignatureHeaderRight>
              </S.SignatureHeader>
              <S.SignaturePreview>
                <img src={sig.signatureData} alt={sig.signatureName} />
              </S.SignaturePreview>
              <S.SignatureInfo>
                <S.SignatureNameRow>
                  <S.SignatureName>{sig.signatureName}</S.SignatureName>
                </S.SignatureNameRow>
                <S.SignatureDateRow>
                  <S.DateLabel>생성일</S.DateLabel>
                  <S.DateValue>{formatDate(sig.createdAt || sig.createdDate)}</S.DateValue>
                  <S.SignatureTypeLabel>
                    {sig.signatureType === 'STAMP' ? '도장' : '서명'}
                  </S.SignatureTypeLabel>
                </S.SignatureDateRow>
              </S.SignatureInfo>
            </S.SignatureCard>
          ))}
        </S.SignaturesGrid>
      )}

      {/* 타입 선택 모달 */}
      {isTypeSelectModalOpen && (
        <S.ModalOverlay onClick={() => setIsTypeSelectModalOpen(false)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle>도장ㆍ서명 타입 선택</S.ModalTitle>
              <S.CloseButton onClick={() => setIsTypeSelectModalOpen(false)}>
                <img src="/이너사인_이미지 (1)/아이콘/24px_팝업창_페이지넘기기_수정삭제/팝업창닫기.png" alt="닫기" />
              </S.CloseButton>
            </S.ModalHeader>
            <S.ModalBody>
              
              <S.TypeSelectButton 
                selected={selectedSignatureType === 'STAMP'}
                onClick={() => handleSelectSignatureType('STAMP')}
              >
                <S.TypeIcon>
                  <img src="/이너사인_이미지 (1)/도장삽입.png" alt="도장" />
                </S.TypeIcon>
                <S.TypeContent>
                  <S.TypeTitle>도장</S.TypeTitle>
                  <S.TypeDescription>이미지 파일을 업로드합니다.</S.TypeDescription>
                </S.TypeContent>
                <S.CheckMark selected={selectedSignatureType === 'STAMP'} />
              </S.TypeSelectButton>
              <S.TypeSelectButton 
                selected={selectedSignatureType === 'SIGNATURE'}
                onClick={() => handleSelectSignatureType('SIGNATURE')}
              >
                <S.TypeIcon>
                  <img src="/이너사인_이미지 (1)/서명삽입.png" alt="서명" />
                </S.TypeIcon>
                <S.TypeContent>
                  <S.TypeTitle>서명</S.TypeTitle>
                  <S.TypeDescription>마우스로 직접 그리거나 이미지 파일을 업로드합니다.</S.TypeDescription>
                </S.TypeContent>
                <S.CheckMark selected={selectedSignatureType === 'SIGNATURE'} />
              </S.TypeSelectButton>
            </S.ModalBody>
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => {
          setIsSignatureModalOpen(false);
          setEditingSignature(null);
          setSelectedSignatureType(null);
          setUploadedImageData(null);
          // 목록 새로고침은 useEffect에서 처리
        }}
        onSave={handleSaveSignature}
        isSaving={isSavingSignature}
        savedSignatures={[]}
        editingSignature={editingSignature}
        showNameInput={true}
        initialImageData={uploadedImageData}
        initialMode={selectedSignatureType === 'STAMP' && !editingSignature ? 'upload' : null}
      />
    </S.Container>
  );
};

export default SignatureManagementPage;


