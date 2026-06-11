import { AuthProvider } from "@/context/AuthContext";
import { RouteProvider } from "@/context/RouteContext";
import StartupGate from "@/startup/StartupGate";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <StartupGate>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RouteProvider>
              <Stack screenOptions={{ headerShown: false }} />
            </RouteProvider>
          </AuthProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </StartupGate>
  );
}
