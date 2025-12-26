import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import { getPayments } from '../../api/subscriptionApi';
import { useAuth } from '../../contexts/AuthContext';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import * as S from './style';

const PaymentHistoryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || (user.role !== 'CEO' && user.role !== 'ADMIN')) {
      navigate('/');
      return;
    }
    loadPayments();
  }, [user, navigate]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const res = await getPayments();
      if (res.success) {
        setPayments(res.data || []);
      }
    } catch (err) {
      console.error('결제 내역 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status) => {
    const labels = {
      'PENDING': '대기 중',
      'COMPLETED': '완료',
      'FAILED': '실패',
      'REFUNDED': '환불됨'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': '#ffc107',
      'COMPLETED': '#28a745',
      'FAILED': '#dc3545',
      'REFUNDED': '#6c757d'
    };
    return colors[status] || '#6c757d';
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      'CARD': '카드',
      'CREDIT_USED': '크레딧 사용',
      'BANK_TRANSFER': '계좌이체'
    };
    return labels[method] || method || '-';
  };

  const getPaymentMethodColor = (method) => {
    if (method === 'CREDIT_USED') {
      return '#28a745';
    }
    return '#6c757d';
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <S.Container>
      <S.Header>
        <S.HeaderLeft>
          <S.Title>결제 내역</S.Title>
        </S.HeaderLeft>
        <S.HeaderRight>
          <S.ProfileButton onClick={() => navigate('/profile')}>
            <FaUser /> 내 정보
          </S.ProfileButton>
        </S.HeaderRight>
      </S.Header>

      {payments.length === 0 ? (
        <S.EmptyState>
          <S.EmptyText>결제 내역이 없습니다.</S.EmptyText>
        </S.EmptyState>
      ) : (
        <S.PaymentsTable>
          <S.TableHeader>
            <S.TableRow>
              <S.TableHeaderCell>결제일</S.TableHeaderCell>
              <S.TableHeaderCell>금액</S.TableHeaderCell>
              <S.TableHeaderCell>결제 수단</S.TableHeaderCell>
              <S.TableHeaderCell>상태</S.TableHeaderCell>
            </S.TableRow>
          </S.TableHeader>
          <S.TableBody>
            {payments.map(payment => (
              <S.TableRow key={payment.paymentId}>
                <S.TableCell>{formatDate(payment.paymentDate)}</S.TableCell>
                <S.TableCell>{payment.amount?.toLocaleString()}원</S.TableCell>
                <S.TableCell>
                  <S.PaymentMethod color={getPaymentMethodColor(payment.paymentMethod)}>
                    {getPaymentMethodLabel(payment.paymentMethod)}
                  </S.PaymentMethod>
                </S.TableCell>
                <S.TableCell>
                  <S.StatusBadge color={getStatusColor(payment.paymentStatus)}>
                    {getStatusLabel(payment.paymentStatus)}
                  </S.StatusBadge>
                </S.TableCell>
              </S.TableRow>
            ))}
          </S.TableBody>
        </S.PaymentsTable>
      )}
    </S.Container>
  );
};

export default PaymentHistoryPage;

