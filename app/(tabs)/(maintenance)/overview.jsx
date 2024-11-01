import React, { useState, useEffect } from "react";
import { Redirect, router } from "expo-router";
import { View, Text, ScrollView, SafeAreaView, Image, RefreshControl, Modal, Button, ImageBackground } from "react-native";
import { images } from "../../../constants";
import { CustomButton } from "../../../components";
import { getMaintenanceRequestsByUnit } from "../../../firebase/database";
import { useGlobalContext } from "../../../context/GlobalProvider";
import LoadingScreen from "../../../components/LoadingScreen";

const Overview = () => {
    const [maintenanceData, setMaintenanceData] = useState([]);
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
        }, 1800);

        return () => clearTimeout(timer);
    }, [user]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData().then(() => setRefreshing(false));
    };

    const openUpdateModal = (window, notes) => {
        setArrivalWindow(window);
        setArrivalNotes(notes);
        setModalVisible(true);
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
                        {
                            arrivalWindow &&
                            <View>
                                <Text className="text-base text-black font-pmedium">Arrival Window:</Text>
                                <Text className="text-base text-black font-pmedium">{arrivalWindow}</Text>
                            </View>
                        }
                        {
                            arrivalNotes &&
                            <View>
                                <Text className="text-base text-black font-pmedium">Notes:</Text>
                                <Text className="text-base text-black font-pmedium">{arrivalNotes}</Text>
                            </View>
                        }
                        <Button
                            title="Close"
                            onPress={() => setModalVisible(!modalVisible)}
                        />
                    </View>
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
                            title="Loading..." // iOS
                            titleColor="#000" // iOS
                        />
                    }
                >
                    <View className="flex-row justify-start w-full ml-[50]">
                        <Image
                            source={images.logoSmall}
                            resizeMode="contain"
                            className="w-[100px] h-auto mt-[-400] mb-[-400]"
                        />
                    </View>
                    <Text className="text-2xl font-semibold text-white font-psemibold mb-4 mt-[-50]">
                        Maintenance Requests
                    </Text>
                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
                        <View className="mx-2">
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
                            title="Create New"
                            handlePress={() => router.push("/create")}
                            containerStyles="w-[150]"
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