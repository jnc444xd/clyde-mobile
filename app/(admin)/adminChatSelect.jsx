import React, {
    useState,
    useEffect,
    useLayoutEffect,
    useCallback
} from 'react';
import { TouchableOpacity, Text, SafeAreaView, View } from 'react-native';
import { router } from "expo-router"
import { getAllUsers } from "../../firebase/database";

const AdminChatSelect = () => {
    const [users, setUsers] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const fetchedUsers = await getAllUsers();

            const groupedData = fetchedUsers.reduce((acc, item) => {
                (acc[item.unit] = acc[item.unit] || []).push(item);
                return acc;
            }, {});

            const filteredData = extractUserDetails(groupedData);
            console.log(filteredData);

            setUsers(filteredData);
        } catch (error) {
            console.error('Failed to fetch data: ', error);
        }
    };

    const extractUserDetails = (data) => {
        const result = {};
        Object.entries(data).forEach(([unit, users]) => {
            result[unit] = users.map(user => ({
                firstName: user.firstName,
                lastName: user.lastName,
                accountID: user.accountID
            }));
        });
        return result;
    };

    return (
        <SafeAreaView className="bg-primary h-full">
            <View>
                <Text className="text-white font-psemibold text-4xl text-center m-5">Users List</Text>
                {
                    users && Object.entries(users).map(([unit, userArray]) => (
                        <View key={unit}>
                            <Text className="text-white text-lg font-psemibold mb-3">Unit {unit}</Text>
                            {userArray.map((user, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        router.push({ pathname: "/adminChatRoom", params: { chatroomID: user.accountID } });
                                    }}
                                    style={{ backgroundColor: 'white', padding: 10, marginBottom: 5, borderRadius: 5, elevation: 1 }}
                                >
                                    <Text>{user.firstName} {user.lastName}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ))
                }
            </View>
        </SafeAreaView>
    );
};

export default AdminChatSelect;