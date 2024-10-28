import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { CustomButton } from "../../components";
import { images } from "../../constants";
import { useGlobalContext } from "../../context/GlobalProvider";
import { getLease } from "../../firebase/database";
import LogoutButton from "../../components/LogoutButton";

const LeaseInfo = () => {
  const [lease, setLease] = useState([]);
  const { user } = useGlobalContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedData = await getLease(user.unit);
        setLease(fetchedData[0]);
      } catch (error) {
        console.error('Failed to fetch lease: ', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    console.log(lease)
  }, [lease]);

  // const [refreshing, setRefreshing] = useState(false);

  // const onRefresh = async () => {
  //   setRefreshing(true);
  //   await refetch();
  //   setRefreshing(false);
  // };

  // const logout = async () => {
  //   await signOutUser();
  //   setUser(null);
  //   setIsLogged(false);

  //   router.replace("/sign-in");
  // };

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
      >
        <View className="flex-grow justify-between w-full h-full px-4 my-6">
          <View className="flex-grow justify-center items-center">
            <Image
              source={images.logo}
              className="w-[520px] h-[336px]"
              resizeMode="contain"
            />
          </View>
          {
            user && user.isAdmin &&
            <CustomButton
              title="Create Lease"
              handlePress={() => router.push("/createLease")}
              containerStyles="w-full"
            />
          }
          <Text className="flex-2 p-2 text-xl text-center font-pbold text-white bg-gray-800">Lease Info</Text>
          <Text className="flex-1 p-2 text-xl text-white font-psemibold bg-gray-800">Unit {lease.unit}</Text>
          <Text className="flex-1 p-2 text-xl text-white font-psemibold bg-gray-800">Start Date: {lease.startDate}</Text>
          <Text className="flex-1 p-2 text-xl text-white font-psemibold bg-gray-800">End Date: {lease.endDate}</Text>
          <Text className="flex-1 p-2 text-xl text-white font-psemibold bg-gray-800">Payment List:</Text>
          {
            lease && lease.payments.map((item, index) => (
              <>
                <Text className="flex-1 p-2 text-l text-white bg-gray-800">{item.month}</Text>
                <Text className="flex-1 p-2 text-l text-white bg-gray-800">Rent Due: ${item.rentAmount}</Text>
                <Text className="flex-1 p-2 text-l text-white bg-gray-800">{item.isPaid ? "Paid" : "Not Paid"}</Text>
                <Text className="flex-1 p-2 text-l text-white bg-gray-800">----</Text>
              </>
            ))
          }
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LeaseInfo;