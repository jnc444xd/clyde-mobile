import { useState, useEffect } from "react";
import { Redirect, router } from "expo-router";
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
import { getAllLeases, updateLease } from "../../firebase/database";
import { useGlobalContext } from "../../context/GlobalProvider";

const UpdatePaymentList = () => {
    const [paymentData, setPaymentData] = useState([]);
    const [modalData, setModalData] = useState([]);
    const [isSubmitting, setSubmitting] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [paidStatuses, setPaidStatuses] = useState({});
    const [refreshing, setRefreshing] = useState(false);

    const { loading, isLogged } = useGlobalContext();

    if (!loading && !isLogged) return <Redirect href="/sign-in" />;

    useEffect(() => {
        fetchAllLeases();
    }, []);

    const fetchAllLeases = async () => {
        try {
            const fetchedData = await getAllLeases();

            const monthOrder = {
                "January": 0, "February": 1, "March": 2, "April": 3, "May": 4, "June": 5,
                "July": 6, "August": 7, "September": 8, "October": 9, "November": 10, "December": 11
            };

            const groupedPaymentData = fetchedData.reduce((acc, lease) => {
                const paymentsArray = Object.entries(lease.payments)
                    .map(([month, paymentDetails]) => ({
                        month,
                        ...paymentDetails,
                        leaseId: lease.id
                    }))
                    .sort((a, b) => {
                        const yearMonthA = a.month.split(' ');
                        const yearMonthB = b.month.split(' ');
                        const yearA = parseInt(yearMonthA[1], 10);
                        const yearB = parseInt(yearMonthB[1], 10);
                        const monthA = monthOrder[yearMonthA[0]];
                        const monthB = monthOrder[yearMonthB[0]];

                        if (yearA !== yearB) {
                            return yearA - yearB;
                        }
                        return monthA - monthB;
                    });

                acc[lease.unit] = paymentsArray;
                return acc;
            }, {});

            setPaymentData(groupedPaymentData);
        } catch (error) {
            console.error('Failed to fetch data: ', error);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchAllLeases().then(() => setRefreshing(false));
    };

    const openUpdateModal = (unit) => {
        const selectedUnitData = paymentData[unit] ? paymentData[unit].flat() : [];
        setModalData(selectedUnitData);

        const newPaidStatuses = selectedUnitData.reduce((acc, payment) => {
            acc[payment.month] = payment.isPaid.isPaid;
            return acc;
        }, {});

        setPaidStatuses(newPaidStatuses);
        setModalVisible(true);
    };

    const togglePaid = (id) => {
        setPaidStatuses(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const submit = async (updateID) => {

        setSubmitting(true);

        try {
            modalData.forEach(async (payment) => {
                const updateData = { isPaid: paidStatuses[payment.month] };
                await updateLease(payment.leaseId, payment.month, updateData);
            });

            Alert.alert("Lease updated successfully!");
            setModalVisible(false);
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setSubmitting(false);
        }

        if (isSubmitting) return <Redirect href="/lease" />;
    };

    return (
        <SafeAreaView className="bg-primary h-full flex-1">
            <ImageBackground
                source={images.altBackground}
                className="flex-1"
                style={{ flex: 1 }}
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
                    <ScrollView>
                        <View
                            className="flex-col bg-white justify-between m-1 p-2"
                            style={{ marginTop: 50, marginHorizontal: 20, backgroundColor: "white", borderRadius: 20, padding: 35, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 }}
                        >
                            <Text style={{ marginBottom: 15, textAlign: "center" }} className="font-pbold text-2xl mt-6">Payment List</Text>
                            {modalData.map((payment, index) => (
                                <View key={index} className="flex-col mb-3 p-2">
                                    <Text className="text-[16px] text-black font-psemibold">{payment.month}</Text>
                                    <Text className="text-[16px] text-black font-psemibold">{`Rent Due: $${payment.rentAmount}`}</Text>
                                    <View>
                                        <Text className="text-[16px] text-black font-psemibold">Paid?{"\n"}</Text>
                                        <Switch
                                            trackColor={{ false: "#767577", true: "#81b0ff" }}
                                            thumbColor={paidStatuses[payment.month] ? "#f5dd4b" : "#f4f3f4"}
                                            onValueChange={() => togglePaid(payment.month)}
                                            value={paidStatuses[payment.month]}
                                        />
                                    </View>
                                    <Text className="text-[16px] text-black font-psemibold mt-5">-------</Text>
                                </View>
                            ))}
                            <CustomButton
                                title="Submit"
                                handlePress={() => submit()}
                                containerStyles="mt-7 p-4"
                                isLoading={isSubmitting}
                            />
                            <CustomButton
                                title="Close"
                                handlePress={() => setModalVisible(!modalVisible)}
                                containerStyles="mt-7 p-4"
                            />
                        </View>
                    </ScrollView>
                </Modal>
                <ScrollView
                    className="flex-1 p-4 h-full"
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#fff"]}
                            tintColor="#fff"
                        />
                    }
                >
                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
                        <View className="flex-column mt-[100]">
                            {Object.entries(paymentData).map(([unit, paymentsArray]) => (
                                <View key={unit}>
                                    <Text className="text-3xl font-psemibold text-white mt-4">{`Unit ${unit}`}</Text>
                                    <CustomButton
                                        title="Open Payment List"
                                        handlePress={() => openUpdateModal(unit)}
                                        containerStyles="mt-7 p-4"
                                    />
                                    {/* {paymentsArray.map((paymentDetails, index) => (
                                    <View key={index} className="flex-row justify-between bg-gray-800 m-1 p-2">
                                        <Text className="text-white">{paymentDetails.month}</Text>
                                        <Text className="text-white">{`Rent Due: $${paymentDetails.rentAmount}`}</Text>
                                        <Text className="text-white">{paymentDetails.isPaid.isPaid ? "Paid" : "Not Paid"}</Text>
                                    </View>
                                ))} */}
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                </ScrollView>
            </ImageBackground>
        </SafeAreaView>
    )
};

export default UpdatePaymentList;