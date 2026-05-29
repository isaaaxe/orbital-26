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
    longitude: 103.77361947116356,
    description: "Seminar Room 2",
  },
  {
    id: "com1-0206",
    name: "COM1-0206",
    latitude: 1.295017273904547,
    longitude: 103.77394252883644,
    description: "Seminar Room 1",
  },
  {
    id: "utown",
    name: "University Town",
    latitude: 1.304,
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
    longitude: 103.77361947116356,
    description: "Seminar Room 2",
  },
  {
    id: "central-library",
    name: "Central Library",
    latitude: 1.2966,
    longitude: 103.7732,
  },
];

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
    latitude: 1.304,
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
];

export const closestNode: RoutePlace = {
  id: "utown",
  name: "University Town",
  latitude: 1.304,
  longitude: 103.7737,
};

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

export const mockRoutev2: RouteResponse = {
  startNodeId: "test",
  endNodeId: "test",
  distanceMeters: 500,
  nodes: [
    {
      id: "test",
      latitude: 1.303662152778908,
      longitude: 103.77474325618729,
      name: "UTown bus stop",
    },
    {
      id: "test",
      latitude: 1.3036898595397952,
      longitude: 103.77503436441853,
      name: "UTown bus stop turn 1",
    },
    {
      id: "test",
      latitude: 1.3037139930571071,
      longitude: 103.77552252761735,
      name: "College circus entrance",
    },
    {
      id: "test",
      latitude: 1.303848068963592,
      longitude: 103.7755761721078,
      name: "College circus turn 1",
    },
    {
      id: "test",
      latitude: 1.3038346613625778,
      longitude: 103.77568614316255,
      name: "College circus turn 2",
    },
    {
      id: "test",
      latitude: 1.3036925408481457,
      longitude: 103.77568346083004,
      name: "College circus turn 3",
    },
    {
      id: "test",
      latitude: 1.3033982880444026,
      longitude: 103.77438865090716,
      name: "Utown bus exit",
    },
    {
      id: "test",
      latitude: 1.3028960536789422,
      longitude: 103.77397057589184,
      name: "College Link Road turn 1",
    },
    {
      id: "test",
      latitude: 1.3026230268821215,
      longitude: 103.77396383277252,
      name: "College Link Road turn 2",
    },
    {
      id: "test",
      latitude: 1.3013845763498575,
      longitude: 103.77446762012752,
      name: "College Link Road turn 3",
    },
    {
      id: "test",
      latitude: 1.3009097750447332,
      longitude: 103.7743715005148,
      name: "Kent Ridge Kres roundabout opening 1",
    },
    {
      id: "test",
      latitude: 1.3005879928037967,
      longitude: 103.77434467844384,
      name: "Kent Ridge Kres roundabout opening 2",
    },
    {
      id: "test",
      latitude: 1.300159870737548,
      longitude: 103.77459395813739,
      name: "Kent Ridge Kres curve corner 1",
    },
    {
      id: "test",
      latitude: 1.299659816384449,
      longitude: 103.77465538415147,
      name: "Kent Ridge Kres circus opening 1",
    },
    {
      id: "test",
      latitude: 1.2993396062334828,
      longitude: 103.7747475230997,
      name: "Kent Ridge Kres circus turn 1",
    },
    {
      id: "test",
      latitude: 1.2992518774012725,
      longitude: 103.77448865654488,
      name: "Kent Ridge Kres circus opening 2",
    },
    {
      id: "test",
      latitude: 1.2984359993051184,
      longitude: 103.7739007222745,
      name: "Kent Ridge Kres curve corner 2",
    },
    {
      id: "test",
      latitude: 1.2978701480748156,
      longitude: 103.77311095987058,
      name: "Kent Ridge Kres curve corner 3",
    },
    {
      id: "test",
      latitude: 1.296576146570338,
      longitude: 103.7725537384373,
      name: "Central Library bus stop",
    },
  ],
};