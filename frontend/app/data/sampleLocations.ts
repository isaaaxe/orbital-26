import { Route } from "expo-router";

// export type RoutePlace = {
//   id: string;
//   name: string;
//   latitude: number;
//   longitude: number;
//   buildingId?: string;
//   description?: string;
// };

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

import { Location } from "@/api/locations";
export const sampleLocations: Location[] = [
  {
    id: "com1-0201",
    name: "COM1-0201",
    display_name: "COM1-0201",
    location_type: "room",
    building_code: "COM1",
    area_name: null,
    description: "Seminar Room 5",
  },
  {
    id: "com1-0203",
    name: "COM1-0203",
    display_name: "COM1-0203",
    location_type: "room",
    building_code: "COM1",
    area_name: null,
    description: "Seminar Room 6",
  },
  {
    id: "com1-0204",
    name: "COM1-0204",
    display_name: "COM1-0204",
    location_type: "room",
    building_code: "COM1",
    area_name: null,
    description: "Seminar Room 2",
  },
  {
    id: "com1-0206",
    name: "COM1-0206",
    display_name: "COM1-0206",
    location_type: "room",
    building_code: "COM1",
    area_name: null,
    description: "Seminar Room 1",
  },
  {
    id: "utown",
    name: "University Town",
    display_name: "University Town",
    location_type: "area",
    building_code: null,
    area_name: "UTown",
    description: null,
  },
  {
    id: "central-library",
    name: "Central Library",
    display_name: "Central Library",
    location_type: "building",
    building_code: "CLB",
    area_name: null,
    description: null,
  },
  {
    id: "deck",
    name: "The Deck",
    display_name: "The Deck",
    location_type: "building",
    building_code: null,
    area_name: null,
    description: null,
  },
  {
    id: "kent-ridge-mrt",
    name: "Kent Ridge MRT",
    display_name: "Kent Ridge MRT",
    location_type: "transport",
    building_code: null,
    area_name: "Kent Ridge",
    description: null,
  },
  {
    id: "biz2-bus-stop",
    name: "BIZ2 Bus Stop",
    display_name: "BIZ2 Bus Stop",
    location_type: "bus_stop",
    building_code: null,
    area_name: "BIZ2",
    description: null,
  },
];

export const sampleSavedLocations: Location[] = [
  {
    id: "com1-0201",
    name: "COM1-0201",
    display_name: "COM1-0201",
    location_type: "room",
    building_code: "COM1",
    area_name: null,
    description: "Seminar Room 5",
  },
  {
    id: "com1-0203",
    name: "COM1-0203",
    display_name: "COM1-0203",
    location_type: "room",
    building_code: "COM1",
    area_name: null,
    description: "Seminar Room 6",
  },
  {
    id: "com1-0204",
    name: "COM1-0204",
    display_name: "COM1-0204",
    location_type: "room",
    building_code: "COM1",
    area_name: null,
    description: "Seminar Room 2",
  },
  {
    id: "central-library",
    name: "Central Library",
    display_name: "Central Library",
    location_type: "building",
    building_code: "CLB",
    area_name: null,
    description: null,
  },
];

export const recentlyVisitedLocations: Location[] = [
  {
    id: "com1-0201",
    name: "COM1-0201",
    display_name: "COM1-0201",
    location_type: "room",
    building_code: "COM1",
    area_name: null,
    description: "Seminar Room 5",
  },
  {
    id: "com1-0203",
    name: "COM1-0203",
    display_name: "COM1-0203",
    location_type: "room",
    building_code: "COM1",
    area_name: null,
    description: "Seminar Room 6",
  },
  {
    id: "utown",
    name: "University Town",
    display_name: "University Town",
    location_type: "area",
    building_code: null,
    area_name: "UTown",
    description: null,
  },
  {
    id: "central-library",
    name: "Central Library",
    display_name: "Central Library",
    location_type: "building",
    building_code: "CLB",
    area_name: null,
    description: null,
  },
  {
    id: "deck",
    name: "The Deck",
    display_name: "The Deck",
    location_type: "building",
    building_code: null,
    area_name: null,
    description: null,
  },
];

export const closestNode: Location = {
  id: "utown",
  name: "University Town",
  display_name: "University Town",
  location_type: "area",
  building_code: null,
  area_name: "UTown",
  description: null,
};

import { RouteResponse } from "@/api/routes";

