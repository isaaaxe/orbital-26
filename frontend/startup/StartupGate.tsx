import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Button } from "react-native";

const API_BASE_URL = "https://orbital-26.onrender.com";

async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

export default function StartupGate({ children }: { children: React.ReactNode }) {
  const [isHealthy, setIsHealthy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function waitForBackend() {
    setFailed(false);

    const maxAttempts = 10;
    const delayMs = 2000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const healthy = await checkHealth();

      if (healthy) {
        setIsHealthy(true);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    setFailed(true);
  }

  useEffect(() => {
    waitForBackend();
  }, []);

  if (isHealthy) {
    return <>{children}</>;
  }

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <ActivityIndicator size="large" />

      <Text style={{ marginTop: 16, textAlign: "center" }}>
        Starting server...
      </Text>

      <Text style={{ marginTop: 8, textAlign: "center", color: "gray" }}>
        This may take a while if the backend is waking up.
      </Text>

      {failed && (
        <>
          <Text style={{ marginTop: 16, textAlign: "center", color: "red" }}>
            Server is taking longer than expected.
          </Text>

          <Button title="Try again" onPress={waitForBackend} />
        </>
      )}
    </View>
  );
}