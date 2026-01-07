import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaPlus } from 'react-icons/fa';
import * as S from './style';

const MobileFAB = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  
  const isLoginPage = location.pathname === '/' || location.pathname.startsWith('/find-') || location.pathname.startsWith('/reset-password');
  const isCreatePage = location.pathname === '/expenses/create' || location.pathname.startsWith('/expenses/edit/');
  const isDetailPage = location.pathname.startsWith('/detail/');
  const isProfilePage = location.pathname === '/profile';
  const isDashboardPage = location.pathname === '/dashboard' || location.pathname === '/dashboard/main';
  const isTaxSummaryPage = location.pathname === '/tax/summary';
  const isUsersPage = location.pathname === '/users';
  const isSuperAdminPage = location.pathname === '/superadmin/dashboard';

  // 지출결의서 목록 페이지만 표시
  const shouldShow = !isLoginPage && user && location.pathname === '/expenses';

  if (!shouldShow) {
    return null;
  }

  const handleClick = () => {
    navigate('/expenses/create');
  };

  return (
    <S.FAB 
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="새 결의서 작성"
      title="새 결의서 작성"
    >
      <FaPlus />
      {isHovered && <S.FABTooltip>새 결의서 작성</S.FABTooltip>}
    </S.FAB>
  );
};

export default MobileFAB;

