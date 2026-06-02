import { useAdmin } from "../context/AdminContext";
import { ActivitiesModule } from "../components/modules/ActivitiesModule";

export default function ActivitiesPage() {
    const { setAudits } = useAdmin();
    return <ActivitiesModule setAudits={setAudits} />;
}