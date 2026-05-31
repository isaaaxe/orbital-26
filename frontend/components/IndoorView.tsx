// Indoor view to be generated for the route
// things i need
// 1. A main indoor view that can be moved around i guess?
// 2. A layers button on the side that can be used to toggle the diff layers
// 3. actually having the routes printed out??

import { Image, StyleSheet, Text, View } from "react-native";
import { ResumableZoom, fitContainer } from "react-native-zoom-toolkit";
import Svg, { Polyline, Circle } from "react-native-svg";
import IndoorViewButtons from "./IndoorViewButtons";

//For testing
import { floorPlans } from "@/app/data/floorPlans";
import { useEffect, useState } from "react";

type RoutePoints = {
  x: number;
  y: number;
};

type IndoorViewProps = {
  routePoints: RoutePoints;
  layerNames: string[];
};

const styles = StyleSheet.create({
  mapWindow: {
    flex: 1,
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 90,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#F2F2F2",
    position: "relative",
  },
  layerButtonsOverlay: {
    position: "absolute",
    right: 12,
    bottom: 12,
    zIndex: 10,
  },
});

export default function IndoorView() {
  //testing
  //   const [buildingId, setBuildingId] = useState(null)
  const [level, setLevel] = useState("B");
  // useEffect(()=>{

  // }, [])

  const testFloorPlan = floorPlans["COM1"][level].image;

  const { width: ORIGINAL_WIDTH, height: ORIGINAL_HEIGHT } =
    Image.resolveAssetSource(testFloorPlan);

  const [containerSize, setContainerSize] = useState({
    width: 0,
    height: 0,
  });
  const imageAspectRatio = ORIGINAL_WIDTH / ORIGINAL_HEIGHT;

  const fittedSize =
    containerSize.width === 0 || containerSize.height === 0
      ? null
      : fitContainer(imageAspectRatio, {
          width: containerSize.width,
          height: containerSize.height,
        });

  const scaleX = fittedSize ? fittedSize.width / ORIGINAL_WIDTH : 1;
  const scaleY = fittedSize ? fittedSize.height / ORIGINAL_HEIGHT : 1;
  return (
    <View
      style={styles.mapWindow}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setContainerSize({ width, height });
      }}
    >
      {fittedSize && (
        <ResumableZoom minScale={1} maxScale={5} panMode="clamp">
          <View style={{ width: fittedSize.width, height: fittedSize.height }}>
            <Image
              source={testFloorPlan}
              style={{
                width: fittedSize.width,
                height: fittedSize.height,
              }}
              resizeMode="contain"
            />
          </View>
        </ResumableZoom>
      )}
      <View style={styles.layerButtonsOverlay}>
        <IndoorViewButtons
          layers={["B", "1", "2", "3"]}
          onPress={(layer) => setLevel(layer)}
        />
      </View>
    </View>
  );
}
