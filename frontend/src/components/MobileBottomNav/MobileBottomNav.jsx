import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaHome, FaChartBar, FaUser, FaList, FaCreditCard } from 'react-icons/fa';
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
    if (path === '/subscriptions/manage') {
      return location.pathname.startsWith('/subscriptions');
    }
    return location.pathname === path;
  };

  const navItems = user?.role === 'SUPERADMIN'
    ? [
        { path: '/superadmin/dashboard', icon: FaHome, label: '대시보드' },
        { path: '/profile', icon: FaUser, label: '내정보' },
      ]
    : [
        { path: '/expenses', icon: FaHome, label: '목록' },
        ...(user?.role === 'CEO' || user?.role === 'ADMIN' || user?.role === 'ACCOUNTANT' 
          ? [{ path: '/dashboard', icon: FaChartBar, label: '대시보드' }] 
          : []),
        ...(user?.role === 'TAX_ACCOUNTANT' 
          ? [{ path: '/tax/summary', icon: FaChartBar, label: '세무요약' }] 
          : []),
        ...(user?.role === 'CEO' || user?.role === 'ADMIN'
          ? [{ path: '/subscriptions/manage', icon: FaCreditCard, label: '구독' }]
          : []),
        { path: '/profile', icon: FaUser, label: '내정보' },
      ];

  return (
    <S.BottomNav>
      {navItems.map((item) => {
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

