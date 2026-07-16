import { useAdmin } from "../context/AdminContext";
import { ListingsModule } from "../components/modules/ListingsModule";

export default function ListingsPage() {
    const {
        properties, setProperties, setAudits,
        categoryFilter, setCategoryFilter, setSelectedPropertyForEdit,
        toggleListingStatus
    } = useAdmin();
    return (
        <ListingsModule
            properties={properties}
            setProperties={setProperties}
            setAudits={setAudits}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            setSelectedPropertyForEdit={setSelectedPropertyForEdit}
            toggleListingStatus={toggleListingStatus}
        />
    );
}