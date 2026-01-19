import * as S from './style';

const LoadingOverlay = ({ fullScreen = false, message = '로딩 중...', progress = null, modal = false }) => {
  return (
    <S.Container fullScreen={fullScreen} modal={modal}>
      <S.ModalContent modal={modal}>
        <S.Spinner />
        <S.Message>{message}</S.Message>
        {progress !== null && (
          <S.ProgressContainer>
            <S.ProgressBar>
              <S.ProgressFill progress={progress} />
            </S.ProgressBar>
            <S.ProgressText>{Math.round(progress)}%</S.ProgressText>
          </S.ProgressContainer>
        )}
      </S.ModalContent>
    </S.Container>
  );
};

export default LoadingOverlay;

