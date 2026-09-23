import { useAdmin } from "../context/AdminContext";
import { AuditsModule } from "../components/modules/AuditsModule";

export default function AuditsPage() {
    const { audits, searchTerm, setSearchTerm, handleSimulateLog: onSimulateLog } = useAdmin();
    return (
        <AuditsModule
            audits={audits}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSimulateLog={onSimulateLog}
        />
    );
}