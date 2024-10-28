// import { useState, useEffect } from "react";
// import { View, Text, ScrollView } from "react-native";
// import { getMaintenanceRequests } from "../../../firebase/database";
// import { useGlobalContext } from "../../../context/GlobalProvider";

// const MaintenanceOverview = () => {
//     const [maintenanceData, setMaintenanceData] = useState([]);
//     const { user } = useGlobalContext();
//     const unitNumber = user.unit;

//     useEffect(async () => {
//         const fetchedData = await getMaintenanceRequests(unitNumber);
//         setMaintenanceData(fetchedData);
//     }, [maintenanceData]);

//     useEffect(() => {
//         console.log(maintenanceData);
//     }, [maintenanceData]);

//     return (
//         <ScrollView className="flex-1 p-4">
//             <View className="flex-row border-b border-black pb-1 mb-4">
//                 <Text className="flex-1 text-center font-bold">Urgent?</Text>
//                 <Text className="flex-1 text-center font-bold">Description</Text>
//                 <Text className="flex-1 text-center font-bold">Location</Text>
//                 <Text className="flex-1 text-center font-bold">Availability</Text>
//                 <Text className="flex-1 text-center font-bold">Image Reference</Text>
//                 <Text className="flex-1 text-center font-bold">Status</Text>
//             </View>
//             {maintenanceData && maintenanceData.map((item, index) => (
//                 <View key={index} className="flex-row py-2.5 border-b border-gray-300">
//                     <Text className="flex-1 text-center">{item.urgent}</Text>
//                     <Text className="flex-1 text-center">{item.description}</Text>
//                     <Text className="flex-1 text-center">{item.location}</Text>
//                     <Text className="flex-1 text-center">{item.availability}</Text>
//                     <Text className="flex-1 text-center">{item.media}</Text>
//                     <Text className="flex-1 text-center">{item.isComplete}</Text>
//                 </View>
//             ))}
//         </ScrollView>
//     )
// };

// export default MaintenanceOverview;