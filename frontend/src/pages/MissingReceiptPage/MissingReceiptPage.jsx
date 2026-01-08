import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getMissingReceipts, getMissingReceiptsByUser } from '../../api/missingReceiptApi';
import * as S from './style';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import { FaExclamationTriangle, FaUser } from 'react-icons/fa';

const MissingReceiptPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [missingReceipts, setMissingReceipts] = useState([]);
  const [missingReceiptsByUser, setMissingReceiptsByUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'byUser'
  const [days, setDays] = useState(3);

  useEffect(() => {
    if (!user || user.role !== 'ACCOUNTANT') {
      alert('접근 권한이 없습니다. (ACCOUNTANT 권한 필요)');
      navigate('/expenses');
      return;
    }
    loadMissingReceipts();
  }, [user, navigate, days, viewMode]);

  // useCallback으로 최적화
  const loadMissingReceipts = useCallback(async () => {
    try {
      setLoading(true);
      if (viewMode === 'byUser') {
        const response = await getMissingReceiptsByUser(days);
        if (response.success) {
          setMissingReceiptsByUser(response.data || {});
        }
      } else {
        const response = await getMissingReceipts(days);
        if (response.success) {
          setMissingReceipts(response.data || []);
        }
      }
    } catch (error) {
      console.error('증빙 누락 건 조회 실패:', error);
      alert(error?.response?.data?.message || '증빙 누락 건 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [days, viewMode]);

  if (!user) {
    return (
      <S.Container>
        <S.Alert>로그인이 필요합니다.</S.Alert>
        <S.Button onClick={() => navigate('/')}>로그인 페이지로 이동</S.Button>
      </S.Container>
    );
  }

  if (user.role !== 'ACCOUNTANT') {
    return (
      <S.Container>
        <S.Alert>접근 권한이 없습니다. (ACCOUNTANT 권한 필요)</S.Alert>
        <S.Button onClick={() => navigate('/expenses')}>목록으로 이동</S.Button>
      </S.Container>
    );
  }

  return (
    <S.Container>
      <S.Header>
        <S.Title>
          <FaExclamationTriangle />
          증빙 누락 관리
        </S.Title>
        <S.Button onClick={() => navigate('/expenses')}>목록으로</S.Button>
      </S.Header>

      {loading && <LoadingOverlay fullScreen={false} message="로딩 중..." />}

      <S.FilterCard>
        <S.FilterGrid>
          <S.FilterGroup>
            <S.Label>경과 일수</S.Label>
            <S.Select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
            >
              <option value="1">1일</option>
              <option value="3">3일</option>
              <option value="7">7일</option>
              <option value="14">14일</option>
              <option value="30">30일</option>
            </S.Select>
          </S.FilterGroup>
          <S.FilterGroup>
            <S.Label>보기 모드</S.Label>
            <S.Select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
            >
              <option value="list">전체 목록</option>
              <option value="byUser">사용자별 그룹</option>
            </S.Select>
          </S.FilterGroup>
        </S.FilterGrid>
      </S.FilterCard>

      {viewMode === 'byUser' ? (
        <S.UserGroupList>
          {Object.keys(missingReceiptsByUser).length === 0 ? (
            <S.EmptyMessage>증빙 누락 건이 없습니다.</S.EmptyMessage>
          ) : (
            Object.entries(missingReceiptsByUser).map(([userId, receipts]) => (
              <S.UserGroup key={userId}>
                <S.UserHeader>
                  <S.UserInfo>
                    <FaUser />
                    <S.UserName>{receipts[0]?.drafterName || `사용자 ID: ${userId}`}</S.UserName>
                    <S.CountBadge>{receipts.length}건</S.CountBadge>
                  </S.UserInfo>
                </S.UserHeader>
                <S.ReceiptList>
                  {receipts.map(receipt => (
                    <S.ReceiptItem key={receipt.expenseReportId}>
                      <S.ReceiptInfo>
                        <S.ReceiptTitle>{receipt.title || `문서 #${receipt.expenseReportId}`}</S.ReceiptTitle>
                        <S.ReceiptDetails>
                          <S.DetailItem>
                            <S.DetailLabel>작성일:</S.DetailLabel>
                            <S.DetailValue>{new Date(receipt.reportDate).toLocaleDateString('ko-KR')}</S.DetailValue>
                          </S.DetailItem>
                          <S.DetailItem>
                            <S.DetailLabel>금액:</S.DetailLabel>
                            <S.DetailValue>{receipt.totalAmount?.toLocaleString()}원</S.DetailValue>
                          </S.DetailItem>
                          <S.DetailItem>
                            <S.DetailLabel>상태:</S.DetailLabel>
                            <S.DetailValue>{receipt.status}</S.DetailValue>
                          </S.DetailItem>
                        </S.ReceiptDetails>
                      </S.ReceiptInfo>
                      <S.ViewButton onClick={() => navigate(`/detail/${receipt.expenseReportId}`)}>
                        상세보기
                      </S.ViewButton>
                    </S.ReceiptItem>
                  ))}
                </S.ReceiptList>
              </S.UserGroup>
            ))
          )}
        </S.UserGroupList>
      ) : (
        <S.ReceiptList>
          {missingReceipts.length === 0 ? (
            <S.EmptyMessage>증빙 누락 건이 없습니다.</S.EmptyMessage>
          ) : (
            missingReceipts.map(receipt => (
              <S.ReceiptCard key={receipt.expenseReportId}>
                <S.ReceiptHeader>
                  <S.ReceiptTitle>{receipt.title || `문서 #${receipt.expenseReportId}`}</S.ReceiptTitle>
                  <S.StatusBadge>{receipt.status}</S.StatusBadge>
                </S.ReceiptHeader>
                <S.ReceiptInfo>
                  <S.InfoRow>
                    <S.InfoLabel>작성자:</S.InfoLabel>
                    <S.InfoValue>{receipt.drafterName || '알 수 없음'}</S.InfoValue>
                  </S.InfoRow>
                  <S.InfoRow>
                    <S.InfoLabel>작성일:</S.InfoLabel>
                    <S.InfoValue>{new Date(receipt.reportDate).toLocaleDateString('ko-KR')}</S.InfoValue>
                  </S.InfoRow>
                  <S.InfoRow>
                    <S.InfoLabel>금액:</S.InfoLabel>
                    <S.InfoValue>{receipt.totalAmount?.toLocaleString()}원</S.InfoValue>
                  </S.InfoRow>
                </S.ReceiptInfo>
                <S.ViewButton onClick={() => navigate(`/detail/${receipt.expenseReportId}`)}>
                  상세보기
                </S.ViewButton>
              </S.ReceiptCard>
            ))
          )}
        </S.ReceiptList>
      )}
    </S.Container>
  );
};

export default MissingReceiptPage;

