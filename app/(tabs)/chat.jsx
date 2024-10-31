import React from 'react';
import { useGlobalContext } from "../../context/GlobalProvider";
import Constants from "expo-constants";
import ChatRoom from "../../components/ChatRoom";

const Chat = () => {
  const { user } = useGlobalContext();
  const chatroomID = user ? user.accountID : null;
  const adminUID = Constants.expoConfig.extra.adminUID;

  return (
    <ChatRoom
      chatroomID={chatroomID}
      recipientID={adminUID}
    />
  );
};

export default Chat;