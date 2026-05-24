import { useRouteContext } from "@/context/RouteContext";
import { Tabs } from "expo-router";
import { Image } from "react-native";

export default function TabsLayout() {
    const icons = {
        home: require("../../assets/icons/home.png"),
        home_orange: require("../../assets/icons/home_orange.png"),
        map: require("../../assets/icons/map.png"),
        map_orange: require("../../assets/icons/map_orange.png"),
        bookmark: require("../../assets/icons/bookmark.png"),
        bookmark_orange: require("../../assets/icons/bookmark_orange.png"),
        settings: require("../../assets/icons/settings.png"),
        settings_orange: require("../../assets/icons/settings_orange.png"),
    }

    const {setUserSearch} = useRouteContext()

  return (
    <Tabs
        screenOptions={{
            tabBarActiveTintColor: "#f86a04",
            headerShown: false
        }}
    >
      <Tabs.Screen
        name="index"
        options={
            { 
                title: "Home",
                tabBarIcon: ({focused}) => (
                    <Image 
                        source={focused ? icons.home_orange : icons.home}
                        style= {{width:24, height: 24}}
                    />
                ),
                
            }
        }
        listeners={{
            tabPress:() => {
                setUserSearch("")
            }
        }}
      />

      <Tabs.Screen
        name="map"
        options={
            { 
                title: "Map",
                tabBarIcon: ({focused}) => (
                    <Image 
                        source={focused ? icons.map_orange : icons.map}
                        style= {{width:24, height: 24}}
                    />
                ),
            }
        }
      />

      <Tabs.Screen
        name="saved"
        options={
            {
                title: "Saved",
                tabBarIcon: ({focused}) => (
                    <Image 
                        source={focused ? icons.bookmark_orange : icons.bookmark}
                        style= {{width:24, height: 24}}
                    />
                ),
            }
        }
      />

      <Tabs.Screen
        name="settings"
        options={
            {
                title: "Settings",
                tabBarIcon: ({focused}) => (
                    <Image 
                        source={focused ? icons.settings_orange : icons.settings}
                        style= {{width:24, height: 24}}
                    />
                ),
            }
        }
      />
    </Tabs>
  );
}