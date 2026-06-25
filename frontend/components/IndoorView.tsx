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
import { useEffect, useState, useMemo } from "react";
import { FloorPlanLayout, getBuildingFloorKey } from "@/context/RouteContext";
import ChipList from "./ChipList";
import { FloorPlansByBuildingFloor } from "@/context/RouteContext";
import { AffineCoeff } from "@/api_debug/campus_map.logged";

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
  loadingOverlay: {
  ...StyleSheet.absoluteFillObject,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#F2F2F2",
  zIndex: 20,
  elevation: 20,
},
loadingText: {
  fontSize: 14,
  fontWeight: "600",
  color: "#555",
},
});

function getFloorLabel(floorNumber: number) {
  if (floorNumber < 0) return `B${Math.abs(floorNumber)}`;
  return `${floorNumber}`;
}

//to derive buildingId and floornumber
export function parseBuildingFloorKey(key: string): {
  buildingId: string;
  floorNumber: number;
} | null {
  const separatorIndex = key.lastIndexOf(":");

  if (separatorIndex === -1) return null;

  const buildingId = key.slice(0, separatorIndex);
  const floorNumber = Number(key.slice(separatorIndex + 1));

  if (!buildingId || Number.isNaN(floorNumber)) return null;

  return {
    buildingId,
    floorNumber,
  };
}

type PixelPoint = {
  x: number;
  y: number;
};

function geoToPixel(lat: number, lng: number, coeff: AffineCoeff): PixelPoint {
  const [[a, d], [b, e], [c, f]] = coeff;

  const det = a * e - b * d;

  // if (Math.abs(det) < 1e-12) {
  //   throw new Error(
  //     "Invalid affine coefficient: determinant is too close to 0",
  //   );
  // }

  const dlng = lng - c;
  const dlat = lat - f;

  const x = (e * dlng - b * dlat) / det;
  const y = (-d * dlng + a * dlat) / det;

  return { x, y };
}

