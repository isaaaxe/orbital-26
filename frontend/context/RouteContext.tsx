import React, { createContext, useContext, useMemo, useState } from "react";
// import * as Location from "expo-location";
import { LocationDetail } from "@/api_debug/locations.logged";
import { RouteResponse } from "@/api_debug/routes.logged";
import {
  AffineCoeff,
  getBuildingFloorByLevel,
  getBuildingFloors,
  NearestNode,
} from "@/api_debug/campus_map.logged";
import { POI_DATA_TYPE } from "@/app/data/POI";
import { FloorDetail } from "@/api_debug/campus_map.logged";
import { useQuery } from "@tanstack/react-query";
import { Mode } from "@/app/(tabs)/map";

export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type MapParams = { coordinates: Coordinate; delta: number };

export type ROUTE_COLOURS_TYPE = {
  [mode: string]: string;
};

export const ROUTE_COLOURS: ROUTE_COLOURS_TYPE = {
  walk: "#0B2D73",
  "campus bus": "#f86a04",
};

export type RenderPath = {
  mode: string;
  coords: Coordinate[];
};
//need to add the nodes as well
type BuildId = string;
type FloorNumber = number;

type BuildingFloorKey = `${BuildId}:${FloorNumber}`;

export type FloorPlanLayout = {
  floorDetail: FloorDetail;
  nodes: Coordinate[] | null;
  affine: AffineCoeff;
};

export type FloorPlansByBuildingFloor = Record<
  BuildingFloorKey,
  FloorPlanLayout | null
>;

export function getBuildingFloorKey(
  buildingId: string,
  floorNumber: number,
): BuildingFloorKey {
  return `${buildingId}:${floorNumber}`;
}

type RouteContextType = {
  // searchDestination: string;
  // setSearchDestination: (destination: string) => void;

  userSearch: string;
  setUserSearch: (search: string) => void;

  selectedRoute: RouteResponse | null;
  setSelectedRoute: (route: RouteResponse | null) => void;

  origin: NearestNode | null;
  setOrigin: (origin: NearestNode | null) => void;
  destination: LocationDetail | null;
  setDestination: (destination: LocationDetail | null) => void;
  // routes: RouteResponse[] | null;
  // setRoutes: (routes: RouteResponse[] | null) => void;
  routeSegments: RenderPath[];
  // routePOIs: POI_DATA_TYPE[];
  // setRoutePOIs: (poi: POI_DATA_TYPE[]) => void;
  floorPlans: FloorPlansByBuildingFloor | undefined;
  floorPlansLoading: boolean;
  selectedLocation: LocationDetail | null;
  setSelectedLocation: (loc_detail: LocationDetail | null) => void;
  floorPlanSource: "route" | "building" | null;
  setFloorPlanSource: (source: "route" | "building" | null) => void;
  mapMode: Mode;
  setMapMode: (mode: Mode) => void;
  mapParams: { coordinates: Coordinate; delta: number };
};

const RouteContext = createContext<RouteContextType | undefined>(undefined);
const initMapParams = {
  coordinates: {
    latitude: 1.300291282646443,
    longitude: 103.77733947340228,
  },
  delta: 0.016,
};

