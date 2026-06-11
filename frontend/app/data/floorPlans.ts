import { ImageSourcePropType } from "react-native";

type FloorPlans = {
  [building: string]: {
    [level: string]: {
      image: ImageSourcePropType;
    };
  };
};

export const floorPlans: FloorPlans = {
  COM1: {
    B1: {
      image: require("../../assets/computing/COM_1/COM1-B.png"),
    },
    "1": {
      image: require("../../assets/computing/COM_1/COM1-1.png"),
    },
    "2": {
      image: require("../../assets/computing/COM_1/COM1-2.png"),
    },
    "3": {
      image: require("../../assets/computing/COM_1/COM1-3.png"),
    },
  },
  COM2: {
    B1: {
      image: require("../../assets/computing/COM_2/COM2_B1.png"),
    },
    "1": {
      image: require("../../assets/computing/COM_2/COM2_1.png"),
    },
    "2": {
      image: require("../../assets/computing/COM_2/COM2_2.png"),
    },
    "3": {
      image: require("../../assets/computing/COM_2/COM2_3.png"),
    },
    "4": {
      image: require("../../assets/computing/COM_2/COM2_4.png"),
    },
  },
  COM3: {
    B1: {
      image: require("../../assets/computing/COM_3/COM3_B1.png"),
    },
    "1": {
      image: require("../../assets/computing/COM_3/COM3_1.png"),
    },
    "2": {
      image: require("../../assets/computing/COM_3/COM3_2.png"),
    },
  },
};
