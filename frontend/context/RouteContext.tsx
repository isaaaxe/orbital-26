import React, { createContext, useContext, useState } from "react";
// import * as Location from "expo-location";
import { Location } from "@/api/locations";
import { RouteResponse } from "@/api/routes";
import { NearestNode } from "@/api_debug/routes.logged";

export type Coordinate = {
  latitude: number;
  longitude: number;
};

// export type RoutePlace = Coordinate & {
//   name: string;
//   id: string;
//   description?: string;
//   buildingId?: string;
// };

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
  // const [routes, setRoutes] = useState<RouteResponse[] | null>(null);

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
        // routes,
        // setRoutes,
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
