import StylisedButton from "@/components/StylisedButton";
import { useAuthContext } from "@/context/AuthContext";
import { router, useNavigation } from "expo-router";
import { useState, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "../../data/loadIcons";

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
    justifyContent: "space-between",
    flexDirection: "row",
  },
  icon: {
    flex: 1,
    justifyContent: "center",
  },

  authToggleContainer: {
    flexDirection: "row",
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 12,
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
  successBox: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginBottom: 8,
  },

  successText: {
    color: "#16A34A",
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
  description: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginHorizontal: 20,
    marginBottom: 4,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  loadingItem: {
    alignItems: "center",
  },
});
const initErrorState = {
  login: false,
  signup: false,
};
export default function Login() {
  // const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [accountCreationSuccess, setAccountCreationSuccess] = useState<
    boolean | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(initErrorState);
  const [isValidInputs, setIsValidInputs] = useState({
    email: true,
    password: true,
    username: true,
  });
  const [passwordHidden, setPasswordHidden] = useState(true);
  const { login, isLogin, setIsLogin, signup } = useAuthContext();
  const navigation = useNavigation();
  // function checkValidEmail(email: string) {
  //   const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  //   if (emailRegex.test(email.trim())) {
  //     setIsValidInputs((prev) => ({
  //       ...prev,
  //       email: true,
  //     }));
  //     return true;
  //   } else {
  //     setIsValidInputs((prev) => ({
  //       ...prev,
  //       email: false,
  //     }));
  //     return false;
  //   }
  // }

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
    const validUserNameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (validUserNameRegex.test(username.trim())) {
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

  async function handleLogin(username: string, password: string) {
    setIsError(initErrorState);
    setAccountCreationSuccess(null);
    const validUsername = checkUsername(username);
    const validPW = checkValidPassword(password);
    if (!validUsername || !validPW) {
      return;
    }
    try {
      setIsLoading(true);
      await login(username, password);
      router.back();
    } catch (error) {
      setIsError((curr) => ({
        ...curr,
        login: true,
      }));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignup(username: string, password: string) {
    setIsError(initErrorState);
    const validPW = checkValidPassword(password);
    const validUsername = checkUsername(username);
    if (!validPW || !validUsername) {
      return;
    }
    try {
      setIsLoading(true);
      const success = await signup(username, password);
      if (success) {
        setIsLogin(true);
      }
      setAccountCreationSuccess(success);
    } catch (error) {
      setIsError((curr) => ({
        ...curr,
        signup: true,
      }));
    } finally {
      setIsLoading(false);
    }
  }

  function togglePasswordHidden() {
    setPasswordHidden(!passwordHidden);
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", () => {
      setPasswordHidden(true);
    });

    return unsubscribe;
  }, [navigation]);

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
        <View>
          {isLogin ? (
            <Text style={styles.description}>
              Logging into an existing account.
            </Text>
          ) : (
            <Text style={styles.description}>Creating a new account!</Text>
          )}
        </View>

        <View style={styles.searchView}>
          <TextInput
            style={styles.searchInput}
            placeholder="Username"
            placeholderTextColor="#6B7280"
            returnKeyType="next"
            onChangeText={setUsername}
            value={username}
            onSubmitEditing={() => {
              checkUsername(username);
            }}
            autoCapitalize="none"
          />
        </View>

        {!isValidInputs.username && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Please enter a valid username:</Text>
            <Text style={styles.errorText}>3-20 Characters</Text>
            <Text style={styles.errorText}>
              Letters, numbers, underscores only
            </Text>
          </View>
        )}

        <View style={styles.searchView}>
          <TextInput
            style={styles.searchInput}
            placeholder="Password"
            placeholderTextColor="#6B7280"
            returnKeyType="done"
            onChangeText={setPassword}
            value={password}
            onSubmitEditing={() =>
              isLogin
                ? handleLogin(username, password)
                : handleSignup(username, password)
            }
            autoCapitalize="none"
            secureTextEntry={passwordHidden}
          />
          <View style={styles.icon}>
            <Pressable onPress={togglePasswordHidden}>
              <Image
                source={passwordHidden ? icons.eye_open : icons.eye_closed}
                style={{ width: 24, height: 24 }}
              />
            </Pressable>
          </View>
        </View>

        {!isValidInputs.password && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Please enter at least: </Text>
            <Text style={styles.errorText}>8 Characters</Text>
            <Text style={styles.errorText}>1 Uppercase character</Text>
            <Text style={styles.errorText}>1 Lowercase character</Text>
            <Text style={styles.errorText}>1 Number</Text>
            <Text style={styles.errorText}>1 Special Character</Text>
          </View>
        )}
        {isError.login && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              User does not exist. Please try again
            </Text>
          </View>
        )}
        {(accountCreationSuccess == false || isError.signup) && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              User already exists. Please try again.
            </Text>
          </View>
        )}
        {accountCreationSuccess && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>
              Success! Login in now to your new account!
            </Text>
          </View>
        )}
        <View style={{ flex: 1, flexDirection: "column-reverse" }}>
          <StylisedButton
            buttonText={isLogin ? "Login" : "Sign Up"}
            onPress={
              isLogin
                ? () => handleLogin(username, password)
                : () => handleSignup(username, password)
            }
          />
        </View>
      </SafeAreaView>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingItem}>
            <ActivityIndicator size="large" />
          </View>
        </View>
      )}
    </View>
  );
}
