import { useState, useMemo } from 'react';
import * as S from './style';

const UserExpenseTable = ({ data, title = '사용자별 지출 합계' }) => {
  const [showAll, setShowAll] = useState(false);
  
  // 건수가 있는 항목만 필터링
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.filter(item => item.itemCount && item.itemCount > 0);
  }, [data]);

  // 총 금액 계산
  const totalAmount = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
  }, [filteredData]);

  const totalCount = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + (item.itemCount || 0), 0);
  }, [filteredData]);

  if (filteredData.length === 0) return null;

  const displayData = showAll ? filteredData : filteredData.slice(0, 10);
  const hasMore = filteredData.length > 10;

  return (
    <S.ChartCard>
      <S.ChartTitle>{title}</S.ChartTitle>
      <S.SummaryTable style={{ marginTop: '0' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'center' }}>사용자</th>
            <th style={{ textAlign: 'center' }}>총 결제 금액</th>
            <th style={{ textAlign: 'center' }}>건수</th>
          </tr>
        </thead>
        <tbody>
          {displayData.map((item, index) => (
            <tr key={index}>
              <td style={{ textAlign: 'center' }}>{item.userName}</td>
              <td style={{ fontWeight: '600', color: '#007bff', textAlign: 'center' }}>
                {item.totalAmount?.toLocaleString() || 0}원
              </td>
              <td style={{ textAlign: 'center' }}>{item.itemCount || 0}건</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td style={{ textAlign: 'center', fontWeight: '700', paddingTop: '12px', borderTop: '2px solid #e0e0e0' }}>합계</td>
            <td style={{ textAlign: 'center', fontWeight: '700', color: '#007bff', paddingTop: '12px', borderTop: '2px solid #e0e0e0' }}>
              {totalAmount.toLocaleString()}원
            </td>
            <td style={{ textAlign: 'center', fontWeight: '700', paddingTop: '12px', borderTop: '2px solid #e0e0e0' }}>
              {totalCount}건
            </td>
          </tr>
        </tfoot>
      </S.SummaryTable>
      {hasMore && !showAll && (
        <S.ViewMoreButton onClick={() => setShowAll(true)}>
          더 보기 ({filteredData.length - 10}개 더)
        </S.ViewMoreButton>
      )}
    </S.ChartCard>
  );
};

export default UserExpenseTable;

