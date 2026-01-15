import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserExpenseStats, fetchDashboardStats } from '../../api/expenseApi';
import { useAuth } from '../../contexts/AuthContext';
import { getPendingUsers } from '../../api/userApi';
import * as S from './style';

const MobileCEODashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userExpenseStats, setUserExpenseStats] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [pendingUsers, setPendingUsers] = useState([]);

  // 데이터 로드
  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [statsRes, userStatsRes, usersRes] = await Promise.all([
        fetchDashboardStats(),
        fetchUserExpenseStats(),
        getPendingUsers().catch(() => ({ success: false, data: [] }))
      ]);

      if (statsRes.success) {
        setDashboardStats(statsRes.data || {});
      }
      if (userStatsRes.success) {
        setUserExpenseStats(userStatsRes.data || []);
      }
      if (usersRes.success) {
        setPendingUsers(usersRes.data || []);
      }
    } catch (error) {
      console.error('모바일 대시보드 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        로딩 중...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* 승인 대기 사용자 알림 배너 */}
      {pendingUsers && pendingUsers.length > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '16px',
            margin: '12px 0',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/users')}
        >
          <span>👥</span>
          <div>
            <div style={{ color: 'white', fontWeight: 'bold' }}>승인 대기 사용자</div>
            <div style={{ color: 'white', opacity: 0.9 }}>{pendingUsers.length}명</div>
          </div>
          <span style={{ marginLeft: 'auto', color: 'white' }}>→</span>
        </div>
      )}

      {/* 기본 통계 카드 */}
      <div style={{ marginBottom: '20px' }}>
        <h3>경영 지표</h3>
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
          <div style={{
            background: '#4CAF50',
            padding: '16px',
            borderRadius: '8px',
            color: 'white',
            minWidth: '120px'
          }}>
            <div>💰</div>
            <div>총 지출</div>
            <div>{(dashboardStats.totalAmount || 0).toLocaleString()}원</div>
          </div>

          <div style={{
            background: '#2196F3',
            padding: '16px',
            borderRadius: '8px',
            color: 'white',
            minWidth: '120px'
          }}>
            <div>📊</div>
            <div>총 건수</div>
            <div>{(dashboardStats.totalCount || 0).toLocaleString()}건</div>
          </div>
        </div>
      </div>

      {/* 빠른 액션 그리드 */}
      <div>
        <h3>관리 기능</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div
            style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onClick={() => navigate('/users')}
          >
            <div style={{ fontSize: '24px' }}>👥</div>
            <div>사용자 관리</div>
          </div>

          <div
            style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onClick={() => navigate('/subscriptions/manage')}
          >
            <div style={{ fontSize: '24px' }}>💳</div>
            <div>구독 관리</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileCEODashboard;




