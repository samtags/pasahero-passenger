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
import BackButton from "../../components/back";
import { useMMKVString } from "react-native-mmkv";
import { useBoolVariation } from "@launchdarkly/react-native-client-sdk";
import cancelMatchRequest from "../../services/api/cancelMatchRequest";
import { useMutation } from "@tanstack/react-query";
import useGetDriver from "../../services/queries/useGetDriver";
import { Skeleton } from "moti/skeleton";
import { format } from "../../services/util/amount";
import LottieView from "lottie-react-native";

export default function Match() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const match = useMatch(params.id);

  const [isMapInitialized, setIsMapInitialized] = useState(false);

  function initializeMap() {
    if (isMapInitialized) return;
    setIsMapInitialized(true);
  }

  const { isPending: isCanceling, mutateAsync: handleCancel } = useMutation({
    mutationFn: () => cancelMatchRequest({ id: match?.id }),
    onSuccess: () => router.replace("/"),
  });

  const [matchDraft] = useMMKVString("match.draft");
  const draft = JSON.parse(matchDraft ?? "{}");

  const initialCoordinates = [
    match?.first_point?.longitude ?? draft?.first?.longitude,
    match?.first_point?.latitude ?? draft?.first?.latitude,
  ];

  const [scrollEnabled, setScrollEnabled] = useState(false);
  const scrollRef = useRef();
  const [showFeedback, setShowFeedback] = useState(false);

  const pointerEvents = scrollEnabled ? "auto" : "box-none";
  const isCoordinatesReady =
    match?.first_point?.longitude && match?.first_point?.latitude;

  function handleGoToMessages() {
    router.navigate({
      pathname: `/messaging/${match?.id}`,
      params: {
        match_id: match?.id,
        driver_id: match?.driver_id,
      },
    });
  }

  function handleCallDriver() {
    router.navigate({
      pathname: "/call/dial",
      params: {
        roomId: match?.driver_id,
      },
    });
  }

  function onHandlerStateChange() {
    setScrollEnabled((prev) => {
      if (prev === false) return true;
      return prev;
    });
    scrollRef?.current?.scrollTo({ y: 50, animated: true });
  }

  function handleOnPressCancel() {
    scrollRef?.current?.scrollTo({ y: 0, animated: true });
    setScrollEnabled(false);
    handleCancel();
  }

  function handleSubmitFeedback(feedback) {
    // todo: do something with the feedback
    console.log(feedback);
    setShowFeedback(false);

    router.replace("/");
  }

  useOnUpdate(() => {
    if (match?.status === "DONE") {
      const timer = setTimeout(() => {
        setShowFeedback(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [match]);

  return (
    <View style={styles.container}>
      <View style={styles.full}>
        <Optional condition={showFeedback}>
          <Feedback
            onClose={() => setShowFeedback(false)}
            onSubmit={(feedback) => handleSubmitFeedback(feedback)}
          />
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
          <Optional condition={match?.status === "DONE"}>
            <DonePreview
              onHandlerStateChange={onHandlerStateChange}
              driver_id={match?.driver_id}
            />
          </Optional>

          <Optional condition={match?.status === "STARTED"}>
            <StartedPreview
              onHandlerStateChange={onHandlerStateChange}
              onMessage={handleGoToMessages}
              onCall={handleCallDriver}
              driver_id={match?.driver_id}
            />
          </Optional>

          <Optional condition={match?.status === "ARRIVED"}>
            <ArrivedPreview
              onHandlerStateChange={onHandlerStateChange}
              services={match?.services}
              driver_id={match?.driver_id}
            />
          </Optional>

          <Optional condition={match?.status === "FOUND"}>
            <FoundPreview
              onHandlerStateChange={onHandlerStateChange}
              onMessage={handleGoToMessages}
              onCall={handleCallDriver}
              driver_id={match?.driver_id}
              platform="Angkas"
              eta="2:35"
            />
          </Optional>

          <Optional condition={match?.status === "REQUESTED"}>
            <RequestedPreview
              onHandlerStateChange={onHandlerStateChange}
              services={match?.services}
            />
          </Optional>

          <Optional condition={Boolean(match)}>
            <TransitPoints
              showShareRide={["FOUND", "ARRIVED", "STARTED"].includes(match?.status)} // prettier-ignore
              onShareRide={() => {}}
              first_point={match?.first_point}
              last_point={match?.last_point}
            />

            <FareDetails
              estimatePreview={match?.estimatePreview}
              showCancelOption={["REQUESTED", "FOUND"].includes(match?.status)}
              serviceCharge={match?.service_charge}
              isCanceling={isCanceling}
              onCancel={handleOnPressCancel}
            />
          </Optional>
        </ScrollView>
        <Mapbox.MapView
          scaleBarEnabled={false}
          style={[styles.map, { opacity: isMapInitialized ? 1 : 0 }]}
          // styleURL="mapbox://styles/mapbox/streets-v12"
          // styleURL="mapbox://styles/mapbox/outdoors-v12"
          // styleURL="mapbox://styles/mapbox/light-v11"
          styleURL="mapbox://styles/mapbox/navigation-day-v1"
          logoPosition={{ top: -100, left: 0 }}
          attributionEnabled={false}
          regionDidChangeDebounceTime={1000}
          onDidFinishLoadingStyle={initializeMap}
        >
          <Optional condition={isCoordinatesReady}>
            <Mapbox.Camera
              animationMode="none"
              zoomLevel={13.79}
              centerCoordinate={initialCoordinates}
            />
            <Optional condition={match?.status === "REQUESTED"}>
              <Mapbox.MarkerView
                coordinate={[
                  match?.first_point?.longitude,
                  match?.first_point?.latitude,
                ]}
              >
                <View
                  style={{
                    position: "absolute",
                    height: 220,
                    width: 220,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Image
                    style={styles.marker}
                    cachePolicy="memory-disk"
                    source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FFrom.png?alt=media&token=0d152a8f-e9c4-4014-8816-6a5dc5660290"
                  />
                </View>
                <LottieView
                  autoPlay
                  loop
                  style={{ width: 220, height: 220 }}
                  source={require("../../assets/json/pulse.json")}
                />
              </Mapbox.MarkerView>
            </Optional>
          </Optional>
        </Mapbox.MapView>
      </View>
    </View>
  );
}

/**
 *
 * @param {RequestedPreviewProps} props
 * @returns
 */
function RequestedPreview({
  onHandlerStateChange, //
  services = [],
}) {
  return (
    <Preview
      style={styles.previewContent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <GrayBar />
      <Text size={28} weight="bold" color="#353579">
        Looking for drivers
      </Text>
      <Text size={14} color="#707070">
        We are searching the best match for your request.
      </Text>
      <View style={styles.services}>
        <Optional condition={services?.includes("AngkasPassenger")}>
          <View style={styles.serviceContainer}>
            <Image
              source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FAngkas.png?alt=media&token=6790cdbc-7cf7-456b-8e3e-2fed2c4193dc"
              cachePolicy="memory-disk"
              style={styles.image}
            />
          </View>
        </Optional>
        <Optional condition={services?.includes("JoyRideMcTaxi")}>
          <View style={styles.serviceContainer}>
            <Image
              source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FJoyRide%20McTaxi.png?alt=media&token=86c9d45f-aca9-458d-8079-0fc73cfd6ad7"
              cachePolicy="memory-disk"
              style={styles.image}
            />
          </View>
        </Optional>
        <Optional condition={services?.includes("MoveItMotoTaxi")}>
          <View style={styles.serviceContainer}>
            <Image
              source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FMove%20it.png?alt=media&token=b19e275e-820b-4b45-98d0-e54e56b48246"
              cachePolicy="memory-disk"
              style={styles.image}
            />
          </View>
        </Optional>
      </View>
    </Preview>
  );
}

/**
 *
 * @param {FoundPreviewProps} props
 * @returns
 */
function FoundPreview({
  onHandlerStateChange,
  platform,
  eta,
  onMessage,
  onCall,
  driver_id,
}) {
  // todo: store driver_info in the match data
  const { data: driver, isLoading } = useGetDriver(driver_id);
  const { image_url, model, plate_number, display_name } = driver || {};

  return (
    <Preview
      style={styles.previewContent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Text size={28} weight="bold" color="#353579">
        On the way
      </Text>
      <View style={styles.driverInfoSubTitle}>
        <Text size={14} color="#707070">
          Your
          <Text weight="bold" size={14} color="#0090F9">
            {" "}
            <Optional condition={isLoading === false}>
              {`${platform} `}
            </Optional>
          </Text>
          driver is on the way!
        </Text>
        <Optional condition={Boolean(eta)}>
          <Text weight="bold" size={14} color="#0090F9">
            {eta}
          </Text>
        </Optional>
      </View>

      <DriverInfo
        image_url={image_url}
        model={model}
        plate_number={plate_number}
        display_name={display_name}
        onCall={onCall}
        onMessage={onMessage}
        isLoading={isLoading}
        showCallOption
        showChatOption
      />
    </Preview>
  );
}

function ArrivedPreview({
  onHandlerStateChange,
  onMessage,
  onCall,
  driver_id,
}) {
  // todo: store driver_info in the match data
  const { data: driver, isLoading } = useGetDriver(driver_id);
  const { image_url, model, plate_number, display_name } = driver || {};

  return (
    <Preview
      style={styles.previewContent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <PreviewTitle>Driver Arrived</PreviewTitle>

      <Text size={14} color="#707070">
        Your
        <Text weight="bold" size={14} color="#0090F9">
          {` Angkas `}
        </Text>
        driver arrived to the pickup location
      </Text>

      <DriverInfo
        image_url={image_url}
        model={model}
        plate_number={plate_number}
        display_name={display_name}
        onCall={onCall}
        onMessage={onMessage}
        isLoading={isLoading}
        showCallOption
        showChatOption
      />
    </Preview>
  );
}

function StartedPreview({
  onHandlerStateChange,
  onMessage,
  onCall,
  driver_id,
}) {
  // todo: store driver_info in the match data
  const { data: driver, isLoading } = useGetDriver(driver_id);
  const { image_url, model, plate_number, display_name } = driver || {};

  return (
    <Preview
      style={styles.previewContent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <PreviewTitle>On your way</PreviewTitle>

      <Text size={14} color="#707070">
        You and your
        <Text weight="bold" size={14} color="#0090F9">
          {` Angkas `}
        </Text>
        is heading to the destination.
      </Text>

      <DriverInfo
        image_url={image_url}
        model={model}
        plate_number={plate_number}
        display_name={display_name}
        onCall={onCall}
        onMessage={onMessage}
        isLoading={isLoading}
      />
    </Preview>
  );
}

function DonePreview({ onHandlerStateChange, driver_id }) {
  // todo: store driver_info in the match data
  const { data: driver, isLoading } = useGetDriver(driver_id);
  const { image_url, model, plate_number, display_name } = driver || {};
  return (
    <Preview
      style={styles.previewContent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <PreviewTitle>Arrived</PreviewTitle>

      <Text size={14} color="#707070">
        You have arrived to the destination.
      </Text>

      <DriverInfo
        image_url={image_url}
        model={model}
        plate_number={plate_number}
        display_name={display_name}
        isLoading={isLoading}
      />
    </Preview>
  );
}

function PreviewTitle({ children }) {
  return (
    <Text size={28} weight="bold" color="#353579">
      {children}
    </Text>
  );
}

function DriverInfo({
  image_url,
  model,
  plate_number,
  display_name,
  isLoading,
  onMessage,
  onCall,
  showCallOption,
  showChatOption,
}) {
  return (
    <View style={styles.driverInfoContainer}>
      <View style={styles.driverInfoRow}>
        <View style={styles.driverDetailsRow}>
          <View style={styles.driverImageContainer}>
            <Optional condition={isLoading === false}>
              <Image
                style={styles.driverImage}
                source={image_url}
                cachePolicy="memory-disk"
              />
            </Optional>
          </View>
          <View style={{ gap: 4 }}>
            <Optional condition={isLoading}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Skeleton height={14} width={50} colorMode="light" />
                <Skeleton height={14} width={75} colorMode="light" />
              </View>
              <Skeleton height={10} width={75} colorMode="light" />
            </Optional>
            <Optional condition={isLoading === false}>
              <Text color="#363F59" size={18} weight="900">
                {model} {`(${plate_number})`}
              </Text>
              <Text size={14} weight="bold" color="#707070">
                {display_name}
              </Text>
            </Optional>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 7 }}>
          <Optional condition={showChatOption}>
            <TouchableOpacity onPress={onMessage}>
              <View style={styles.iconContainer}>
                <Image
                  style={{ width: 22, height: 22 }}
                  source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FChat.png?alt=media&token=5f0ac4b3-d2ac-4af4-ba83-db9adb4027cb"
                />
              </View>
            </TouchableOpacity>
          </Optional>
          <Optional condition={showCallOption}>
            <TouchableOpacity onPress={onCall}>
              <View style={styles.iconContainer}>
                <Image
                  style={{ width: 22, height: 22 }}
                  source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FPhone.png?alt=media&token=f27c1ca8-c601-4f37-905c-61ac9ab0c9e5"
                />
              </View>
            </TouchableOpacity>
          </Optional>
        </View>
      </View>
    </View>
  );
}

function TransitPoints({
  first_point, //
  last_point,
  showShareRide,
  onShareRide,
}) {
  const isEnableRideShare = useBoolVariation("php-enable-share-ride", false);

  return (
    <View style={styles.transitContainer}>
      <View style={{ gap: 8 }}>
        <View style={styles.transitRow}>
          <Image
            style={styles.indicator}
            cachePolicy="memory-disk"
            source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FOrigin.png?alt=media&token=7913bdfb-7b7f-41aa-aecb-433a275c92b8"
          />
          <Text weight="900" size={18} color="#1B1B1B">
            {first_point?.short_address}
          </Text>
        </View>
        <Text size={14} color="#707070">
          {first_point?.long_address}
        </Text>
      </View>
      <View style={{ gap: 8 }}>
        <View style={styles.transitRow}>
          <Image
            style={styles.indicator}
            cachePolicy="memory-disk"
            source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FDestination.png?alt=media&token=e92cc2d1-77c3-486f-9793-3c0827ca5aef"
          />
          <Text weight="900" size={18} color="#1B1B1B">
            {last_point?.short_address}
          </Text>
        </View>
        <Text size={14} color="#707070">
          {last_point?.long_address}
        </Text>
      </View>

      <Optional condition={isEnableRideShare}>
        <Optional condition={showShareRide}>
          <TouchableOpacity onPress={() => onShareRide?.()}>
            <View style={styles.shareRideRow}>
              <View style={styles.iconContainer}>
                <Image
                  style={{ height: 16, width: 18, resizeMode: "contain" }}
                  cachePolicy="memory-disk"
                  source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FShare.png?alt=media&token=4e75220d-0bc9-44ee-8aae-a8526df4d141"
                />
              </View>
              <Text weight="900" color="#10B981">
                Share this ride
              </Text>
            </View>
          </TouchableOpacity>
        </Optional>
      </Optional>
    </View>
  );
}

function FareDetails({
  estimatePreview,
  isCanceling,
  onCancel,
  showCancelOption,
  serviceCharge,
}) {
  const isEnableServiceCharge = useBoolVariation("php-enable-service-charge", false); // prettier-ignore

  return (
    <View style={styles.fareDetailsContainer}>
      <Optional condition={isEnableServiceCharge}>
        <View style={{ gap: 8 }}>
          <Text size={14} color="#707070">
            Service Charge
          </Text>
          <Optional condition={serviceCharge === 0}>
            <Text weight="bold" size={18} color="#353579">
              Free
            </Text>
          </Optional>
          <Optional condition={serviceCharge > 0}>
            <Text weight="bold" size={18} color="#1B1B1B">
              {format(serviceCharge ?? 0)}
            </Text>
          </Optional>
        </View>
      </Optional>
      <View style={{ gap: 8 }}>
        <Text size={14} color="#707070">
          Estimated Fare
        </Text>
        <Text weight="700" size={34} color="#353579">
          {estimatePreview ?? "₱ 0.00"}
        </Text>
      </View>
      <Text color="#707070" size={11}>
        This estimation is based on price regulated by LTFB. Estimated fare may
        vary in the actual trip in the application you chose.
      </Text>
      <Optional condition={showCancelOption}>
        <Cta
          disabled={isCanceling}
          onPress={onCancel}
          color={isCanceling ? "#f3f4f6" : "#D1D5DB"}
        >
          Cancel Request
        </Cta>
      </Optional>
    </View>
  );
}

function Feedback({ onClose, onSubmit }) {
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
          <Cta onPress={onClose} textColor="#353579" color="transparent">
            Not Now. Thank you!
          </Cta>
          <Cta onPress={onSubmit} color="#6366F1">
            Submit
          </Cta>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    height: 24,
    width: 24,
  },
  marker: { width: 48, height: 48, marginBottom: 24 },
  indicator: { width: 12, height: 12, marginTop: 4 },
  driverInfoSubTitle: {
    justifyContent: "space-between",
    flexDirection: "row",
  },
  driverInfoContainer: {
    paddingTop: 16,
    marginTop: 16,
    borderColor: "#EAEAEA",
    borderTopWidth: 1,
  },
  driverInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  driverDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  driverImageContainer: {
    width: 55,
    height: 55,
    backgroundColor: "#f3f4f6",
    borderRadius: 9,
    overflow: "hidden",
  },
  driverImage: {
    width: "100%",
    height: "100%",
  },
  iconContainer: {
    backgroundColor: "#EFEFEF",
    height: 40,
    width: 40,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  transitContainer: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 32,
    gap: 16,
  },
  transitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  shareRideRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  fareDetailsContainer: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 32,
    gap: 16,
  },
});

/**
 * @typedef FoundPreviewProps
 * @property {() => void} onHandlerStateChange
 * @property {() => void} onMessage
 * @property {() => void} onCall
 * @property {string} driver_id
 * @property {boolean} isLoading
 * @property {string} platform
 * @property {string} eta
 * @property {string} image_url
 * @property {string} model
 * @property {string} plate_number
 * @property {string} display_name
 *
 */

/**
 * @typedef RequestedPreviewProps
 * @property {() => void} onHandlerStateChange
 * @property {string[]} services
 */
