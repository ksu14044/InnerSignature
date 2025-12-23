import { useTour } from '../../contexts/TourContext';
import { FaQuestionCircle } from 'react-icons/fa';
import * as S from './style';

const TourButton = () => {
  const { startTour } = useTour();

  return (
    <S.TourButton onClick={startTour} title="가이드 투어 시작">
      <FaQuestionCircle />
      <span>가이드</span>
    </S.TourButton>
  );
};

export default TourButton;

