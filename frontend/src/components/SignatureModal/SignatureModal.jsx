import { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { FaTimes, FaEraser, FaCheck } from 'react-icons/fa';
import * as S from './style';

const SignatureModal = ({ isOpen, onClose, onSave, isSaving, savedSignatures = [] }) => {
  const sigCanvas = useRef(null);
  const [mode, setMode] = useState('select'); // 'select' 또는 'draw'
  const [selectedSignature, setSelectedSignature] = useState(null);

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
  }, [isOpen, savedSignatures]);

  if (!isOpen) return null;

  const clear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
  };

  const save = () => {
    if (isSaving) return;
    
    if (mode === 'select' && selectedSignature) {
      // 저장된 서명 사용
      onSave(selectedSignature.signatureData);
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
        {savedSignatures.length > 0 && (
          <S.TabGroup>
            <S.Tab active={mode === 'select'} onClick={() => setMode('select')}>
              저장된 서명/도장
            </S.Tab>
            <S.Tab active={mode === 'draw'} onClick={() => setMode('draw')}>
              새로 그리기
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
          <S.ActionButton onClick={save} variant="primary" disabled={isSaving || (mode === 'select' && !selectedSignature)}>
            <FaCheck />
            <span>{isSaving ? '저장 중...' : '승인 및 저장'}</span>
          </S.ActionButton>
        </S.ButtonGroup>
      </S.Content>
    </S.Overlay>
  );
};

export default SignatureModal;