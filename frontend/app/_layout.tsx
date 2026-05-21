import { RouteProvider } from "@/context/RouteContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return <RouteProvider>
  <Stack screenOptions={{headerShown: false}}/>;
  </RouteProvider>
}
