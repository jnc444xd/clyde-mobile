import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { images } from '../constants';

const LoadingScreen = () => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.5,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1.5,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                })
            ]),
            {
                iterations: 1
            }
        ).start();
    }, []);

    return (
        <View className="flex-1 items-center justify-center bg-[#151521]">
            <Animated.Image
                source={images.logoNoText}
                style={{
                    width: 150,
                    height: 150,
                    transform: [{ scale: scaleAnim }]
                }}
                resizeMode="contain"
            />
        </View>
    );
};

export default LoadingScreen;