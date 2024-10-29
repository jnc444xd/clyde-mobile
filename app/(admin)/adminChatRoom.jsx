import { useState, useEffect } from "react";
import { ScrollView, Text, View, RefreshControl } from "react-native";
import { useNavigation, useRouter, useLocalSearchParams } from "expo-router";

import ChatRoom from "../../components/ChatRoom";

const AdminChatRoom = () => {
    const params = useLocalSearchParams();
    const { chatroomID } = params;

    return (
        <ChatRoom
            chatroomID={chatroomID}
        />
    )
};

export default AdminChatRoom;