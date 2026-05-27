import React, { createContext, useContext, useState } from "react";
import * as Location from "expo-location";

type RouteOption = {
  optionType: string;
  eta: number;
  routeTitle: string;
  routeDescription: string;
};

export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type RoutePlace = Coordinate & {
  name: string;
  id: string;
  description? :string;
  buildingId?: string;
};

type RouteContextType = {
  // searchDestination: string;
  // setSearchDestination: (destination: string) => void;

  userSearch: string;
  setUserSearch: (search: string) => void;

  selectedRoute: RouteOption | null;
  setSelectedRoute: (route: RouteOption | null) => void;

  origin: RoutePlace | null
  setOrigin: (origin: RoutePlace | null) => void;
  destination: RoutePlace | null
  setDestination: (destination: RoutePlace | null) => void;
};

const RouteContext = createContext<RouteContextType | undefined>(undefined);

export function RouteProvider({ children }: { children: React.ReactNode }) {
  // const [searchDestination, setSearchDestination] = useState("");
  const [userSearch, setUserSearch] = useState("")
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);

  const [origin, setOrigin] = useState<RoutePlace | null>(null);
  const [destination, setDestination] = useState<RoutePlace | null>(null);

  return (
    <RouteContext.Provider
      value={{
        userSearch,
        setUserSearch,
        // searchDestination,
        // setSearchDestination,
        selectedRoute,
        setSelectedRoute,
        origin, 
        setOrigin, 
        destination, 
        setDestination
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