import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  TextInput,
} from "react-native";
import Mapbox from "@rnmapbox/maps";
import useMatch from "../../services/supabase/realtime/useMatch";
import Optional from "../../components/optional";
import Text from "../../components/text";
import { useRef, useState } from "react";
import { Image } from "expo-image";
import Cta from "../../components/cta";
import Preview from "./components/Preview";
import useOnUpdate from "../../services/hooks/useOnUpdate";

export default function Match() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const match = useMatch(params.id);

  const [scrollEnabled, setScrollEnabled] = useState(false);
  const scrollRef = useRef();
  const [showFeedback, setShowFeedback] = useState(false);

  const pointerEvents = scrollEnabled ? "auto" : "box-none";
  const isCoordinatesReady =
    match?.first_point?.longitude && match?.first_point?.latitude;

  useOnUpdate(() => {
    if (match?.status === "COMPLETED") {
      const timer = setTimeout(() => {
        setShowFeedback(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [match]);

  function handleGoToMessages() {
    router.navigate(`/messaging/${match?.id}`);
  }

  function handleCallDriver() {
    router.navigate({
      pathname: "/call/dial",
      params: {
        // todo: change with driver id
        roomId: "Todo change with driver id",
      },
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.full}>
        <Optional condition={showFeedback}>
          <Feedback />
        </Optional>
        <BackButton />
        <ScrollView
          ref={scrollRef}
          pagingEnabled
          horizontal={false}
          snapToAlignment="end"
          showsVerticalScrollIndicator={false}
          style={styles.absolute}
          pointerEvents={pointerEvents}
          contentContainerStyle={{ gap: 8, pointerEvents }}
          onMomentumScrollEnd={(e) => {
            if (e.nativeEvent.contentOffset.y <= 0) setScrollEnabled(false);
          }}
        >
          <Optional condition={match?.status === "REQUESTED"}>
            <Preview
              style={styles.previewContent}
              onHandlerStateChange={() => {
                setScrollEnabled((prev) => {
                  if (prev === false) return true;
                  return prev;
                });
                scrollRef?.current?.scrollTo({ y: 50, animated: true });
              }}
            >
              <Text size={28} weight="bold" color="#353579">
                Searching
              </Text>
              <Text size={14} color="#707070">
                Hold still we are will find the best match for you.
              </Text>
              <View style={styles.services}>
                <View style={styles.serviceContainer}>
                  <Image
                    source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FJoyRide%20McTaxi.png?alt=media&token=86c9d45f-aca9-458d-8079-0fc73cfd6ad7"
                    cachePolicy="memory-disk"
                    style={styles.image}
                  />
                </View>
                <View style={styles.serviceContainer}>
                  <Image
                    source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FMove%20it.png?alt=media&token=b19e275e-820b-4b45-98d0-e54e56b48246"
                    cachePolicy="memory-disk"
                    style={styles.image}
                  />
                </View>
              </View>
            </Preview>
            <View
              style={{
                backgroundColor: "white",
                paddingHorizontal: 16,
                paddingVertical: 32,
                gap: 16,
              }}
            >
              <View style={{ gap: 8 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <Image
                    style={styles.indicator}
                    cachePolicy="memory-disk"
                    source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FOrigin.png?alt=media&token=7913bdfb-7b7f-41aa-aecb-433a275c92b8"
                  />
                  <Text weight="900" size={18} color="#1B1B1B">
                    {match?.first_point?.short_address}
                  </Text>
                </View>
                <Text size={14} color="#707070">
                  {match?.first_point?.long_address}
                </Text>
              </View>
              <View style={{ gap: 8 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <Image
                    style={styles.indicator}
                    cachePolicy="memory-disk"
                    source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FDestination.png?alt=media&token=e92cc2d1-77c3-486f-9793-3c0827ca5aef"
                  />
                  <Text weight="900" size={18} color="#1B1B1B">
                    {match?.last_point?.short_address}
                  </Text>
                </View>
                <Text size={14} color="#707070">
                  {match?.last_point?.long_address}
                </Text>
              </View>
            </View>
            <View
              style={{
                backgroundColor: "white",
                paddingHorizontal: 16,
                paddingVertical: 32,
                gap: 16,
              }}
            >
              <View style={{ gap: 8 }}>
                <Text size={14} color="#707070">
                  Service Charge
                </Text>
                <Text weight="bold" size={18} color="#1B1B1B">
                  ₱5.00
                </Text>
              </View>
              <View style={{ gap: 8 }}>
                <Text size={14} color="#707070">
                  Estimated Fare
                </Text>
                <Text weight="700" size={34} color="#353579">
                  ₱ 50.00 - 60.00
                </Text>
              </View>
              <Text color="#707070" size={11}>
                This estimation is based on price regulated by LTFB. Estimated
                fare may vary in the actual trip in the application you chose.
              </Text>
              <Cta disabled color="#D1D5DB">
                Slide to cancel
              </Cta>
            </View>
          </Optional>

          <Optional condition={match?.status === "FOUND"}>
            <Preview
              style={styles.previewContent}
              onHandlerStateChange={() => {
                setScrollEnabled((prev) => {
                  if (prev === false) return true;
                  return prev;
                });
                scrollRef?.current?.scrollTo({ y: 50, animated: true });
              }}
            >
              <Text size={28} weight="bold" color="#353579">
                On the way
              </Text>
              <View
                style={{
                  justifyContent: "space-between",
                  flexDirection: "row",
                }}
              >
                <Text size={14} color="#707070">
                  Your
                  <Text weight="bold" size={14} color="#0090F9">
                    {` Angkas `}
                  </Text>
                  driver is on the way!
                </Text>
                <Text weight="bold" size={14} color="#0090F9">
                  2:35
                </Text>
              </View>

              <View
                style={{
                  paddingTop: 16,
                  marginTop: 16,
                  borderColor: "#EAEAEA",
                  borderTopWidth: 1,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 55,
                        height: 55,
                        backgroundColor: "gainsboro",
                        borderRadius: 9,
                      }}
                    />
                    <View style={{ gap: 4 }}>
                      <Text color="#363F59" size={18} weight="900">
                        Toyota Vios (CA3751)
                      </Text>
                      <Text size={14} weight="bold" color="#707070">
                        Tom Hedge
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", gap: 7 }}>
                    <TouchableOpacity onPress={handleGoToMessages}>
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
                          source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FChat.png?alt=media&token=5f0ac4b3-d2ac-4af4-ba83-db9adb4027cb"
                        />
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleCallDriver}>
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
                  </View>
                </View>
              </View>
            </Preview>

            <View
              style={{
                backgroundColor: "white",
                paddingHorizontal: 16,
                paddingVertical: 32,
                gap: 16,
              }}
            >
              <View style={{ gap: 8 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <Image
                    style={styles.indicator}
                    cachePolicy="memory-disk"
                    source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FOrigin.png?alt=media&token=7913bdfb-7b7f-41aa-aecb-433a275c92b8"
                  />
                  <Text weight="900" size={18} color="#1B1B1B">
                    {match?.first_point?.short_address}
                  </Text>
                </View>
                <Text size={14} color="#707070">
                  {match?.first_point?.long_address}
                </Text>
              </View>
              <View style={{ gap: 8 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <Image
                    style={styles.indicator}
                    cachePolicy="memory-disk"
                    source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FDestination.png?alt=media&token=e92cc2d1-77c3-486f-9793-3c0827ca5aef"
                  />
                  <Text weight="900" size={18} color="#1B1B1B">
                    {match?.last_point?.short_address}
                  </Text>
                </View>
                <Text size={14} color="#707070">
                  {match?.last_point?.long_address}
                </Text>
              </View>

              <TouchableOpacity>
                <View
                  style={{
                    gap: 12,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#EFEFEF",
                      width: 40,
                      height: 40,
                      borderRadius: 9,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      style={{ height: 16, width: 18 }}
                      resizeMode="contain"
                      cachePolicy="memory-disk"
                      source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FShare.png?alt=media&token=4e75220d-0bc9-44ee-8aae-a8526df4d141"
                    />
                  </View>
                  <Text weight="900" color="#10B981">
                    Share this ride
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View
              style={{
                backgroundColor: "white",
                paddingHorizontal: 16,
                paddingVertical: 32,
                gap: 16,
              }}
            >
              <View style={{ gap: 8 }}>
                <Text size={14} color="#707070">
                  Service Charge
                </Text>
                <Text weight="bold" size={18} color="#1B1B1B">
                  ₱5.00
                </Text>
              </View>
              <View style={{ gap: 8 }}>
                <Text size={14} color="#707070">
                  Estimated Fare
                </Text>
                <Text weight="700" size={34} color="#353579">
                  ₱ 50.00 - 60.00
                </Text>
              </View>
              <Text color="#707070" size={11}>
                This estimation is based on price regulated by LTFB. Estimated
                fare may vary in the actual trip in the application you chose.
              </Text>
              <Cta disabled color="#D1D5DB">
                Slide to cancel
              </Cta>
            </View>
          </Optional>

          <Optional condition={match?.status === "ARRIVED"}>
            <Preview
              style={styles.previewContent}
              onHandlerStateChange={() => {
                setScrollEnabled((prev) => {
                  if (prev === false) return true;
                  return prev;
                });
                scrollRef?.current?.scrollTo({ y: 50, animated: true });
              }}
            >
              <Text size={28} weight="bold" color="#353579">
                Driver Arrived
              </Text>

              <Text size={14} color="#707070">
                Your
                <Text weight="bold" size={14} color="#0090F9">
                  {` Angkas `}
                </Text>
                driver is on the way!
              </Text>

              <View
                style={{
                  paddingTop: 16,
                  marginTop: 16,
                  borderColor: "#EAEAEA",
                  borderTopWidth: 1,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 55,
                        height: 55,
                        backgroundColor: "gainsboro",
                        borderRadius: 9,
                      }}
                    />
                    <View style={{ gap: 4 }}>
                      <Text color="#363F59" size={18} weight="900">
                        Toyota Vios (CA3751)
                      </Text>
                      <Text size={14} weight="bold" color="#707070">
                        Tom Hedge
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", gap: 7 }}>
                    <TouchableOpacity>
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
                          source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FChat.png?alt=media&token=5f0ac4b3-d2ac-4af4-ba83-db9adb4027cb"
                        />
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity>
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
                  </View>
                </View>
              </View>
            </Preview>

            <View
              style={{
                backgroundColor: "white",
                paddingHorizontal: 16,
                paddingVertical: 32,
                gap: 16,
              }}
            >
              <View style={{ gap: 8 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <Image
                    style={styles.indicator}
                    cachePolicy="memory-disk"
                    source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FOrigin.png?alt=media&token=7913bdfb-7b7f-41aa-aecb-433a275c92b8"
                  />
                  <Text weight="900" size={18} color="#1B1B1B">
                    {match?.first_point?.short_address}
                  </Text>
                </View>
                <Text size={14} color="#707070">
                  {match?.first_point?.long_address}
                </Text>
              </View>
              <View style={{ gap: 8 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <Image
                    style={styles.indicator}
                    cachePolicy="memory-disk"
                    source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FDestination.png?alt=media&token=e92cc2d1-77c3-486f-9793-3c0827ca5aef"
                  />
                  <Text weight="900" size={18} color="#1B1B1B">
                    {match?.last_point?.short_address}
                  </Text>
                </View>
                <Text size={14} color="#707070">
                  {match?.last_point?.long_address}
                </Text>
              </View>

              <TouchableOpacity>
                <View
                  style={{
                    gap: 12,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#EFEFEF",
                      width: 40,
                      height: 40,
                      borderRadius: 9,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      style={{ height: 16, width: 18 }}
                      resizeMode="contain"
                      cachePolicy="memory-disk"
                      source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FShare.png?alt=media&token=4e75220d-0bc9-44ee-8aae-a8526df4d141"
                    />
                  </View>
                  <Text weight="900" color="#10B981">
                    Share this ride
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View
              style={{
                backgroundColor: "white",
                paddingHorizontal: 16,
                paddingVertical: 32,
                gap: 16,
              }}
            >
              <View style={{ gap: 8 }}>
                <Text size={14} color="#707070">
                  Service Charge
                </Text>
                <Text weight="bold" size={18} color="#1B1B1B">
                  ₱5.00
                </Text>
              </View>
              <View style={{ gap: 8 }}>
                <Text size={14} color="#707070">
                  Estimated Fare
                </Text>
                <Text weight="700" size={34} color="#353579">
                  ₱ 50.00 - 60.00
                </Text>
              </View>
              <Text color="#707070" size={11}>
                This estimation is based on price regulated by LTFB. Estimated
                fare may vary in the actual trip in the application you chose.
              </Text>
              <View>
                <Cta disabled color="transparent" textColor="#353579">
                  Slide to cancel
                </Cta>
                <Cta disabled color="#6366F1">
                  Transfer to Angkas
                </Cta>
              </View>
            </View>
          </Optional>

          <Optional condition={match?.status === "STARTED"}>
            <Preview
              style={styles.previewContent}
              onHandlerStateChange={() => {
                setScrollEnabled((prev) => {
                  if (prev === false) return true;
                  return prev;
                });
                scrollRef?.current?.scrollTo({ y: 50, animated: true });
              }}
            >
              <Text size={28} weight="bold" color="#353579">
                On your way
              </Text>

              <Text size={14} color="#707070">
                You and your
                <Text weight="bold" size={14} color="#0090F9">
                  {` Angkas `}
                </Text>
                is heading to the destination.
              </Text>

              <View
                style={{
                  paddingTop: 16,
                  marginTop: 16,
                  borderColor: "#EAEAEA",
                  borderTopWidth: 1,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 55,
                        height: 55,
                        backgroundColor: "gainsboro",
                        borderRadius: 9,
                      }}
                    />
                    <View style={{ gap: 4 }}>
                      <Text color="#363F59" size={18} weight="900">
                        Toyota Vios (CA3751)
                      </Text>
                      <Text size={14} weight="bold" color="#707070">
                        Tom Hedge
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </Preview>

            <View
              style={{
                backgroundColor: "white",
                paddingHorizontal: 16,
                paddingVertical: 32,
                gap: 16,
              }}
            >
              <View style={{ gap: 8 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <Image
                    style={styles.indicator}
                    cachePolicy="memory-disk"
                    source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FOrigin.png?alt=media&token=7913bdfb-7b7f-41aa-aecb-433a275c92b8"
                  />
                  <Text weight="900" size={18} color="#1B1B1B">
                    {match?.first_point?.short_address}
                  </Text>
                </View>
                <Text size={14} color="#707070">
                  {match?.first_point?.long_address}
                </Text>
              </View>
              <View style={{ gap: 8 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <Image
                    style={styles.indicator}
                    cachePolicy="memory-disk"
                    source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FDestination.png?alt=media&token=e92cc2d1-77c3-486f-9793-3c0827ca5aef"
                  />
                  <Text weight="900" size={18} color="#1B1B1B">
                    {match?.last_point?.short_address}
                  </Text>
                </View>
                <Text size={14} color="#707070">
                  {match?.last_point?.long_address}
                </Text>
              </View>

              <TouchableOpacity>
                <View
                  style={{
                    gap: 12,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#EFEFEF",
                      width: 40,
                      height: 40,
                      borderRadius: 9,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      style={{ height: 16, width: 18 }}
                      resizeMode="contain"
                      cachePolicy="memory-disk"
                      source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FShare.png?alt=media&token=4e75220d-0bc9-44ee-8aae-a8526df4d141"
                    />
                  </View>
                  <Text weight="900" color="#10B981">
                    Share this ride
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View
              style={{
                backgroundColor: "white",
                paddingHorizontal: 16,
                paddingVertical: 32,
                gap: 16,
              }}
            >
              <View style={{ gap: 8 }}>
                <Text size={14} color="#707070">
                  Service Charge
                </Text>
                <Text weight="bold" size={18} color="#1B1B1B">
                  ₱5.00
                </Text>
              </View>
              <View style={{ gap: 8 }}>
                <Text size={14} color="#707070">
                  Estimated Fare
                </Text>
                <Text weight="700" size={34} color="#353579">
                  ₱ 50.00 - 60.00
                </Text>
              </View>
              <Text color="#707070" size={11}>
                This estimation is based on price regulated by LTFB. Estimated
                fare may vary in the actual trip in the application you chose.
              </Text>
            </View>
          </Optional>

          <Optional condition={match?.status === "COMPLETED"}>
            <Preview
              style={styles.previewContent}
              onHandlerStateChange={() => {
                setScrollEnabled((prev) => {
                  if (prev === false) return true;
                  return prev;
                });
                scrollRef?.current?.scrollTo({ y: 50, animated: true });
              }}
            >
              <Text size={28} weight="bold" color="#353579">
                Arrived
              </Text>

              <Text size={14} color="#707070">
                You have arrived to the destination.
              </Text>

              <View
                style={{
                  paddingTop: 16,
                  marginTop: 16,
                  borderColor: "#EAEAEA",
                  borderTopWidth: 1,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 55,
                        height: 55,
                        backgroundColor: "gainsboro",
                        borderRadius: 9,
                      }}
                    />
                    <View style={{ gap: 4 }}>
                      <Text color="#363F59" size={18} weight="900">
                        Toyota Vios (CA3751)
                      </Text>
                      <Text size={14} weight="bold" color="#707070">
                        Tom Hedge
                      </Text>
                    </View>
                  </View>
                  <Text size={14} weight="900" color="#0090F9">
                    Angkas
                  </Text>
                </View>
              </View>
            </Preview>

            <View
              style={{
                backgroundColor: "white",
                paddingHorizontal: 16,
                paddingVertical: 32,
                gap: 16,
              }}
            >
              <View style={{ gap: 8 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <Image
                    style={styles.indicator}
                    cachePolicy="memory-disk"
                    source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FOrigin.png?alt=media&token=7913bdfb-7b7f-41aa-aecb-433a275c92b8"
                  />
                  <Text weight="900" size={18} color="#1B1B1B">
                    {match?.first_point?.short_address}
                  </Text>
                </View>
                <Text size={14} color="#707070">
                  {match?.first_point?.long_address}
                </Text>
              </View>
              <View style={{ gap: 8 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <Image
                    style={styles.indicator}
                    cachePolicy="memory-disk"
                    source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FDestination.png?alt=media&token=e92cc2d1-77c3-486f-9793-3c0827ca5aef"
                  />
                  <Text weight="900" size={18} color="#1B1B1B">
                    {match?.last_point?.short_address}
                  </Text>
                </View>
                <Text size={14} color="#707070">
                  {match?.last_point?.long_address}
                </Text>
              </View>
            </View>

            <View
              style={{
                backgroundColor: "white",
                paddingHorizontal: 16,
                paddingVertical: 32,
                gap: 16,
              }}
            >
              <View style={{ gap: 8 }}>
                <Text size={14} color="#707070">
                  Service Charge
                </Text>
                <Text weight="bold" size={18} color="#1B1B1B">
                  ₱5.00
                </Text>
              </View>
              <View style={{ gap: 8 }}>
                <Text size={14} color="#707070">
                  Estimated Fare
                </Text>
                <Text weight="700" size={34} color="#353579">
                  ₱ 50.00 - 60.00
                </Text>
              </View>
              <Text color="#707070" size={11}>
                This estimation is based on price regulated by LTFB. Estimated
                fare may vary in the actual trip in the application you chose.
              </Text>
            </View>
          </Optional>
        </ScrollView>
        <Mapbox.MapView
          scaleBarEnabled={false}
          style={styles.map}
          styleURL="mapbox://styles/mapbox/light-v11"
          logoPosition={{ top: -100, left: 0 }}
          attributionEnabled={false}
        >
          <Optional condition={isCoordinatesReady}>
            <Mapbox.Camera
              animationMode="none"
              zoomLevel={13.79}
              centerCoordinate={[
                match?.first_point?.longitude,
                match?.first_point?.latitude,
              ]}
            />
            <Mapbox.MarkerView
              coordinate={[
                match?.first_point?.longitude,
                match?.first_point?.latitude,
              ]}
            >
              <Image
                style={styles.marker}
                cachePolicy="memory-disk"
                source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FRequest%20Origin.png?alt=media&token=d7bfb9da-845a-4e48-96f5-b785b248bbfb"
              />
            </Mapbox.MarkerView>
          </Optional>
        </Mapbox.MapView>
      </View>
    </View>
  );
}

function BackButton() {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={router.back} style={styles.back}>
      <Image
        style={{ width: 44, height: 44 }}
        cachePolicy="memory-disk"
        source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FCircle%20Back.png?alt=media&token=bff546fa-0686-4949-ab46-08bd9510dc4d"
      />
    </TouchableOpacity>
  );
}

function Feedback() {
  return (
    <View
      style={{
        position: "absolute",
        backgroundColor: "#00000029",
        height: "100%",
        width: "100%",
        zIndex: 4,
      }}
    >
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <View style={styles.previewContent}>
          <Text size={28} weight="bold" color="#353579">
            You have arrived!
          </Text>

          <View style={{ marginVertical: 30, gap: 12 }}>
            <Text size={18} weight="bold" color="#1B1B1B">
              Tell us how was your trip?
            </Text>
            <Text size={14} color="#707070">
              Your feedback will help improve the app experience.
            </Text>
            <View
              style={{
                backgroundColor: "#F0F0F0",
                height: 81,
                borderRadius: 10,
                padding: 16,
              }}
            >
              <TextInput
                style={{ fontFamily: "Lato-Regular", fontSize: 16 }}
                placeholder="Give us a feed back"
                multiline
              />
            </View>
          </View>
          <Cta textColor="#353579" color="transparent">
            Not Now. Thank you!
          </Cta>
          <Cta color="#6366F1">Submit</Cta>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  back: {
    position: "absolute",
    zIndex: 1,
    left: 0,
    padding: 16,
    top: 16,
    zIndex: 3,
  },
  container: {
    flex: 1,
  },
  full: {
    flex: 1,
    position: "relative",
  },
  absolute: {
    position: "absolute",
    zIndex: 2,
    height: "100%",
    width: "100%",
    gap: 16,
  },
  previewContent: {
    backgroundColor: "white",
    paddingHorizontal: 18,
    paddingVertical: 32,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
  },
  map: {
    height: "100%",
    width: "100%",
    flex: 1,
  },
  heading: {
    flexDirection: "row",
    marginTop: 16,
  },
  button: {
    backgroundColor: "gainsboro",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  preview: {
    paddingTop: Dimensions.get("window").height - 160,
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width,
  },
  services: {
    flexDirection: "row",
    marginTop: 24,
    gap: 8,
  },
  serviceContainer: {
    height: 24,
    width: 24,
    borderRadius: 24,
    overflow: "hidden",
  },
  image: {
    height: 24,
    width: 24,
  },
  marker: { width: 48, height: 48, marginBottom: 24 },
  indicator: { width: 12, height: 12 },
});
