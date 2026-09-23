import { useAdmin } from "../context/AdminContext";
import { CouponsModule } from "../components/modules/CouponsModule";

export default function CouponsPage() {
    const {
        coupons, properties, activities,
        newCouponCode, setNewCouponCode, newCouponDiscount, setNewCouponDiscount,
        newCouponType, setNewCouponType, newCouponTarget, setNewCouponTarget,
        newCouponExpiry, setNewCouponExpiry, newCouponMinOrder, setNewCouponMinOrder,
        newCouponLimit, setNewCouponLimit,
        handleCreateCoupon, handleDeleteCoupon
    } = useAdmin();

    return (
        <CouponsModule
            coupons={coupons}
            properties={properties}
            activities={activities}
            newCouponCode={newCouponCode}
            setNewCouponCode={setNewCouponCode}
            newCouponDiscount={newCouponDiscount}
            setNewCouponDiscount={setNewCouponDiscount}
            newCouponType={newCouponType}
            setNewCouponType={setNewCouponType}
            newCouponTarget={newCouponTarget}
            setNewCouponTarget={setNewCouponTarget}
            newCouponExpiry={newCouponExpiry}
            setNewCouponExpiry={setNewCouponExpiry}
            newCouponMinOrder={newCouponMinOrder}
            setNewCouponMinOrder={setNewCouponMinOrder}
            newCouponLimit={newCouponLimit}
            setNewCouponLimit={setNewCouponLimit}
            handleCreateCoupon={handleCreateCoupon}
            handleDeleteCoupon={handleDeleteCoupon}
        />
    );
}