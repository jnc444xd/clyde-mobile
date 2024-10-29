import { useState, useEffect } from "react";
import { Redirect, router } from "expo-router";
import { View, Text, ScrollView, SafeAreaView, Image, RefreshControl, Modal, Button, Switch, TextInput, Alert } from "react-native";
import { images } from "../../constants";
import { CustomButton } from "../../components";
import { getAllMaintenanceRequests, updateMaintenanceRequest } from "../../firebase/database";
import { useGlobalContext } from "../../context/GlobalProvider";

const UpdateRequests = () => {
    const [maintenanceData, setMaintenanceData] = useState([]);
    const [isSubmitting, setSubmitting] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [form, setForm] = useState({
        scheduled: false,
        arrivalWindow: "",
        arrivalNotes: "",
        invoicePaid: false
    });
    const [isScheduled, setIsScheduled] = useState(false);
    const [isPaid, setIsPaid] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const { loading, isLogged } = useGlobalContext();

    if (!loading && !isLogged) return <Redirect href="/sign-in" />;

    const toggleScheduled = () => setIsScheduled(previousState => !previousState);
    const togglePaid = () => setIsPaid(previousState => !previousState);
    const toggleComplete = () => setIsComplete(previousState => !previousState);

    const fetchData = async () => {
        try {
            const fetchedData = await getAllMaintenanceRequests();

            const groupedData = fetchedData.reduce((acc, item) => {
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

    const openUpdateModal = (selectedID) => {
        setCurrentItem(selectedID);
        setModalVisible(true);
    };

    const submit = async (updateID) => {
        if (form.arrivalWindow === "") {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setSubmitting(true);

        try {
            const updateData = {
                arrivalWindow: form.arrivalWindow,
                arrivalNotes: form.arrivalNotes,
                scheduled: isScheduled,
                invoicePaid: isPaid,
                isComplete: isComplete
            };
            const result = await updateMaintenanceRequest(updateID, updateData);

            if (result) {
                Alert.alert("Request updated successfully!");
                setModalVisible(false);
            }
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setSubmitting(false);
        }
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
                    <Text style={{ marginBottom: 15, textAlign: "center" }} className="text-bold text-xl">Update Maintenance Request</Text>
                    <View className={`space-y-2`}>
                        <Text className="text-base text-black font-pmedium">Arrival Window</Text>
                        <View className="w-full h-16 px-4 bg-white rounded-2xl border-2 border-black-200 focus:border-secondary flex flex-row items-center">
                            <TextInput
                                className="flex-1 text-black font-psemibold text-base"
                                value={form.arrivalWindow}
                                placeholder="Enter Here..."
                                placeholderTextColor="black"
                                onChangeText={(e) => setForm({ ...form, arrivalWindow: e })}
                            />
                        </View>
                    </View>
                    <View className={`space-y-2`}>
                        <Text className="text-base text-black font-pmedium">Arrival Notes</Text>
                        <View className="w-full h-16 px-4 bg-white rounded-2xl border-2 border-black-200 focus:border-secondary flex flex-row items-center">
                            <TextInput
                                className="flex-1 text-black font-psemibold text-base"
                                value={form.arrivalNotes}
                                placeholder="Enter Here..."
                                placeholderTextColor="black"
                                onChangeText={(e) => setForm({ ...form, arrivalNotes: e })}
                            />
                        </View>
                    </View>
                    <View>
                        <Text className="text-[16px] text-black mt-10 font-psemibold">Scheduled?{"\n"}</Text>
                        <Switch
                            trackColor={{ false: "#767577", true: "#81b0ff" }}
                            thumbColor={isScheduled ? "#f5dd4b" : "#f4f3f4"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleScheduled}
                            value={isScheduled}
                        />
                    </View>
                    <View>
                        <Text className="text-[16px] text-black mt-10 font-psemibold">Invoice Paid?{"\n"}</Text>
                        <Switch
                            trackColor={{ false: "#767577", true: "#81b0ff" }}
                            thumbColor={isPaid ? "#f5dd4b" : "#f4f3f4"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={togglePaid}
                            value={isPaid}
                        />
                    </View>
                    <View>
                        <Text className="text-[16px] text-black mt-10 font-psemibold">Completed?{"\n"}</Text>
                        <Switch
                            trackColor={{ false: "#767577", true: "#81b0ff" }}
                            thumbColor={isComplete ? "#f5dd4b" : "#f4f3f4"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleComplete}
                            value={isComplete}
                        />
                    </View>
                    <CustomButton
                        title="Submit"
                        handlePress={() => submit(currentItem)}
                        containerStyles="mt-7"
                        isLoading={isSubmitting}
                    />
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
                    <View className="flex-column">
                        {Object.entries(maintenanceData).map(([unit, requests]) => (
                            <View key={unit}>
                                <Text className="text-xl font-bold text-white mt-4">{`Unit ${unit}`}</Text>
                                <View className="flex-row border-b border-gray-300">
                                    <Text className="flex-1 p-2 text-center font-bold text-white bg-gray-800">                    </Text>
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
                                        <Button
                                            title="Update"
                                            onPress={() => openUpdateModal(item.id)}
                                        />
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
        </SafeAreaView>
    )
};

export default UpdateRequests;