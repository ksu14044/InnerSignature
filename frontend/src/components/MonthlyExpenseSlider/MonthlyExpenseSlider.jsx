import { useState, useEffect, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { fetchMonthlyDetailedStats } from '../../api/expenseApi';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './MonthlyExpenseSlider.css';

const MonthlyExpenseSlider = ({ userRole }) => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 무한루프 방지: 단일 useEffect로 데이터 로드
  useEffect(() => {
    let isMounted = true;

    const loadMonthlyData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 최근 12개월 데이터 로드
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 11);

        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        // 월별 상세 통계 API 호출
        const detailedStatsRes = await fetchMonthlyDetailedStats(startDateStr, endDateStr);

        // 컴포넌트가 언마운트되었는지 확인
        if (!isMounted) return;

        if (detailedStatsRes.success && detailedStatsRes.data) {
          // API에서 받은 월별 데이터를 그대로 사용
          const monthlyData = detailedStatsRes.data.map(monthData => ({
            yearMonth: monthData.yearMonth,
            totalAmount: monthData.totalAmount,
            categoryBreakdown: monthData.categoryBreakdown || [],
            topSpenders: monthData.topSpenders || []
          }));

          setMonthlyData(monthlyData);
        } else {
          // API 실패 시 빈 배열 설정
          setError('월별 통계 데이터를 불러오는데 실패했습니다.');
          setMonthlyData([]);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('월별 데이터 로드 실패:', error);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadMonthlyData();

    // cleanup 함수
    return () => {
      isMounted = false;
    };
  }, []); // 빈 의존성 배열: 컴포넌트 마운트 시 단 1회만 실행

  if (loading) {
    return (
      <div className="monthly-slider-loading">
        <div>월별 통계 로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="monthly-slider-error">
        <div>{error}</div>
        <button onClick={() => window.location.reload()}>
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="monthly-slider-container">
      <h3>월별 지출 현황</h3>
      {monthlyData.length === 0 ? (
        <div>표시할 데이터가 없습니다.</div>
      ) : (
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={20}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
          }}
        >
          {monthlyData.map((monthData, index) => (
            <SwiperSlide key={`${monthData.yearMonth}-${index}`}>
              <MonthlyStatsCard
                data={monthData}
                userRole={userRole}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};

const MonthlyStatsCard = ({ data, userRole }) => {
  // 데이터 검증
  if (!data || typeof data !== 'object') {
    return <div className="stats-card-error">데이터 오류</div>;
  }

  const {
    yearMonth,
    totalAmount = 0,
    categoryBreakdown = [],
    topSpenders = []
  } = data;

  // 안전한 숫자 포맷팅
  const formatAmount = (amount) => {
    const num = Number(amount);
    return isNaN(num) ? '0' : num.toLocaleString();
  };

  return (
    <div className="monthly-stats-card">
      <div className="month-header">
        <h4>{yearMonth || '알 수 없음'}월</h4>
        <div className="total-amount">
          {formatAmount(totalAmount)}원
        </div>
      </div>

      {/* 카테고리별 사용 내역 */}
      <div className="category-breakdown">
        <h5>사용 용도별</h5>
        {Array.isArray(categoryBreakdown) && categoryBreakdown.length > 0 ? (
          categoryBreakdown.map((category, idx) => (
            <div key={`${category.name}-${idx}`} className="category-item">
              <span className="category-name">{category.name || '기타'}</span>
              <span className="category-amount">
                {formatAmount(category.amount)}원
              </span>
              <div
                className="progress-bar"
                style={{
                  width: totalAmount > 0 ? `${(category.amount / totalAmount) * 100}%` : '0%'
                }}
              />
            </div>
          ))
        ) : (
          <div>카테고리 데이터가 없습니다.</div>
        )}
      </div>

      {/* 상위 지출자 (ADMIN/CEO 전용) */}
      {(userRole === 'ADMIN' || userRole === 'CEO') && Array.isArray(topSpenders) && topSpenders.length > 0 && (
        <div className="top-spenders">
          <h5>주요 지출자</h5>
          {topSpenders.slice(0, 3).map((spender, idx) => (
            <div key={`${spender.name}-${idx}`} className="spender-item">
              <span>{spender.name || '알 수 없음'}</span>
              <span>{formatAmount(spender.amount)}원</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MonthlyExpenseSlider;
