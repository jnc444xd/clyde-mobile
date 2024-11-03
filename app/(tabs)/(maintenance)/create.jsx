import { useState, useEffect } from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
// import Video from "react-native-video";
import * as ImagePicker from 'expo-image-picker';
import Constants from "expo-constants";
import { View, Text, ScrollView, Dimensions, Alert, Image, Switch, TouchableOpacity, TextInput } from "react-native";
import { images, icons } from "../../../constants";
import { addMaintenanceRequest } from "../../../firebase/database";
import { uploadPhoto, getFileUrl, deleteImage } from "../../../firebase/storage";
import { CustomButton, FormField } from "../../../components";
import { useGlobalContext } from "../../../context/GlobalProvider";

const DayButton = ({ day, onSelect, isSelected }) => (
  <TouchableOpacity onPress={() => onSelect(day)}>
    <Text
      style={isSelected ? { color: "#FDDA0D" } : { color: "white" }}
      className="text-[16px] mt-10 font-psemibold"
    >
      {day}
    </Text>
  </TouchableOpacity>
);

const Create = () => {
  const [imagePaths, setImagePaths] = useState([]);
  const [imageRef, setImageRef] = useState([]);
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    description: "",
    location: ""
  });
  const [days, setDays] = useState({
    Monday: { selected: false, note: "" },
    Tuesday: { selected: false, note: "" },
    Wednesday: { selected: false, note: "" },
    Thursday: { selected: false, note: "" },
    Friday: { selected: false, note: "" },
    Saturday: { selected: false, note: "" },
    Sunday: { selected: false, note: "" },
  });
  const [isUrgent, setIsUrgent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const { user, loading, isLogged } = useGlobalContext();
  const unitNumber = user ? user.unit : null;
  const creatorID = user ? user.uid : null;
  const adminUID = Constants.expoConfig.extra.adminUID;

  if (!loading && !isLogged) return <Redirect href="/sign-in" />;

  const toggleSwitch = () => setIsUrgent(previousState => !previousState);

  const toggleDaySelection = (day) => {
    setDays(prevDays => ({
      ...prevDays,
      [day]: {
        ...prevDays[day],
        selected: !prevDays[day].selected
      }
    }));
  };

  const handleNoteChange = (text, day) => {
    setDays(prevDays => ({
      ...prevDays,
      [day]: {
        ...prevDays[day],
        note: text
      }
    }));
  };

  const handleDeleteImage = (index, ref) => {
    setImagePaths(currentImages => currentImages.filter((_, i) => i !== index));

    try {
      deleteImage(ref);
      console.log("Image deleted successfully");
    } catch (error) {
      console.error("Failed to delete image:", error);
    }
  };

  // User take photo to upload
  const takePhoto = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

    if (cameraPermission.granted) {
      const photoResult = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [3, 3],
        quality: 0,
      });

      if (!photoResult.canceled) {
        setIsLoading(true);
        const uploadResult = await uploadPhoto(photoResult, user.accountID);
        if (uploadResult) {
          setImageRef(prevRefs => [...prevRefs, uploadResult.storageRef]);
        }
        setTimeout(() => {
          setIsLoading(false);
          setUploadSuccess(true);
        }, 3000);
      }
    } else {
      Alert.alert("Camera Permission", "Camera permission is required to take photos!");
    }
  };

  const fetchImageURL = async (storageRef) => {
    try {
      const url = await getFileUrl(storageRef);
      return url;
    } catch (error) {
      console.error("Failed to download URL:", error);
      throw new Error("Failed to fetch image URL");
    }
  };

  const fetchAllImageURLs = async () => {
    if (imageRef.length === 0) return;

    try {
      const promises = imageRef.map(ref => fetchImageURL(ref));
      const results = await Promise.all(promises);
      setImagePaths(results);
      console.log("All images have been successfully loaded!");
    } catch (error) {
      console.error("Error fetching image URLs:", error);
      Alert.alert("Error", "Failed to fetch all image URLs.");
    }
  };

  useEffect(() => {
    fetchAllImageURLs();
  }, [imageRef]);

  const submit = async () => {
    if (form.description === "" || form.location === "") {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // Check which days are available
    const processDays = (daysObject) => {
      const selectedDays = Object.entries(daysObject)
        .filter(([day, details]) => details.selected)
        .map(([day, details]) => (`${day}: ${details.note}`));

      return selectedDays;
    };

    const availableDays = processDays(days);

    if (!availableDays.length > 0) {
      Alert.alert("Error", "Please select at least one available day and time");
      return;
    }

    try {
      const currentDate = new Date().toLocaleDateString("en-US", { year: 'numeric', month: '2-digit', day: '2-digit' });

      const maintenanceRequestData = {
        unit: unitNumber,
        description: form.description,
        location: form.location,
        availability: availableDays,
        urgent: isUrgent,
        media: imagePaths,
        isComplete: false,
        createdAt: currentDate,
        scheduled: false,
        arrivalWindow: "",
        arrivalNotes: "",
        invoicePaid: false,
        adminID: adminUID,
        creatorID: creatorID
      };
      const result = await addMaintenanceRequest(maintenanceRequestData);

      if (result) {
        Alert.alert("Request submitted successfully!");
      }

      router.replace("/overview");
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
          className="w-full h-full flex justify-center h-full px-4"
        >
          <Image
            source={images.logo}
            resizeMode="contain"
            className="w-[200] h-[200]"
          />
          <Text className="text-2xl text-white font-psemibold">
            Maintenance Request Form:
          </Text>
          <View>
            <Text className="text-[16px] text-white mt-10 font-psemibold">Urgent?{"\n"}</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isUrgent ? "#f5dd4b" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={isUrgent}
            />
          </View>
          <FormField
            title="Description"
            value={form.description}
            handleChangeText={(e) => setForm({ ...form, description: e })}
            otherStyles="mt-7"
          />
          <FormField
            title="Location (ex. 2nd Floor Bathroom)"
            value={form.location}
            handleChangeText={(e) => setForm({ ...form, location: e })}
            otherStyles="mt-7"
          />
          <Text className="text-[16px] text-white mt-10 font-psemibold">
            ----{"\n"}{"\n"}
            Please Select Availability:
          </Text>
          {Object.keys(days).map(day => (
            <View key={day}>
              <DayButton
                day={day}
                onSelect={toggleDaySelection}
                isSelected={days[day].selected}
              />
              {days[day].selected && (
                <TextInput
                  className="text-[16px] text-[#949392] mt-10 font-psemibold"
                  onChangeText={(text) => handleNoteChange(text, day)}
                  value={days[day].note}
                  placeholder="Please specify availability times"
                  placeholderTextColor="#949392"
                />
              )}
            </View>
          ))}
          <Text className="text-[16px] text-white mt-10 font-psemibold">
            ----
          </Text>
          {
            uploadSuccess &&
            <View className="w-full flex-row justify-center mb-4">
              <Text className="text-xl text-white font-psemibold">Upload Successful!</Text>
            </View>
          }
          {
            isLoading &&
            <View className="w-full flex-row justify-center mt-4">
              <Image
                source={icons.loading}
                className="w-[50] h-[50]"
                resizeMode="contain"
              />
            </View>
          }
          {
            !isLoading &&
            !uploadSuccess &&
            <View className="w-full flex-row justify-center">
              <CustomButton
                title="Upload Photo"
                handlePress={takePhoto}
                containerStyles="mt-7 w-[200]"
              />
            </View>
          }
          {
            !isLoading &&
            uploadSuccess &&
            <View className="w-full flex-row justify-center">
              <CustomButton
                title="Upload Additional"
                handlePress={takePhoto}
                containerStyles="mt-7 w-[200]"
              />
            </View>
          }
          {/* <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className="flex-row">
            {imagePaths && imagePaths.length > 0 && imagePaths.map((item, index) => (
              <View key={index}>
                <Image
                  source={{ uri: item.uri }}
                  style={{ width: 100, height: 100, margin: 10 }}
                />
                <Button title="x" onPress={() => handleDeleteImage(index, item.ref)} />
              </View>
            ))}
          </ScrollView> */}
          <View className="w-full flex-row justify-center">
            <CustomButton
              title="Submit"
              handlePress={submit}
              containerStyles="mt-7 w-[100]"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Create;