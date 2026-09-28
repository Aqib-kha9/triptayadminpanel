import { useAdmin } from "../context/AdminContext";
import { SettingsModule } from "../components/modules/SettingsModule";

export default function SettingsPage() {
    const {
        isPayAtPropertyEnabled, setIsPayAtPropertyEnabled,
        commissionRate, setCommissionRate, gstRate, setGstRate,
        gstLuxuryRate, setGstLuxuryRate, gstLuxuryThreshold, setGstLuxuryThreshold,
        tcsRate, setTcsRate, tdsRate, setTdsRate, platformGstRate, setPlatformGstRate,
        platformFeeRate, setPlatformFeeRate, payoutMinThreshold, setPayoutMinThreshold,
        autoPayoutEnabled, setAutoPayoutEnabled, rateLimit, setRateLimit,
        rateLimitAuthMax, setRateLimitAuthMax, bookingExpiryMinutes, setBookingExpiryMinutes,
        maintenanceMode, setMaintenanceMode,
        whatsappNotificationsEnabled, setWhatsappNotificationsEnabled, mfaEnforced, setMfaEnforced,
        globalSiteTitle, setGlobalSiteTitle, globalMetaDescription, setGlobalMetaDescription,
        ipBlocklist, setIpBlocklist,
        cancellationDefaultPolicy, setCancellationDefaultPolicy,
        cancellationVendorOverrideEnabled, setCancellationVendorOverrideEnabled,
        cancellationFlexibleFullRefundHours, setCancellationFlexibleFullRefundHours,
        cancellationModerateFullRefundHours, setCancellationModerateFullRefundHours,
        cancellationModeratePartialRefundHours, setCancellationModeratePartialRefundHours,
        cancellationStrictPartialRefundHours, setCancellationStrictPartialRefundHours,
        gatewaySettings, gatewaySettingsLoading, saveGatewaySetting,
        testGateway, gatewayTestResult, gatewayTesting,
    } = useAdmin();
    return (
        <SettingsModule
            isPayAtPropertyEnabled={isPayAtPropertyEnabled}
            setIsPayAtPropertyEnabled={setIsPayAtPropertyEnabled}
            commissionRate={commissionRate}
            setCommissionRate={setCommissionRate}
            gstRate={gstRate}
            setGstRate={setGstRate}
            gstLuxuryRate={gstLuxuryRate}
            setGstLuxuryRate={setGstLuxuryRate}
            gstLuxuryThreshold={gstLuxuryThreshold}
            setGstLuxuryThreshold={setGstLuxuryThreshold}
            tcsRate={tcsRate}
            setTcsRate={setTcsRate}
            tdsRate={tdsRate}
            setTdsRate={setTdsRate}
            platformGstRate={platformGstRate}
            setPlatformGstRate={setPlatformGstRate}
            platformFeeRate={platformFeeRate}
            setPlatformFeeRate={setPlatformFeeRate}
            payoutMinThreshold={payoutMinThreshold}
            setPayoutMinThreshold={setPayoutMinThreshold}
            autoPayoutEnabled={autoPayoutEnabled}
            setAutoPayoutEnabled={setAutoPayoutEnabled}
            rateLimit={rateLimit}
            setRateLimit={setRateLimit}
            rateLimitAuthMax={rateLimitAuthMax}
            setRateLimitAuthMax={setRateLimitAuthMax}
            bookingExpiryMinutes={bookingExpiryMinutes}
            setBookingExpiryMinutes={setBookingExpiryMinutes}
            maintenanceMode={maintenanceMode}
            setMaintenanceMode={setMaintenanceMode}
            whatsappNotificationsEnabled={whatsappNotificationsEnabled}
            setWhatsappNotificationsEnabled={setWhatsappNotificationsEnabled}
            mfaEnforced={mfaEnforced}
            setMfaEnforced={setMfaEnforced}
            globalSiteTitle={globalSiteTitle}
            setGlobalSiteTitle={setGlobalSiteTitle}
            globalMetaDescription={globalMetaDescription}
            setGlobalMetaDescription={setGlobalMetaDescription}
            ipBlocklist={ipBlocklist}
            setIpBlocklist={setIpBlocklist}
            cancellationDefaultPolicy={cancellationDefaultPolicy}
            setCancellationDefaultPolicy={setCancellationDefaultPolicy}
            cancellationVendorOverrideEnabled={cancellationVendorOverrideEnabled}
            setCancellationVendorOverrideEnabled={setCancellationVendorOverrideEnabled}
            cancellationFlexibleFullRefundHours={cancellationFlexibleFullRefundHours}
            setCancellationFlexibleFullRefundHours={setCancellationFlexibleFullRefundHours}
            cancellationModerateFullRefundHours={cancellationModerateFullRefundHours}
            setCancellationModerateFullRefundHours={setCancellationModerateFullRefundHours}
            cancellationModeratePartialRefundHours={cancellationModeratePartialRefundHours}
            setCancellationModeratePartialRefundHours={setCancellationModeratePartialRefundHours}
            cancellationStrictPartialRefundHours={cancellationStrictPartialRefundHours}
            setCancellationStrictPartialRefundHours={setCancellationStrictPartialRefundHours}
            gatewaySettings={gatewaySettings}
            gatewaySettingsLoading={gatewaySettingsLoading}
            saveGatewaySetting={saveGatewaySetting}
            testGateway={testGateway}
            gatewayTestResult={gatewayTestResult}
            gatewayTesting={gatewayTesting}
        />
    );
}