import React, { createContext, useContext, useMemo, useState } from "react";
// import * as Location from "expo-location";
import { LocationDetail } from "@/api_debug/locations.logged";
import { RouteResponse } from "@/api_debug/routes.logged";
import {
  AffineCoeff,
  getBuildingFloorByLevel,
  NearestNode,
} from "@/api_debug/campus_map.logged";
import { POI_DATA_TYPE } from "@/app/data/POI";
import { FloorDetail } from "@/api_debug/campus_map.logged";
import { useQuery } from "@tanstack/react-query";

export type Coordinate = {
  latitude: number;
  longitude: number;
};

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
  nodes: Coordinate[];
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
  routePOIs: POI_DATA_TYPE[];
  setRoutePOIs: (poi: POI_DATA_TYPE[]) => void;
  floorPlans: FloorPlansByBuildingFloor | undefined;
  // floorPlanWithNodes: FloorPlanLayouts | undefined
};

const RouteContext = createContext<RouteContextType | undefined>(undefined);

export function RouteProvider({ children }: { children: React.ReactNode }) {
  // const [searchDestination, setSearchDestination] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<RouteResponse | null>(
    null,
  );

  const [origin, setOrigin] = useState<NearestNode | null>(null);
  const [destination, setDestination] = useState<LocationDetail | null>(null);
  const [routePOIs, setRoutePOIs] = useState<POI_DATA_TYPE[]>([]);
  // const [routes, setRoutes] = useState<RouteResponse[] | null>(null);
  //selectedRoute available, need to
  //1. group by colour
  //2. create array of array of LatLng objects
  //struct = [{mode: "walk", coords: LatLng[]}, {mode: "campus bus", coords: LatLng[]}]

  function buildRenderPath(selectedRoute: RouteResponse): RenderPath[] {
    console.log(selectedRoute.steps.length);
    console.log(selectedRoute.path_coordinates.length);
    console.log(selectedRoute.path_coordinates);
    selectedRoute.steps.forEach((step) => console.log(step.floor_transition));
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
  const routeSegments = useMemo(() => {
    if (!selectedRoute) {
      return [];
    }
    return buildRenderPath(selectedRoute);
  }, [selectedRoute]);

  async function getFloorPlans(
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
      let building_code = selectedRoute.steps[i].buildings_passed_by_id[1];
      let floor = selectedRoute.steps[i].floor_transition[1];
      if (curr == building_code && curr_floor == floor) {
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
          {
            latitude: selectedRoute.path_coordinates[i * 2][1],
            longitude: selectedRoute.path_coordinates[i * 2][0],
          },
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
      } else {
        console.log(`Unable to get floor plan for ${building_code}`);
        floorPlansByBuildingFloor[building_code] = null;
      }
    });

    return floorPlansByBuildingFloor;
  }

  const {
    data: floorPlans,
    isLoading: isFloorPlanLoading,
    error: floorPlansError,
  } = useQuery<FloorPlansByBuildingFloor>({
    queryKey: ["floorPlans", selectedRoute],
    queryFn: () => getFloorPlans(selectedRoute!),
    enabled: !!selectedRoute,
  });

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
        routePOIs,
        setRoutePOIs,
        floorPlans,
        // floorPlanWithNodes
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
