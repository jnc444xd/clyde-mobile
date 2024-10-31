import { useLocalSearchParams } from "expo-router";
import ChatRoom from "../../components/ChatRoom";

const AdminChatRoom = () => {
    const params = useLocalSearchParams();
    const { chatroomID, recipientID } = params;

    return (
        <ChatRoom
            chatroomID={chatroomID}
            recipientID={recipientID}
        />
    )
};

export default AdminChatRoom;