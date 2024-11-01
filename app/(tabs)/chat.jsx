import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { useGlobalContext } from "../../context/GlobalProvider";
import Constants from "expo-constants";
import ChatRoom from "../../components/ChatRoom";

const Chat = () => {
  const [chatroomID, setChatroomID] = useState(null);
  const { user } = useGlobalContext();
  const adminUID = Constants.expoConfig.extra.adminUID;

  useEffect(() => {
    if (user?.accountID) {
      setChatroomID(user.accountID);
    }
  }, [user]);

  if (!chatroomID) {
    return <Text>Loading chat...</Text>;
  }

  return (
    <ChatRoom
      chatroomID={chatroomID}
      recipientID={adminUID}
    />
  );
};

export default Chat;