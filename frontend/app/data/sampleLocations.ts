
export type SampleLocation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  buildingId?: string;
  description?: string;
};

export const sampleLocations: SampleLocation[] = [
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

export const sampleSavedLocations: SampleLocation[] = [
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
]