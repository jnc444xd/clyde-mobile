import { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform, Alert } from 'react-native';
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { app } from '../firebase/config';
import Constants from 'expo-constants';
import GlobalProvider from "../context/GlobalProvider";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, ({ data: { notification }, error }) => {
  if (error) {
    console.error(error);
    return;
  }
  console.log('Received a notification in the background:', notification);
  // Optionally handle notification data here, like scheduling local notifications
});

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
    // Return a splash screen or loader
  }

  if (!fontsLoaded && !error) {
    return null;
    // Return a splash screen or loader
  }

  useEffect(() => {
    const setupNotifications = async () => {
      const expoPushToken = await registerForPushNotificationsAsync();
      console.log("Expo Push Token:", expoPushToken);
      // Add function to update push token field in users collection

      Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

      const notificationListener = Notifications.addNotificationReceivedListener(notification => {
        console.log("Notification Received:", notification);
      });

      const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        console.log("Notification Clicked:", response);
        // Add function to handle the response (open app to specific target screen)
      });

      return () => {
        Notifications.removeNotificationSubscription(notificationListener);
        Notifications.removeNotificationSubscription(responseListener);
      };
    }

    setupNotifications();
  }, []);

  const handleRegistrationError = (errorMessage) => {
    Alert.alert(errorMessage);
    throw new Error(errorMessage);
  }

  const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const existingStatus = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const status = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        handleRegistrationError('Permission not granted to get push token for push notification!');
        return;
      }
      // Need to define projectID
      const projectID = Constants?.expoConfig?.extra?.eas?.projectID ?? Constants?.easConfig?.projectID;
      if (!projectID) {
        handleRegistrationError('Project ID not found');
      }
      try {
        const pushTokenString = (await Notifications.getExpoPushTokenAsync(projectID)).data;
        console.log(pushTokenString);
        return pushTokenString;
      } catch (error) {
        handleRegistrationError(`${error}`);
      }
    } else {
      handleRegistrationError('Must use physical device for push notifications');
    }
  }

  return (
    <GlobalProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </GlobalProvider>
  );
};

export default RootLayout;
