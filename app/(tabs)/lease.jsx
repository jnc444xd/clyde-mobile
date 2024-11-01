import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, ScrollView, Text, View, RefreshControl, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { CustomButton } from "../../components";
import { images } from "../../constants";
import { useGlobalContext } from "../../context/GlobalProvider";
import { getLease } from "../../firebase/database";
import LogoutButton from "../../components/LogoutButton";
import LoadingScreen from "../../components/LoadingScreen";

const LeaseInfo = () => {
  const [lease, setLease] = useState(null);
  const [paymentList, setPaymentList] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useGlobalContext();

  const monthOrder = {
    "January": 0, "February": 1, "March": 2, "April": 3, "May": 4, "June": 5,
    "July": 6, "August": 7, "September": 8, "October": 9, "November": 10, "December": 11
  };

  const fetchData = async () => {
    if (!user) return;

    try {
      const fetchedData = await getLease(user.unit);
      setLease(fetchedData[0]);
    } catch (error) {
      console.error('Failed to fetch lease: ', error);
    }
  };

  useEffect(() => {
    fetchData();

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, [user]);

  useEffect(() => {
    if (lease) {
      setPaymentList(lease.payments);
    }
  }, [lease]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData().then(() => setRefreshing(false));
  };

  if (isLoading) {
    return <LoadingScreen />;
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <View className="flex flex-row justify-end p-8">
        <LogoutButton />
      </View>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 20
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#fff"]}
            tintColor="#fff"
          />
        }
      >
        <View className="flex-grow justify-between w-full h-full px-4 my-6">
          <View className="flex-grow justify-center items-center">
            <Image
              source={images.logo}
              className="w-[300] h-auto"
              resizeMode="contain"
            />
          </View>
          <View>
            <Text className="flex-2 p-2 text-xl text-center font-pbold text-white bg-gray-800">Lease Info</Text>
            <Text className="flex-1 p-2 text-xl text-white font-psemibold bg-gray-800">Unit {lease ? lease.unit : null}</Text>
            <Text className="flex-1 p-2 text-xl text-white font-psemibold bg-gray-800">Start Date: {lease ? lease.startDate : null}</Text>
            <Text className="flex-1 p-2 text-xl text-white font-psemibold bg-gray-800">End Date: {lease ? lease.endDate : null}</Text>
            <Text className="flex-1 p-2 text-xl text-white font-psemibold bg-gray-800">Payment List:</Text>
          </View>
          {
            paymentList && Object.entries(paymentList)
              .sort((a, b) => {
                const yearMonthA = a[0].split(' ');
                const yearMonthB = b[0].split(' ');
                const yearA = parseInt(yearMonthA[1], 10);
                const yearB = parseInt(yearMonthB[1], 10);
                const monthA = monthOrder[yearMonthA[0]];
                const monthB = monthOrder[yearMonthB[0]];

                if (yearA !== yearB) {
                  return yearA - yearB;
                }
                return monthA - monthB;
              })
              .map(([month, details], index) => (
                <View key={index}>
                  <Text className="flex-1 p-2 text-l text-white bg-gray-800">----</Text>
                  <Text className="flex-1 p-2 text-l text-white bg-gray-800">{month}</Text>
                  <Text className="flex-1 p-2 text-l text-white bg-gray-800">Rent Due: ${details.rentAmount}</Text>
                  <Text className="flex-1 p-2 text-l text-white bg-gray-800">{details.isPaid.isPaid ? "Paid" : "Not Paid"}</Text>
                </View>
              ))
          }
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LeaseInfo;