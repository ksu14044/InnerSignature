import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ExpenseListPage from './pages/ExpenseListPage/ExpenseListPage';
import ExpenseDetailPage from './pages/ExpenseDetailPage/ExpenseDetailPage';
import LoginPage from './pages/LoginPage/LoginPage';
import ExpenseCreatePage from './pages/ExpenseCreatePage/ExpenseCreatePage';
import TaxSummaryPage from './pages/TaxSummaryPage/TaxSummaryPage';
import UserManagementPage from './pages/UserManagementPage/UserManagementPage';
import MyProfilePage from './pages/MyProfilePage/MyProfilePage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import FindIdPage from './pages/FindIdPage/FindIdPage';
import FindPasswordPage from './pages/FindPasswordPage/FindPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage/ResetPasswordPage';
import SubscriptionManagementPage from './pages/SubscriptionManagementPage/SubscriptionManagementPage';
import PlanSelectionPage from './pages/PlanSelectionPage/PlanSelectionPage';
import PaymentHistoryPage from './pages/PaymentHistoryPage/PaymentHistoryPage';
import SuperAdminDashboardPage from './pages/SuperAdminDashboardPage/SuperAdminDashboardPage';
import MobileAppBar from './components/MobileAppBar/MobileAppBar';
import MobileBottomNav from './components/MobileBottomNav/MobileBottomNav';
import MobileFAB from './components/MobileFAB/MobileFAB';

function App() {
  return (
    <BrowserRouter>
      <MobileAppBar />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/find-id" element={<FindIdPage />} />
        <Route path="/find-password" element={<FindPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/expenses" element={<ExpenseListPage />} />
        <Route path="/detail/:id" element={<ExpenseDetailPage />} />
        <Route path="/expenses/create" element={<ExpenseCreatePage />} />
        <Route path="/tax/summary" element={<TaxSummaryPage />} />
        <Route path="/users" element={<UserManagementPage />} />
        <Route path="/profile" element={<MyProfilePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/subscriptions/manage" element={<SubscriptionManagementPage />} />
        <Route path="/subscriptions/plans" element={<PlanSelectionPage />} />
        <Route path="/subscriptions/payments" element={<PaymentHistoryPage />} />
        <Route path="/superadmin/dashboard" element={<SuperAdminDashboardPage />} />
      </Routes>
      <MobileBottomNav />
      <MobileFAB />
    </BrowserRouter>
  );
}

export default App;