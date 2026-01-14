import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getPendingUsers } from '../../api/userApi';
import CommonDashboardSection from './CommonDashboardSection';
import * as S from './style';

const AdminDashboardSection = ({ filters }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
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

      {/* 차트 - CommonDashboardSection 사용 */}
      <CommonDashboardSection
        chartTypes={['monthly', 'user']}
        showCategoryChart={true}
        showPendingUsers={false}
        filters={filters}
      />

      {/* 관리 메뉴 */}
      <S.ManagementSection>
        <S.SectionTitle>관리 메뉴</S.SectionTitle>
        <S.ManagementGrid>
          <S.ManagementCard onClick={() => navigate('/users')}>
            <S.ManagementIcon>👥</S.ManagementIcon>
            <S.ManagementTitle>사용자 관리</S.ManagementTitle>
            <S.ManagementDesc>회사 소속 사용자 관리 및 승인</S.ManagementDesc>
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
          <S.ManagementCard onClick={() => navigate('/account-codes')}>
            <S.ManagementIcon>📊</S.ManagementIcon>
            <S.ManagementTitle>계정 과목 매핑</S.ManagementTitle>
            <S.ManagementDesc>카테고리별 계정 과목 자동 분류 설정</S.ManagementDesc>
          </S.ManagementCard>
          <S.ManagementCard onClick={() => navigate('/monthly-closing')}>
            <S.ManagementIcon>📅</S.ManagementIcon>
            <S.ManagementTitle>월 마감 관리</S.ManagementTitle>
            <S.ManagementDesc>회계 월 마감 처리 및 관리</S.ManagementDesc>
          </S.ManagementCard>
          <S.ManagementCard onClick={() => navigate('/audit-logs')}>
            <S.ManagementIcon>📋</S.ManagementIcon>
            <S.ManagementTitle>감사 로그</S.ManagementTitle>
            <S.ManagementDesc>자동 감사로 탐지된 이슈 확인</S.ManagementDesc>
          </S.ManagementCard>
        </S.ManagementGrid>
      </S.ManagementSection>
    </>
  );
};

export default AdminDashboardSection;
