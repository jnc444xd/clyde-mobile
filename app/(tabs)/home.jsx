import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, ScrollView, Text, View, RefreshControl } from "react-native";
import { router } from "expo-router";
import { CustomButton } from "../../components";
import { images } from "../../constants";
import { useGlobalContext } from "../../context/GlobalProvider";
import { getNotices } from "../../firebase/database";
import LogoutButton from "../../components/LogoutButton";
import LoadingScreen from "../../components/LoadingScreen";

const Home = () => {
  const [notices, setNotices] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useGlobalContext();

  const fetchData = async () => {
    try {
      const fetchedData = await getNotices();

      setNotices(fetchedData);
    } catch (error) {
      console.error('Failed to fetch notices: ', error);
    }
  };

  useEffect(() => {
    fetchData();

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData().then(() => setRefreshing(false));
  };

  if (isLoading) {
    return (
      <LoadingScreen />
    )
  };

  return (
    <SafeAreaView className="bg-primary">
      <View className="flex flex-row justify-end p-8">
        <LogoutButton />
      </View>
      <View className="flex-grow justify-center items-center">
        <Image
          source={images.logo}
          className="w-[300px] h-auto"
          resizeMode="contain"
        />
      </View>
      <Text className="font-pmedium text-xl text-gray-100">
        Hi {user ? user.fullName : `There`} 👋
      </Text>
      {
        user && user.isAdmin &&
        <CustomButton
          title="Go to Admin Chat"
          handlePress={() => router.push("/adminChatSelect")}
          containerStyles="w-full"
        />
      }
      {user && user.isAdmin &&
        <CustomButton
          title="Update Maintenance Requests"
          handlePress={() => router.push("/updateMaintenanceRequest")}
          containerStyles="w-full"
        />
      }
      {
        user && user.isAdmin &&
        <CustomButton
          title="View Payment Lists"
          handlePress={() => router.push("/updatePaymentList")}
          containerStyles="w-full"
        />
      }
      {
        user && user.isAdmin &&
        <CustomButton
          title="Create Notice"
          handlePress={() => router.push("/createNotice")}
          containerStyles="w-full"
        />
      }
      {
        user && user.isAdmin &&
        <CustomButton
          title="Create Lease"
          handlePress={() => router.push("/createLease")}
          containerStyles="w-full"
        />
      }
      <ScrollView
        contentContainerStyle={{
          height: "100%",
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <View className="flex-grow justify-between w-full h-full px-4 my-6">
          <ScrollView
            contentContainerStyle={{
              height: "100%",
            }}
          >
            <View className="min-w-full">
              <View className="flex-row">
                <Text className="flex-2 p-2 text-xl text-center font-bold text-white bg-gray-800">Notices</Text>
              </View>
              {notices && notices.map((item, index) => (
                <View key={index}>
                  <View className="flex-row">
                    <Text className="flex-1 p-2 text-xl text-white bg-gray-800">{item.title}</Text>
                  </View>
                  <View className="flex-row">
                    <Text className="flex-1 p-2 text-white bg-gray-800">{item.message}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;