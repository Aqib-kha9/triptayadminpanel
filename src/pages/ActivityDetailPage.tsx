import { useAdmin } from "../context/AdminContext";
import { ActivityDetailModule } from "../components/modules/ActivityDetailModule";

export default function ActivityDetailPage() {
    const { setAudits } = useAdmin();
    return <ActivityDetailModule setAudits={setAudits} />;
}