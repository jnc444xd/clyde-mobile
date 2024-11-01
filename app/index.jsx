import { Redirect, router } from "expo-router";
import { View, Image, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../constants";
import { CustomButton } from "../components";
import { useGlobalContext } from "../context/GlobalProvider";

const Welcome = () => {
  const { loading, isLogged } = useGlobalContext();

  if (!loading && isLogged) return <Redirect href="/home" />;

  return (
    <SafeAreaView className="bg-primary h-full">
      <ImageBackground
        source={images.background}
        className="flex-1"
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View className="flex-grow justify-center items-center w-full h-full">
          <Image
            source={images.logo}
            className="w-[330] h-auto mt-[300]"
            resizeMode="contain"
          />
          <CustomButton
            title="Continue"
            handlePress={() => router.push("/sign-in")}
            containerStyles="w-[125] mb-[250]"
          />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default Welcome;
