import { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { FaTimes, FaEraser, FaCheck } from 'react-icons/fa';
import * as S from './style';

const SignatureModal = ({ isOpen, onClose, onSave, isSaving }) => {
  // [수정 1] 초기값을 {}에서 null로 변경
  const sigCanvas = useRef(null); 

  if (!isOpen) return null;

  const clear = () => sigCanvas.current.clear();

  const save = () => {
    if (isSaving) return;
    // 캔버스에 그림이 비어있는지 확인
    if (sigCanvas.current.isEmpty()) {
      alert("서명을 해주세요!");
      return;
    }
    
    // [수정 2] 에러가 발생하는 getTrimmedCanvas()를 getCanvas()로 변경
    // 수정 전: const dataURL = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
    
    // 수정 후: 여백 자르기 없이 전체 캔버스 이미지를 가져옵니다.
    const dataURL = sigCanvas.current.getCanvas().toDataURL('image/png');
    
    onSave(dataURL);
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

        <S.ButtonGroup>
          <S.ActionButton onClick={clear} variant="secondary" disabled={isSaving}>
            <FaEraser />
            <span>지우기</span>
          </S.ActionButton>
          <S.ActionButton onClick={save} variant="primary" disabled={isSaving}>
            <FaCheck />
            <span>{isSaving ? '저장 중...' : '승인 및 저장'}</span>
          </S.ActionButton>
        </S.ButtonGroup>
      </S.Content>
    </S.Overlay>
  );
};

export default SignatureModal;