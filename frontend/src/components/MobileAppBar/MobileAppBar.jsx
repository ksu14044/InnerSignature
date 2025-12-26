import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaBars, FaBell, FaUser, FaSignOutAlt, FaBuilding, FaChevronDown, FaCheck } from 'react-icons/fa';
import * as S from './style';

const MobileAppBar = ({ title, onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, companies, switchCompany } = useAuth();
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const companyDropdownRef = useRef(null);
  const isLoginPage = location.pathname === '/' || location.pathname.startsWith('/find-') || location.pathname.startsWith('/reset-password');

  if (isLoginPage) {
    return null;
  }

  const getTitle = () => {
    if (title) return title;
    if (location.pathname === '/superadmin/dashboard') return 'SUPERADMIN 대시보드';
    if (location.pathname === '/expenses') return '지출결의서';
    if (location.pathname.startsWith('/detail/')) return '상세보기';
    if (location.pathname === '/expenses/create') return '새 결의서 작성';
    if (location.pathname === '/dashboard') return '대시보드';
    if (location.pathname === '/tax/summary') return '세무요약';
    if (location.pathname === '/users') return '사용자 관리';
    if (location.pathname === '/profile') return '내 정보';
    if (location.pathname === '/subscriptions/manage') return '구독 관리';
    if (location.pathname === '/subscriptions/plans') return '플랜 선택';
    if (location.pathname === '/subscriptions/payments') return '결제 내역';
    return '지출결의서';
  };

  const handleBack = () => {
    if (location.pathname.startsWith('/detail/') || location.pathname === '/expenses/create') {
      navigate('/expenses');
    } else {
      navigate(-1);
    }
  };

  const handleLogout = async () => {
    navigate('/');
    await logout();
  };

  const showBackButton = location.pathname.startsWith('/detail/') || 
                         location.pathname === '/expenses/create' ||
                         location.pathname === '/users' ||
                         location.pathname === '/profile' ||
                         location.pathname === '/dashboard' ||
                         location.pathname === '/tax/summary' ||
                         location.pathname.startsWith('/subscriptions');

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target)) {
        setIsCompanyDropdownOpen(false);
      }
    };

    if (isCompanyDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isCompanyDropdownOpen]);

  const handleCompanySwitch = async (companyId) => {
    try {
      await switchCompany(companyId);
      setIsCompanyDropdownOpen(false);
      window.location.reload(); // 페이지 새로고침하여 데이터 업데이트
    } catch (error) {
      alert('회사 전환에 실패했습니다.');
    }
  };

  return (
    <S.AppBar>
      <S.LeftSection>
        {showBackButton && (
          <S.MenuButton onClick={handleBack}>
            ←
          </S.MenuButton>
        )}
        <S.Title>{getTitle()}</S.Title>
      </S.LeftSection>
      <S.RightSection>
        {user && (
          <>
            {companies && companies.length > 1 && (
              <S.CompanySelector ref={companyDropdownRef}>
                <S.CompanyButton onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}>
                  <FaBuilding />
                </S.CompanyButton>
                {isCompanyDropdownOpen && (
                  <S.CompanyDropdown>
                    {companies.map((company) => (
                      <S.CompanyDropdownItem
                        key={company.companyId}
                        selected={company.companyId === user.companyId}
                        onClick={() => handleCompanySwitch(company.companyId)}
                      >
                        {company.companyId === user.companyId && <FaCheck style={{ marginRight: '8px', color: '#007bff' }} />}
                        {company.companyName}
                      </S.CompanyDropdownItem>
                    ))}
                  </S.CompanyDropdown>
                )}
              </S.CompanySelector>
            )}
            {location.pathname !== '/profile' && (
              <S.IconButton onClick={() => navigate('/profile')}>
                <FaUser />
              </S.IconButton>
            )}
            <S.IconButton onClick={handleLogout}>
              <FaSignOutAlt />
            </S.IconButton>
          </>
        )}
      </S.RightSection>
    </S.AppBar>
  );
};

export default MobileAppBar;

