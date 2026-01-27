import { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { FaTimes, FaCheck, FaImage } from 'react-icons/fa';
import * as S from './style';

const SignatureModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  isSaving, 
  savedSignatures = [], 
  editingSignature = null,
  showNameInput = false, // 이름 입력 필드 표시 여부
  initialImageData = null, // 초기 이미지 데이터 (도장 업로드 시 사용)
  initialMode = null // 초기 모드 ('draw', 'upload', 'select' 중 하나)
}) => {
  const sigCanvas = useRef(null);
  const fileInputRef = useRef(null);
  const [mode, setMode] = useState('select'); // 'select', 'draw', 'upload'
  const [selectedSignature, setSelectedSignature] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [hasDrawn, setHasDrawn] = useState(false); // 그리기 완료 여부 추적
  const [signatureName, setSignatureName] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    // 저장 중일 때는 editingSignature 변경에 반응하지 않음
    if (isSaving) return;
    
    if (isOpen && editingSignature) {
      // 수정 모드인 경우
      setSignatureName(editingSignature.signatureName || '');
      setIsDefault(editingSignature.isDefault || false);
      
      if (editingSignature.signatureType === 'STAMP') {
        // 도장인 경우 업로드 모드로 설정하고 기존 이미지 표시
        setMode('upload');
        setUploadedImage(editingSignature.signatureData);
      } else {
        // 서명인 경우 그리기 모드로 설정하고 기존 서명을 캔버스에 로드
        setMode('draw');
        // 캔버스가 준비될 때까지 기다리기
        const loadImage = () => {
          if (sigCanvas.current && editingSignature.signatureData) {
            const img = new Image();
            img.onload = () => {
              if (sigCanvas.current) {
                const ctx = sigCanvas.current.getCanvas().getContext('2d');
                ctx.clearRect(0, 0, sigCanvas.current.getCanvas().width, sigCanvas.current.getCanvas().height);
                ctx.drawImage(img, 0, 0, sigCanvas.current.getCanvas().width, sigCanvas.current.getCanvas().height);
                setHasDrawn(true);
              }
            };
            img.onerror = () => {
              console.error('이미지 로드 실패');
            };
            img.src = editingSignature.signatureData;
          } else if (sigCanvas.current === null) {
            // 캔버스가 아직 준비되지 않았으면 다음 프레임에 재시도
            requestAnimationFrame(loadImage);
          }
        };
        
        // 다음 렌더 사이클에 실행 (캔버스가 마운트될 시간 확보)
        setTimeout(loadImage, 0);
      }
    } else if (isOpen && initialImageData) {
      // 도장 업로드로 모달이 열린 경우
      setMode('upload');
      setUploadedImage(initialImageData);
      setSignatureName('');
      setIsDefault(savedSignatures.length === 0);
    } else if (isOpen && initialMode) {
      // 초기 모드가 지정된 경우 (도장 추가 시)
      setMode(initialMode);
      if (showNameInput) {
        setSignatureName('');
        setIsDefault(savedSignatures.length === 0);
      }
    } else if (isOpen && savedSignatures.length > 0) {
      // 저장된 서명이 있고 기본 서명이 있으면 자동 선택
      const defaultSig = savedSignatures.find(sig => sig.isDefault);
      if (defaultSig) {
        setSelectedSignature(defaultSig);
        setMode('select');
      } else {
        setMode('select');
      }
      // 새로 추가하는 경우
      if (showNameInput) {
        setSignatureName('');
        setIsDefault(false);
      }
    } else if (isOpen && savedSignatures.length === 0) {
      // 저장된 서명이 없으면 그리기 모드로
      setMode('draw');
      if (showNameInput) {
        setSignatureName('');
        setIsDefault(true); // 첫 번째 서명/도장은 기본으로 설정
      }
    }
    
    // 모달이 열릴 때 상태 초기화 (수정 모드가 아니고 초기 이미지도 없을 때만)
    if (isOpen && !editingSignature && !initialImageData && !initialMode) {
      setUploadedImage(null);
      setHasDrawn(false);
      if (sigCanvas.current) {
        sigCanvas.current.clear();
      }
    }
  }, [isOpen, savedSignatures, editingSignature, showNameInput, initialImageData, initialMode, isSaving]);

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
    
    // 이름 입력이 필요한 경우 검증
    if (showNameInput && !signatureName.trim()) {
      alert('서명/도장 이름을 입력해주세요.');
      return;
    }
    
    let signatureData = null;
    
    if (mode === 'select' && selectedSignature) {
      // 저장된 서명 사용
      signatureData = selectedSignature.signatureData;
    } else if (mode === 'upload' && uploadedImage) {
      // 업로드한 이미지 사용
      signatureData = uploadedImage;
    } else {
      // 새로 그린 서명 사용
      if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
        alert("서명을 해주세요!");
        return;
      }
      signatureData = sigCanvas.current.getCanvas().toDataURL('image/png');
    }
    
    // 이름 입력이 필요한 경우 이름과 기본 설정 정보도 함께 전달
    if (showNameInput) {
      onSave(signatureData, signatureName.trim(), isDefault);
    } else {
      onSave(signatureData);
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
          <S.Title>{editingSignature ? '서명/도장 수정' : '서명 입력'}</S.Title>
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
              <S.ClearButton onClick={clear} disabled={isSaving} title="지우기">
                <FaTimes />
              </S.ClearButton>
            </S.CanvasContainer>
          </>
        )}

        {/* 이름 입력 필드 (showNameInput이 true일 때만 표시) */}
        {showNameInput && (
          <S.NameInputSection>
            <S.Label>서명/도장 이름</S.Label>
            <S.NameInput
              type="text"
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              placeholder={editingSignature ? '서명/도장 이름을 입력하세요' : '예: 기본 서명, 회사 도장'}
              maxLength={50}
            />
            <S.CheckboxWrapper>
              <input
                type="checkbox"
                id="isDefault"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                disabled={editingSignature?.isDefault} // 기존 기본 서명은 체크박스 비활성화
              />
              <label htmlFor="isDefault">기본 서명/도장으로 설정</label>
            </S.CheckboxWrapper>
          </S.NameInputSection>
        )}

        <S.ButtonGroup>
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