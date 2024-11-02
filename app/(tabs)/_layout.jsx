import { StatusBar } from "expo-status-bar";
import { Redirect, Tabs } from "expo-router";
import { Image, Text, View, Platform, Alert } from "react-native";
import { icons } from "../../constants";
import { Loader } from "../../components";
import { useGlobalContext } from "../../context/GlobalProvider";
import MaintenanceLayout from "./(maintenance)/_layout";

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View className="flex items-center justify-center gap-2">
      <Image
        source={icon}
        resizeMode="contain"
        tintColor={color}
        className="w-6 h-6"
      />
      <Text
        className={`${focused ? "font-psemibold" : "font-pregular"} text-xs mr-4`}
        style={{ color: "#FFFFFF" }}
      >
        {name}
      </Text>
    </View>
  );
};

const TabLayout = () => {
  const { user, loading, isLogged } = useGlobalContext();

  if (!loading && !isLogged) return <Redirect href="/sign-in" />;

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#FFA001",
          tabBarInactiveTintColor: "#CDCDE0",
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "#161622",
            borderTopWidth: 0,
            borderTopColor: "#FFF",
            height: 85,
            paddingTop: 35,
            // paddingBottom: 10,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon
                icon={icons.home}
                // color={color}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: "Chat",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon
                icon={icons.chat}
                // color={color}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="(maintenance)"
          element={<MaintenanceLayout />}
          options={{
            title: "Maintenance",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon
                icon={icons.maintenance}
                // color={color}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="lease"
          options={{
            title: "Lease",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon
                icon={icons.lease}
                // color={color}
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
};

export default TabLayout;
