import { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { FaTimes, FaEraser, FaCheck, FaImage } from 'react-icons/fa';
import * as S from './style';

const SignatureModal = ({ isOpen, onClose, onSave, isSaving, savedSignatures = [] }) => {
  const sigCanvas = useRef(null);
  const fileInputRef = useRef(null);
  const [mode, setMode] = useState('select'); // 'select', 'draw', 'upload'
  const [selectedSignature, setSelectedSignature] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [hasDrawn, setHasDrawn] = useState(false); // 그리기 완료 여부 추적

  useEffect(() => {
    if (isOpen && savedSignatures.length > 0) {
      // 저장된 서명이 있고 기본 서명이 있으면 자동 선택
      const defaultSig = savedSignatures.find(sig => sig.isDefault);
      if (defaultSig) {
        setSelectedSignature(defaultSig);
        setMode('select');
      } else {
        setMode('select');
      }
    } else if (isOpen && savedSignatures.length === 0) {
      // 저장된 서명이 없으면 그리기 모드로
      setMode('draw');
    }
    
    // 모달이 열릴 때 상태 초기화
    if (isOpen) {
      setUploadedImage(null);
      setHasDrawn(false);
      if (sigCanvas.current) {
        sigCanvas.current.clear();
      }
    }
  }, [isOpen, savedSignatures]);

  if (!isOpen) return null;

  const clear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
    setHasDrawn(false);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result);
      setMode('upload');
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const save = () => {
    if (isSaving) return;
    
    if (mode === 'select' && selectedSignature) {
      // 저장된 서명 사용
      onSave(selectedSignature.signatureData);
    } else if (mode === 'upload' && uploadedImage) {
      // 업로드한 이미지 사용
      onSave(uploadedImage);
    } else {
      // 새로 그린 서명 사용
      if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
        alert("서명을 해주세요!");
        return;
      }
      
      const dataURL = sigCanvas.current.getCanvas().toDataURL('image/png');
      onSave(dataURL);
    }
  };

  const getCanSave = () => {
    if (mode === 'select') return selectedSignature !== null;
    if (mode === 'upload') return uploadedImage !== null;
    if (mode === 'draw') return hasDrawn;
    return false;
  };

  return (
    <S.Overlay>
      <S.Content>
        <S.Header>
          <S.Title>서명 입력</S.Title>
          <S.CloseButton onClick={onClose}>
            <FaTimes />
          </S.CloseButton>
        </S.Header>

        {/* 모드 선택 탭 */}
        {savedSignatures.length > 0 ? (
          <S.TabGroup>
            <S.Tab active={mode === 'select'} onClick={() => setMode('select')}>
              저장된 서명/도장
            </S.Tab>
            <S.Tab active={mode === 'draw'} onClick={() => setMode('draw')}>
              새로 그리기
            </S.Tab>
            <S.Tab active={mode === 'upload'} onClick={() => setMode('upload')}>
              <FaImage /> 이미지 업로드
            </S.Tab>
          </S.TabGroup>
        ) : (
          <S.TabGroup>
            <S.Tab active={mode === 'draw'} onClick={() => setMode('draw')}>
              직접 그리기
            </S.Tab>
            <S.Tab active={mode === 'upload'} onClick={() => setMode('upload')}>
              <FaImage /> 이미지 업로드
            </S.Tab>
          </S.TabGroup>
        )}

        {mode === 'select' ? (
          <>
            <S.Instruction>
              사용할 서명/도장을 선택해주세요
            </S.Instruction>
            <S.SavedSignatureList>
              {savedSignatures.map(sig => (
                <S.SignatureOption
                  key={sig.signatureId}
                  selected={selectedSignature?.signatureId === sig.signatureId}
                  onClick={() => setSelectedSignature(sig)}
                >
                  <S.SignaturePreview>
                    <img src={sig.signatureData} alt={sig.signatureName} />
                  </S.SignaturePreview>
                  <S.SignatureInfo>
                    <S.SignatureName>{sig.signatureName}</S.SignatureName>
                    <S.SignatureType>{sig.signatureType === 'STAMP' ? '도장' : '서명'}</S.SignatureType>
                    {sig.isDefault && <S.DefaultBadge>기본</S.DefaultBadge>}
                  </S.SignatureInfo>
                </S.SignatureOption>
              ))}
            </S.SavedSignatureList>
          </>
        ) : mode === 'upload' ? (
          <>
            <S.Instruction>
              서명 이미지 파일을 업로드해주세요
            </S.Instruction>
            <S.UploadContainer>
              {uploadedImage ? (
                <S.UploadedImageWrapper>
                  <S.UploadedImage src={uploadedImage} alt="업로드된 서명" />
                  <S.RemoveImageButton onClick={() => setUploadedImage(null)}>
                    <FaTimes /> 이미지 제거
                  </S.RemoveImageButton>
                </S.UploadedImageWrapper>
              ) : (
                <S.UploadArea onClick={handleUploadClick}>
                  <FaImage style={{ fontSize: '48px', color: '#007bff', marginBottom: '16px' }} />
                  <p>이미지를 클릭하거나 드래그하여 업로드</p>
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                    JPG, PNG, GIF (최대 5MB)
                  </p>
                </S.UploadArea>
              )}
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
            </S.UploadContainer>
          </>
        ) : (
          <>
            <S.Instruction>
              아래 영역에 서명을 입력해주세요
            </S.Instruction>
            <S.CanvasContainer>
              <SignatureCanvas
                ref={sigCanvas}
                canvasProps={{ width: 360, height: 200, className: 'sigCanvas' }}
                backgroundColor="#fafafa"
                onEnd={() => {
                  // 그리기 완료 시 상태 업데이트
                  if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
                    setHasDrawn(true);
                  }
                }}
              />
            </S.CanvasContainer>
          </>
        )}

        <S.ButtonGroup>
          {mode === 'draw' && (
            <S.ActionButton onClick={clear} variant="secondary" disabled={isSaving}>
              <FaEraser />
              <span>지우기</span>
            </S.ActionButton>
          )}
          <S.ActionButton 
            onClick={save} 
            variant="primary" 
            disabled={isSaving || !getCanSave()}
          >
            <FaCheck />
            <span>{isSaving ? '저장 중...' : '승인 및 저장'}</span>
          </S.ActionButton>
        </S.ButtonGroup>
      </S.Content>
    </S.Overlay>
  );
};

export default SignatureModal;