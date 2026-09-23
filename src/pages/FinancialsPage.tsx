import { useAdmin } from "../context/AdminContext";
import { FinancialsModule } from "../components/modules/FinancialsModule";

export default function FinancialsPage() {
    const {
        bookings, commissionRate, setCommissionRate, gstRate, setGstRate,
        triggerPayoutModal, handleCancelAndRefundBooking, setSelectedInvoiceBooking,
        commissionSummary, hostBreakdown, payouts, financialsLoading
    } = useAdmin();
    return (
        <FinancialsModule
            bookings={bookings}
            commissionRate={commissionRate}
            setCommissionRate={setCommissionRate}
            gstRate={gstRate}
            setGstRate={setGstRate}
            triggerPayoutModal={triggerPayoutModal}
            handleCancelAndRefundBooking={handleCancelAndRefundBooking}
            setSelectedInvoiceBooking={setSelectedInvoiceBooking}
            commissionSummary={commissionSummary}
            hostBreakdown={hostBreakdown}
            payouts={payouts}
            financialsLoading={financialsLoading}
        />
    );
}