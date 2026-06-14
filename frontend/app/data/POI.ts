export type POI_DATA_TYPE = {
  display_name: string;
  name: string;
  code: string;
  boundary: {
    latitude: number;
    longitude: number;
  }[];
  center: { latitude: number; longitude: number };
  color: string;
};

export type POI_GROUP_TYPE = {
  name: string;
  boundary: {
    latitude: number;
    longitude: number;
  }[];
  color: string;
  center: { latitude: number; longitude: number };
};

export const POI_DATA: POI_DATA_TYPE[] = [
  {
    display_name: "C1",
    name: "COM 1",
    code: "COM1",
    boundary: [
      { latitude: 1.2955517929338451, longitude: 103.77362779578262 },
      { latitude: 1.2947299755116342, longitude: 103.77438699306742 },
      { latitude: 1.2945436921497224, longitude: 103.77422742209411 },
      { latitude: 1.2944627308787748, longitude: 103.77398898114822 },
      { latitude: 1.2950444336107492, longitude: 103.77342919058599 },
      { latitude: 1.29539731482386, longitude: 103.77345952406473 },
      { latitude: 1.2955517929338451, longitude: 103.77362779578262 },
    ],
    center: { latitude: 1.294918607305062, longitude: 103.77391249242724 },
    color: "rgba(130, 202, 255, 0.75)",
  },
  {
    display_name: "C2",
    name: "COM 2",
    code: "COM2",
    boundary: [
      { latitude: 1.2944627308787748, longitude: 103.77398898114822 },
      { latitude: 1.2945436921497224, longitude: 103.77422742209411 },
      { latitude: 1.294081444946064, longitude: 103.77409531776226 },
      { latitude: 1.2938379396888149, longitude: 103.77419439601114 },
      { latitude: 1.294024793528894, longitude: 103.77467327421401 },
      { latitude: 1.293609514418326, longitude: 103.7748888537719 },
      { latitude: 1.2932021574991703, longitude: 103.77404491475349 },
      { latitude: 1.293947385044634, longitude: 103.77372069970775 },
      { latitude: 1.2944627308787748, longitude: 103.77398898114822 },
    ],
    center: { latitude: 1.2938803589279313, longitude: 103.77404986077516 },
    color: "rgba(100, 149, 237, 0.75)",
  },
  {
    display_name: "C3",
    name: "COM 3",
    code: "COM3",
    boundary: [
      { latitude: 1.2945436921497224, longitude: 103.77422742209411 },
      { latitude: 1.2947299755116342, longitude: 103.77438699306742 },
      { latitude: 1.2953463385782924, longitude: 103.77381759510382 },
      { latitude: 1.2958246538217122, longitude: 103.77446165213088 },
      { latitude: 1.2943026734735577, longitude: 103.77521100556537 },
      { latitude: 1.294024793528894, longitude: 103.77467327421401 },
      { latitude: 1.2938379396888149, longitude: 103.77419439601114 },
      { latitude: 1.294081444946064, longitude: 103.77409531776226 },
      { latitude: 1.2945436921497224, longitude: 103.77422742209411 },
    ],
    center: { latitude: 1.2947297763475263, longitude: 103.77460462789179 },
    color: "rgba(30, 144, 255, 0.75)",
  },
];

export const POI_CANTEEN: POI_DATA_TYPE[] = [
  {
    display_name: "Terrace",
    name: "Terrace",
    code: "Terrace",
    boundary: [
      { latitude: 1.294462299052614, longitude: 103.77419892148188 },
      { latitude: 1.2945655377420602, longitude: 103.77442154483806 },
      { latitude: 1.294172506555371, longitude: 103.77460144543792 },
      { latitude: 1.2940324642468757, longitude: 103.7743239750433 },
      { latitude: 1.2943684233096564, longitude: 103.77416510040534 },
      { latitude: 1.294462299052614, longitude: 103.77419892148188 },
    ],
    center: { latitude: 1.2943825013135533, longitude: 103.77434145565437 },
    color: "rgba(118, 180, 250, 0.75)",
  },
  {
    display_name: "The Deck",
    name: "The Deck",
    code: "The Deck",
    boundary: [
      { latitude: 1.29484227539654, longitude: 103.77223567704927 },
      { latitude: 1.2949505098245335, longitude: 103.7724623507819 },
      { latitude: 1.2947644818985788, longitude: 103.7727465387452 },
      { latitude: 1.2945108074320788, longitude: 103.77272285641492 },
      { latitude: 1.294376641815105, longitude: 103.77247137262201 },
      { latitude: 1.2945130623163448, longitude: 103.77222891066918 },
      { latitude: 1.29484227539654, longitude: 103.77223567704927 },
    ],
    center: { latitude: 1.2946720316515028, longitude: 103.77249167176225 },
    color: "rgba(254, 220, 86, 0.75)",
  },
];

