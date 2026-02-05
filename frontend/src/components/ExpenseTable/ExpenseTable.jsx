import { useNavigate } from 'react-router-dom';
import { STATUS_KOREAN } from '../../constants/status';
import * as S from './style';

const ExpenseTable = ({
  expenses,
  loading
}) => {
  const navigate = useNavigate();

  const handleRowClick = (expenseReportId, e) => {
    // 버튼 클릭이 아닌 경우에만 상세 페이지로 이동
    if (!e.target.closest('button') && !e.target.closest('a')) {
      navigate(`/detail/${expenseReportId}`);
    }
  };

  if (expenses.length === 0) {
    return null;
  }

  return (
    <S.TableContainer>
      <S.Table>
        <S.Thead>
          <tr>
            <th>지급 요청일</th>
            <th>작성자</th>
            <th>적요(내용)</th>
            <S.AmountTh>금액</S.AmountTh>
            <th>상태</th>
          </tr>
        </S.Thead>
        <tbody>
          {expenses.map((item) => {
            // 지급 요청일 계산 (상세 항목 중 가장 빠른 날짜)
            const paymentReqDate = item.details && item.details.length > 0
              ? item.details
                  .map(d => d.paymentReqDate)
                  .filter(d => d)
                  .sort()[0] || item.paymentReqDate || item.reportDate
              : item.paymentReqDate || item.reportDate;

            // 항목 표시 (첫 번째 항목 외 n개)
            const categoryDisplay = item.details && item.details.length > 0
              ? item.details.length === 1
                ? item.details[0].category
                : `${item.details[0].category} 외 ${item.details.length - 1}개`
              : '-';

            // 적요(내용) 표시 - 목록 응답의 요약 필드 사용
            const descriptionDisplay =
              item.summaryDescription && item.summaryDescription.trim() !== ''
                ? item.summaryDescription
                : item.firstDescription && item.firstDescription.trim() !== ''
                  ? item.firstDescription
                  : '-';

            return (
              <S.Tr
                key={item.expenseReportId}
                onClick={(e) => handleRowClick(item.expenseReportId, e)}
              >
                <td>
                  {paymentReqDate}
                </td>
                <td>{item.drafterName}</td>
                <td title={descriptionDisplay} style={{
                  maxWidth: '200px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {descriptionDisplay}
                </td>
                <S.AmountTd>{item.totalAmount.toLocaleString()}원</S.AmountTd>
                <td>
                  <S.StatusBadge status={item.status}>
                    {STATUS_KOREAN[item.status] || item.status}
                  </S.StatusBadge>
                </td>
              </S.Tr>
            );
          })}
        </tbody>
      </S.Table>
    </S.TableContainer>
  );
};

export default ExpenseTable;
