import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import useMatches from "../../services/queries/useMatches";
import { router } from "expo-router";
import Text from "../../components/text";
import { Image } from "expo-image";
import getLabel from "../../services/util/status/getLabel";
import log from "../../services/log";
import useGetDriverProfile from "../../services/queries/useGetDriverProfile";
import { dropoff, pickup, star } from "../../services/images/remote";

export default function List() {
  const { data } = useMatches();

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          backgroundColor: "white",
        }}
      >
        <View
          style={{
            paddingVertical: 16,
            borderBottomWidth: 3.5,
            borderColor: "#6366F1",
            flex: 1,
            alignItems: "center",
          }}
        >
          <Text color="#353579" weight="700">
            Ongoing
          </Text>
        </View>
        <View
          style={{
            paddingVertical: 16,
            flex: 1,
            alignItems: "center",
            opacity: 0.2,
          }}
        >
          <Text color="#707070">Nearby</Text>
        </View>
        <View
          style={{
            paddingVertical: 16,
            flex: 1,
            alignItems: "center",
            opacity: 0.2,
          }}
        >
          <Text color="#707070">History</Text>
        </View>
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 24,
          gap: 12,
          backgroundColor: "#f9fafb",
        }}
      >
        {data?.map((match) => (
          <TripCard
            key={match.id}
            onPress={() => router.navigate(`/match/${match.id}`)}
            name={match.passenger_id}
            platform={match.estimatePreview}
            status={match.status}
            firstAddress={match.first_point?.short_address}
            lastAddress={match.last_point?.short_address}
            profile_id={match.profile_id}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function TripCard({
  name = "[name]",
  platform = "[platform]",
  rating = 4.6,
  status = "[status]",
  firstAddress = "[address1]",
  lastAddress = "[address2]",
  onPress = () => {},
  profile_id,
}) {
  const { data: profile } = useGetDriverProfile(profile_id);

  let title = "-";

  if (profile) {
    `${profile?.vehicle_make} ${profile?.vehicle_model} (${profile?.vehicle_plate_number})`;
  }

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={{ padding: 16, borderRadius: 24, backgroundColor: "white" }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            borderBottomColor: "#F4F4F4",
            borderBottomWidth: 1,
            paddingBottom: 16,
            gap: 8,
          }}
        >
          <View style={{ flexDirection: "row", gap: 12, flex: 1 }}>
            {/* <View
              style={{
                backgroundColor: "#D9D9D9",
                width: 55,
                height: 55,
                borderRadius: 10,
              }}
            /> */}
            <View style={{ flex: 1, gap: 4 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Text
                  style={{ flex: 1 }}
                  weight="700"
                  size={18}
                  color="#363F59"
                  numberOfLines={1}
                >
                  {title}
                </Text>
                <View
                  style={{
                    paddingHorizontal: 10,
                    borderColor: "#D9D9D9",
                    borderWidth: 2.5,
                    borderRadius: 24,
                    height: 32,
                    flexDirection: "row",
                    gap: 4,
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <Image
                    source={star}
                    style={{ width: 16, height: 16 }}
                    cachePolicy="memory-disk"
                  />
                  <Text size={14} weight="900">
                    {rating}
                  </Text>
                </View>
              </View>
              <Text weight="700" size={14} color="#707070">
                {platform}
              </Text>
            </View>
          </View>
          <View style={{ flexShrink: 0 }}>
            <TouchableOpacity
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 4,
                backgroundColor: "#6366F1",
              }}
            >
              <Text color="white" size={14} weight="700">
                {getLabel(status)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ paddingVertical: 16 }}>
          <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
            <Image
              source={pickup}
              style={{ width: 20, height: 20 }}
              cachePolicy="memory-disk"
            />
            <Text
              weight="700"
              color="#1b1b1b"
              style={{ flex: 1 }}
              numberOfLines={1}
            >
              {firstAddress}
            </Text>
          </View>
          <View style={{ flexDirection: "row", paddingVertical: 8 }}>
            <Text
              style={{
                transform: [{ rotate: "90deg" }],
              }}
              size={18}
              weight="700"
              color="#D9D9D9"
            >
              ---
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
            <Image
              source={dropoff}
              style={{ width: 20, height: 20 }}
              cachePolicy="memory-disk"
            />
            <Text
              weight="700"
              color="#1b1b1b"
              style={{ flex: 1 }}
              numberOfLines={1}
            >
              {lastAddress}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },

  button: {
    backgroundColor: "gainsboro",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  spacer: {
    padding: 4,
    gap: 8,
  },
});
