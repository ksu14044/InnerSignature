import * as S from './style';

const LoadingOverlay = ({ fullScreen = false, message = '로딩 중...' }) => {
  return (
    <S.Container fullScreen={fullScreen}>
      <S.Spinner />
      <S.Message>{message}</S.Message>
    </S.Container>
  );
};

export default LoadingOverlay;

