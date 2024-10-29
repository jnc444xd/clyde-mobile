import { useState, useEffect } from "react";
import { Redirect, router } from "expo-router";
import { View, Text, ScrollView, SafeAreaView, Image, RefreshControl, Modal, Button, Switch, TextInput, Alert } from "react-native";
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

    useEffect(() => {
        console.log("December 2024", paidStatuses["December 2024"]);
    }, [paidStatuses]);

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
                <ScrollView>
                    <View
                        className="flex-col justify-between bg-white m-1 p-2"
                        style={{ marginTop: 50, marginHorizontal: 20, backgroundColor: "white", borderRadius: 20, padding: 35, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 }}
                    >
                        <Text style={{ marginBottom: 15, textAlign: "center" }} className="text-bold text-xl">Payment List</Text>
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
                            containerStyles="mt-7"
                            isLoading={isSubmitting}
                        />
                        <Button
                            title="Close"
                            onPress={() => setModalVisible(!modalVisible)}
                        />
                    </View>
                </ScrollView>
            </Modal>
            <ScrollView
                className="flex-1 p-4 bg-primary h-full"
            >
                <Image
                    source={images.logo}
                    resizeMode="contain"
                    className="w-[460] h-[136px]"
                />
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
                    <View className="flex-column">
                        {Object.entries(paymentData).map(([unit, paymentsArray]) => (
                            <View key={unit}>
                                <Text className="text-xl font-bold text-white mt-4">{`Unit ${unit}`}</Text>
                                <Button
                                    title="Open"
                                    onPress={() => openUpdateModal(unit)}
                                />
                                {paymentsArray.map((paymentDetails, index) => (
                                    <View key={index} className="flex-row justify-between bg-gray-800 m-1 p-2">
                                        <Text className="text-white">{paymentDetails.month}</Text>
                                        <Text className="text-white">{`Rent Due: $${paymentDetails.rentAmount}`}</Text>
                                        <Text className="text-white">{paymentDetails.isPaid.isPaid ? "Paid" : "Not Paid"}</Text>
                                    </View>
                                ))}
                            </View>
                        ))}

                        {/* {Object.entries(paymentData).map(([unit, payments]) => (
                            <View key={unit}>
                                <Text className="text-xl font-bold text-white mt-4">{`Unit ${unit}`}</Text>
                                {payments.map((item, index) => (
                                    <View key={index}>
                                        <Text className="flex-1 p-2 text-l text-white bg-gray-800">{item.month}</Text>
                                        <Text className="flex-1 p-2 text-l text-white bg-gray-800">Rent Due: ${item.rentAmount}</Text>
                                        <Text className="flex-1 p-2 text-l text-white bg-gray-800">{item.isPaid ? "Paid" : "Not Paid"}</Text>
                                        <Text className="flex-1 p-2 text-l text-white bg-gray-800">----</Text>
                                    </View>
                                ))}
                            </View>
                        ))} */}
                    </View>
                </ScrollView>
            </ScrollView>
        </SafeAreaView>
    )
};

export default UpdatePaymentList;