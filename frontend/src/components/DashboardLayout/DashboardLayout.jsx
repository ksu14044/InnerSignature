import { useNavigate } from 'react-router-dom';
import TourButton from '../TourButton/TourButton';
import * as S from './style';

const DashboardLayout = ({ 
  children, 
  title = '대시보드',
  showFilters = true,
  filters = null,
  onFilterChange = null,
  showBackButton = false
}) => {
  const navigate = useNavigate();

  return (
    <S.Container>
      <S.Header data-tourid="tour-dashboard-header">
        <div>
          <S.Title>{title}</S.Title>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <TourButton />
          {showBackButton && (
            <S.Button variant="secondary" onClick={() => navigate('/expenses')}>
              목록으로
            </S.Button>
          )}
        </div>
      </S.Header>

      {showFilters && filters && onFilterChange && (
        <S.FilterCard data-tourid="tour-date-filter">
          <S.FilterGrid>
            <div>
              <S.Label>시작일</S.Label>
              <S.Input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => onFilterChange('startDate', e.target.value)}
              />
            </div>
            <div>
              <S.Label>종료일</S.Label>
              <S.Input
                type="date"
                value={filters.endDate || ''}
                min={filters.startDate || undefined}
                onChange={(e) => onFilterChange('endDate', e.target.value)}
              />
            </div>
          </S.FilterGrid>
        </S.FilterCard>
      )}

      {children}
    </S.Container>
  );
};

export default DashboardLayout;

