import { useAdmin } from "../context/AdminContext";
import { DashboardModule } from "../components/modules/DashboardModule";

export default function DashboardPage() {
    const { bookings, applications, users, properties, commissionRate, gstRate, setSelectedKycApp } = useAdmin();
    return (
        <DashboardModule
            bookings={bookings}
            applications={applications}
            users={users}
            properties={properties}
            commissionRate={commissionRate}
            gstRate={gstRate}
            setSelectedKycApp={setSelectedKycApp}
        />
    );
}