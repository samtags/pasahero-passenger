import { Link, useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Button,
  Alert,
} from "react-native";
import useMatch from "../../services/supabase/realtime/useMatch";
import Optional from "../../components/optional";
import useOnUpdate from "../../services/hooks/useOnUpdate";
import useGetEstimate from "../../services/queries/useGetEstimate";
import { ServiceCard } from ".";

export default function Match() {
  const router = useRouter();

  const params = useLocalSearchParams();
  const match = useMatch(params.id);

  const origin = `${match?.first_point?.latitude},${match?.first_point?.longitude}`;
  const destination = `${match?.last_point?.latitude},${match?.last_point?.longitude}`;

  const { data: angkasPassenger } = useGetEstimate("AngkasPassenger", origin, destination); // prettier-ignore
  const { data: joyRideMcTaxi } = useGetEstimate("JoyRideMcTaxi", origin, destination); // prettier-ignore
  const { data: moveItMotoTaxi } = useGetEstimate("MoveItMotoTaxi", origin, destination); // prettier-ignore

  useOnUpdate(() => {
    if (match?.status === "DONE") {
      Alert.alert(
        "Trip completed",
        "You have now arrived in your destination."
      );

      router.navigate("/");
    }
  }, [match?.status]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ gap: 8, flex: 1 }}>
          <Optional condition={match?.status === "REQUESTED"}>
            <Text style={{ fontSize: 24 }}>Searching</Text>
            <Text>Finding the best match for your request</Text>
            <View style={{ marginVertical: 24 }}>
              <Text>{match?.first_point?.long_address}</Text>
              <Text>{match?.last_point?.long_address}</Text>
            </View>
            <Text>{generateRandomNumber()} drivers nearby</Text>
            <Optional condition={Boolean(angkasPassenger)}>
              <ServiceCard
                serviceName="Angkas Passenger"
                minFare={angkasPassenger?.fare.minFare}
                maxFare={angkasPassenger?.fare.maxFare}
                currency={angkasPassenger?.fare.currency}
                onPress={() => {
                  console.log("AngkasPassenger");
                }}
              />
            </Optional>

            <Optional condition={Boolean(joyRideMcTaxi)}>
              <ServiceCard
                serviceName="JoyRide MC Taxi"
                minFare={joyRideMcTaxi?.fare.minFare}
                maxFare={joyRideMcTaxi?.fare.maxFare}
                currency={joyRideMcTaxi?.fare.currency}
                onPress={() => {
                  console.log("JoyRideMcTaxi");
                }}
              />
            </Optional>
            <Optional condition={Boolean(moveItMotoTaxi)}>
              <ServiceCard
                serviceName="Move It MotoTaxi"
                minFare={moveItMotoTaxi?.fare.minFare}
                maxFare={moveItMotoTaxi?.fare.maxFare}
                currency={moveItMotoTaxi?.fare.currency}
                onPress={() => {
                  console.log("MoveItMotoTaxi");
                }}
              />
            </Optional>
          </Optional>

          <Optional condition={match?.status === "FOUND"}>
            <Text style={{ fontSize: 24 }}>Your driver is on the way</Text>

            <Link href={`/messaging/${params.id}`}>
              <Text>Send Message</Text>
            </Link>
          </Optional>

          <Optional condition={match?.status === "ARRIVED"}>
            <Text style={{ fontSize: 24 }}>Your driver has arrived</Text>
          </Optional>

          <Optional condition={match?.status === "STARTED"}>
            <Text style={{ fontSize: 24 }}>Your trip has started</Text>
            <Text>Enjoy your ride!</Text>
          </Optional>
        </View>
        <Optional condition={match?.status === "REQUESTED"}>
          <Button color="#6b7280" title="Cancel" />
        </Optional>
        <Optional condition={match?.status === "ARRIVED"}>
          <Button color="#6b7280" title="Transfer trip to the app" />
        </Optional>
        <Optional condition={match?.status === "STARTED"}>
          <Button color="#6b7280" title="Share your ride" />
        </Optional>
      </SafeAreaView>
    </View>
  );
}

function generateRandomNumber() {
  return Math.floor(Math.random() * 7) + 1;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "whitesmoke",
    padding: 24,
  },
  button: {
    backgroundColor: "gainsboro",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});
