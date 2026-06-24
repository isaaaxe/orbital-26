import { ImageSourcePropType } from "react-native";
type IconType = Record<string, ImageSourcePropType>;

export const icons: IconType = {
  no_image: require("../../assets/icons/no_image.png"),
  "lecture theatre": require("../../assets/icons/lecture_theatre.png"),
  building: require("../../assets/icons/building.png"),
  COM: require("../../assets/icons/building.png"),
  canteen: require("../../assets/icons/canteen.png"),
  lab: require("../../assets/icons/com_lab.png"),
  "discussion room": require("../../assets/icons/discussion_room.png"),
  "central library": require("../../assets/icons/library.png"),
  room: require("../../assets/icons/room.png"),
  "seminar room": require("../../assets/icons/seminar_room.png"),
  "tutorial room": require("../../assets/icons/tutorial_room.png"),
  location: require("../../assets/icons/location.png"),
  star: require("../../assets/icons/star.png"),
  "bus stop": require("../../assets/icons/bus-stop.png"),
};
