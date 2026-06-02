import { useAdmin } from "../context/AdminContext";
import { UsersModule } from "../components/modules/UsersModule";

export default function UsersPage() {
    const { setAudits } = useAdmin();
    return <UsersModule setAudits={setAudits} />;
}