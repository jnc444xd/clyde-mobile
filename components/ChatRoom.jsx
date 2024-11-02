import React, {
    useState,
    useEffect,
    useLayoutEffect,
    useCallback
} from 'react';
import { SafeAreaView } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import {
    collection,
    addDoc,
    orderBy,
    query,
    onSnapshot
} from 'firebase/firestore';
import { db } from "../firebase/config";
import { useGlobalContext } from "../context/GlobalProvider";
import LoadingScreen from "../components/LoadingScreen";

const ChatRoom = ({ chatroomID, recipientID }) => {

    const [messages, setMessages] = useState([]);
    const [userData, setUserData] = useState(null);

    const { user } = useGlobalContext();

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

    useEffect(() => {
        if (user) {
            setUserData(user);
        }
    }, [user]);

    useLayoutEffect(() => {
        const chatRef = collection(db, 'chats', `${chatroomID}`, 'messages');
        const q = query(chatRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, querySnapshot => {
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
            user,
            recipientID: recipientID
        });
    }, []);

    if (!user) {
        return (
            <LoadingScreen />
        );
    }

    return (
        <SafeAreaView className="bg-primary h-full flex-1">
            <GiftedChat
                messages={messages}
                showAvatarForEveryMessage={false}
                showUserAvatar={false}
                onSend={messages => onSend(messages)}
                messagesContainerStyle={{
                    backgroundColor: '#161622'
                }}
                textInputStyle={{
                    backgroundColor: '#fff',
                    borderRadius: 20,
                }}
                user={{
                    _id: user ? user.email : null,
                    name: user ? `${user.firstName} ${user.lastName}` : null,
                    // avatar: 
                }}
            />
        </SafeAreaView>
    );
};

export default ChatRoom;