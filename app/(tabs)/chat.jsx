import React, { useEffect, useState } from 'react';
import { useGlobalContext } from "../../context/GlobalProvider";
import Constants from "expo-constants";
import ChatRoom from "../../components/ChatRoom";
import LoadingScreen from "../../components/LoadingScreen";

const Chat = () => {
  const [chatroomID, setChatroomID] = useState(null);
  // const [isLoading, setIsLoading] = useState(true);
  const { user } = useGlobalContext();
  const adminUID = Constants.expoConfig.extra.adminUID;

  useEffect(() => {
    if (user?.accountID) {
      setChatroomID(user.accountID);
    }

    // const timer = setTimeout(() => {
    //   setIsLoading(false);
    // }, 1200);

    // return () => clearTimeout(timer);
  }, [user]);

  // if (isLoading || !chatroomID) {
  //   return (
  //     <LoadingScreen />
  //   )
  // };

  if (!chatroomID) {
    return (
      <LoadingScreen />
    )
  };

  return (
    <ChatRoom
      chatroomID={chatroomID}
      recipientID={adminUID}
    />
  );
};

export default Chat;