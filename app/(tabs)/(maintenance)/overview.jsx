import React, { useState, useEffect } from "react";
import { Redirect, router } from "expo-router";
import { View, Text, ScrollView, SafeAreaView, Image, RefreshControl, Modal, Button, ImageBackground, TouchableOpacity } from "react-native";
import { images, icons } from "../../../constants";
import { CustomButton } from "../../../components";
import { getMaintenanceRequestsByUnit } from "../../../firebase/database";
import { useGlobalContext } from "../../../context/GlobalProvider";
import LogoutButton from "../../../components/LogoutButton";
import LoadingScreen from "../../../components/LoadingScreen";

const Overview = () => {
    const [maintenanceData, setMaintenanceData] = useState([]);
    const [selectedRequestID, setSelectedRequestID] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
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

        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1200);

        return () => clearTimeout(timer);
    }, [user]);

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

    if (isLoading) {
        return (
            <LoadingScreen />
        )
    }

    return (
        <SafeAreaView className="bg-primary h-full flex-1">
            <ImageBackground
                source={images.altBackground}
                className="flex-1"
                resizeMode="cover"
            >
                <View className="flex flex-row justify-start p-8">
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
                            {renderSelectedRequestDetails()}
                            <TouchableOpacity
                                onPress={() => setModalVisible(!modalVisible)}
                                className="bg-white"
                            >
                                <Image
                                    source={icons.close}
                                    resizeMode="contain"
                                    className="w-[30px] h-[30px] mt-6"
                                />
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </Modal>
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
                    <View className="mb-[150]">
                        <Image
                            source={images.logoSmall}
                            resizeMode="contain"
                            className="w-[100px] h-[100px] mb-[50] ml-1"
                        />
                        <View className="flex-row justify-start w-[90%]">
                            <Text className="text-2xl font-semibold text-white font-psemibold mb-4">
                                Maintenance Requests
                            </Text>
                        </View>
                        <View className="flex-row justify-start mb-[50] w-[90%]">
                            <ScrollView>
                                <View className="flex-col items-start w-full">
                                    <View className="flex-row w-full border-b border-gray-300 justify-center items-center">
                                        <Text className="flex-1 p-4 pr-8 text-center font-bold text-white bg-gray-800">Status</Text>
                                        <Text className="flex-1 p-4 text-center font-bold text-white bg-gray-800">             </Text>
                                    </View>
                                    {maintenanceData && maintenanceData.map((item, index) => (
                                        <View key={index} className="flex-row w-full border-gray-300 justify-center">
                                            <View className="flex-1 p-4 text-center text-white bg-gray-800">
                                                {item.scheduled ?
                                                    <TouchableOpacity
                                                        onPress={() => openUpdateModal(item.arrivalWindow, item.arrivalNotes, item.id)}
                                                        className="bg-gray-800"
                                                    >
                                                        <Text className="text-white text-center">Press here for details</Text>
                                                    </TouchableOpacity>
                                                    :
                                                    <Text className="text-white text-center bg-gray-800">
                                                        Scheduling In Progress
                                                    </Text>
                                                }
                                            </View>
                                            <Text className="flex-1 p-4 text-center text-white bg-gray-800">
                                                {item.createdAt}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                    {
                        user && !user.isAdmin &&
                        <CustomButton
                            title="Create"
                            handlePress={() => router.push("/create")}
                            containerStyles="w-[90]"
                        />
                    }
                    {/* <CustomButton
                        title="Create New Maintenance Request"
                        handlePress={() => router.push("/create")}
                        containerStyles="w-full"
                    /> */}
                </ScrollView>
            </ImageBackground>
        </SafeAreaView>
    )
};

export default Overview;