export function RouteProvider({ children }: { children: React.ReactNode }) {
  // const [searchDestination, setSearchDestination] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<RouteResponse | null>(
    null,
  );

  const [origin, setOrigin] = useState<NearestNode | null>(null);
  const [destination, setDestination] = useState<LocationDetail | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationDetail | null>(null);
  const [floorPlanSource, setFloorPlanSource] = useState<
    "route" | "building" | null
  >("route");
  const [mapMode, setMapMode] = useState<Mode>("building");
  const [mapParams, setMapParams] = useState<MapParams>(initMapParams);

  function buildRenderPath(selectedRoute: RouteResponse): RenderPath[] {
    // console.log(selectedRoute.steps.length);
    // console.log(selectedRoute.path_coordinates.length);
    // console.log(selectedRoute.steps.length);
    // console.log(selectedRoute.path_coordinates.length);
    // console.log(selectedRoute.path_coordinates);
    const groupOfSteps: RenderPath[] = [];
    let prev = null;
    for (let i = 0; i < selectedRoute.steps.length; i++) {
      if (prev == null) {
        groupOfSteps.push({
          mode: selectedRoute.steps[i].transport_mode,
          coords: [
            {
              latitude: selectedRoute.path_coordinates[i * 2][1],
              longitude: selectedRoute.path_coordinates[i * 2][0],
            },
            {
              latitude: selectedRoute.path_coordinates[i * 2 + 1][1],
              longitude: selectedRoute.path_coordinates[i * 2 + 1][0],
            },
          ],
        });
        prev = selectedRoute.steps[i].transport_mode;
      } else if (selectedRoute.steps[i].transport_mode == prev) {
        groupOfSteps[groupOfSteps.length - 1].coords.push({
          latitude: selectedRoute.path_coordinates[i * 2 + 1][1],
          longitude: selectedRoute.path_coordinates[i * 2 + 1][0],
        });
      } else {
        groupOfSteps.push({
          mode: selectedRoute.steps[i].transport_mode,
          coords: [
            {
              latitude: selectedRoute.path_coordinates[i * 2][1],
              longitude: selectedRoute.path_coordinates[i * 2][0],
            },
            {
              latitude: selectedRoute.path_coordinates[i * 2 + 1][1],
              longitude: selectedRoute.path_coordinates[i * 2 + 1][0],
            },
          ],
        });
        prev = selectedRoute.steps[i].transport_mode;
      }
    }
    return groupOfSteps;
  }

  function getMapParams(selectedRoute: RouteResponse) {
    let topLat: number = -999;
    let botLat: number = 999;
    let rightLng: number = -999;
    let leftLng: number = 999;

    for (let i = 0; i < selectedRoute.path_coordinates.length / 2; i++) {
      const [lng, lat] = selectedRoute.path_coordinates[i * 2];
      leftLng = lng < leftLng ? lng : leftLng;
      rightLng = lng > rightLng ? lng : rightLng;
      topLat = lat > topLat ? lat : topLat;
      botLat = lat < botLat ? lat : botLat;
    }
    // one more extra for last coord
    const [lastLng, lastLat] =
      selectedRoute.path_coordinates[selectedRoute.path_coordinates.length - 1];
    leftLng = lastLng < leftLng ? lastLng : leftLng;
    rightLng = lastLng > rightLng ? lastLng : rightLng;
    topLat = lastLat > topLat ? lastLat : topLat;
    botLat = lastLat < botLat ? lastLat : botLat;

    // calc mid point
    const midLng = (leftLng + rightLng) / 2;
    const midLat = (topLat + botLat) / 2;
    // calc delta
    const delta = Math.max((midLng - leftLng) * 2.5, (midLat - botLat) * 2);
    setMapParams({
      coordinates: {
        latitude: midLat,
        longitude: midLng,
      },
      delta: delta,
    });
  }

  const routeSegments = useMemo(() => {
    if (!selectedRoute) {
      return [];
    }
    //can call the function here
    getMapParams(selectedRoute);
    return buildRenderPath(selectedRoute);
  }, [selectedRoute]);

  async function getFloorPlansByRoute(
    selectedRoute: RouteResponse,
  ): Promise<FloorPlansByBuildingFloor> {
    const building_codes: BuildingFloorKey[] = [];
    const nodesByBuildingFloor: Coordinate[][] = [];

    let curr = selectedRoute.steps[0].buildings_passed_by_id[0]; //first item passed by
    let curr_floor = selectedRoute.steps[0].floor_transition[0];
    if (curr != null) {
      building_codes.push(getBuildingFloorKey(curr, curr_floor));
      nodesByBuildingFloor.push([
        {
          latitude: selectedRoute.path_coordinates[0][1],
          longitude: selectedRoute.path_coordinates[0][0],
        },
      ]);
    }
    for (let i = 0; i < selectedRoute.steps.length; i++) {
      //look at index 1 item
      // console.log(selectedRoute.steps[i].buildings_passed_by_id);
      let building_code = selectedRoute.steps[i].buildings_passed_by_id[1];
      let floor = selectedRoute.steps[i].floor_transition[1];
      if (
        curr == building_code &&
        curr_floor == floor &&
        building_code != null
      ) {
        //continues from latest path
        //add the node to latest
        nodesByBuildingFloor[nodesByBuildingFloor.length - 1].push({
          latitude: selectedRoute.path_coordinates[i * 2 + 1][1],
          longitude: selectedRoute.path_coordinates[i * 2 + 1][0],
        });
        continue;
      }
      if (building_code == null) {
        //path ended
        if (curr != null) {
          //add latest node
          nodesByBuildingFloor[nodesByBuildingFloor.length - 1].push({
            latitude: selectedRoute.path_coordinates[i * 2 + 1][1],
            longitude: selectedRoute.path_coordinates[i * 2 + 1][0],
          });
        }
        curr = null;
      } else {
        curr = building_code;
        curr_floor = floor;
        building_codes.push(getBuildingFloorKey(curr, curr_floor));
        //make new entry in nodesByBuildingFloor, but capture the prev node as well
        nodesByBuildingFloor.push([
          // {
          //   latitude: selectedRoute.path_coordinates[i * 2][1],
          //   longitude: selectedRoute.path_coordinates[i * 2][0],
          // },
          {
            latitude: selectedRoute.path_coordinates[i * 2 + 1][1],
            longitude: selectedRoute.path_coordinates[i * 2 + 1][0],
          },
        ]);
      }
    }

    const floorPlansByBuildingFloor: FloorPlansByBuildingFloor = {};
    const res = await Promise.allSettled(
      building_codes.map((code) => {
        const [building_code, floor] = code.split(":");
        return getBuildingFloorByLevel(building_code, Number(floor));
      }),
    );
    res.forEach((result, index) => {
      const building_code = building_codes[index];
      if (result.status == "fulfilled") {
        floorPlansByBuildingFloor[building_code] = {
          floorDetail: result.value,
          nodes: nodesByBuildingFloor[index],
          affine: result.value.affine,
        };
        // console.log(building_code);
        // console.log(nodesByBuildingFloor[index]);
      } else {
        console.log(`Unable to get floor plan for ${building_code}`);
        floorPlansByBuildingFloor[building_code] = null;
      }
    });
    // console.log(floorPlansByBuildingFloor);
    // Object.values(floorPlansByBuildingFloor).forEach((floor) => {
    //   console.log(floor?.nodes);
    // });
    return floorPlansByBuildingFloor;
  }

  async function getFloorPlansByBuilding(selectedLocation: LocationDetail) {
    const buildingId = selectedLocation.building_id;
    const building_floor_plans: FloorDetail[] = await getBuildingFloors(
      buildingId!,
    );
    const res: FloorPlansByBuildingFloor = {};
    building_floor_plans.forEach((floor) => {
      const key = getBuildingFloorKey(floor.building_id, floor.floor_number);
      res[key] = { floorDetail: floor, nodes: null, affine: floor.affine };
    });
    return res;
  }

  const {
    data: floorPlansByRoute,
    isLoading: isFloorPlanLoadingByRoute,
    error: floorPlansErrorByRoute,
  } = useQuery<FloorPlansByBuildingFloor>({
    queryKey: ["floorPlans", selectedRoute],
    queryFn: () => getFloorPlansByRoute(selectedRoute!),
    enabled: !!selectedRoute && floorPlanSource == "route",
  });

  const {
    data: floorPlansByBuilding,
    isLoading: isFloorPlanLoadingByBuilding,
    error: floorPlansErrorByBuilding,
  } = useQuery<FloorPlansByBuildingFloor>({
    queryKey: ["floorPlans", selectedLocation],
    queryFn: () => getFloorPlansByBuilding(selectedLocation!),
    enabled: !!selectedLocation && floorPlanSource == "building",
  });

  const floorPlans =
    floorPlanSource === "route" ? floorPlansByRoute : floorPlansByBuilding;

  const floorPlansLoading =
    floorPlanSource === "route"
      ? isFloorPlanLoadingByRoute
      : isFloorPlanLoadingByBuilding;
  // console.log(selectedRoute?.path_coordinates.length);
  // console.log(selectedRoute?.path_coordinates);

  return (
    <RouteContext.Provider
      value={{
        userSearch,
        setUserSearch,
        selectedRoute,
        setSelectedRoute,
        origin,
        setOrigin,
        destination,
        setDestination,
        routeSegments,
        floorPlans,
        floorPlansLoading,
        selectedLocation,
        setSelectedLocation,
        floorPlanSource,
        setFloorPlanSource,
        mapMode,
        setMapMode,
        mapParams,
      }}
    >
      {children}
    </RouteContext.Provider>
  );
}

export function useRouteContext() {
  const context = useContext(RouteContext);

  if (!context) {
    throw new Error("useRouteContext must be used inside RouteProvider");
  }

  return context;
}
