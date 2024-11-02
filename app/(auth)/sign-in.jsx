import { useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image, ImageBackground } from "react-native";
import { images } from "../../constants";
import { CustomButton, FormField } from "../../components";
import { useGlobalContext } from "../../context/GlobalProvider";
import { signIn } from "../../firebase/auth";

const SignIn = () => {
  const { setUser, setIsLogged } = useGlobalContext();
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const submit = async () => {
    if (form.email === "" || form.password === "") {
      Alert.alert("Error", "Please fill in all fields");
    }

    setSubmitting(true);

    try {
      await signIn(form.email, form.password);
      setIsLogged(true);

      console.log("Success", "User signed in successfully");
      router.replace("/home");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ImageBackground
        source={images.altBackground}
        className="flex-1"
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <ScrollView className="flex-1 px-4">
          <View className="flex items-center justify-center mt-[100]">
            <View className="flex-row justify-start w-full ml-4">
              <Image
                source={images.logoSmall}
                resizeMode="contain"
                className="w-[100px] h-[100px] mb-[50]"
              />
            </View>
            <View className="flex-row justify-start items-start w-full">
              <Text className="text-2xl font-semibold text-white mb-3">
                Welcome home! 👋
              </Text>
            </View>
            <FormField
              title="Email"
              value={form.email}
              handleChangeText={(e) => setForm({ ...form, email: e })}
              otherStyles="mt-4"
              keyboardType="email-address"
            />
            <FormField
              title="Password"
              value={form.password}
              handleChangeText={(e) => setForm({ ...form, password: e })}
              otherStyles="mt-4"
            />
            <CustomButton
              title="Sign In"
              handlePress={submit}
              containerStyles="mt-4 w-full"
              isLoading={isSubmitting}
            />
            <View className="flex-row justify-center mt-5">
              <Text className="text-lg text-gray-100">
                Don't have an account?
              </Text>
              <Link
                href="/sign-up"
                className="text-lg text-secondary font-semibold"
              >
                Signup
              </Link>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default SignIn;
