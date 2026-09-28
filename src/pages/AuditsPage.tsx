import { useAdmin } from "../context/AdminContext";
import { AuditsModule } from "../components/modules/AuditsModule";

export default function AuditsPage() {
    const { audits, searchTerm, setSearchTerm } = useAdmin();
    return (
        <AuditsModule
            audits={audits}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
        />
    );
}