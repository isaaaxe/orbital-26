import StylisedButton from "@/components/StylisedButton";
import { useAuthContext } from "@/context/AuthContext";
import { router } from "expo-router";
import { useState } from "react";
import {
  Text,
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  safeArea: {
    flex: 1,
  },
  searchInput: {
    flex: 12,
    fontSize: 14,
    color: "#111827",
  },
  searchView: {
    marginHorizontal: 20,
    height: 48,
    borderWidth: 2,
    borderColor: "#D5D7DB",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#111827",
    marginBottom: 12,
  },
  icon: {
    flex: 1,
    justifyContent: "center",
  },

  authToggleContainer: {
    flexDirection: "row",
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  authToggleItem: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },

  authToggleItemSelected: {
    borderBottomColor: "#f86a04",
  },

  authToggleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },

  authToggleTextSelected: {
    color: "#f86a04",
  },

  formContainer: {
    marginHorizontal: 24,
    gap: 16,
  },

  fieldGroup: {
    gap: 6,
  },

  errorBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginBottom: 8,
  },

  errorText: {
    color: "#DC2626",
    fontSize: 13,
    lineHeight: 18,
  },

  passwordHintText: {
    color: "#DC2626",
    fontSize: 13,
    lineHeight: 18,
  },

  primaryButton: {
    backgroundColor: "#0B2D73",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isValidInputs, setIsValidInputs] = useState({
    email: true,
    password: true,
    username: true,
  });
  const { login, isLogin, setIsLogin, signup } = useAuthContext();

  function checkValidEmail(email: string) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (emailRegex.test(email.trim())) {
      setIsValidInputs((prev) => ({
        ...prev,
        email: true,
      }));
      return true;
    } else {
      setIsValidInputs((prev) => ({
        ...prev,
        email: false,
      }));
      return false;
    }
  }

  function checkValidPassword(password: string) {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    if (strongPasswordRegex.test(password.trim())) {
      setIsValidInputs((prev) => ({
        ...prev,
        password: true,
      }));
      return true;
    } else {
      setIsValidInputs((prev) => ({
        ...prev,
        password: false,
      }));
      return false;
    }
  }

  function checkUsername(username: string) {
    if (username.length > 3) {
      setIsValidInputs((prev) => ({
        ...prev,
        username: true,
      }));
      return true;
    } else {
      setIsValidInputs((prev) => ({
        ...prev,
        username: false,
      }));
      return false;
    }
  }

  function handleLogin(email: string, password: string) {
    const validEmail = checkValidEmail(email);
    const validPW = checkValidPassword(password);
    if (!validEmail || !validPW) {
      // nothing happens
    } else {
      login(email, password);
      // set to isLoading, set the user and go back to accouints page
      router.back();
    }
  }

  function handleSignup(email: string, password: string, username: string) {
    const validEmail = checkValidEmail(email);
    const validPW = checkValidPassword(password);
    const validUsername = checkUsername(username);
    if (!validEmail || !validPW || !validUsername) {
      // nothing happens
    } else {
      signup(email, password, username);
    }
    // set to isLoading, set the user and go back to accounts page
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.authToggleContainer}>
          <TouchableOpacity
            style={[
              styles.authToggleItem,
              isLogin && styles.authToggleItemSelected,
            ]}
            onPress={() => setIsLogin(true)}
          >
            <Text
              style={[
                styles.authToggleText,
                isLogin && styles.authToggleTextSelected,
              ]}
            >
              Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.authToggleItem,
              !isLogin && styles.authToggleItemSelected,
            ]}
            onPress={() => setIsLogin(false)}
          >
            <Text
              style={[
                styles.authToggleText,
                !isLogin && styles.authToggleTextSelected,
              ]}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchView}>
          <TextInput
            style={styles.searchInput}
            placeholder="Email"
            placeholderTextColor="#6B7280"
            returnKeyType="search"
            onChangeText={setEmail}
            value={email}
            onSubmitEditing={() => {
              checkValidEmail(email);
            }}
            autoCapitalize="none"
          />
        </View>
        {!isValidInputs.email ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              Please enter a valid email address.
            </Text>
          </View>
        ) : (
          <></>
        )}

        {!isLogin ? (
          <>
            <View style={styles.searchView}>
              <TextInput
                style={styles.searchInput}
                placeholder="Username"
                placeholderTextColor="#6B7280"
                returnKeyType="search"
                onChangeText={setUsername}
                value={username}
                onSubmitEditing={() => {
                  checkUsername;
                }}
                autoCapitalize="none"
              />
            </View>
            {!isValidInputs.username ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>
                  Please enter a username longer than 3 characters.
                </Text>
              </View>
            ) : (
              <></>
            )}
          </>
        ) : (
          <></>
        )}
        <View style={styles.searchView}>
          <TextInput
            style={styles.searchInput}
            placeholder="Password"
            placeholderTextColor="#6B7280"
            returnKeyType="search"
            onChangeText={setPassword}
            value={password}
            onSubmitEditing={() => handleLogin(email, password)}
            autoCapitalize="none"
            secureTextEntry
          />
        </View>
        {!isValidInputs.password ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Please enter at least: </Text>
            <Text style={styles.errorText}>8 Characters</Text>
            <Text style={styles.errorText}>1 Uppercase character</Text>
            <Text style={styles.errorText}>1 Lowercase character</Text>
            <Text style={styles.errorText}>1 Number</Text>
            <Text style={styles.errorText}>1 Special Character</Text>
          </View>
        ) : (
          <></>
        )}
        <View style={{ flex: 1, flexDirection: "column-reverse" }}>
          <StylisedButton
            buttonText={isLogin ? "Login" : "Sign Up"}
            onPress={
              isLogin
                ? () => handleLogin(email, password)
                : () => handleSignup(email, password, username)
            }
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
