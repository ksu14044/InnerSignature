import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaPlus } from 'react-icons/fa';
import * as S from './style';

const MobileFAB = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isLoginPage = location.pathname === '/' || location.pathname.startsWith('/find-') || location.pathname.startsWith('/reset-password');
  const isCreatePage = location.pathname === '/expenses/create';
  const isDetailPage = location.pathname.startsWith('/detail/');
  const isProfilePage = location.pathname === '/profile';
  const isDashboardPage = location.pathname === '/dashboard';
  const isTaxSummaryPage = location.pathname === '/tax/summary';
  const isUsersPage = location.pathname === '/users';

  if (isLoginPage || !user || isCreatePage || isDetailPage || isProfilePage || isDashboardPage || isTaxSummaryPage || isUsersPage) {
    return null;
  }

  const handleClick = () => {
    navigate('/expenses/create');
  };

  return (
    <S.FAB onClick={handleClick}>
      <FaPlus />
    </S.FAB>
  );
};

export default MobileFAB;

