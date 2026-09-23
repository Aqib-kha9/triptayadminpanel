import { useAdmin } from "../context/AdminContext";
import { UserDetailModule } from "../components/modules/UserDetailModule";

export default function UserDetailPage() {
    const { setAudits } = useAdmin();
    return <UserDetailModule setAudits={setAudits} />;
}