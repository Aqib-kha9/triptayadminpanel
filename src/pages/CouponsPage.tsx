import { useAdmin } from "../context/AdminContext";
import { CouponsModule } from "../components/modules/CouponsModule";

export default function CouponsPage() {
    const {
        coupons, campaigns,
        newCouponCode, setNewCouponCode, newCouponDiscount, setNewCouponDiscount,
        newCouponType, setNewCouponType, newCouponTarget, setNewCouponTarget,
        handleCreateCoupon,
        newCampTitle, setNewCampTitle, newCampGroup, setNewCampGroup,
        newCampChannel, setNewCampChannel, handleLaunchCampaign
    } = useAdmin();
    return (
        <CouponsModule
            coupons={coupons}
            campaigns={campaigns}
            newCouponCode={newCouponCode}
            setNewCouponCode={setNewCouponCode}
            newCouponDiscount={newCouponDiscount}
            setNewCouponDiscount={setNewCouponDiscount}
            newCouponType={newCouponType}
            setNewCouponType={setNewCouponType}
            newCouponTarget={newCouponTarget}
            setNewCouponTarget={setNewCouponTarget}
            handleCreateCoupon={handleCreateCoupon}
            newCampTitle={newCampTitle}
            setNewCampTitle={setNewCampTitle}
            newCampGroup={newCampGroup}
            setNewCampGroup={setNewCampGroup}
            newCampChannel={newCampChannel}
            setNewCampChannel={setNewCampChannel}
            handleLaunchCampaign={handleLaunchCampaign}
        />
    );
}