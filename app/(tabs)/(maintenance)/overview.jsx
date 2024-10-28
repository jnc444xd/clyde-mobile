import React, { useState, useEffect } from "react";
import { Redirect, router } from "expo-router";
import { View, Text, ScrollView, SafeAreaView, Image, RefreshControl } from "react-native";
import { images } from "../../../constants";
import { CustomButton } from "../../../components";
import { getMaintenanceRequests } from "../../../firebase/database";
import { useGlobalContext } from "../../../context/GlobalProvider";

const Overview = () => {
    const [maintenanceData, setMaintenanceData] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const { user, loading, isLogged } = useGlobalContext();
    const unitNumber = user.unit;

    if (!loading && !isLogged) return <Redirect href="/sign-in" />;

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedData = await getMaintenanceRequests(unitNumber);
                console.log(fetchedData);

                setMaintenanceData(fetchedData);
            } catch (error) {
                console.error('Failed to fetch data: ', error);
            }
        };

        fetchData();
    }, []);

    return (
        <SafeAreaView className="bg-primary h-full">
            <ScrollView
                className="flex-1 p-4 bg-primary h-full"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#9Bd35A", "#689F38"]} // Android
                        tintColor="#689F38" // iOS
                        title="Loading..." // iOS
                        titleColor="#000" // iOS
                    />
                }
            >
                <Image
                    source={images.logo}
                    resizeMode="contain"
                    className="w-[460] h-[136px]"
                />
                <Text className="text-2xl font-semibold text-white mt-10 font-psemibold">
                    Maintenance Request History
                </Text>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
                    <View>
                        <View className="flex-row border-b border-gray-300">
                            <Text className="flex-1 p-2 text-center font-bold text-white bg-gray-800">Urgent?</Text>
                            <Text className="flex-2 p-2 text-center font-bold text-white bg-gray-800">Description</Text>
                            <Text className="flex-1 p-2 text-center font-bold text-white bg-gray-800">Location</Text>
                            <Text className="flex-2 p-2 text-center font-bold text-white bg-gray-800">Availability</Text>
                            <Text className="flex-1 p-2 text-center font-bold text-white bg-gray-800">Image Reference</Text>
                            <Text className="flex-1 p-2 text-center font-bold text-white bg-gray-800">Status</Text>
                        </View>
                        {maintenanceData && maintenanceData.map((item, index) => (
                            <View key={index} className="flex-row border-b border-gray-300">
                                <Text className="flex-1 p-2 text-center text-white bg-gray-800">{item.urgent ? 'Yes' : 'No'}</Text>
                                <Text className="flex-1 p-2 text-center text-white bg-gray-800">{item.description}</Text>
                                <Text className="flex-1 p-2 text-center text-white bg-gray-800">{item.location}</Text>
                                <Text className="flex-1 p-2 text-center text-white bg-gray-800">{item.availability.join('\n')}</Text>
                                <Text className="flex-1 p-2 text-center text-white bg-gray-800">{item.media.length > 0 ? 'Yes' : 'No'}</Text>
                                <Text className="flex-1 p-2 text-center text-white bg-gray-800">{item.isComplete ? 'Complete' : 'Pending'}</Text>
                            </View>
                        ))}
                    </View>
                </ScrollView>
                <CustomButton
                    title="Create New Maintenance Request"
                    handlePress={() => router.push("/create")}
                    containerStyles="w-full"
                />
            </ScrollView>
        </SafeAreaView>
    )
};

export default Overview;