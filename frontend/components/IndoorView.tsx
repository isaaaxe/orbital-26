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
import { POI_DATA_TYPE } from "@/app/data/POI";
import { floorPlans } from "@/app/data/floorPlans";
import { useEffect, useState, useMemo } from "react";
import { useRouteContext } from "@/context/RouteContext";

type RoutePoints = {
  x: number;
  y: number;
};

type IndoorViewProps = {
  routePOIs: POI_DATA_TYPE[];
};

const styles = StyleSheet.create({
  mapWindow: {
    flex: 1,
    marginTop: 16,
    marginHorizontal: 16,
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

export default function IndoorView({ routePOIs }: IndoorViewProps) {
  // const floorsPerPOI = routePOIs.map((poi) => {
  //   return Object.keys(floorPlans[poi.code]);
  // });
  //default take first item?
  const [currPOI, setCurrPOI] = useState<POI_DATA_TYPE | null>(
    routePOIs[0] ?? null,
  );
  const [containerSize, setContainerSize] = useState({
    width: 0,
    height: 0,
  });
  const [level, setLevel] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (!currPOI && routePOIs.length > 0) {
      setCurrPOI(routePOIs[0]);
    }
  }, [routePOIs, currPOI]);

  const floors = useMemo(() => {
    if (!currPOI || !floorPlans[currPOI.code]) return [];
    return Object.keys(floorPlans[currPOI.code]).sort((a, b) => {
      const floorValue = (floor: string) => {
        if (floor.startsWith("B")) {
          return -Number(floor.slice(1));
        }
        return Number(floor);
      };
      return floorValue(b) - floorValue(a);
    });
  }, [currPOI]);
  useEffect(() => {
    if (floors.length > 0) {
      setLevel(floors[floors.length - 1]);
    }
  }, [floors]);

  if (!currPOI || floors.length === 0 || !level) {
    return (
      <View style={styles.mapWindow}>
        <Text>Indoor map unavailable</Text>
      </View>
    );
  }
  //testing assuming 1
  const testFloorPlan = floorPlans[currPOI.code][level].image;

  const { width: ORIGINAL_WIDTH, height: ORIGINAL_HEIGHT } =
    Image.resolveAssetSource(testFloorPlan);

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
          layers={floors}
          selectedLayer={level}
          onPress={(layer) => setLevel(layer)}
        />
      </View>
    </View>
  );
}
