import { useState, useEffect } from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
// import Video from "react-native-video";
import * as ImagePicker from 'expo-image-picker';
import Constants from "expo-constants";
import { View, Text, ScrollView, Dimensions, Alert, Image, Button, Switch, TouchableOpacity, TextInput } from "react-native";
import { images } from "../../../constants";
import { addMaintenanceRequest } from "../../../firebase/database";
import { uploadImageFromLibrary, uploadPhoto, getFileUrl, deleteImage } from "../../../firebase/storage";
import { serverTimestamp } from "firebase/firestore";
import { CustomButton, FormField } from "../../../components";
import { useGlobalContext } from "../../../context/GlobalProvider";
import LoadingScreen from "../../../components/LoadingScreen";

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
  const [imagePath, setImagePath] = useState([]);
  // const [videoPath, setVideoPath] = useState([]);
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
  const [isLoading, setIsLoading] = useState(true);

  const { user, loading, isLogged } = useGlobalContext();
  const unitNumber = user ? user.unit : null;
  const creatorID = user ? user.uid : null;
  const adminUID = Constants.expoConfig.extra.adminUID;

  if (!loading && !isLogged) return <Redirect href="/sign-in" />;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

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
    setImagePath(currentImages => currentImages.filter((_, i) => i !== index));

    try {
      deleteImage(ref);
      console.log("Image deleted successfully");
    } catch (error) {
      console.error("Failed to delete image:", error);
    }
  };

  // User select photo to upload from library
  const selectPhoto = async () => {
    const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (libraryPermission.granted) {
      const uploadResult = await uploadImageFromLibrary(user.accountID);
      // const downloadUrl = await getFileUrl(uploadResult.storageRef);

      if (uploadResult && uploadResult.type.startsWith("image")) {
        const downloadUrl = await getFileUrl(uploadResult.storageRef);

        setImagePath(prevImagePaths => [
          ...prevImagePaths,
          {
            uri: downloadUrl,
            ref: uploadResult.storageRef
          }
        ]);

        Alert.alert("Upload Successful!");

      } else if (uploadResult && downloadUrl && uploadResult.type.startsWith("video")) {
        Alert.alert("Unable to upload videos at the moment, sorry!");
        // setVideoPath(prevVideoPaths => [...prevVideoPaths, downloadUrl]);

      } else {
        console.log("Upload Unsuccessful");
      }
    } else {

      console.log("Library permissions not granted");
      return;

    }
  };

  // User take photo to upload
  const takePhoto = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

    if (cameraPermission.granted) {
      const photoResult = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.1,
      });

      if (!photoResult.canceled) {
        const uploadResult = await uploadPhoto(photoResult, user.accountID);

        if (uploadResult) {
          const downloadUrl = await getFileUrl(uploadResult.storageRef);

          setImagePath(prevImagePaths => [
            ...prevImagePaths,
            {
              uri: downloadUrl,
              ref: uploadResult.storageRef
            }
          ]);

          Alert.alert("Upload Successful!");

        } else {
          console.log("Upload Unsuccessful");
        }
      }
    } else {
      Alert.alert("Camera Permission", "Camera permission is required to take photos!");
    }
  };

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

    setSubmitting(true);

    try {
      const maintenanceRequestData = {
        unit: unitNumber,
        description: form.description,
        location: form.location,
        availability: availableDays,
        urgent: isUrgent,
        media: imagePath,
        isComplete: false,
        createdAt: serverTimestamp(),
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

  if (isLoading) {
    return (
      <LoadingScreen />
    )
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View
          className="w-full flex justify-center h-full px-4 my-6"
        >
          <Image
            source={images.logo}
            resizeMode="contain"
            className="w-[460] h-[136px]"
          />
          <Text className="text-2xl text-white mt-10 font-psemibold">
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
          <Text className="text-[16px] text-white mt-10 font-psemibold">
            For reference please upload photos:{"\n"}
          </Text>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className="flex-row">
            {imagePath.length > 0 && imagePath.map((item, index) => (
              <View key={index}>
                <Image
                  source={{ uri: item.uri }}
                  style={{ width: 100, height: 100, margin: 10 }}
                />
                <Button title="x" onPress={() => handleDeleteImage(index, item.ref)} />
              </View>
            ))}
          </ScrollView>
          <Button title="Choose Image From Library" onPress={selectPhoto} />
          <Button title="Take Photo" onPress={takePhoto} />
          {/* {
            videoPath &&
            <Video
              source={{ uri: videoPath }}
              style={{ width: 200, height: 200 }}
              controls={true}
              resizeMode="contain"
              repeat={false}
              onError={(e) => console.log(e)}
            />
          } */}
          <CustomButton
            title="Submit"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Create;