export default function IndoorView({ floorPlans }: IndoorViewProps) {
  // const floorsPerPOI = routePOIs.map((poi) => {
  //   return Object.keys(floorPlans[poi.code]);
  // });
  //default take first item?
  const [isImageLoaded, setIsImageLoaded] = useState(false);
const [imageLoadError, setImageLoadError] = useState(false);

  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(
    null,
  );

  const [selectedFloorNumber, setSelectedFloorNumber] = useState<number | null>(
    null,
  );
  const [containerSize, setContainerSize] = useState({
    width: 0,
    height: 0,
  });

  const floorPlansByBuilding = useMemo(() => {
    const grouped: Record<string, FloorPlanLayout[] | null> = {};
    Object.entries(floorPlans).forEach(([key, floorPlan]) => {
      if (!floorPlan) return;

      const parsed = parseBuildingFloorKey(key);
      if (!parsed) return;
      const { buildingId } = parsed;
      if (!grouped[buildingId]) {
        grouped[buildingId] = [];
      }
      grouped[buildingId].push(floorPlan);
    });
    Object.values(grouped).forEach((floors) => {
      floors?.sort(
        (a, b) => a.floorDetail.floor_number - b.floorDetail.floor_number,
      );
    });
    return grouped;
  }, [floorPlans]);

  const buildingIds = useMemo(() => {
    return Object.keys(floorPlansByBuilding);
  }, [floorPlansByBuilding]);

  useEffect(() => {
    if (!selectedBuildingId || !buildingIds.includes(selectedBuildingId)) {
      setSelectedBuildingId(buildingIds[0]);
    }
  }, [buildingIds, selectedBuildingId]);

  const floors = useMemo(() => {
    if (!selectedBuildingId) return [];

    return floorPlansByBuilding[selectedBuildingId] ?? [];
  }, [floorPlansByBuilding, selectedBuildingId]);

  useEffect(() => {
    if (floors.length === 0) {
      setSelectedFloorNumber(null);
      return;
    }

    const selectedFloorStillExists = floors.some(
      (floor) => floor.floorDetail.floor_number === selectedFloorNumber,
    );

    if (!selectedFloorStillExists) {
      const levelOne = floors.find(
        (floor) => floor.floorDetail.floor_number === 1,
      );
      setSelectedFloorNumber((levelOne ?? floors[0]).floorDetail.floor_number);
    }
  }, [floors, selectedFloorNumber]);

  const currentFloor = useMemo(() => {
    if (!selectedBuildingId || selectedFloorNumber == null) return null;

    return (
      floors.find(
        (floor) => floor.floorDetail.floor_number === selectedFloorNumber,
      ) ?? null
    );
  }, [floors, selectedFloorNumber]);

  useEffect(() => {
    setIsImageLoaded(false);
    setImageLoadError(false);
  }, [currentFloor?.floorDetail.image_url]);

  if (!currentFloor || !selectedBuildingId) {
    return (
      <View style={styles.mapWindow}>
        <Text>Indoor Map unavailable...</Text>
      </View>
    );
  }

  //here currentFloor is determined
  const pixelNodes = useMemo(() => {
    if (!currentFloor.nodes) return null
    return currentFloor.nodes.map((node) =>
      geoToPixel(
        node.latitude,
        node.longitude,
        currentFloor.floorDetail.affine,
      ),
    );
  }, [currentFloor]);
  const routePoints = useMemo(() => {
    if (!pixelNodes) return null
    return pixelNodes.map((p) => `${p.x},${p.y}`).join(" ");
  }, [pixelNodes]);

  const imageAspectRatio =
    currentFloor.floorDetail.image_width /
    currentFloor.floorDetail.image_height;

  const fittedSize =
    containerSize.width === 0 || containerSize.height === 0
      ? null
      : fitContainer(imageAspectRatio, {
          width: containerSize.width,
          height: containerSize.height,
        });

  const scaleX = fittedSize
    ? fittedSize.width / currentFloor.floorDetail.image_width
    : 1;
  const scaleY = fittedSize
    ? fittedSize.height / currentFloor.floorDetail.image_height
    : 1;

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
      {!fittedSize && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Loading indoor map...</Text>
        </View>
      )}
      {fittedSize && (
        <ResumableZoom minScale={1} maxScale={5} panMode="clamp">
          <View style={{ width: fittedSize.width, height: fittedSize.height }}>
            <Image
              source={{ uri: currentFloor.floorDetail.image_url }}
              style={{
                width: fittedSize.width,
                height: fittedSize.height,
                opacity: isImageLoaded ? 1 : 0
              }}
              resizeMode="contain"
              onLoadStart={() => {
                setIsImageLoaded(false);
                setImageLoadError(false);
              }}
              onLoad={() => {
                setIsImageLoaded(true);
              }}
              onError={() => {
                setImageLoadError(true);
              }}
            />
            {!isImageLoaded && !imageLoadError && (
              <View style={styles.loadingOverlay}>
                <Text style={styles.loadingText}>Loading indoor map...</Text>
              </View>
            )}

            {imageLoadError && (
              <View style={styles.loadingOverlay}>
                <Text style={styles.loadingText}>Failed to load indoor map</Text>
              </View>
            )}
            {isImageLoaded && <Svg
              width={fittedSize.width}
              height={fittedSize.height}
              viewBox={`0 0 ${currentFloor.floorDetail.image_width} ${currentFloor.floorDetail.image_height}`}
              style={[StyleSheet.absoluteFill, { zIndex: 10, elevation: 10 }]}
            >
              {routePoints && (<Polyline
                points={routePoints}
                fill="none"
                stroke="#0B4EA2"
                strokeWidth={8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />)}
              {pixelNodes && pixelNodes.map((point, index) => (
                <Circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r={12}
                  fill="#0B4EA2"
                />
              ))}
            </Svg>}
          </View>
        </ResumableZoom>
      )}
      <View style={styles.layerButtonsOverlay}>
        <IndoorViewButtons
          layers={floors.map((floor) =>
            getFloorLabel(floor.floorDetail.floor_number),
          )}
          selectedLayer={
            selectedFloorNumber == null
              ? undefined
              : getFloorLabel(selectedFloorNumber)
          }
          onPress={(layer) => {
            const selected = floors.find(
              (floor) =>
                getFloorLabel(floor.floorDetail.floor_number) === layer,
            );

            if (selected) {
              setSelectedFloorNumber(selected.floorDetail.floor_number);
            }
          }}
        />
      </View>
    </View>
  );
}
