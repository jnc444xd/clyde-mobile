import React from "react";
import { router } from "expo-router";
import { TouchableOpacity, Image, Alert } from "react-native";
import { signOutUser } from "../firebase/auth";
import { useGlobalContext } from "../context/GlobalProvider";

const LogoutButton = ({ additionalStyles }) => {
    const { setUser, setIsLogged } = useGlobalContext();

    const handleLogout = async () => {
        await signOutUser();
        setUser(null);
        setIsLogged(false);

        router.replace("/sign-in");
    };

    return (
        <TouchableOpacity onPress={handleLogout} style={additionalStyles}>
            <Image
                source={require('../assets/icons/logout.png')}
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
            />
        </TouchableOpacity>
    );
};

export default LogoutButton;