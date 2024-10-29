import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Loader } from "../../components";
import { useGlobalContext } from "../../context/GlobalProvider";

const AdminLayout  = () => {
  const { loading, isLogged, user } = useGlobalContext();
  
  if (!loading && !isLogged) return <Redirect href="/sign-in" />;
  if (!loading && !user.isAdmin) return <Redirect href="/home" />;

  return (
    <>
      <Stack>
        <Stack.Screen
          name="createNotice"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="createLease"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="updateMaintenanceRequest"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="updatePaymentList"
          options={{
            headerShown: false,
          }}
        />
      </Stack>

      <Loader isLoading={loading} />
      <StatusBar backgroundColor="#161622" style="light" />
    </>
  );
};

export default AdminLayout;
