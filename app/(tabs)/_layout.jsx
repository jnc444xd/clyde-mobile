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
            borderTopWidth: 1,
            borderTopColor: "#161622",
            height: 84,
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
                // icon={icons.home}
                // color={color}
                name="Home"
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
                // icon={icons.bookmark}
                // color={color}
                name="Chat"
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
                name="Maintenance"
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
                // icon={icons.profile}
                // color={color}
                name="Lease"
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>

      <Loader isLoading={loading} />
      <StatusBar backgroundColor="#161622" style="light" />
    </>
  );
};

export default TabLayout;
