import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAuditLogList, resolveAuditLog } from '../../api/auditApi';
import * as S from './style';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import { FaCheck, FaExclamationTriangle, FaInfoCircle, FaList } from 'react-icons/fa';

const AuditLogPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logList, setLogList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState({
    severity: '',
    isResolved: '',
    startDate: '',
    endDate: ''
  });
  const pageSize = 10;

  useEffect(() => {
    if (!user || (user.role !== 'ADMIN' && user.role !== 'CEO' && user.role !== 'ACCOUNTANT')) {
      alert('접근 권한이 없습니다. (ADMIN, CEO, ACCOUNTANT 권한 필요)');
      navigate('/expenses');
      return;
    }
    loadLogList();
  }, [user, navigate, currentPage, filters]);

  const loadLogList = async () => {
    try {
      setLoading(true);
      const filterParams = {};
      if (filters.severity) filterParams.severity = filters.severity;
      if (filters.isResolved !== '') filterParams.isResolved = filters.isResolved === 'true';
      if (filters.startDate) filterParams.startDate = filters.startDate;
      if (filters.endDate) filterParams.endDate = filters.endDate;
      
      const response = await getAuditLogList(filterParams, currentPage, pageSize);
      if (response.success && response.data) {
        setLogList(response.data.content || []);
        setCurrentPage(response.data.page || 1);
        setTotalPages(response.data.totalPages || 1);
        setTotalElements(response.data.totalElements || 0);
      }
    } catch (error) {
      console.error('감사 로그 목록 조회 실패:', error);
      alert(error?.response?.data?.message || '감사 로그 목록 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (auditLogId) => {
    if (!window.confirm('이 감사 로그를 해결 처리하시겠습니까?')) {
      return;
    }

    try {
      const response = await resolveAuditLog(auditLogId);
      if (response.success) {
        alert('감사 로그가 해결 처리되었습니다.');
        loadLogList();
      }
    } catch (error) {
      console.error('감사 로그 해결 처리 실패:', error);
      alert(error?.response?.data?.message || '감사 로그 해결 처리 중 오류가 발생했습니다.');
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'HIGH':
        return <FaExclamationTriangle style={{ color: '#dc3545' }} />;
      case 'MEDIUM':
        return <FaInfoCircle style={{ color: '#ffc107' }} />;
      case 'LOW':
        return <FaInfoCircle style={{ color: '#28a745' }} />;
      default:
        return <FaInfoCircle />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'HIGH':
        return '#dc3545';
      case 'MEDIUM':
        return '#ffc107';
      case 'LOW':
        return '#28a745';
      default:
        return '#6c757d';
    }
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

  return (
    <S.Container>
      <S.Header>
        <S.Title>
          <FaList />
          감사 로그
        </S.Title>
        <S.Button onClick={() => navigate('/expenses')}>목록으로</S.Button>
      </S.Header>

      {loading && <LoadingOverlay fullScreen={false} message="로딩 중..." />}

      <S.FilterCard>
        <S.FilterGrid>
          <S.FilterGroup>
            <S.Label>심각도</S.Label>
            <S.Select
              value={filters.severity}
              onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
            >
              <option value="">전체</option>
              <option value="HIGH">높음</option>
              <option value="MEDIUM">중간</option>
              <option value="LOW">낮음</option>
            </S.Select>
          </S.FilterGroup>
          <S.FilterGroup>
            <S.Label>해결 여부</S.Label>
            <S.Select
              value={filters.isResolved}
              onChange={(e) => setFilters(prev => ({ ...prev, isResolved: e.target.value }))}
            >
              <option value="">전체</option>
              <option value="false">미해결</option>
              <option value="true">해결됨</option>
            </S.Select>
          </S.FilterGroup>
          <S.FilterGroup>
            <S.Label>시작일</S.Label>
            <S.Input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </S.FilterGroup>
          <S.FilterGroup>
            <S.Label>종료일</S.Label>
            <S.Input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              min={filters.startDate || undefined}
            />
          </S.FilterGroup>
        </S.FilterGrid>
        <S.ButtonRow style={{ marginTop: 12 }}>
          <S.Button onClick={() => setFilters({ severity: '', isResolved: '', startDate: '', endDate: '' })}>
            필터 초기화
          </S.Button>
        </S.ButtonRow>
      </S.FilterCard>

      <S.LogList>
        {logList.length === 0 ? (
          <S.EmptyMessage>감사 로그가 없습니다.</S.EmptyMessage>
        ) : (
          logList.map(log => (
            <S.LogCard key={log.auditLogId} resolved={log.isResolved}>
              <S.LogHeader>
                <S.LogInfo>
                  <S.SeverityBadge color={getSeverityColor(log.severity)}>
                    {getSeverityIcon(log.severity)}
                    {log.severity === 'HIGH' ? '높음' : log.severity === 'MEDIUM' ? '중간' : '낮음'}
                  </S.SeverityBadge>
                  <S.RuleName>{log.ruleName || '알 수 없음'}</S.RuleName>
                  {log.isResolved && (
                    <S.ResolvedBadge>해결됨</S.ResolvedBadge>
                  )}
                </S.LogInfo>
                {!log.isResolved && (
                  <S.ResolveButton onClick={() => handleResolve(log.auditLogId)}>
                    <FaCheck /> 해결 처리
                  </S.ResolveButton>
                )}
              </S.LogHeader>
              <S.LogMessage>{log.message}</S.LogMessage>
              <S.LogDetails>
                <S.DetailItem>
                  <S.DetailLabel>지출결의서:</S.DetailLabel>
                  <S.DetailValue>{log.expenseTitle || `#${log.expenseReportId}`}</S.DetailValue>
                </S.DetailItem>
                <S.DetailItem>
                  <S.DetailLabel>탐지 일시:</S.DetailLabel>
                  <S.DetailValue>{new Date(log.detectedAt).toLocaleString('ko-KR')}</S.DetailValue>
                </S.DetailItem>
                {log.isResolved && log.resolvedByName && (
                  <S.DetailItem>
                    <S.DetailLabel>해결자:</S.DetailLabel>
                    <S.DetailValue>{log.resolvedByName}</S.DetailValue>
                  </S.DetailItem>
                )}
              </S.LogDetails>
            </S.LogCard>
          ))
        )}
      </S.LogList>

      {totalPages > 1 && (
        <S.Pagination>
          <S.PaginationButton
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            이전
          </S.PaginationButton>
          <S.PaginationInfo>
            {currentPage} / {totalPages} (총 {totalElements}건)
          </S.PaginationInfo>
          <S.PaginationButton
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            다음
          </S.PaginationButton>
        </S.Pagination>
      )}
    </S.Container>
  );
};

export default AuditLogPage;

