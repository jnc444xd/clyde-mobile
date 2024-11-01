import { View, Image } from 'react-native';

const LoadingScreen = () => {
    return (
        <View className="flex-1 w-full h-full items-center justify-center bg-[#151521]">
            <Image
                source={require("../assets/images/clyde-pop.gif")}
                className="w-64 h-64"
                resizeMode="contain"
            />
        </View>
    )
};

export default LoadingScreen;