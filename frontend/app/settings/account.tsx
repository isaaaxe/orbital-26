import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import Header from "@/components/Header";
import { router } from "expo-router";
import StylisedButton from "@/components/StylisedButton";
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  buttonContainer: {
    paddingHorizontal: 24,
    marginTop: 24,
    gap: 14,
  },

  button: {
    backgroundColor: "#0B2D73",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  signOutButton: {
    backgroundColor: "#DC2626",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default function AccountSettings() {
  const { user, setIsLogin, logout } = useAuthContext();

  function toCredentials(isLogin: boolean) {
    if (isLogin) {
      setIsLogin(true);
    } else {
      setIsLogin(false);
    }
    router.push("/settings/login");
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView>
        <Header
          text={"Account"}
          description={
            user
              ? `Hello, ${user.username}!`
              : "Please signup/login to access all Routes@NUS features"
          }
        />
        <View style={styles.buttonContainer}>
          {user != null ? (
            <>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Change Password</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.signOutButton]}
                onPress={logout}
              >
                <Text style={styles.buttonText}>Sign out</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.button}
                onPress={() => toCredentials(false)}
              >
                <Text style={styles.buttonText}>Sign Up</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => toCredentials(true)}
              >
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
