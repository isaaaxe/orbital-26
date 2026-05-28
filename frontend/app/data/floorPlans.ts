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
    B: {
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
};
