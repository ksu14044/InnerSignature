import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ExpenseListPage from './pages/ExpenseListPage/ExpenseListPage';
import ExpenseDetailPage from './pages/ExpenseDetailPage/ExpenseDetailPage';
import LoginPage from './pages/LoginPage/LoginPage';
import ExpenseCreatePage from './pages/ExpenseCreatePage/ExpenseCreatePage';
import TaxSummaryPage from './pages/TaxSummaryPage/TaxSummaryPage';
import UserManagementPage from './pages/UserManagementPage/UserManagementPage';
import MyProfilePage from './pages/MyProfilePage/MyProfilePage';
import FindIdPage from './pages/FindIdPage/FindIdPage';
import FindPasswordPage from './pages/FindPasswordPage/FindPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage/ResetPasswordPage';
import SubscriptionManagementPage from './pages/SubscriptionManagementPage/SubscriptionManagementPage';
import SuperAdminDashboardPage from './pages/SuperAdminDashboardPage/SuperAdminDashboardPage';
import MonthlyClosingPage from './pages/MonthlyClosingPage/MonthlyClosingPage';
import BudgetManagementPage from './pages/BudgetManagementPage/BudgetManagementPage';
import AuditRuleManagementPage from './pages/AuditRuleManagementPage/AuditRuleManagementPage';
import AuditLogPage from './pages/AuditLogPage/AuditLogPage';
import MissingReceiptPage from './pages/MissingReceiptPage/MissingReceiptPage';
import AccountCodeMappingPage from './pages/AccountCodeMappingPage/AccountCodeMappingPage';
import MainDashboardPage from './pages/MainDashboardPage/MainDashboardPage';
import ExpenseCategoryPage from './pages/ExpenseCategoryPage/ExpenseCategoryPage';
import MyApproverPage from './pages/MyApproverPage/MyApproverPage';
import CardManagementPage from './pages/CardManagementPage/CardManagementPage';
import SignatureManagementPage from './pages/SignatureManagementPage/SignatureManagementPage';
import MobileAppBar from './components/MobileAppBar/MobileAppBar';
import MobileBottomNav from './components/MobileBottomNav/MobileBottomNav';
import MobileFAB from './components/MobileFAB/MobileFAB';
import { TourProvider } from './contexts/TourContext';

function App() {
  return (
    <BrowserRouter>
      <TourProvider>
        <MobileAppBar />
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
        <MobileBottomNav />
        <MobileFAB />
      </TourProvider>
    </BrowserRouter>
  );
}

export default App;