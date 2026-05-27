import { AuthProvider } from "@/context/AuthContext";
import { RouteProvider } from "@/context/RouteContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";

const queryClient = new QueryClient()

export default function RootLayout() {
  return <QueryClientProvider client={queryClient}> 
          <AuthProvider>
            <RouteProvider>
              <Stack screenOptions={{headerShown: false}}/>;
            </RouteProvider>
          </AuthProvider>
        </QueryClientProvider>
}
