import { useAdmin } from "../context/AdminContext";
import { ChatsModule } from "../components/modules/ChatsModule";

export default function ChatsPage() {
    const { chatRooms, chatsLoading, handleSendMessage: onSendMessage } = useAdmin();
    return (
        <ChatsModule
            chatRooms={chatRooms}
            chatsLoading={chatsLoading}
            onSendMessage={onSendMessage}
        />
    );
}