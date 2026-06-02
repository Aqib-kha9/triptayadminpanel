import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

// Auth
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Context
import { AdminProvider, useAdmin } from "./context/AdminContext";

// Layout components
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";

// Page components
import AdminLoginPage from "./pages/AdminLoginPage";
import DashboardPage from "./pages/DashboardPage";
import ApprovalsPage from "./pages/ApprovalsPage";
import UsersPage from "./pages/UsersPage";
import UserDetailPage from "./pages/UserDetailPage";
import StaysPage from "./pages/StaysPage";
import StayDetailPage from "./pages/StayDetailPage";
import ActivitiesPage from "./pages/ActivitiesPage";
import ActivityDetailPage from "./pages/ActivityDetailPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import FinancialsPage from "./pages/FinancialsPage";
import DisputesPage from "./pages/DisputesPage";
import ChatsPage from "./pages/ChatsPage";
import CouponsPage from "./pages/CouponsPage";
import AttractionsPage from "./pages/AttractionsPage";
import SettingsPage from "./pages/SettingsPage";
import AuditsPage from "./pages/AuditsPage";

// Modals
import { KycAppModal } from "./components/modals/KycAppModal";
import { PayoutModal } from "./components/modals/PayoutModal";
import { AwardCoinsModal } from "./components/modals/AwardCoinsModal";
import { InvoiceModal } from "./components/modals/InvoiceModal";
import { EditListingModal } from "./components/modals/EditListingModal";
import { EditUserModal } from "./components/modals/EditUserModal";

// ──────────────────── Admin Layout ────────────────────

function AdminLayout() {
  const {
    pendingApprovalsCount,
    pendingDisputesCount,
    unreadChatsCount,
    setAudits,
    selectedKycApp, setSelectedKycApp, handleApprove, handleReject,
    payoutVendor, setPayoutVendor, payoutReceipt, setPayoutReceipt,
    executeManualPayout, closePayoutReceipt,
    selectedUserForCoins, setSelectedUserForCoins,
    awardAmount, setAwardAmount, awardReason, setAwardReason, handleAwardCoins,
    selectedInvoiceBooking, setSelectedInvoiceBooking,
    commissionRate, gstRate,
    selectedPropertyForEdit, setSelectedPropertyForEdit, handleSaveListing,
    selectedUserForEdit, setSelectedUserForEdit, handleSaveUser,
  } = useAdmin();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden font-sans">
      {/* ================= SIDEBAR NAVIGATION ================= */}
      <Sidebar
        pendingApprovalsCount={pendingApprovalsCount}
        pendingDisputesCount={pendingDisputesCount}
        unreadChatsCount={unreadChatsCount}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ================= MAIN CONTAINER SYSTEM ================= */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Operations Header */}
        <Header
          setAudits={setAudits}
          onMenuToggle={() => setSidebarOpen(prev => !prev)}
        />

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/approvals" element={<ApprovalsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/:userId" element={<UserDetailPage />} />
            <Route path="/stays/:listingId" element={<StayDetailPage />} />
            <Route path="/stays" element={<StaysPage />} />
            <Route path="/activities/:activityId" element={<ActivityDetailPage />} />
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/testimonials" element={<TestimonialsPage />} />
            <Route path="/financials" element={<FinancialsPage />} />
            <Route path="/disputes" element={<DisputesPage />} />
            <Route path="/chats" element={<ChatsPage />} />
            <Route path="/coupons" element={<CouponsPage />} />
            <Route path="/attractions" element={<AttractionsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/audits" element={<AuditsPage />} />
          </Routes>
        </div>
      </main>

      {/* ================= MODAL LAYERS ================= */}
      <KycAppModal
        selectedKycApp={selectedKycApp}
        setSelectedKycApp={setSelectedKycApp}
        handleApprove={handleApprove}
        handleReject={handleReject}
      />
      <PayoutModal
        payoutVendor={payoutVendor}
        setPayoutVendor={setPayoutVendor}
        payoutReceipt={payoutReceipt}
        setPayoutReceipt={setPayoutReceipt}
        executeManualPayout={executeManualPayout}
        closePayoutReceipt={closePayoutReceipt}
      />
      <AwardCoinsModal
        selectedUserForCoins={selectedUserForCoins}
        setSelectedUserForCoins={setSelectedUserForCoins}
        awardAmount={awardAmount}
        setAwardAmount={setAwardAmount}
        awardReason={awardReason}
        setAwardReason={setAwardReason}
        handleAwardCoins={handleAwardCoins}
      />
      <InvoiceModal
        booking={selectedInvoiceBooking}
        onClose={() => setSelectedInvoiceBooking(null)}
        commissionRate={commissionRate}
        gstRate={gstRate}
      />
      <EditListingModal
        property={selectedPropertyForEdit}
        onClose={() => setSelectedPropertyForEdit(null)}
        onSave={handleSaveListing}
      />
      <EditUserModal
        user={selectedUserForEdit}
        onClose={() => setSelectedUserForEdit(null)}
        onSave={handleSaveUser}
      />
    </div>
  );
}

// ──────────────────── App Root ────────────────────

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public: Admin Login */}
        <Route path="/login" element={<AdminLoginPage />} />

        {/* Protected: All admin panels */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/*"
            element={
              <AdminProvider>
                <AdminLayout />
              </AdminProvider>
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
