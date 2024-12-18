import React, { createContext, useContext, useEffect, useRef } from 'react';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as Device from "expo-device";
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';
import { updateUserPushToken } from '../firebase/database';
import { useGlobalContext } from "./GlobalProvider";

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

const NotificationProvider = ({ children, userId }) => {
  const { user } = useGlobalContext();
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

    TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, ({ data: { notification }, error }) => {
      if (error) {
        console.error(error);
        return;
      }
      console.log('Received a notification in the background:', notification);
    });

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log("Notification Received:", notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("Notification Clicked:", response);
      const { data } = response.notification.request.content;
      console.log("response data: ", data.type);

      switch (data.type) {
        case "chat":
          router.push("/chat");
          break;
        case "maintenance":
          router.push("/overview");
          break;
        default:
          router.push("/home");
          break;
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    if (user?.uid) {
      const handleTokenUpdate = async () => {
        try {
          const expoPushToken = await registerForPushNotificationsAsync();
          await updateUserPushToken(user.uid, expoPushToken);
          console.log("Expo Push Token Updated!");
        } catch (error) {
          console.error("Error updating push token:", error);
        }
      };

      handleTokenUpdate();
    }
  }, [user]);

  const handleRegistrationError = (errorMessage) => {
    console.log(errorMessage);
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

      if (!finalStatus.granted) {
        const status = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (!finalStatus.granted) {
        console.log("Permission not granted");
        handleRegistrationError("Permission not granted to get push token for push notification!");
        return;
      }

      // const projectID = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      const projectID = Constants.expoConfig.extra.eas.projectId;
      if (!projectID) {
        console.log("Project ID not found");
        handleRegistrationError("Project ID not found");
      }
      try {
        const tokenData = await Notifications.getExpoPushTokenAsync({ projectId: projectID });
        const pushToken = tokenData.data;
        return pushToken;
      } catch (error) {
        console.log("Error getting push token using project id");
        handleRegistrationError(`${error}`);
      }
    } else {
      console.log("Must use physical device for push notifications");
      handleRegistrationError("Must use physical device for push notifications");
    }
  }

  return (
    <NotificationContext.Provider value={{}}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;