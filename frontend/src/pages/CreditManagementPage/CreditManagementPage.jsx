import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaExclamationTriangle } from 'react-icons/fa';
import { getCredits, getTotalAvailableAmount } from '../../api/creditApi';
import { useAuth } from '../../contexts/AuthContext';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import * as S from './style';

const CreditManagementPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [credits, setCredits] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || (user.role !== 'CEO' && user.role !== 'ADMIN')) {
      navigate('/');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [creditsRes, totalRes] = await Promise.all([
        getCredits(),
        getTotalAvailableAmount()
      ]);
      
      if (creditsRes.success) {
        setCredits(creditsRes.data || []);
      }
      
      if (totalRes.success && totalRes.data) {
        setTotalAmount(totalRes.data.totalAmount || 0);
      }
    } catch (err) {
      console.error('크레딧 데이터 로드 실패:', err);
      alert('크레딧 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '만료 없음';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const isExpiringSoon = (expiresAt) => {
    if (!expiresAt) return false;
    const expiryDate = new Date(expiresAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);
    const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    return daysLeft >= 0 && daysLeft <= 30;
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    const expiryDate = new Date(expiresAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);
    return expiryDate < today;
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <S.Container>
      <S.Header>
        <S.HeaderLeft>
          <S.Title>크레딧 관리</S.Title>
        </S.HeaderLeft>
        <S.HeaderRight>
          <S.ProfileButton onClick={() => navigate('/profile')}>
            <FaUser /> 내 정보
          </S.ProfileButton>
        </S.HeaderRight>
      </S.Header>

      {/* 총 사용 가능한 크레딧 카드 */}
      <S.TotalCreditCard>
        <S.TotalCreditLabel>사용 가능한 크레딧</S.TotalCreditLabel>
        <S.TotalCreditAmount>{totalAmount.toLocaleString()}원</S.TotalCreditAmount>
      </S.TotalCreditCard>

      {credits.length === 0 ? (
        <S.EmptyState>
          <S.EmptyText>크레딧 내역이 없습니다.</S.EmptyText>
        </S.EmptyState>
      ) : (
        <S.CreditsTable>
          <S.TableHeader>
            <S.TableRow>
              <S.TableHeaderCell>발생 사유</S.TableHeaderCell>
              <S.TableHeaderCell>총 금액</S.TableHeaderCell>
              <S.TableHeaderCell>사용 금액</S.TableHeaderCell>
              <S.TableHeaderCell>사용 가능</S.TableHeaderCell>
              <S.TableHeaderCell>만료일</S.TableHeaderCell>
              <S.TableHeaderCell>생성일</S.TableHeaderCell>
            </S.TableRow>
          </S.TableHeader>
          <S.TableBody>
            {credits.map(credit => {
              const availableAmount = credit.amount - (credit.usedAmount || 0);
              const expiringSoon = isExpiringSoon(credit.expiresAt);
              const expired = isExpired(credit.expiresAt);
              
              return (
                <S.TableRow key={credit.creditId}>
                  <S.TableCell>{credit.reason || '-'}</S.TableCell>
                  <S.TableCell>{credit.amount?.toLocaleString()}원</S.TableCell>
                  <S.TableCell>{credit.usedAmount?.toLocaleString() || 0}원</S.TableCell>
                  <S.TableCell>
                    <S.AvailableAmount available={availableAmount > 0 && !expired}>
                      {availableAmount > 0 && !expired 
                        ? `${availableAmount.toLocaleString()}원` 
                        : expired 
                        ? '만료됨' 
                        : '사용 완료'}
                    </S.AvailableAmount>
                  </S.TableCell>
                  <S.TableCell>
                    <S.ExpiryDate expired={expired} expiringSoon={expiringSoon && !expired}>
                      {formatDate(credit.expiresAt)}
                      {expiringSoon && !expired && (
                        <S.ExpiryWarning>
                          <FaExclamationTriangle /> 30일 이내 만료
                        </S.ExpiryWarning>
                      )}
                    </S.ExpiryDate>
                  </S.TableCell>
                  <S.TableCell>
                    {credit.createdAt 
                      ? new Date(credit.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        })
                      : '-'}
                  </S.TableCell>
                </S.TableRow>
              );
            })}
          </S.TableBody>
        </S.CreditsTable>
      )}
    </S.Container>
  );
};

export default CreditManagementPage;

