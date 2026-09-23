import { useAdmin } from "../context/AdminContext";
import { StaysModule } from "../components/modules/StaysModule";

export default function StaysPage() {
    const { setAudits } = useAdmin();
    return <StaysModule setAudits={setAudits} />;
}