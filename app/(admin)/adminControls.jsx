import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, ScrollView, Text, View, ImageBackground } from "react-native";
import { router } from "expo-router";
import { CustomButton } from "../../components";
import { images } from "../../constants";
import { useGlobalContext } from "../../context/GlobalProvider";
import { getNotices } from "../../firebase/database";
import LogoutButton from "../../components/LogoutButton";
import LoadingScreen from "../../components/LoadingScreen";

const AdminControls = () => {
    // const [isLoading, setIsLoading] = useState(true);
    const { user } = useGlobalContext();

    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         setIsLoading(false);
    //     }, 1200);

    //     return () => clearTimeout(timer);
    // }, []);

    // if (isLoading) {
    //     return (
    //         <LoadingScreen />
    //     )
    // };

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
                <Text className="font-pmedium text-2xl text-gray-100 mx-5 my-10">
                    Admin Control Panel
                </Text>
                <ScrollView>
                    {
                        user && user.isAdmin &&
                        <CustomButton
                            title="Go to Admin Chat"
                            handlePress={() => router.push("/adminChatSelect")}
                            containerStyles="w-full mb-2"
                        />
                    }
                    {user && user.isAdmin &&
                        <CustomButton
                            title="Update Maintenance Requests"
                            handlePress={() => router.push("/updateMaintenanceRequest")}
                            containerStyles="w-full mb-2"
                        />
                    }
                    {
                        user && user.isAdmin &&
                        <CustomButton
                            title="View Payment Lists"
                            handlePress={() => router.push("/updatePaymentList")}
                            containerStyles="w-full mb-2"
                        />
                    }
                    {
                        user && user.isAdmin &&
                        <CustomButton
                            title="Create Notice"
                            handlePress={() => router.push("/createNotice")}
                            containerStyles="w-full mb-2"
                        />
                    }
                    {
                        user && user.isAdmin &&
                        <CustomButton
                            title="Create Lease"
                            handlePress={() => router.push("/createLease")}
                            containerStyles="w-full mb-2"
                        />
                    }
                </ScrollView>
            </ImageBackground>
        </SafeAreaView>
    );
};

export default AdminControls;