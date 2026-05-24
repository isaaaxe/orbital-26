import React, { createContext, useContext, useState } from "react";

type RouteOption = {
  optionType: string;
  eta: number;
  routeTitle: string;
  routeDescription: string;
};

type RouteContextType = {
  searchDestination: string;
  setSearchDestination: (destination: string) => void;

  userSearch: string;
  setUserSearch: (search: string) => void;

  selectedRoute: RouteOption | null;
  setSelectedRoute: (route: RouteOption | null) => void;
};

const RouteContext = createContext<RouteContextType | undefined>(undefined);

export function RouteProvider({ children }: { children: React.ReactNode }) {
  const [searchDestination, setSearchDestination] = useState("");
  const [userSearch, setUserSearch] = useState("")
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);

  return (
    <RouteContext.Provider
      value={{
        userSearch,
        setUserSearch,
        searchDestination,
        setSearchDestination,
        selectedRoute,
        setSelectedRoute,
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