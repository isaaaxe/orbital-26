import { Route } from "expo-router";

export type RoutePlace = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  buildingId?: string;
  description?: string;
};

export type RouteOptionType =
  | "Fastest"
  | "Walking only"
  | "Accessible"
  | "Carpark";

export type RouteOption = {
  id: string;
  optionType: RouteOptionType;
  title: string;
  description: string;
  distanceMeters: number;
  estimatedMinutes: number;
};

export const sampleLocations: RoutePlace[] = [
  {
    id: "com1-0201",
    name: "COM1-0201",
    latitude: 1.2954072407950261,
    longitude: 103.77357718123713,
    description: "Seminar Room 5",
  },
  {
    id: "com1-0203",
    name: "COM1-0203",
    latitude: 1.2954320448868748, 
    longitude: 103.77367776407878,
    description: "Seminar Room 6",
  },
  {
    id: "com1-0204",
    name: "COM1-0204",
    latitude: 1.295071700000007,
    longitude:   103.77361947116356,
    description: "Seminar Room 2",
  },
  {
    id: "com1-0206",
    name: "COM1-0206",
    latitude: 1.295017273904547, 
    longitude: 103.77394252883644,
    description: "Seminar Room 1"
  },
  {
    id: "utown",
    name: "University Town",
    latitude: 1.3040,
    longitude: 103.7737,
  },
  {
    id: "central-library",
    name: "Central Library",
    latitude: 1.2966,
    longitude: 103.7732,
  },
  {
    id: "deck",
    name: "The Deck",
    latitude: 1.2942,
    longitude: 103.7719,
  },
  {
    id: "kent-ridge-mrt",
    name: "Kent Ridge MRT",
    latitude: 1.2936,
    longitude: 103.7844,
  },
  {
    id: "biz2-bus-stop",
    name: "BIZ2 Bus Stop",
    latitude: 1.2931,
    longitude: 103.7756,
  },
];

export const sampleSavedLocations: RoutePlace[] = [
  {
    id: "com1-0201",
    name: "COM1-0201",
    latitude: 1.2954072407950261,
    longitude: 103.77357718123713,
    description: "Seminar Room 5",
  },
  {
    id: "com1-0203",
    name: "COM1-0203",
    latitude: 1.2954320448868748, 
    longitude: 103.77367776407878,
    description: "Seminar Room 6",
  },
  {
    id: "com1-0204",
    name: "COM1-0204",
    latitude: 1.295071700000007,
    longitude:   103.77361947116356,
    description: "Seminar Room 2",
  },
  {
    id: "central-library",
    name: "Central Library",
    latitude: 1.2966,
    longitude: 103.7732,
  },
]

export const recentlyVisitedLocations: RoutePlace[] = [
  {
    id: "com1-0201",
    name: "COM1-0201",
    latitude: 1.2954072407950261,
    longitude: 103.77357718123713,
    description: "Seminar Room 5",
  },
  {
    id: "com1-0203",
    name: "COM1-0203",
    latitude: 1.2954320448868748, 
    longitude: 103.77367776407878,
    description: "Seminar Room 6",
  },
  {
    id: "utown",
    name: "University Town",
    latitude: 1.3040,
    longitude: 103.7737,
  },
  {
    id: "central-library",
    name: "Central Library",
    latitude: 1.2966,
    longitude: 103.7732,
  },
  {
    id: "deck",
    name: "The Deck",
    latitude: 1.2942,
    longitude: 103.7719,
  },
]

export const closestNode: RoutePlace =   {
    id: "utown",
    name: "University Town",
    latitude: 1.3040,
    longitude: 103.7737,
}

import { RouteResponse } from "@/api/routes";

export const mockRoute: RouteResponse = {
  startNodeId: "node-utown",
  endNodeId: "node-com1-0201",
  distanceMeters: 950,
  nodes: [
    {
      id: "node-utown",
      latitude: 1.30401,
      longitude: 103.77298,
      name: "University Town",
    },
    {
      id: "node-utown-exit",
      latitude: 1.30325,
      longitude: 103.77285,
      name: "UTown Exit",
    },
    {
      id: "node-education-road-1",
      latitude: 1.30195,
      longitude: 103.77295,
      name: "Education Resource Centre Path",
    },
    {
      id: "node-bridge-start",
      latitude: 1.30065,
      longitude: 103.77318,
      name: "Link Path Start",
    },
    {
      id: "node-bridge-mid",
      latitude: 1.29935,
      longitude: 103.77335,
      name: "Link Path Middle",
    },
    {
      id: "node-towards-com",
      latitude: 1.29785,
      longitude: 103.77355,
      name: "Towards School of Computing",
    },
    {
      id: "node-com2-side",
      latitude: 1.29655,
      longitude: 103.77375,
      name: "COM2 Side Path",
    },
    {
      id: "node-com1-entrance",
      latitude: 1.29525,
      longitude: 103.77395,
      name: "COM1 Entrance",
    },
    {
      id: "node-com1-level-2",
      latitude: 1.29508,
      longitude: 103.77388,
      name: "COM1 Level 2",
    },
    {
      id: "node-com1-0201",
      latitude: 1.29502,
      longitude: 103.77382,
      name: "COM1-0201",
    },
  ],
};

export const sampleRouteOptions: RouteOption[] = [
  {
    id: "fastest",
    optionType: "Fastest",
    title: "Fastest Route",
    description: "Shortest estimated route to your destination.",
    distanceMeters: 420,
    estimatedMinutes: 6,
  },
  {
    id: "walking_only",
    optionType: "Walking only",
    title: "Walking Only",
    description: "Avoids buses, carparks, and vehicle-based segments.",
    distanceMeters: 520,
    estimatedMinutes: 8,
  },
  {
    id: "accessible",
    optionType: "Accessible",
    title: "Accessible Route",
    description: "Prioritises ramps, lifts, and step-free paths.",
    distanceMeters: 610,
    estimatedMinutes: 10,
  },
  {
    id: "carpark",
    optionType: "Carpark",
    title: "Via Carpark",
    description: "Routes through nearby carpark access points where useful.",
    distanceMeters: 700,
    estimatedMinutes: 11,
  },
];