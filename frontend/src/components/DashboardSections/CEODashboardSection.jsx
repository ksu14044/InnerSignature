import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CommonDashboardSection from './CommonDashboardSection';
import { getPendingUsers } from '../../api/userApi';
import { useAuth } from '../../contexts/AuthContext';
import * as S from './style';

const CEODashboardSection = ({ filters }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState([]);

  // 승인 대기 사용자 데이터 로드
  const loadPendingUsers = useCallback(async () => {
    try {
      const response = await getPendingUsers();
      if (response.success) {
        setPendingUsers(response.data || []);
      }
    } catch (error) {
      console.error('승인 대기 사용자 조회 실패:', error);
    }
  }, []);

  useEffect(() => {
    loadPendingUsers();
  }, [loadPendingUsers]);

  // 데스크톱 및 모바일 공통 버전 (CommonDashboardSection이 모바일 렌더링 자동 처리)
  return (
    <>
      {/* 승인 대기 사용자 */}
      {pendingUsers.length > 0 && (
        <S.AlertSection>
          <S.AlertTitle>👥 승인 대기 사용자: {pendingUsers.length}명</S.AlertTitle>
          <S.AlertButton onClick={() => navigate('/users')}>
            사용자 관리로 이동 →
          </S.AlertButton>
        </S.AlertSection>
      )}

      <CommonDashboardSection
        chartTypes={['monthly', 'user']}
        showCategoryChart={true}
        showPendingUsers={false}
        filters={filters} // 필터 적용
      />

      {/* 관리 기능 */}
      <S.ManagementSection>
        <S.SectionTitle>관리 기능</S.SectionTitle>
        <S.ManagementGrid>
          <S.ManagementCard onClick={() => navigate('/users')}>
            <S.ManagementIcon>👥</S.ManagementIcon>
            <S.ManagementTitle>사용자 관리</S.ManagementTitle>
            <S.ManagementDesc>회사 소속 사용자 관리 및 승인</S.ManagementDesc>
          </S.ManagementCard>
          <S.ManagementCard onClick={() => navigate('/subscriptions/manage')}>
            <S.ManagementIcon>💳</S.ManagementIcon>
            <S.ManagementTitle>구독 관리</S.ManagementTitle>
            <S.ManagementDesc>구독 및 크레딧 현황 관리</S.ManagementDesc>
          </S.ManagementCard>
          <S.ManagementCard onClick={() => navigate('/budget')}>
            <S.ManagementIcon>💰</S.ManagementIcon>
            <S.ManagementTitle>예산 관리</S.ManagementTitle>
            <S.ManagementDesc>연간/월간 예산 설정 및 모니터링</S.ManagementDesc>
          </S.ManagementCard>
          <S.ManagementCard onClick={() => navigate('/audit-rules')}>
            <S.ManagementIcon>🛡️</S.ManagementIcon>
            <S.ManagementTitle>감사 규칙</S.ManagementTitle>
            <S.ManagementDesc>자동 감사 규칙 설정 및 관리</S.ManagementDesc>
          </S.ManagementCard>
        </S.ManagementGrid>
      </S.ManagementSection>
    </>
  );
};

export default CEODashboardSection;

