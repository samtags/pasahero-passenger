import {
  Stack,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import Text from "../../src/components/text";
import Messaging from "../../src/screens/messaging/[transit]";
import { TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import useGetDriver from "../../src/services/queries/useGetDriver";
import { useEffect } from "react";

export default function Entry(props) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { data: driver } = useGetDriver(params?.driver_id);

  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      // e.preventDefault(); // Prevent default action (navigation back)
      // redirect to the match request screen
      // Saving this for future cases.
      // Custom logic before going back
      // Alert.alert("Confirm exit", "Do you want to go back?", [
      //   { text: "Cancel", style: "cancel", onPress: () => {} },
      //   {
      //     text: "Yes",
      //     style: "destructive",
      //     onPress: () => navigation.dispatch(e.data.action),
      //   },
      // ]);
    });

    // Clean up the event listener on unmount
    return unsubscribe;
  }, [navigation]);

  function handlePressCall() {
    router.navigate({
      pathname: "/call/dial",
      params: {
        roomId: params?.driver_id,
      },
    });
  }

  return (
    <>
      <Stack.Screen
        options={{
          animation: "ios",
          headerTitle: () => (
            <Text size={19} weight="bold" color="#353579">
              {driver?.display_name}
            </Text>
          ),
          headerTitleAlign: "center",
          headerRight: () => (
            <TouchableOpacity onPress={handlePressCall}>
              <View
                style={{
                  backgroundColor: "#EFEFEF",
                  height: 40,
                  width: 40,
                  borderRadius: 9,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  style={{ width: 22, height: 22 }}
                  source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FPhone.png?alt=media&token=f27c1ca8-c601-4f37-905c-61ac9ab0c9e5"
                />
              </View>
            </TouchableOpacity>
          ),
        }}
      />
      <Messaging />
    </>
  );
}
