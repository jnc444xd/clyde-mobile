import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, ScrollView, Text, View } from "react-native";
import { router, Link } from "expo-router";
import { CustomButton } from "../../components";
import { images } from "../../constants";
import { useGlobalContext } from "../../context/GlobalProvider";
import { getNotices } from "../../firebase/database";
import LogoutButton from "../../components/LogoutButton";

const Home = () => {
  const [notices, setNotices] = useState([]);
  const { user } = useGlobalContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedData = await getNotices();

        setNotices(fetchedData);
      } catch (error) {
        console.error('Failed to fetch notices: ', error);
      }
    };

    fetchData();
  }, []);

  // const [refreshing, setRefreshing] = useState(false);

  // const onRefresh = async () => {
  //   setRefreshing(true);
  //   await refetch();
  //   setRefreshing(false);
  // };

  return (
    <SafeAreaView className="bg-primary">
      <View className="flex flex-row justify-end p-8">
        <LogoutButton />
      </View>
      <View className="flex-grow justify-center items-center">
        <Image
          source={images.logo}
          className="w-[520px] h-[336px]"
          resizeMode="contain"
        />
      </View>
      <Text className="font-pmedium text-xl text-gray-100">
        Hi {user ? user.fullName : `There`} 👋
      </Text>
      {
        user && user.isAdmin &&
        <CustomButton
          title="Create Notice"
          handlePress={() => router.push("/createNotice")}
          containerStyles="w-full"
        />
      }
      <ScrollView
        contentContainerStyle={{
          height: "50%",
        }}
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