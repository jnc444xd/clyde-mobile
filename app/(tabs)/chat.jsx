import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback
} from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot
} from 'firebase/firestore';
import { signOut } from '../../firebase/auth';
import { db } from "../../firebase/config";
import { useNavigation } from '@react-navigation/native';
// import { AntDesign } from '@expo/vector-icons';
import { useGlobalContext } from "../../context/GlobalProvider";


export default function Chat() {

  const [messages, setMessages] = useState([]);
  // const navigation = useNavigation();

  const { user } = useGlobalContext();
  const chatroomID = user.accountID;

  const onSignOut = () => {
    signOut(auth).catch(error => console.log('Error logging out: ', error));
  };

  // useLayoutEffect(() => {
  //   navigation.setOptions({
  //     headerRight: () => (
  //       <TouchableOpacity
  //         style={{
  //           marginRight: 10
  //         }}
  //         onPress={onSignOut}
  //       >
  //         <AntDesign name="logout" size={24} color={colors.gray} style={{ marginRight: 10 }} />
  //       </TouchableOpacity>
  //     )
  //   });
  // }, [navigation]);

  useLayoutEffect(() => {
    const chatRef = collection(db, 'chats', `${chatroomID}`, 'messages');
    const q = query(chatRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, querySnapshot => {
      console.log('querySnapshot unsusbscribe');
      setMessages(
        querySnapshot.docs.map(doc => ({
          _id: doc.data()._id,
          createdAt: doc.data().createdAt.toDate(),
          text: doc.data().text,
          user: doc.data().user
        }))
      );
    });

    return unsubscribe;
  }, []);

  const onSend = useCallback((messages = []) => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, messages)
    );
    const { _id, createdAt, text, user } = messages[0];
    addDoc(collection(db, 'chats', `${chatroomID}`, 'messages'), {
      _id,
      createdAt,
      text,
      user
    });
  }, []);

  return (
    <GiftedChat
      messages={messages}
      showAvatarForEveryMessage={false}
      showUserAvatar={false}
      onSend={messages => onSend(messages)}
      messagesContainerStyle={{
        backgroundColor: '#fff'
      }}
      textInputStyle={{
        backgroundColor: '#fff',
        borderRadius: 20,
      }}
      user={{
        _id: user.email,
        // avatar: 
      }}
    />
  );
}