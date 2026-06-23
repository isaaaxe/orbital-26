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
import { FloorDetail } from "@/api_debug/campus_map.logged";
import ChipList from "./ChipList";
import { FloorPlansByBuildingFloor } from "@/context/RouteContext";

type RoutePoints = {
  x: number;
  y: number;
};

type IndoorViewProps = {
  floorPlans: FloorPlansByBuildingFloor;
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
  chipOverlay: {
    position: "absolute",
    top: 12,
    left: 16,
    right: 16,
    zIndex: 10,
  },
});

function getFloorLabel(floorNumber: number) {
  if (floorNumber < 0) return `B${Math.abs(floorNumber)}`;
  return `${floorNumber}`;
}

export default function IndoorView({ floorPlans }: IndoorViewProps) {
  // const floorsPerPOI = routePOIs.map((poi) => {
  //   return Object.keys(floorPlans[poi.code]);
  // });
  //default take first item?

  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(
    null,
  );
  const [containerSize, setContainerSize] = useState({
    width: 0,
    height: 0,
  });
  const [selectedFloorNumber, setSelectedFloorNumber] = useState<number | null>(
    null,
  );

  const buildingIds = useMemo(() => {
    return Object.keys(floorPlans);
  }, [floorPlans]);

  useEffect(() => {
    if (!selectedBuildingId || !buildingIds.includes(selectedBuildingId)) {
      setSelectedBuildingId(buildingIds[0]);
    }
  }, [buildingIds, selectedBuildingId]);

  const floors = useMemo(() => {
    if (!selectedBuildingId) return [];

    const buildingFloors = floorPlans[selectedBuildingId];

    if (!buildingFloors) return [];

    return [...buildingFloors].sort((a, b) => a.floor_number - b.floor_number);
  }, [floorPlans, selectedBuildingId]);

  useEffect(() => {
    if (floors.length === 0) {
      setSelectedFloorNumber(null);
      return;
    }

    const selectedFloorStillExists = floors.some(
      (floor) => floor.floor_number === selectedFloorNumber,
    );

    if (!selectedFloorStillExists) {
      const levelOne = floors.find((floor) => floor.floor_number === 1);
      setSelectedFloorNumber((levelOne ?? floors[0]).floor_number);
    }
  }, [floors, selectedFloorNumber]);

  const currentFloor = useMemo(() => {
    if (selectedFloorNumber == null) return null;

    return (
      floors.find((floor) => floor.floor_number === selectedFloorNumber) ?? null
    );
  }, [floors, selectedFloorNumber]);

  if (!currentFloor || !selectedBuildingId) {
    return (
      <View style={styles.mapWindow}>
        <Text>Indoor Map unavailable...</Text>
      </View>
    );
  }

  const imageAspectRatio = currentFloor.image_width / currentFloor.image_height;

  const fittedSize =
    containerSize.width === 0 || containerSize.height === 0
      ? null
      : fitContainer(imageAspectRatio, {
          width: containerSize.width,
          height: containerSize.height,
        });

  const scaleX = fittedSize ? fittedSize.width / currentFloor.image_width : 1;
  const scaleY = fittedSize ? fittedSize.height / currentFloor.image_height : 1;

  const buildingData = buildingIds.map((buildingId) => ({
    name: buildingId.toUpperCase(),
    code: buildingId,
  }));

  return (
    <View
      style={styles.mapWindow}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setContainerSize({ width, height });
      }}
    >
      <View style={styles.chipOverlay}>
        <ChipList
          data={buildingData}
          selected={selectedBuildingId}
          onSelect={setSelectedBuildingId}
        />
      </View>
      {fittedSize && (
        <ResumableZoom minScale={1} maxScale={5} panMode="clamp">
          <View style={{ width: fittedSize.width, height: fittedSize.height }}>
            <Image
              source={{ uri: currentFloor.image_url }}
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
          layers={floors.map((floor) => getFloorLabel(floor.floor_number))}
          selectedLayer={
            selectedFloorNumber == null
              ? undefined
              : getFloorLabel(selectedFloorNumber)
          }
          onPress={(layer) => {
            const selected = floors.find(
              (floor) => getFloorLabel(floor.floor_number) === layer,
            );

            if (selected) {
              setSelectedFloorNumber(selected.floor_number);
            }
          }}
        />
      </View>
    </View>
  );
}
