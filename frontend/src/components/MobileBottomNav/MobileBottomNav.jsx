import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaHome, FaChartBar, FaUser, FaList, FaCreditCard, FaUsers } from 'react-icons/fa';
import * as S from './style';

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isLoginPage = location.pathname === '/' || location.pathname.startsWith('/find-') || location.pathname.startsWith('/reset-password');

  if (isLoginPage || !user) {
    return null;
  }

  const isActive = (path) => {
    if (path === '/expenses') {
      return location.pathname === '/expenses' || location.pathname.startsWith('/detail/') || location.pathname.startsWith('/expenses/create');
    }
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/main';
    }
    if (path === '/subscriptions/manage') {
      return location.pathname.startsWith('/subscriptions');
    }
    if (path === '/users') {
      return location.pathname === '/users';
    }
    if (path === '/cards') {
      return location.pathname === '/cards';
    }
    if (path === '/profile') {
      return location.pathname === '/profile';
    }
    return location.pathname === path;
  };

  // 사용자 관리 권한이 있는지 확인
  const canManageUsers = user?.role === 'SUPERADMIN' || user?.role === 'CEO' || user?.role === 'ADMIN';

  const navItems = user?.role === 'SUPERADMIN'
    ? [
        { path: '/superadmin/dashboard', icon: FaHome, label: '대시보드' },
        { path: '/users', icon: FaUsers, label: '사용자관리' },
      ]
    : [
        { path: '/expenses', icon: FaHome, label: '목록' },
        // 모든 사용자가 대시보드 접근 가능 (권한별로 다른 내용 표시)
        { path: '/dashboard', icon: FaChartBar, label: '대시보드' },
        { path: '/cards', icon: FaCreditCard, label: '카드' },
        ...(user?.role === 'CEO' || user?.role === 'ADMIN'
          ? [{ path: '/subscriptions/manage', icon: FaChartBar, label: '구독' }]
          : []),
        canManageUsers
          ? { path: '/users', icon: FaUsers, label: '사용자관리' }
          : { path: '/profile', icon: FaUser, label: '내정보' },
      ];

  return (
    <S.BottomNav>
      {navItems && navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);
        return (
          <S.NavItem
            key={item.path}
            active={active}
            onClick={() => navigate(item.path)}
          >
            <S.IconWrapper active={active}>
              <Icon />
            </S.IconWrapper>
            <S.Label active={active}>{item.label}</S.Label>
          </S.NavItem>
        );
      })}
    </S.BottomNav>
  );
};

export default MobileBottomNav;

