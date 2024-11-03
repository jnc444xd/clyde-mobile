import { useState } from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image, ImageBackground } from "react-native";
import { images } from "../../constants";
import { addNotice } from "../../firebase/database";
import { CustomButton, FormField } from "../../components";
// import { useGlobalContext } from "../../context/GlobalProvider";

const createNotice = () => {
    // const { user, isLogged, isAdmin } = useGlobalContext();

    const [isSubmitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        title: "",
        message: ""
    });

    const submit = async () => {
        if (form.title === "" || form.message === "") {
            Alert.alert("Error", "Please fill in all fields");
        }

        setSubmitting(true);
        try {
            const timeStamp = new Date().toLocaleString("en-US", {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            const noticeData = {
                title: form.title,
                message: form.message,
                createdAt: timeStamp
            };
            const result = await addNotice(noticeData);
            Alert.alert("Notice created successfully")
            router.replace("/home");
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView className="bg-primary h-full flex-1">
            <ImageBackground
                source={images.altBackground}
                className="flex-1"
                style={{ flex: 1 }}
                resizeMode="cover"
            >
                <ScrollView>
                    <View className="w-full flex justify-center h-full px-4 mt-[100]">
                        <Text className="text-2xl font-semibold text-white mt-10 font-psemibold">
                            Create notice:
                        </Text>
                        <FormField
                            title="Title"
                            value={form.title}
                            handleChangeText={(e) => setForm({ ...form, title: e })}
                            otherStyles="mt-7"
                        />
                        <FormField
                            title="Message"
                            value={form.message}
                            handleChangeText={(e) => setForm({ ...form, message: e })}
                            otherStyles="mt-7"
                        />
                        <CustomButton
                            title="Save"
                            handlePress={submit}
                            containerStyles="mt-7"
                            isLoading={isSubmitting}
                        />
                    </View>
                </ScrollView>
            </ImageBackground>
        </SafeAreaView>
    );
};

export default createNotice;