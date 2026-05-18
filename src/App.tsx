import { useState } from "react";
import type {
  PlatformUser,
  HostApplication,
  Property,
  SystemBooking,
  Coupon,
  Campaign,
  TouristAttraction,
  AuditLog
} from "./types";
import {
  INITIAL_USERS,
  INITIAL_APPLICATIONS,
  INITIAL_PROPERTIES,
  INITIAL_BOOKINGS,
  INITIAL_COUPONS,
  INITIAL_CAMPAIGNS,
  INITIAL_ATTRACTIONS,
  INITIAL_AUDITS
} from "./data/mockData";

// Layout components
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";

// Module tabs
import { DashboardModule } from "./components/modules/DashboardModule";
import { UsersModule } from "./components/modules/UsersModule";
import { ApprovalsModule } from "./components/modules/ApprovalsModule";
import { ListingsModule } from "./components/modules/ListingsModule";
import { FinancialsModule } from "./components/modules/FinancialsModule";
import { CouponsModule } from "./components/modules/CouponsModule";
import { AttractionsModule } from "./components/modules/AttractionsModule";
import { AuditsModule } from "./components/modules/AuditsModule";

// Modals
import { KycAppModal } from "./components/modals/KycAppModal";
import { PayoutModal } from "./components/modals/PayoutModal";
import { AwardCoinsModal } from "./components/modals/AwardCoinsModal";

