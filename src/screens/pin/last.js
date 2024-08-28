import Map from "./component/Map";
import Info from "./component/Info";
import Control from "./component/Control";

export default function PinLastLocation() {
  return (
    <>
      <Map coordinates={[121.1728652, 14.5813157]} />
      <Control />
      <Info
        title="Pinned Location"
        subTitle="Custom pinned location. Near Salon for Herr and Frau."
      />
    </>
  );
}
