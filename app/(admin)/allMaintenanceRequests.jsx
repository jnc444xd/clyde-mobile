import { useState, useEffect } from "react";
import { Redirect } from "expo-router";
import {
    View,
    Text,
    ScrollView,
    SafeAreaView,
    Image,
    RefreshControl,
    Modal,
    Button,
    Switch,
    TextInput,
    Alert,
    ImageBackground
} from "react-native";
import { images } from "../../constants";
import { CustomButton } from "../../components";
import { getAllMaintenanceRequests, updateMaintenanceRequest } from "../../firebase/database";
import { useGlobalContext } from "../../context/GlobalProvider";

const AllMaintenanceRequests = () => {
    const [maintenanceData, setMaintenanceData] = useState([]);
    const [isSubmitting, setSubmitting] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const { loading, isLogged } = useGlobalContext();

    if (!loading && !isLogged) return <Redirect href="/sign-in" />;

    const fetchData = async () => {
        try {
            const fetchedData = await getAllMaintenanceRequests();
            const completeRequests = fetchedData.filter((request) => request.isComplete);

            const groupedData = completeRequests.reduce((acc, item) => {
                (acc[item.unit] = acc[item.unit] || []).push(item);
                return acc;
            }, {});

            setMaintenanceData(groupedData);
        } catch (error) {
            console.error('Failed to fetch data: ', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData().then(() => setRefreshing(false));
    };

    return (
        <SafeAreaView className="bg-primary h-full flex-1">
            <ImageBackground
                source={images.altBackground}
                className="flex-1"
                style={{ flex: 1 }}
                resizeMode="cover"
            >
                <ScrollView
                    className="flex-1 p-4 h-full"
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#FFF", "#FFF"]} // Android
                            tintColor="#FFF" // iOS
                            title="Loading..." // iOS
                            titleColor="#000" // iOS
                        />
                    }
                >
                    <Text className="text-2xl font-semibold text-white mt-[200] font-psemibold">
                        Maintenance Requests
                    </Text>
                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
                        <View className="flex-column">
                            {Object.entries(maintenanceData).map(([unit, requests]) => (
                                <View key={unit}>
                                    <Text className="text-xl font-bold text-white mt-4">{`Unit ${unit}`}</Text>
                                    <View className="flex-row border-b border-gray-300">
                                        <Text className="flex-1 p-2 text-center font-bold text-white bg-gray-800">Status</Text>
                                        <Text className="flex-1 p-2 text-center font-bold text-white bg-gray-800">Invoice</Text>
                                        <Text className="flex-1 p-2 text-center font-bold text-white bg-gray-800">Urgent?</Text>
                                        <Text className="flex-2 p-2 text-center font-bold text-white bg-gray-800">Description</Text>
                                        <Text className="flex-1 p-2 text-center font-bold text-white bg-gray-800">Location</Text>
                                        <Text className="flex-2 p-2 text-center font-bold text-white bg-gray-800">Availability</Text>
                                        <Text className="flex-1 p-2 text-center font-bold text-white bg-gray-800">Image Reference</Text>
                                    </View>
                                    {requests.map((item, index) => (
                                        <View key={index} className="flex-row border-b border-gray-300">
                                            <Text className="flex-1 p-2 text-center text-white bg-gray-800">{item.isComplete ? 'Complete' : 'Pending'}</Text>
                                            <Text className="flex-1 p-2 text-center text-white bg-gray-800">{item.invoicePaid ? 'Paid' : 'Pending'}</Text>
                                            <Text className="flex-1 p-2 text-center text-white bg-gray-800">{item.urgent ? 'Yes' : 'No'}</Text>
                                            <Text className="flex-1 p-2 text-center text-white bg-gray-800">{item.description}</Text>
                                            <Text className="flex-1 p-2 text-center text-white bg-gray-800">{item.location}</Text>
                                            <Text className="flex-1 p-2 text-center text-white bg-gray-800">{item.availability.join('\n')}</Text>
                                            <Text className="flex-1 p-2 text-center text-white bg-gray-800">{item.media.length > 0 ? 'Yes' : 'No'}</Text>
                                        </View>
                                    ))}
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                </ScrollView>
            </ImageBackground>
        </SafeAreaView>
    )
};

export default AllMaintenanceRequests;