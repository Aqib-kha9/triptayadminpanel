import { useAdmin } from "../context/AdminContext";
import { SettingsModule } from "../components/modules/SettingsModule";

export default function SettingsPage() {
    const {
        commissionRate, setCommissionRate, gstRate, setGstRate,
        autoPayoutEnabled, setAutoPayoutEnabled, rateLimit, setRateLimit,
        ipBlocklist, setIpBlocklist
    } = useAdmin();
    return (
        <SettingsModule
            commissionRate={commissionRate}
            setCommissionRate={setCommissionRate}
            gstRate={gstRate}
            setGstRate={setGstRate}
            autoPayoutEnabled={autoPayoutEnabled}
            setAutoPayoutEnabled={setAutoPayoutEnabled}
            rateLimit={rateLimit}
            setRateLimit={setRateLimit}
            ipBlocklist={ipBlocklist}
            setIpBlocklist={setIpBlocklist}
        />
    );
}