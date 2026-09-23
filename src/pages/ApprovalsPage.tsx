import { useAdmin } from "../context/AdminContext";
import { ApprovalsModule } from "../components/modules/ApprovalsModule";

export default function ApprovalsPage() {
    const {
        applications,
        setSelectedKycApp,
        searchTerm,
        setSearchTerm,
        kycLoading,
        kycError,
        kycFilter,
        setKycFilter,
        refreshKycApplications,
    } = useAdmin();

    return (
        <ApprovalsModule
            applications={applications}
            setSelectedKycApp={setSelectedKycApp}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            kycLoading={kycLoading}
            kycError={kycError}
            kycFilter={kycFilter}
            setKycFilter={setKycFilter}
            refreshKycApplications={refreshKycApplications}
        />
    );
}