import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, ScrollView, Text, View, RefreshControl, ImageBackground, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { CustomButton } from "../../components";
import { images } from "../../constants";
import { useGlobalContext } from "../../context/GlobalProvider";
import { getNotices, deleteNotice } from "../../firebase/database";
import LogoutButton from "../../components/LogoutButton";
import LoadingScreen from "../../components/LoadingScreen";

const Home = () => {
  const [notices, setNotices] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  // const [isLoading, setIsLoading] = useState(true);

  const { user } = useGlobalContext();

  const fetchData = async () => {
    try {
      const fetchedData = await getNotices();
      console.log(fetchedData);
      const sortedData = fetchedData.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setNotices(sortedData);
    } catch (error) {
      console.error('Failed to fetch notices: ', error);
    }
  };

  useEffect(() => {
    fetchData();

    // const timer = setTimeout(() => {
    //   setIsLoading(false);
    // }, 1200);

    // return () => clearTimeout(timer);
  }, [notices]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData().then(() => setRefreshing(false));
  };

  const handleDeleteNotice = (noticeID) => {
    try {
      deleteNotice(noticeID);
      console.log("Notice deleted successfully");
    } catch (error) {
      console.error("Failed to delete notice: ", error);
    }
  };

  // if (isLoading) {
  //   return (
  //     <LoadingScreen />
  //   )
  // };

  return (
    <SafeAreaView className="bg-primary flex-1">
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
            className="w-[100px] h-[100px] mt-5"
          />
        </View>
        {
          user && user.isAdmin &&
          <View className="flex items-center">
            <CustomButton
              title="Admin Control Panel"
              handlePress={() => router.push("/adminControls")}
              containerStyles="w-[250px] mt-10 p-2"
            />
          </View>
        }
        <Text className="font-pmedium text-2xl text-gray-100 mx-5 mb-6 mt-10">
          Hi {user ? user.fullName : `There`} 👋
        </Text>
        <View className="flex-row w-full mx-4">
          <Text className="flex-2 p-2 text-2xl text-center font-pbold text-white">Notices</Text>
        </View>
        <View className="flex-1 justify-between w-full h-full px-4">
          <ScrollView
            className="flex-1"
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
            <View className="w-full">
              {
                notices &&
                notices.length > 0 &&
                notices.map((item) => (
                  <View key={item.id}>
                    <View className="flex-row">
                      <Text className="flex-1 p-2 text-xl text-white bg-gray-800 font-pbold">{item.title}</Text>
                    </View>
                    <View className="flex-row">
                      <Text className="flex-1 p-2 text-white bg-gray-800 font-pregular">{item.message}</Text>
                    </View>
                    {
                      user && user.isAdmin &&
                      <View className="flex-row justify-center items-center w-full">
                        <TouchableOpacity
                          onPress={() => handleDeleteNotice(item.id)}
                          className="bg-gray-800 w-full pb-2"
                        >
                          <Text className="text-[16px] text-white text-center font-psemibold">Delete</Text>
                        </TouchableOpacity>
                      </View>
                    }
                  </View>
                ))
              }
              {
                notices &&
                notices.length === 0 &&
                <View className="flex-row">
                  <Text className="flex-1 p-2 text-xl text-white bg-gray-800 font-pregular">No new notics at this time!</Text>
                </View>
              }
            </View>
          </ScrollView>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default Home;