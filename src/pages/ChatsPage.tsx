import { useAdmin } from "../context/AdminContext";
import { ChatsModule } from "../components/modules/ChatsModule";

export default function ChatsPage() {
    const { chatRooms, handleSendMessage: onSendMessage, handleSimulateIncoming: onSimulateIncoming } = useAdmin();
    return (
        <ChatsModule
            chatRooms={chatRooms}
            onSendMessage={onSendMessage}
            onSimulateIncoming={onSimulateIncoming}
        />
    );
}