export default function App() {
  // Tabs Setup
  const [activeTab, setActiveTab] = useState<"dashboard" | "approvals" | "listings" | "financials" | "coupons" | "attractions" | "audits" | "users">("dashboard");
  
  // Data States
  const [users, setUsers] = useState<PlatformUser[]>(INITIAL_USERS);
  const [selectedUserForCoins, setSelectedUserForCoins] = useState<PlatformUser | null>(null);
  const [awardAmount, setAwardAmount] = useState(500);
  const [awardReason, setAwardReason] = useState("Sign-up Promotional Credit");

  const [applications, setApplications] = useState<HostApplication[]>(INITIAL_APPLICATIONS);
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [bookings, setBookings] = useState<SystemBooking[]>(INITIAL_BOOKINGS);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [attractions, setAttractions] = useState<TouristAttraction[]>(INITIAL_ATTRACTIONS);
  const [audits, setAudits] = useState<AuditLog[]>(INITIAL_AUDITS);

  // Financial Policy Configurations (GST and Platform commission rate splits)
  const [commissionRate, setCommissionRate] = useState(15); // 15% Platform fee
  const [gstRate, setGstRate] = useState(5); // 5% GST

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Interactive Modals Setup
  const [selectedKycApp, setSelectedKycApp] = useState<HostApplication | null>(null);
  const [payoutVendor, setPayoutVendor] = useState<{ name: string; balance: number } | null>(null);
  const [payoutReceipt, setPayoutReceipt] = useState<string | null>(null);

  // Attraction Form State
  const [newAttractionName, setNewAttractionName] = useState("");
  const [newAttractionLoc, setNewAttractionLoc] = useState("");
  const [newAttractionCoords, setNewAttractionCoords] = useState("");
  const [newAttractionCat, setNewAttractionCat] = useState<"Nature" | "Adventure" | "Historical" | "Spiritual">("Nature");

  // Coupon Creator Form State
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState(10);
  const [newCouponType, setNewCouponType] = useState<"Global" | "Stay-Specific" | "Activity-Specific">("Global");
  const [newCouponTarget, setNewCouponTarget] = useState("");

  // Campaign Dispatcher Form State
  const [newCampTitle, setNewCampTitle] = useState("");
  const [newCampGroup, setNewCampGroup] = useState<"Guests" | "Vendors" | "All Users">("Guests");
  const [newCampChannel, setNewCampChannel] = useState<"AWS SES Email" | "Twilio WhatsApp" | "Firebase Push">("AWS SES Email");

  // ----------------------------------------------------
  // EVENT HANDLERS
  // ----------------------------------------------------

  // Approve Host and trigger Property Listing generation
  const handleApprove = (appId: string) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;

    // Mutate Applications status
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: "Approved" } : a));

    // Generate property entry
    const newProperty: Property = {
      id: `PROP-${Math.floor(Math.random() * 900) + 100}`,
      title: app.property,
      hostName: app.name,
      location: app.location,
      type: app.type,
      category: app.category || "General",
      price: app.priceExpected,
      rating: "5.0",
      status: "Active"
    };
    setProperties(prev => [newProperty, ...prev]);

    // Push into AWS SQS Audit queue and logs
    setAudits(logs => [
      {
        id: `AUD-${Math.floor(Math.random() * 900) + 100}`,
        timestamp: new Date().toLocaleTimeString(),
        type: "System",
        event: `Host Approval Succeeded. Generated Listing "${newProperty.title}" under ID ${newProperty.id}.`,
        status: "Success"
      },
      {
        id: `AUD-${Math.floor(Math.random() * 900) + 100}`,
        timestamp: new Date().toLocaleTimeString(),
        type: "SQS Queue",
        event: `AWS SQS Job: Host onboard confirmation email queued successfully for ${app.email}.`,
        status: "Success"
      },
      ...logs
    ]);

    setSelectedKycApp(null);
  };

  // Reject Host and trigger audit
  const handleReject = (appId: string) => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: "Rejected" } : a));

    setAudits(logs => [{
      id: `AUD-${Math.floor(Math.random() * 900) + 100}`,
      timestamp: new Date().toLocaleTimeString(),
      type: "Security",
      event: `Host onboard KYC rejected for application ID: ${appId}. Checked gstin failures.`,
      status: "Failed"
    }, ...logs]);

    setSelectedKycApp(null);
  };

  // Generate Coupon Promo Code
  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;

    const newCpn: Coupon = {
      id: `CPN-${Math.floor(Math.random() * 90) + 10}`,
      code: newCouponCode.toUpperCase(),
      discountPercent: newCouponDiscount,
      type: newCouponType,
      targetName: newCouponTarget || "All Stays & Experiences",
      expiryDate: "30 September, 2026",
      status: "Active"
    };
    setCoupons(prev => [newCpn, ...prev]);

    setAudits(logs => [{
      id: `AUD-${Math.floor(Math.random() * 900) + 100}`,
      timestamp: new Date().toLocaleTimeString(),
      type: "System",
      event: `Global Promo Coupon "${newCpn.code}" (${newCouponDiscount}%) generated successfully.`,
      status: "Success"
    }, ...logs]);

    setNewCouponCode("");
    setNewCouponTarget("");
  };

  // Dispatch Campaign Event via AWS SQS queue
  const handleLaunchCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampTitle) return;
    const count = newCampGroup === "Guests" ? 850 : newCampGroup === "Vendors" ? 40 : 890;
    const newCamp: Campaign = {
      id: `CMP-${Math.floor(Math.random() * 900) + 100}`,
      title: newCampTitle,
      targetGroup: newCampGroup,
      channel: newCampChannel,
      scheduledTime: "Immediate Dispatch",
      status: "Sent",
      analytics: { sent: count, opens: Math.round(count * 0.45), clicks: Math.round(count * 0.12) }
    };
    setCampaigns(prev => [newCamp, ...prev]);

    // Push into AWS SQS Queue and Log
    setAudits(logs => [
      {
        id: `AUD-${Math.floor(Math.random() * 900) + 100}`,
        timestamp: new Date().toLocaleTimeString(),
        type: "SQS Queue",
        event: `AWS SQS: Initialized Campaign Queue job ${newCamp.id} (${newCampChannel}). Dispatching to ${count} targets.`,
        status: "Success"
      },
      ...logs
    ]);

    setNewCampTitle("");
  };

  // Add Attraction Trigger
  const handleAddAttraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttractionName || !newAttractionLoc) return;
    const newAttr: TouristAttraction = {
      id: `ATR-${Math.floor(Math.random() * 90) + 10}`,
      name: newAttractionName,
      location: newAttractionLoc,
      coordinates: newAttractionCoords || "32.2210° N, 77.0123° E",
      nearbyStaysCount: Math.floor(Math.random() * 12) + 2,
      category: newAttractionCat
    };
    setAttractions(prev => [newAttr, ...prev]);
    
    // Log audit
    setAudits(logs => [{
      id: `AUD-${Math.floor(Math.random() * 900) + 100}`,
      timestamp: new Date().toLocaleTimeString(),
      type: "System",
      event: `Tourist hotspot CMS entry added: "${newAttr.name}" in ${newAttr.location}.`,
      status: "Success"
    }, ...logs]);

    setNewAttractionName("");
    setNewAttractionLoc("");
    setNewAttractionCoords("");
  };

  // Process manual payout calculations
  const triggerPayoutModal = (vendorName: string, balance: number) => {
    setPayoutVendor({ name: vendorName, balance });
  };

  const executeManualPayout = () => {
    if (!payoutVendor) return;
    const receiptNum = `PAY-RC-${Math.floor(Math.random() * 90000) + 10000}`;
    setPayoutReceipt(receiptNum);
    
    // Log the transaction settlement in our platform audits
    setAudits(logs => [{
      id: `AUD-${Math.floor(Math.random() * 900) + 100}`,
      timestamp: new Date().toLocaleTimeString(),
      type: "System",
      event: `Settled manual payout receipt ${receiptNum} to Host ${payoutVendor.name} totaling ₹${payoutVendor.balance.toLocaleString()}.`,
      status: "Success"
    }, ...logs]);
  };

  const closePayoutReceipt = () => {
    setPayoutVendor(null);
    setPayoutReceipt(null);
  };

  // Toggle User Active / Block Status
  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === "Active" ? "Blocked" : "Active";
        const log: AuditLog = {
          id: `AUD-${Math.floor(Math.random() * 900) + 100}`,
          timestamp: new Date().toLocaleTimeString(),
          type: "Security",
          event: `User ${userId} (${u.name}) has been ${nextStatus.toUpperCase()} by Administrator.`,
          status: "Success"
        };
        setAudits(logs => [log, ...logs]);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  // Award Coins to Wallet Credit
  const handleAwardCoins = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForCoins) return;
    setUsers(prev => prev.map(u => {
      if (u.id === selectedUserForCoins.id) {
        const newBalance = u.walletBalance + awardAmount;
        
        // Log system transaction split
        const log: AuditLog = {
          id: `AUD-${Math.floor(Math.random() * 900) + 100}`,
          timestamp: new Date().toLocaleTimeString(),
          type: "System",
          event: `Awarded ₹${awardAmount.toLocaleString()} Loyalty Coins to user ${u.name} (Reason: ${awardReason}).`,
          status: "Success"
        };

        // Queue notification
        const queueLog: AuditLog = {
          id: `AUD-${Math.floor(Math.random() * 900) + 100}`,
          timestamp: new Date().toLocaleTimeString(),
          type: "SQS Queue",
          event: `AWS SQS: Wallet credit notification email task triggered successfully for ${u.email}.`,
          status: "Success"
        };
        
        setAudits(logs => [log, queueLog, ...logs]);
        return { ...u, walletBalance: newBalance };
      }
      return u;
    }));
    setSelectedUserForCoins(null);
    setAwardAmount(500);
    setAwardReason("Sign-up Promotional Credit");
  };

  // Cancel booking and refund entire amount to Guest wallet balance
  const handleCancelAndRefundBooking = (bookingId: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        if (b.status === "Cancelled") return b;
        
        // Find user to refund
        setUsers(allUsers => allUsers.map(u => {
          if (u.name.toLowerCase() === b.guestName.toLowerCase()) {
            const nextBalance = u.walletBalance + b.amount;
            
            // Log security audit trace
            const refundLog: AuditLog = {
              id: `AUD-${Math.floor(Math.random() * 900) + 100}`,
              timestamp: new Date().toLocaleTimeString(),
              type: "System",
              event: `Cancelled booking ${bookingId} and refunded ₹${b.amount.toLocaleString()} to User ${u.name}'s Triptay Wallet.`,
              status: "Success"
            };

            const sqsLog: AuditLog = {
              id: `AUD-${Math.floor(Math.random() * 900) + 100}`,
              timestamp: new Date().toLocaleTimeString(),
              type: "SQS Queue",
              event: `AWS SQS Job: Dispatched automated refund email confirmation to guest ${u.email}.`,
              status: "Success"
            };
            
            setAudits(logs => [refundLog, sqsLog, ...logs]);
            return { ...u, walletBalance: nextBalance };
          }
          return u;
        }));

        return { ...b, status: "Cancelled" };
      }
      return b;
    }));
  };

  const pendingApprovalsCount = applications.filter(app => app.status === "Pending").length;

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden font-sans">
      
      {/* ================= SIDEBAR NAVIGATION ================= */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSearchTerm(""); // reset filters on tab change
        }}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* ================= MAIN CONTAINER SYSTEM ================= */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Operations Header */}
        <Header activeTab={activeTab} setAudits={setAudits} />

        {/* Tab Modules Wrapper */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {activeTab === "dashboard" && (
            <DashboardModule 
              bookings={bookings}
              applications={applications}
              users={users}
              properties={properties}
              commissionRate={commissionRate}
              gstRate={gstRate}
              setSelectedKycApp={setSelectedKycApp}
            />
          )}

          {activeTab === "approvals" && (
            <ApprovalsModule 
              applications={applications}
              setSelectedKycApp={setSelectedKycApp}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          )}

          {activeTab === "users" && (
            <UsersModule 
              users={users}
              toggleUserStatus={toggleUserStatus}
              setSelectedUserForCoins={setSelectedUserForCoins}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          )}

          {activeTab === "listings" && (
            <ListingsModule 
              properties={properties}
              setProperties={setProperties}
              setAudits={setAudits}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
            />
          )}

          {activeTab === "financials" && (
            <FinancialsModule 
              bookings={bookings}
              commissionRate={commissionRate}
              setCommissionRate={setCommissionRate}
              gstRate={gstRate}
              setGstRate={setGstRate}
              triggerPayoutModal={triggerPayoutModal}
              handleCancelAndRefundBooking={handleCancelAndRefundBooking}
            />
          )}

          {activeTab === "coupons" && (
            <CouponsModule 
              coupons={coupons}
              campaigns={campaigns}
              newCouponCode={newCouponCode}
              setNewCouponCode={setNewCouponCode}
              newCouponDiscount={newCouponDiscount}
              setNewCouponDiscount={setNewCouponDiscount}
              newCouponType={newCouponType}
              setNewCouponType={setNewCouponType}
              newCouponTarget={newCouponTarget}
              setNewCouponTarget={setNewCouponTarget}
              handleCreateCoupon={handleCreateCoupon}
              newCampTitle={newCampTitle}
              setNewCampTitle={setNewCampTitle}
              newCampGroup={newCampGroup}
              setNewCampGroup={setNewCampGroup}
              newCampChannel={newCampChannel}
              setNewCampChannel={setNewCampChannel}
              handleLaunchCampaign={handleLaunchCampaign}
            />
          )}

          {activeTab === "attractions" && (
            <AttractionsModule 
              attractions={attractions}
              newAttractionName={newAttractionName}
              setNewAttractionName={setNewAttractionName}
              newAttractionLoc={newAttractionLoc}
              setNewAttractionLoc={setNewAttractionLoc}
              newAttractionCoords={newAttractionCoords}
              setNewAttractionCoords={setNewAttractionCoords}
              newAttractionCat={newAttractionCat}
              setNewAttractionCat={setNewAttractionCat}
              handleAddAttraction={handleAddAttraction}
            />
          )}

          {activeTab === "audits" && (
            <AuditsModule 
              audits={audits}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          )}

        </div>
      </main>

      {/* ================= MODAL LAYERS ================= */}
      
      {/* 1. HOST APPLICATION KYC DETAILS REVIEW DRAWER */}
      <KycAppModal 
        selectedKycApp={selectedKycApp}
        setSelectedKycApp={setSelectedKycApp}
        handleApprove={handleApprove}
        handleReject={handleReject}
      />

      {/* 2. MANUAL PAYOUT SETTLEMENT MODAL & RECEIPT SUMMARY */}
      <PayoutModal 
        payoutVendor={payoutVendor}
        setPayoutVendor={setPayoutVendor}
        payoutReceipt={payoutReceipt}
        setPayoutReceipt={setPayoutReceipt}
        executeManualPayout={executeManualPayout}
        closePayoutReceipt={closePayoutReceipt}
      />

      {/* 3. AWARD WALLET COINS MODAL */}
      <AwardCoinsModal 
        selectedUserForCoins={selectedUserForCoins}
        setSelectedUserForCoins={setSelectedUserForCoins}
        awardAmount={awardAmount}
        setAwardAmount={setAwardAmount}
        awardReason={awardReason}
        setAwardReason={setAwardReason}
        handleAwardCoins={handleAwardCoins}
      />

    </div>
  );
}
