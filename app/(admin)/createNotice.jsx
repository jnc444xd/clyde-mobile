import { useState } from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";
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
            const noticeData = {
                title: form.title,
                message: form.message
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
        <SafeAreaView className="bg-primary h-full">
            <ScrollView>
                <View
                    className="w-full flex justify-center h-full px-4 my-6"
                >
                    <Image
                        source={images.logo}
                        resizeMode="contain"
                        className="w-[460] h-[136px]"
                    />

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
        </SafeAreaView>
    );
};

export default createNotice;