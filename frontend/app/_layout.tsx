import { AuthProvider } from "@/context/AuthContext";
import { RouteProvider } from "@/context/RouteContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return <AuthProvider>
          <RouteProvider>
            <Stack screenOptions={{headerShown: false}}/>;
          </RouteProvider>
        </AuthProvider>
}
