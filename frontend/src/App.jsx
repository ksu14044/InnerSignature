import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import LoadingOverlay from './components/LoadingOverlay/LoadingOverlay';
import MobileAppBar from './components/MobileAppBar/MobileAppBar';
import MobileBottomNav from './components/MobileBottomNav/MobileBottomNav';
import MobileFAB from './components/MobileFAB/MobileFAB';
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
          <Route path="/" element={<LoginPage />} />
          <Route path="/find-id" element={<FindIdPage />} />
          <Route path="/find-password" element={<FindPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/expenses" element={<ExpenseListPage />} />
          <Route path="/detail/:id" element={<ExpenseDetailPage />} />
          <Route path="/expenses/create" element={<ExpenseCreatePage />} />
          <Route path="/expenses/edit/:id" element={<ExpenseCreatePage />} />
          <Route path="/tax/summary" element={<TaxSummaryPage />} />
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/profile" element={<MyProfilePage />} />
          <Route path="/dashboard" element={<MainDashboardPage />} />
          <Route path="/dashboard/main" element={<MainDashboardPage />} />
          <Route path="/expense-categories" element={<ExpenseCategoryPage />} />
          <Route path="/my-approvers" element={<MyApproverPage />} />
          <Route path="/subscriptions/manage" element={<SubscriptionManagementPage />} />
          <Route path="/subscriptions/plans" element={<SubscriptionManagementPage />} />
          <Route path="/subscriptions/payments" element={<SubscriptionManagementPage />} />
          <Route path="/credits" element={<SubscriptionManagementPage />} />
          <Route path="/monthly-closing" element={<BudgetManagementPage />} />
          <Route path="/budget" element={<BudgetManagementPage />} />
          <Route path="/audit-rules" element={<AuditRuleManagementPage />} />
          <Route path="/audit-logs" element={<AuditRuleManagementPage />} />
          <Route path="/missing-receipts" element={<MissingReceiptPage />} />
          <Route path="/account-codes" element={<ExpenseCategoryPage />} />
          <Route path="/cards" element={<CardManagementPage />} />
          <Route path="/signatures" element={<SignatureManagementPage />} />
          <Route path="/superadmin/dashboard" element={<SuperAdminDashboardPage />} />
        </Routes>
      </Suspense>
      <MobileBottomNav />
      <MobileFAB />
    </BrowserRouter>
  );
}

export default App;