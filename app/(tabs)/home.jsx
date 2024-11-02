import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, ScrollView, Text, View, RefreshControl, ImageBackground } from "react-native";
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
    }, 1200);

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
    <SafeAreaView className="bg-primary h-full flex-1">
      <ImageBackground
        source={images.altBackground}
        className="flex-1"
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <LogoutButton
          additionalStyles={{ marginLeft: 32, marginTop: 32, marginBottom: 32 }}
        />
        <View className="flex-row justify-start w-full ml-6">
          <Image
            source={images.logoSmall}
            resizeMode="contain"
            className="w-[100px] h-[100px] mt-10"
          />
        </View>
        <View className="flex items-center">
          {
            user && user.isAdmin &&
            <CustomButton
              title="Admin Control Panel"
              handlePress={() => router.push("/adminControls")}
              containerStyles="w-[250px] mt-10 p-2"
            />
          }
        </View>
        <Text className="font-pmedium text-2xl text-gray-100 mx-5 my-10">
          Hi {user ? user.fullName : `There`} 👋
        </Text>
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
          <View className="flex-grow justify-between w-full h-full px-4">
            <ScrollView
              contentContainerStyle={{
                height: "100%",
              }}
            >
              <View className="min-w-full">
                <View className="flex-row w-full">
                  <Text className="flex-2 p-2 text-2xl text-center font-bold text-white">Notices</Text>
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
      </ImageBackground>
    </SafeAreaView>
  );
};

export default Home;