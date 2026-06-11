import React, { createContext, useContext, useMemo, useState } from "react";
// import * as Location from "expo-location";
import { Location } from "@/api/locations";
import { RouteResponse } from "@/api/routes";
import { NearestNode } from "@/api_debug/routes.logged";
import { POI_DATA_TYPE } from "@/app/data/POI";

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
  coords: {
    latitude: number;
    longitude: number;
  }[];
};

type RouteContextType = {
  // searchDestination: string;
  // setSearchDestination: (destination: string) => void;

  userSearch: string;
  setUserSearch: (search: string) => void;

  selectedRoute: RouteResponse | null;
  setSelectedRoute: (route: RouteResponse | null) => void;

  origin: NearestNode | null;
  setOrigin: (origin: NearestNode | null) => void;
  destination: Location | null;
  setDestination: (destination: Location | null) => void;
  // routes: RouteResponse[] | null;
  // setRoutes: (routes: RouteResponse[] | null) => void;
  routeSegments: RenderPath[];
  routePOIs: POI_DATA_TYPE[];
  setRoutePOIs: (poi: POI_DATA_TYPE[]) => void;
};

const RouteContext = createContext<RouteContextType | undefined>(undefined);

export function RouteProvider({ children }: { children: React.ReactNode }) {
  // const [searchDestination, setSearchDestination] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<RouteResponse | null>(
    null,
  );

  const [origin, setOrigin] = useState<NearestNode | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [routePOIs, setRoutePOIs] = useState<POI_DATA_TYPE[]>([]);
  // const [routes, setRoutes] = useState<RouteResponse[] | null>(null);
  //selectedRoute available, need to
  //1. group by colour
  //2. create array of array of LatLng objects
  //struct = [{mode: "walk", coords: LatLng[]}, {mode: "campus bus", coords: LatLng[]}]

  function buildRenderPath(selectedRoute: RouteResponse): RenderPath[] {
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
