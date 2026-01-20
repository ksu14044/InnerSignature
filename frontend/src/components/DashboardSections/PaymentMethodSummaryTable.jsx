import { useState, useMemo } from 'react';
import * as S from './style';
import { getPaymentMethodLabel } from '../../utils/paymentMethodUtils';

const PaymentMethodSummaryTable = ({ data, title = '지출 수단별 합계' }) => {
  const [showAll, setShowAll] = useState(false);
  
  // 총 금액 계산
  const totalAmount = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return data.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
  }, [data]);

  // 총 건수 계산
  const totalCount = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return data.reduce((sum, item) => sum + (item.itemCount || 0), 0);
  }, [data]);

  if (!data || data.length === 0) return null;

  const displayData = showAll ? data : data.slice(0, 10);
  const hasMore = data.length > 10;

  return (
    <S.ChartCard>
      <S.ChartTitle title={title}>{title}</S.ChartTitle>
      <S.SummaryTable style={{ marginTop: '0' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'center' }}>지출 수단</th>
            <th style={{ textAlign: 'center' }}>총 결제 금액</th>
            <th style={{ textAlign: 'center' }}>건수</th>
          </tr>
        </thead>
        <tbody>
          {displayData.map((item, index) => {
            const paymentMethodLabel = getPaymentMethodLabel(item.paymentMethod);
            return (
              <tr key={index}>
                <td style={{ textAlign: 'center' }} title={paymentMethodLabel}>{paymentMethodLabel}</td>
                <td style={{ fontWeight: '600', color: '#007bff', textAlign: 'center' }}>
                  {item.totalAmount?.toLocaleString() || 0}원
                </td>
                <td style={{ textAlign: 'center' }}>{item.itemCount || 0}건</td>
              </tr>
            );
          })}
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
          더 보기 ({data.length - 10}개 더)
        </S.ViewMoreButton>
      )}
    </S.ChartCard>
  );
};

export default PaymentMethodSummaryTable;