// export const mockRoute: RouteResponse = {
//   total_distance: 500,
//   total_estimated_seconds: 2000,

//   nodes: [
//     {
//       id: "node-utown",
//       latitude: 1.30401,
//       longitude: 103.77298,
//       name: "University Town",
//     },
//     {
//       id: "node-utown-exit",
//       latitude: 1.30325,
//       longitude: 103.77285,
//       name: "UTown Exit",
//     },
//     {
//       id: "node-education-road-1",
//       latitude: 1.30195,
//       longitude: 103.77295,
//       name: "Education Resource Centre Path",
//     },
//     {
//       id: "node-bridge-start",
//       latitude: 1.30065,
//       longitude: 103.77318,
//       name: "Link Path Start",
//     },
//     {
//       id: "node-bridge-mid",
//       latitude: 1.29935,
//       longitude: 103.77335,
//       name: "Link Path Middle",
//     },
//     {
//       id: "node-towards-com",
//       latitude: 1.29785,
//       longitude: 103.77355,
//       name: "Towards School of Computing",
//     },
//     {
//       id: "node-com2-side",
//       latitude: 1.29655,
//       longitude: 103.77375,
//       name: "COM2 Side Path",
//     },
//     {
//       id: "node-com1-entrance",
//       latitude: 1.29525,
//       longitude: 103.77395,
//       name: "COM1 Entrance",
//     },
//     {
//       id: "node-com1-level-2",
//       latitude: 1.29508,
//       longitude: 103.77388,
//       name: "COM1 Level 2",
//     },
//     {
//       id: "node-com1-0201",
//       latitude: 1.29502,
//       longitude: 103.77382,
//       name: "COM1-0201",
//     },
//   ],
// };

export const mockRoutev2: RouteResponse = {
  total_distance: 800,
  total_estimated_seconds: 2000,
  mode: "fastest",
  steps: [
    {
      step_number: 1,
      step_instruction:
        "Start at UTown bus stop and head towards College Circus.",
      transport_mode: "walk",
      distance_for_step: 120,
      estimated_seconds: 180,
      from_name: "UTown bus stop",
      to_name: "College circus entrance",
    },
    {
      step_number: 2,
      step_instruction:
        "Continue around College Circus towards UTown bus exit.",
      transport_mode: "walk",
      distance_for_step: 160,
      estimated_seconds: 240,
      from_name: "College circus entrance",
      to_name: "Utown bus exit",
    },
    {
      step_number: 3,
      step_instruction: "Follow College Link Road.",
      transport_mode: "walk",
      distance_for_step: 220,
      estimated_seconds: 360,
      from_name: "Utown bus exit",
      to_name: "College Link Road turn 3",
    },
    {
      step_number: 4,
      step_instruction: "Continue along Kent Ridge Crescent.",
      transport_mode: "walk",
      distance_for_step: 220,
      estimated_seconds: 420,
      from_name: "College Link Road turn 3",
      to_name: "Kent Ridge Kres curve corner 3",
    },
    {
      step_number: 5,
      step_instruction: "Head towards Central Library bus stop.",
      transport_mode: "walk",
      distance_for_step: 80,
      estimated_seconds: 160,
      from_name: "Kent Ridge Kres curve corner 3",
      to_name: "Central Library bus stop",
    },
  ],

  path_coordinates: [
    [1.303662152778908, 103.77474325618729],
    [1.3036898595397952, 103.77503436441853],
    [1.3037139930571071, 103.77552252761735],
    [1.303848068963592, 103.7755761721078],
    [1.3038346613625778, 103.77568614316255],
    [1.3036925408481457, 103.77568346083004],
    [1.3033982880444026, 103.77438865090716],
    [1.3028960536789422, 103.77397057589184],
    [1.3026230268821215, 103.77396383277252],
    [1.3013845763498575, 103.77446762012752],
    [1.3009097750447332, 103.7743715005148],
    [1.3005879928037967, 103.77434467844384],
    [1.300159870737548, 103.77459395813739],
    [1.299659816384449, 103.77465538415147],
    [1.2993396062334828, 103.7747475230997],
    [1.2992518774012725, 103.77448865654488],
    [1.2984359993051184, 103.7739007222745],
    [1.2978701480748156, 103.77311095987058],
    [1.296576146570338, 103.7725537384373],
  ],
};
