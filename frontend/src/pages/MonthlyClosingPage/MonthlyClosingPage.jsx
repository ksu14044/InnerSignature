import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getClosingList, closeMonth, reopenMonth } from '../../api/monthlyClosingApi';
import * as S from './style';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import { FaLock, FaUnlock, FaCalendarAlt } from 'react-icons/fa';

const MonthlyClosingPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [closingList, setClosingList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [isClosing, setIsClosing] = useState(false);
  const [reopeningId, setReopeningId] = useState(null);

  useEffect(() => {
    if (!user || (user.role !== 'ADMIN' && user.role !== 'CEO' && user.role !== 'ACCOUNTANT')) {
      alert('접근 권한이 없습니다. (ADMIN, CEO, ACCOUNTANT 권한 필요)');
      navigate('/expenses');
      return;
    }
    loadClosingList();
  }, [user, navigate]);

  // useCallback으로 최적화
  const loadClosingList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getClosingList();
      if (response.success) {
        setClosingList(response.data || []);
      }
    } catch (error) {
      console.error('마감 목록 조회 실패:', error);
      alert(error?.response?.data?.message || '마감 목록 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCloseMonth = async () => {
    if (isClosing) return;
    
    if (!window.confirm(`${selectedYear}년 ${selectedMonth}월을 마감 처리하시겠습니까?`)) {
      return;
    }

    try {
      setIsClosing(true);
      const response = await closeMonth(selectedYear, selectedMonth);
      if (response.success) {
        alert('월 마감이 완료되었습니다.');
        loadClosingList();
      } else {
        alert('월 마감 실패: ' + response.message);
      }
    } catch (error) {
      console.error('월 마감 실패:', error);
      alert(error?.response?.data?.message || '월 마감 중 오류가 발생했습니다.');
    } finally {
      setIsClosing(false);
    }
  };

  const handleReopenMonth = async (closingId) => {
    if (reopeningId === closingId) return;
    
    if (!window.confirm('마감을 해제하시겠습니까?')) {
      return;
    }

    try {
      setReopeningId(closingId);
      const response = await reopenMonth(closingId);
      if (response.success) {
        alert('월 마감이 해제되었습니다.');
        loadClosingList();
      } else {
        alert('월 마감 해제 실패: ' + response.message);
      }
    } catch (error) {
      console.error('월 마감 해제 실패:', error);
      alert(error?.response?.data?.message || '월 마감 해제 중 오류가 발생했습니다.');
    } finally {
      setReopeningId(null);
    }
  };

  const isMonthClosed = (year, month) => {
    return closingList.some(
      closing => closing.closingYear === year && 
                 closing.closingMonth === month && 
                 closing.isClosed
    );
  };

  const getClosingInfo = (year, month) => {
    return closingList.find(
      closing => closing.closingYear === year && closing.closingMonth === month
    );
  };

  if (!user) {
    return (
      <S.Container>
        <S.Alert>로그인이 필요합니다.</S.Alert>
        <S.Button onClick={() => navigate('/')}>로그인 페이지로 이동</S.Button>
      </S.Container>
    );
  }

  if (user.role !== 'ADMIN' && user.role !== 'CEO' && user.role !== 'ACCOUNTANT') {
    return (
      <S.Container>
        <S.Alert>접근 권한이 없습니다. (ADMIN, CEO 또는 ACCOUNTANT 권한 필요)</S.Alert>
        <S.Button onClick={() => navigate('/expenses')}>목록으로 이동</S.Button>
      </S.Container>
    );
  }

  const canClose = user.role === 'ADMIN' || user.role === 'CEO';

  // 최근 12개월 목록 생성
  const months = [];
  const currentDate = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    months.push({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      label: `${date.getFullYear()}년 ${date.getMonth() + 1}월`
    });
  }

  return (
    <S.Container>
      <S.Header>
        <S.Title>
          <FaCalendarAlt />
          월 마감 관리
        </S.Title>
        <S.Button onClick={() => navigate('/expenses')}>목록으로</S.Button>
      </S.Header>

      {loading && <LoadingOverlay fullScreen={false} message="로딩 중..." />}

      {canClose && (
        <S.CloseSection>
          <S.SectionTitle>마감 처리</S.SectionTitle>
          <S.CloseForm>
            <S.FormGroup>
              <S.Label>년도</S.Label>
              <S.Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                  <option key={year} value={year}>{year}년</option>
                ))}
              </S.Select>
            </S.FormGroup>
            <S.FormGroup>
              <S.Label>월</S.Label>
              <S.Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>{month}월</option>
                ))}
              </S.Select>
            </S.FormGroup>
            <S.CloseButton
              onClick={handleCloseMonth}
              disabled={isClosing || isMonthClosed(selectedYear, selectedMonth)}
            >
              {isClosing ? '처리 중...' : '마감 처리'}
            </S.CloseButton>
          </S.CloseForm>
        </S.CloseSection>
      )}

      <S.ListSection>
        <S.SectionTitle>마감 현황</S.SectionTitle>
        <S.MonthList>
          {months.map(({ year, month, label }) => {
            const closed = isMonthClosed(year, month);
            const closingInfo = getClosingInfo(year, month);
            
            return (
              <S.MonthItem key={`${year}-${month}`} closed={closed}>
                <S.MonthInfo>
                  <S.MonthLabel>{label}</S.MonthLabel>
                  {closed && closingInfo && (
                    <S.ClosingInfo>
                      <span>마감일: {new Date(closingInfo.closedAt).toLocaleDateString('ko-KR')}</span>
                      {closingInfo.closedByName && (
                        <span>처리자: {closingInfo.closedByName}</span>
                      )}
                    </S.ClosingInfo>
                  )}
                </S.MonthInfo>
                <S.MonthActions>
                  {closed ? (
                    <>
                      <S.StatusBadge closed>
                        <FaLock /> 마감됨
                      </S.StatusBadge>
                      {canClose && closingInfo && (
                        <S.ReopenButton
                          onClick={() => handleReopenMonth(closingInfo.closingId)}
                          disabled={reopeningId === closingInfo.closingId}
                        >
                          {reopeningId === closingInfo.closingId ? '해제 중...' : '해제'}
                        </S.ReopenButton>
                      )}
                    </>
                  ) : (
                    <S.StatusBadge>
                      <FaUnlock /> 미마감
                    </S.StatusBadge>
                  )}
                </S.MonthActions>
              </S.MonthItem>
            );
          })}
        </S.MonthList>
      </S.ListSection>
    </S.Container>
  );
};

export default MonthlyClosingPage;