export const POI_BUS_STOPS: POI_DATA_TYPE[] = [
  {
    display_name: "AS5",
    name: "AS5",
    code: "as5_bus_stop",
    boundary: [],
    center: { latitude: 1.2937627750417746, longitude: 103.77148072711469 },
    color: "",
  },
  {
    display_name: "BIZ 2",
    name: "BIZ 2",
    code: "biz2_bus_stop",
    boundary: [],
    center: { latitude: 1.293345963585481, longitude: 103.7751221519664 },
    color: "",
  },
  {
    display_name: "Central Library",
    name: "CLB",
    code: "clb_bus_stop",
    boundary: [],
    center: { latitude: 1.2965656305266464, longitude: 103.77254245107346 },
    color: "",
  },
  {
    display_name: "Computing 3",
    name: "Computing 3",
    code: "com3_bus_stop",
    boundary: [],
    center: { latitude: 1.2945325069297082, longitude: 103.77518748197289 },
    color: "",
  },
  {
    display_name: "Information Technology",
    name: "IT",
    code: "it_bus_stop",
    boundary: [],
    center: { latitude: 1.2972252834562263, longitude: 103.77268917770141 },
    color: "",
  },
  {
    display_name: "Yusof Ishak House",
    name: "YIH",
    code: "yih_bus_stop",
    boundary: [],
    center: { latitude: 1.2989031578252643, longitude: 103.77438482843635 },
    color: "",
  },
  {
    display_name: "Opp Yusof Ishak House",
    name: "Opp YIH",
    code: "opp_yih_bus_stop",
    boundary: [],
    center: { latitude: 1.2965656305266464, longitude: 103.77254245107346 },
    color: "",
  },
  {
    display_name: "Kent Ridge Bus Terminal",
    name: "KR Bus Ter",
    code: "kr_bus_ter",
    boundary: [],
    center: { latitude: 1.2942543647095595, longitude: 103.76975006083703 },
    color: "",
  },
  {
    display_name: "Kent Ridge MRT",
    name: "KR MRT",
    code: "kr_mrt_bus_stop",
    boundary: [],
    center: { latitude: 1.294828023637707, longitude: 103.78443258554935 },
    color: "",
  },
  {
    display_name: "LT 13",
    name: "LT 13",
    code: "lt_13_bus_stop",
    boundary: [],
    center: { latitude: 1.2945616755859357, longitude: 103.77061079310505 },
    color: "",
  },
  {
    display_name: "LT 27",
    name: "LT 27",
    code: "lt_27_bus_stop",
    boundary: [],
    center: { latitude: 1.2974099445001437, longitude: 103.78095407427769 },
    color: "",
  },
  {
    display_name: "Museum",
    name: "Museum",
    code: "museum_bus_stop",
    boundary: [],
    center: { latitude: 1.3010866786494832, longitude: 103.77370339583585 },
    color: "",
  },
  {
    display_name: "Opp HSSML",
    name: "Opp HSSML",
    code: "opp_hssml_bus_stop",
    boundary: [],
    center: { latitude: 1.2928662517322573, longitude: 103.77500762644067 },
    color: "",
  },
  {
    display_name: "Opp Kent Ridge MRT",
    name: "Opp KR MRT",
    code: "opp_kr_mrt_bus_stop",
    boundary: [],
    center: { latitude: 1.2949471515016537, longitude: 103.78457909863756 },
    color: "",
  },
  {
    display_name: "Opp NUSS",
    name: "Opp NUSS",
    code: "opp_nuss_bus_stop",
    boundary: [],
    center: { latitude: 1.2932481678954533, longitude: 103.77256865756615 },
    color: "",
  },
  {
    display_name: "Opp SDE 3",
    name: "Opp SDE 3",
    code: "opp_sde_bus_stop",
    boundary: [],
    center: { latitude: 1.2978600217413119, longitude: 103.76965105063196 },
    color: "",
  },
  {
    display_name: "Opp TCOMS",
    name: "Opp TCOMS",
    code: "opp_tcoms_bus_stop",
    boundary: [],
    center: { latitude: 1.293820582489697, longitude: 103.77673763267296 },
    color: "",
  },
  {
    display_name: "Opp University Hall",
    name: "Opp UHall",
    code: "opp_uhall_bus_stop",
    boundary: [],
    center: { latitude: 1.297536268937435, longitude: 103.77812682281393 },
    color: "",
  },
  {
    display_name: "Opp University Health Centre",
    name: "Opp UHC",
    code: "opp_uhc_bus_stop",
    boundary: [],
    center: { latitude: 1.2987839835250539, longitude: 103.77561696209608 },
    color: "",
  },
  {
    display_name: "Prince George's Park",
    name: "PGP",
    code: "pgp_bus_stop",
    boundary: [],
    center: { latitude: 1.2917827712709424, longitude: 103.78040354789883 },
    color: "",
  },
  {
    display_name: "Prince George's Park Foyer",
    name: "PGP Foyer",
    code: "pgp_foyer_bus_stop",
    boundary: [],
    center: { latitude: 1.2909983953944193, longitude: 103.78105223165615 },
    color: "",
  },
  {
    display_name: "Raffles Hall",
    name: "Raffles Hall",
    code: "raffles_hall_bus_stop",
    boundary: [],
    center: { latitude: 1.300984237731914, longitude: 103.77270081356113 },
    color: "",
  },
  {
    display_name: "S17",
    name: "S17",
    code: "s17_bus_stop",
    boundary: [],
    center: { latitude: 1.2975263451949979, longitude: 103.78072756848783 },
    color: "",
  },
  {
    display_name: "TCOMS",
    name: "TCOMS",
    code: "tcoms_bus_stop",
    boundary: [],
    center: { latitude: 1.2936815773265218, longitude: 103.77689649328939 },
    color: "",
  },
  {
    display_name: "University Hall",
    name: "UHall",
    code: "uhall_bus_stop",
    boundary: [],
    center: { latitude: 1.2974241133989246, longitude: 103.77805828113925 },
    color: "",
  },
  {
    display_name: "University Health Centre",
    name: "UHC",
    code: "uhc_bus_stop",
    boundary: [],
    center: { latitude: 1.298927352523014, longitude: 103.77610974422547 },
    color: "",
  },
  {
    display_name: "Univeristy Town",
    name: "U Town",
    code: "utown_bus_stop",
    boundary: [],
    center: { latitude: 1.2965656305266464, longitude: 103.77254245107346 },
    color: "",
  },
  {
    display_name: "Ventus",
    name: "Ventus",
    code: "ventus_bus_stop",
    boundary: [],
    center: { latitude: 1.2954004625472149, longitude: 103.77062104859067 },
    color: "",
  },
];

export const POI_GROUPS: POI_GROUP_TYPE[] = [
  {
    name: "COM",
    boundary: [
      { latitude: 1.2932021574991703, longitude: 103.77404491475349 },
      { latitude: 1.293947385044634, longitude: 103.77372069970775 },
      { latitude: 1.2944627308787748, longitude: 103.77398898114822 },
      { latitude: 1.2950444336107492, longitude: 103.77342919058599 },
      { latitude: 1.29539731482386, longitude: 103.77345952406473 },
      { latitude: 1.2955517929338451, longitude: 103.77362779578262 },
      { latitude: 1.2953463385782924, longitude: 103.77381759510382 },
      { latitude: 1.2958246538217122, longitude: 103.77446165213088 },
      { latitude: 1.2943026734735577, longitude: 103.77521100556537 },
      { latitude: 1.294024793528894, longitude: 103.77467327421401 },
      { latitude: 1.293609514418326, longitude: 103.7748888537719 },
      { latitude: 1.2932021574991703, longitude: 103.77404491475349 },
    ],
    color: "rgba(102, 147, 245, 0.75)",
    center: { latitude: 1.2947299755116342, longitude: 103.77438699306742 },
  },
];
