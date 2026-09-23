import { useAdmin } from "../context/AdminContext";
import { StayDetailModule } from "../components/modules/StayDetailModule";

export default function StayDetailPage() {
    const { setAudits } = useAdmin();
    return <StayDetailModule setAudits={setAudits} />;
}