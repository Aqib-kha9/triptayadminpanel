import { useAdmin } from "../context/AdminContext";
import { AttractionsModule } from "../components/modules/AttractionsModule";

export default function AttractionsPage() {
    const { setAudits } = useAdmin();
    return <AttractionsModule setAudits={setAudits} />;
}