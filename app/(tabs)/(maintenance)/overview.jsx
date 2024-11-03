import React, { useState, useEffect } from "react";
import { Redirect, router } from "expo-router";
import { View, Text, ScrollView, SafeAreaView, Image, RefreshControl, Modal, ImageBackground, TouchableOpacity, Alert } from "react-native";
import { images, icons } from "../../../constants";
import { CustomButton } from "../../../components";
import { getMaintenanceRequestsByUnit, deleteMaintenanceRequest } from "../../../firebase/database";
import { useGlobalContext } from "../../../context/GlobalProvider";
import LogoutButton from "../../../components/LogoutButton";
import LoadingScreen from "../../../components/LoadingScreen";

const Overview = () => {
    const [maintenanceData, setMaintenanceData] = useState([]);
    const [selectedRequestID, setSelectedRequestID] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    // const [isLoading, setIsLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [arrivalWindow, setArrivalWindow] = useState(null);
    const [arrivalNotes, setArrivalNotes] = useState(null);

    const { user, loading, isLogged } = useGlobalContext();
    const unitNumber = user ? user.unit : null;

    if (!loading && !isLogged) return <Redirect href="/sign-in" />;

    const fetchData = async () => {
        if (!unitNumber) return;

        try {
            const fetchedData = await getMaintenanceRequestsByUnit(unitNumber);
            const incompleteRequests = fetchedData.filter((request) => !request.isComplete);

            setMaintenanceData(incompleteRequests);
        } catch (error) {
            console.error('Failed to fetch data: ', error);
        }
    };

    useEffect(() => {
        fetchData();

        // const timer = setTimeout(() => {
        //     setIsLoading(false);
        // }, 1200);

        // return () => clearTimeout(timer);
    }, [user, maintenanceData]);

    const handleDelete = (requestID) => {
        try {
            deleteMaintenanceRequest(requestID);
            console.log("Maintenance request deleted successfully");
        } catch (error) {
            console.error("Failed to delete maintenance request: ", error);
        }
    };

    const deleteConfirmation = (requestID) => {
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this item?",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed")
                },
                {
                    text: "OK",
                    onPress: () => handleDelete(requestID)
                }
            ]
        );
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData().then(() => setRefreshing(false));
    };

    const openUpdateModal = (window, notes, id) => {
        setSelectedRequestID(id);
        setArrivalWindow(window);
        setArrivalNotes(notes);
        setModalVisible(true);
    };

    const renderSelectedRequestDetails = () => {
        const item = maintenanceData.find(({ id }) => id === selectedRequestID);
        if (!item) return null;

        return (
            <>
                <Text className="text-xl text-black font-pbold my-2">{item.scheduled ? "Scheduled!" : "Scheduling In Progress"}</Text>
                {arrivalWindow && <Text className="text-base text-black font-medium my-2">Arrival Window: {arrivalWindow}</Text>}
                {arrivalNotes && <Text className="text-base text-black font-medium my-2">Notes: {arrivalNotes}</Text>}
                <Text className="text-base text-black font-medium my-2">Urgent: {item.urgent ? 'Yes' : 'No'}</Text>
                <Text className="text-base text-black font-medium my-2">Description: {item.description}</Text>
                <Text className="text-base text-black font-medium my-2">Location: {item.location}</Text>
                <Text className="text-base text-black font-medium my-2">Availability: {item.availability.join('\n')}</Text>
                <Text className="text-base text-black font-medium my-2">Attachments: {item.media.length > 0 ? 'Yes' : 'No'}</Text>
            </>
        );
    };

    // if (isLoading) {
    //     return (
    //         <LoadingScreen />
    //     )
    // }

    return (
        <SafeAreaView className="bg-primary flex-1">
            <ImageBackground
                source={images.altBackground}
                className="flex-1"
                resizeMode="cover"
            >
                <View className="flex flex-row justify-start p-8 h-[5%]">
                    <LogoutButton />
                </View>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        Alert.alert("Modal has been closed.");
                        setModalVisible(!modalVisible);
                    }}
                >
                    <ScrollView
                        className="h-full"
                        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={["#FFF", "#FFF"]} // Android
                                tintColor="#FFF" // iOS
                                titleColor="#000" // iOS
                            />
                        }
                    >
                        <View className="flex-col justify-center mt-12 mx-5 bg-white rounded-lg p-9 items-center shadow-lg" style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 }}>
                            <View className="w-full self-end mb-4">
                                <TouchableOpacity
                                    onPress={() => setModalVisible(!modalVisible)}
                                    className="bg-white"
                                >
                                    <Image
                                        source={icons.close}
                                        resizeMode="contain"
                                        className="w-[20px] h-[20px]"
                                    />
                                </TouchableOpacity>
                            </View>
                            {renderSelectedRequestDetails()}
                            <TouchableOpacity
                                onPress={() => deleteConfirmation(item.id)}
                            >
                                <Image
                                    source={icons.trash}
                                    className="w-[25] h-[25] mt-6"
                                />
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </Modal>
                <ScrollView>
                    <View className="flex-1 mx-4 mt-[40] h-[95%]">
                        <Image
                            source={images.logoSmall}
                            resizeMode="contain"
                            className="w-[100px] h-[100px] mb-[30] ml-1"
                        />
                        <View className="flex-row justify-start w-[90%]">
                            <Text className="text-2xl font-semibold text-white font-psemibold mb-4">
                                Maintenance Requests
                            </Text>
                        </View>
                        <View className="flex-row justify-start w-full">
                            <ScrollView
                                contentContainerStyle={{ flexGrow: 1 }}
                                className="h-[80%]"
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={onRefresh}
                                        colors={["#FFF", "#FFF"]} // Android
                                        tintColor="#FFF" // iOS
                                        titleColor="#000" // iOS
                                    />
                                }
                            >
                                <View className="flex-col items-start w-full">
                                    {/* <View className="flex-row w-full border-gray-300 justify-center items-center">
                                        <Text className="flex-1 p-4 pr-8 text-xl text-center font-pbold text-white bg-gray-800">Status</Text>
                                        <Text className="flex-1 p-4 text-xl text-center font-pbold text-white bg-gray-800">             </Text>
                                    </View> */}
                                    {
                                        maintenanceData &&
                                        maintenanceData.length > 0 &&
                                        maintenanceData.map((item, index) => (
                                            <View key={index} className="flex-row w-full border-gray-300 justify-center">
                                                <Text className="flex-1 p-4 text-center text-white bg-gray-800 font-pregular">
                                                    {item.createdAt}
                                                </Text>
                                                <View className="flex-1 p-4 text-center text-white bg-gray-800">
                                                    {item.scheduled ?
                                                        <TouchableOpacity
                                                            onPress={() => openUpdateModal(item.arrivalWindow, item.arrivalNotes, item.id)}
                                                            className="bg-gray-800"
                                                        >
                                                            <Text className="text-white text-center font-pregular">Scheduled!</Text>
                                                            <Text className="text-white text-center font-pregular">Press For Details</Text>
                                                        </TouchableOpacity>
                                                        :
                                                        <TouchableOpacity
                                                            onPress={() => openUpdateModal(item.arrivalWindow, item.arrivalNotes, item.id)}
                                                            className="bg-gray-800"
                                                        >
                                                            <Text className="text-white text-center font-pregular">In Progress</Text>
                                                        </TouchableOpacity>
                                                    }
                                                </View>
                                            </View>
                                        ))
                                    }
                                    {
                                        maintenanceData &&
                                        maintenanceData.length === 0 &&
                                        <View className="flex-row w-full border-gray-300 justify-center">
                                            <Text className="flex-1 p-4 pb-8 text-center text-white bg-gray-800 font-pregular">
                                                No active requests
                                            </Text>
                                        </View>
                                    }
                                </View>
                            </ScrollView>
                        </View>
                        {
                            user && !user.isAdmin &&
                            <View className="flex-row justify-center items-center w-full mt-[-40]">
                                <CustomButton
                                    title="Create New"
                                    handlePress={() => router.push("/create")}
                                    containerStyles="w-[150] mx-2"
                                />
                                <CustomButton
                                    title="View History"
                                    handlePress={() => router.push("/completed")}
                                    containerStyles="w-[150] mx-2"
                                />
                            </View>
                        }
                        {/* <CustomButton
                        title="Create New Maintenance Request"
                        handlePress={() => router.push("/create")}
                        containerStyles="w-full"
                    /> */}
                    </View>
                </ScrollView>
            </ImageBackground>
        </SafeAreaView >
    )
};

export default Overview;