import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTrash, FaPen, FaStar, FaStamp } from 'react-icons/fa';
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

  return (
    <S.Container>
      <S.SectionHeader>
        <S.SectionTitle>내 서명/도장 목록</S.SectionTitle>
        <S.AddButton onClick={handleAddNewSignature}>
          <FaPlus /> 서명/도장 추가
        </S.AddButton>
      </S.SectionHeader>

      {savedSignatures.length === 0 ? (
        <S.EmptyState>
          <S.EmptyText>등록된 서명/도장이 없습니다.</S.EmptyText>
        </S.EmptyState>
      ) : (
        <S.SignaturesGrid>
          {savedSignatures.map(sig => (
            <S.SignatureItem key={sig.signatureId} isDefault={sig.isDefault}>
              <S.SignaturePreview>
                <img src={sig.signatureData} alt={sig.signatureName} />
              </S.SignaturePreview>
              <S.SignatureInfo>
                <S.SignatureName>
                  {sig.signatureName}
                  {sig.isDefault && <S.DefaultBadge>기본</S.DefaultBadge>}
                </S.SignatureName>
                <S.SignatureType>
                  {sig.signatureType === 'STAMP' ? '도장' : '서명'}
                </S.SignatureType>
                <S.SignatureActions>
                  <S.ActionButton onClick={() => handleEditSignature(sig)}>
                    <FaPen /> 수정
                  </S.ActionButton>
                  {!sig.isDefault && (
                    <S.ActionButton onClick={() => handleSetDefaultSignature(sig.signatureId)}>
                      <FaStar /> 기본으로 설정
                    </S.ActionButton>
                  )}
                  <S.DeleteButton onClick={() => handleDeleteSignature(sig.signatureId)}>
                    <FaTrash /> 삭제
                  </S.DeleteButton>
                </S.SignatureActions>
              </S.SignatureInfo>
            </S.SignatureItem>
          ))}
        </S.SignaturesGrid>
      )}

      {/* 타입 선택 모달 */}
      {isTypeSelectModalOpen && (
        <S.ModalOverlay onClick={() => setIsTypeSelectModalOpen(false)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle>서명/도장 타입 선택</S.ModalTitle>
              <S.CloseButton onClick={() => setIsTypeSelectModalOpen(false)}>×</S.CloseButton>
            </S.ModalHeader>
            <S.ModalBody>
              <S.TypeSelectButton onClick={() => handleSelectSignatureType('SIGNATURE')}>
                <FaPen style={{ fontSize: '32px', marginBottom: '8px', color: '#007bff' }} />
                <div>
                  <strong>서명</strong>
                  <p>터치스크린이나 마우스로 직접 서명합니다</p>
                </div>
              </S.TypeSelectButton>
              <S.TypeSelectButton onClick={() => handleSelectSignatureType('STAMP')}>
                <FaStamp style={{ fontSize: '32px', marginBottom: '8px', color: '#007bff' }} />
                <div>
                  <strong>도장</strong>
                  <p>이미지 파일을 업로드합니다</p>
                </div>
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


