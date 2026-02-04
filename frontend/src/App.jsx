import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import LoadingOverlay from './components/LoadingOverlay/LoadingOverlay';
import MobileAppBar from './components/MobileAppBar/MobileAppBar';
import MobileBottomNav from './components/MobileBottomNav/MobileBottomNav';
import MobileFAB from './components/MobileFAB/MobileFAB';
import AuthenticatedLayout from './components/AuthenticatedLayout/AuthenticatedLayout';
import Footer from './components/common/Footer/Footer';
import { registerServiceWorker } from './utils/serviceWorker';

// Code Splitting 적용 - 각 페이지를 lazy loading으로 로드
const ExpenseListPage = lazy(() => import('./pages/ExpenseListPage/ExpenseListPage'));
const ExpenseDetailPage = lazy(() => import('./pages/ExpenseDetailPage/ExpenseDetailPage'));
const LoginPage = lazy(() => import('./pages/LoginPage/LoginPage'));
const ExpenseCreatePage = lazy(() => import('./pages/ExpenseCreatePage/ExpenseCreatePage'));
const TaxSummaryPage = lazy(() => import('./pages/TaxSummaryPage/TaxSummaryPage'));
const UserManagementPage = lazy(() => import('./pages/UserManagementPage/UserManagementPage'));
const MyProfilePage = lazy(() => import('./pages/MyProfilePage/MyProfilePage'));
const FindIdPage = lazy(() => import('./pages/FindIdPage/FindIdPage'));
const FindPasswordPage = lazy(() => import('./pages/FindPasswordPage/FindPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage/ResetPasswordPage'));
const SubscriptionManagementPage = lazy(() => import('./pages/SubscriptionManagementPage/SubscriptionManagementPage'));
const SuperAdminDashboardPage = lazy(() => import('./pages/SuperAdminDashboardPage/SuperAdminDashboardPage'));
const MonthlyClosingPage = lazy(() => import('./pages/MonthlyClosingPage/MonthlyClosingPage'));
const BudgetManagementPage = lazy(() => import('./pages/BudgetManagementPage/BudgetManagementPage'));
const AuditRuleManagementPage = lazy(() => import('./pages/AuditRuleManagementPage/AuditRuleManagementPage'));
const AuditLogPage = lazy(() => import('./pages/AuditLogPage/AuditLogPage'));
const MissingReceiptPage = lazy(() => import('./pages/MissingReceiptPage/MissingReceiptPage'));
const AccountCodeMappingPage = lazy(() => import('./pages/AccountCodeMappingPage/AccountCodeMappingPage'));
const MainDashboardPage = lazy(() => import('./pages/MainDashboardPage/MainDashboardPage'));
const ExpenseCategoryPage = lazy(() => import('./pages/ExpenseCategoryPage/ExpenseCategoryPage'));
const MyApproverPage = lazy(() => import('./pages/MyApproverPage/MyApproverPage'));
const CardManagementPage = lazy(() => import('./pages/CardManagementPage/CardManagementPage'));
const SignatureManagementPage = lazy(() => import('./pages/SignatureManagementPage/SignatureManagementPage'));

function App() {
  // Service Worker 등록
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <BrowserRouter>
      <MobileAppBar />
      <Suspense fallback={<LoadingOverlay fullScreen={true} message="페이지 로딩 중..." />}>
        <Routes>
          {/* 공개 라우트 (헤더 없음) */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/find-id" element={<FindIdPage />} />
          <Route path="/find-password" element={<FindPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          
          {/* 인증 필요 라우트 (공통 헤더 표시) */}
          <Route path="/expenses" element={
            <AuthenticatedLayout>
              <ExpenseListPage />
            </AuthenticatedLayout>
          } />
          <Route path="/detail/:id" element={
            <AuthenticatedLayout>
              <ExpenseDetailPage />
            </AuthenticatedLayout>
          } />
          <Route path="/expenses/create" element={
            <AuthenticatedLayout>
              <ExpenseCreatePage />
            </AuthenticatedLayout>
          } />
          <Route path="/expenses/edit/:id" element={
            <AuthenticatedLayout>
              <ExpenseCreatePage />
            </AuthenticatedLayout>
          } />
          <Route path="/tax/summary" element={
            <AuthenticatedLayout>
              <TaxSummaryPage />
            </AuthenticatedLayout>
          } />
          <Route path="/users" element={
            <AuthenticatedLayout>
              <UserManagementPage />
            </AuthenticatedLayout>
          } />
          <Route path="/profile" element={
            <AuthenticatedLayout>
              <MyProfilePage />
            </AuthenticatedLayout>
          } />
          <Route path="/dashboard" element={
            <AuthenticatedLayout>
              <MainDashboardPage />
            </AuthenticatedLayout>
          } />
          <Route path="/dashboard/main" element={
            <AuthenticatedLayout>
              <MainDashboardPage />
            </AuthenticatedLayout>
          } />
          <Route path="/expense-categories" element={
            <AuthenticatedLayout>
              <ExpenseCategoryPage />
            </AuthenticatedLayout>
          } />
          <Route path="/my-approvers" element={
            <AuthenticatedLayout>
              <MyApproverPage />
            </AuthenticatedLayout>
          } />
          <Route path="/subscriptions/manage" element={
            <AuthenticatedLayout>
              <SubscriptionManagementPage />
            </AuthenticatedLayout>
          } />
          <Route path="/subscriptions/plans" element={
            <AuthenticatedLayout>
              <SubscriptionManagementPage />
            </AuthenticatedLayout>
          } />
          <Route path="/subscriptions/payments" element={
            <AuthenticatedLayout>
              <SubscriptionManagementPage />
            </AuthenticatedLayout>
          } />
          <Route path="/credits" element={
            <AuthenticatedLayout>
              <SubscriptionManagementPage />
            </AuthenticatedLayout>
          } />
          <Route path="/monthly-closing" element={
            <AuthenticatedLayout>
              <BudgetManagementPage />
            </AuthenticatedLayout>
          } />
          <Route path="/budget" element={
            <AuthenticatedLayout>
              <BudgetManagementPage />
            </AuthenticatedLayout>
          } />
          <Route path="/audit-rules" element={
            <AuthenticatedLayout>
              <AuditRuleManagementPage />
            </AuthenticatedLayout>
          } />
          <Route path="/audit-logs" element={
            <AuthenticatedLayout>
              <AuditRuleManagementPage />
            </AuthenticatedLayout>
          } />
          <Route path="/missing-receipts" element={
            <AuthenticatedLayout>
              <MissingReceiptPage />
            </AuthenticatedLayout>
          } />
          <Route path="/account-codes" element={
            <AuthenticatedLayout>
              <ExpenseCategoryPage />
            </AuthenticatedLayout>
          } />
          <Route path="/cards" element={
            <AuthenticatedLayout>
              <CardManagementPage />
            </AuthenticatedLayout>
          } />
          <Route path="/signatures" element={
            <AuthenticatedLayout>
              <SignatureManagementPage />
            </AuthenticatedLayout>
          } />
          
          {/* SUPERADMIN은 별도 레이아웃 (자체 헤더 사용) */}
          <Route path="/superadmin/dashboard" element={<SuperAdminDashboardPage />} />
        </Routes>
      </Suspense>
      <MobileBottomNav />
      <MobileFAB />
      <Footer />
    </BrowserRouter>
  );
}

export default App;