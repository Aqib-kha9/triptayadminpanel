import { useAdmin } from "../context/AdminContext";
import { DisputesModule } from "../components/modules/DisputesModule";

export default function DisputesPage() {
    const { disputes, handleRefundDispute: onRefund, handleReleaseDispute: onRelease, handleBlockHost: onBlockHost } = useAdmin();
    return (
        <DisputesModule
            disputes={disputes}
            onRefund={onRefund}
            onRelease={onRelease}
            onBlockHost={onBlockHost}
        />
    );
}