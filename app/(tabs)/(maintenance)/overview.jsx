import React, { useState, useEffect } from "react";
import { Redirect, router } from "expo-router";
import { View, Text, ScrollView, SafeAreaView, Image, RefreshControl, Modal, Button } from "react-native";
import { images } from "../../../constants";
import { CustomButton } from "../../../components";
import { getMaintenanceRequestsByUnit } from "../../../firebase/database";
import { useGlobalContext } from "../../../context/GlobalProvider";

const Overview = () => {
    const [maintenanceData, setMaintenanceData] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [arrivalWindow, setArrivalWindow] = useState(null);
    const [arrivalNotes, setArrivalNotes] = useState(null);

    const { user, loading, isLogged } = useGlobalContext();
    const unitNumber = user ? user.unit : null;

    if (!loading && !isLogged) return <Redirect href="/sign-in" />;

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    useEffect(() => {
        if (!unitNumber) return;

        const fetchData = async () => {
            try {
                const fetchedData = await getMaintenanceRequestsByUnit(unitNumber);
                
                const incompleteRequests = fetchedData.filter((request) => !request.isComplete);
                
                setMaintenanceData(incompleteRequests);
            } catch (error) {
                console.error('Failed to fetch data: ', error);
            }
        };

        fetchData();
    }, []);

    const openUpdateModal = (window, notes) => {
        setArrivalWindow(window);
        setArrivalNotes(notes);
        setModalVisible(true);
    };

    return (
        <SafeAreaView className="bg-primary h-full">
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    Alert.alert("Modal has been closed.");
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={{ marginTop: 50, marginHorizontal: 20, backgroundColor: "white", borderRadius: 20, padding: 35, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 }}>
                    <View>
                        <Text className="text-base text-black font-pmedium">Arrival Window:</Text>
                        <Text className="text-base text-black font-pmedium">{arrivalWindow}</Text>
                    </View>
                    <View>
                        <Text className="text-base text-black font-pmedium">Notes:</Text>
                        <Text className="text-base text-black font-pmedium">{arrivalNotes}</Text>
                    </View>
                    <Button
                        title="Close"
                        onPress={() => setModalVisible(!modalVisible)}
                    />
                </View>
            </Modal>
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
                    Maintenance Requests
                </Text>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
                    <View>
                        <View className="flex-row border-b border-gray-300">
                            <Text className="flex-1 p-2 text-center font-bold text-white bg-gray-800">Scheduling</Text>
                            <Text className="flex-1 p-2 text-center font-bold text-white bg-gray-800">Urgent?</Text>
                            <Text className="flex-2 p-2 text-center font-bold text-white bg-gray-800">Description</Text>
                            <Text className="flex-1 p-2 text-center font-bold text-white bg-gray-800">Location</Text>
                            <Text className="flex-2 p-2 text-center font-bold text-white bg-gray-800">Availability</Text>
                            <Text className="flex-1 p-2 text-center font-bold text-white bg-gray-800">Image Reference</Text>
                            <Text className="flex-1 p-2 text-center font-bold text-white bg-gray-800">Status</Text>
                        </View>
                        {maintenanceData && maintenanceData.map((item, index) => (
                            <View key={index} className="flex-row border-b border-gray-300">
                                <Text className="flex-1 p-2 text-center text-white bg-gray-800">
                                    {item.scheduled ?
                                        <Button
                                            title="Details"
                                            onPress={() => openUpdateModal(item.arrivalWindow, item.arrivalNotes)}
                                        />
                                        :
                                        'In Progress'
                                    }
                                </Text>
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
                {
                    user && !user.isAdmin &&
                    <CustomButton
                        title="Create New Maintenance Request"
                        handlePress={() => router.push("/create")}
                        containerStyles="w-full"
                    />
                }
                {/* <CustomButton
                    title="Create New Maintenance Request"
                    handlePress={() => router.push("/create")}
                    containerStyles="w-full"
                /> */}
                {user && user.isAdmin &&
                    <CustomButton
                        title="Update Maintenance Requests"
                        handlePress={() => router.push("/updateMaintenanceRequest")}
                        containerStyles="w-full"
                    />
                }
            </ScrollView>
        </SafeAreaView>
    )
};

export default Overview;