import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import Header from "@/components/Header";
import { router } from "expo-router";
import StylisedButton from "@/components/StylisedButton";
import { useUpdateUserMutation } from "@/hook/useUser";
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  modalCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0B2D73",
    marginBottom: 8,
  },

  modalText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#4B5563",
    marginBottom: 20,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },

  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },

  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  modalSaveButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },

  modalSaveText: {
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    marginBottom: 16,
  },

  deleteButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#DC2626",
  },

  deleteButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    // marginHorizontal: 20,
    marginBottom: 16,
  },

  errorText: {
    color: "#DC2626",
    fontSize: 13,
    lineHeight: 18,
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

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function AccountSettings() {
  const { user, token, setIsLogin, logout, deleteAccount } = useAuthContext();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [reenterNewPassword, setReenterNewPassword] = useState("");
  const [isValidInputs, setIsValidInputs] = useState({
    same: true,
    password: true,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState<string | null>(
    null,
  );
  const updateUserMutation = useUpdateUserMutation();

  function toCredentials(isLogin: boolean) {
    if (isLogin) {
      setIsLogin(true);
    } else {
      setIsLogin(false);
    }
    router.push("/settings/login");
  }

  async function handleConfirmChangePassword() {
    setChangePasswordError(null);

    const passwordsMatch = newPassword === reenterNewPassword;
    const passwordIsValid = passwordRegex.test(newPassword);

    setIsValidInputs({
      same: passwordsMatch,
      password: passwordIsValid,
    });

    if (!passwordsMatch || !passwordIsValid) {
      return;
    }
    if (!user) {
      return;
    }

    try {
      setIsChangingPassword(true);
      await updateUserMutation.mutateAsync({
        token: token,
        request: {
          new_username: user?.username,
          new_password: newPassword,
          language: user?.language,
          profile_settings: user?.profile_settings,
        },
      });
      setNewPassword("");
      setReenterNewPassword("");

      setIsValidInputs({
        same: true,
        password: true,
      });

      setChangePasswordVisible(false);
    } catch (error) {
      setChangePasswordError("Failed to update password. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
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
              <TouchableOpacity
                style={styles.button}
                onPress={() => setChangePasswordVisible(true)}
              >
                <Text style={styles.buttonText}>Change Password</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.signOutButton]}
                onPress={logout}
              >
                <Text style={styles.buttonText}>Sign out</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.signOutButton]}
                onPress={() => setDeleteModalVisible(true)}
              >
                <Text style={styles.buttonText}>Delete Account</Text>
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
      <Modal
        visible={deleteModalVisible}
        statusBarTranslucent
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Delete account?</Text>

            <Text style={styles.modalText}>
              This action cannot be undone. Are you sure you want to delete your
              account?
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={async () => {
                  setDeleteModalVisible(false);
                  setIsLoading(true);
                  await deleteAccount();
                  setIsLoading(false);
                }}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={changePasswordVisible}
        statusBarTranslucent
        transparent
        animationType="fade"
        onRequestClose={() => setChangePasswordVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Change Password</Text>
            {/* 1. old pw, 2. new pw, 3 new pw  */}
            <TextInput
              style={styles.modalInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New Password"
              autoFocus
            />
            <TextInput
              style={styles.modalInput}
              value={reenterNewPassword}
              onChangeText={setReenterNewPassword}
              placeholder="Re-enter New Password"
              autoFocus
            />
            {!isValidInputs.same && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>
                  Re-entered password did not match.
                </Text>
              </View>
            )}
            {!isValidInputs.password && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>
                  Invalid Password. Please enter at least:{" "}
                </Text>
                <Text style={styles.errorText}>8 Characters</Text>
                <Text style={styles.errorText}>1 Uppercase character</Text>
                <Text style={styles.errorText}>1 Lowercase character</Text>
                <Text style={styles.errorText}>1 Number</Text>
                <Text style={styles.errorText}>1 Special Character</Text>
              </View>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setChangePasswordVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={async () => {
                  //update pasword calls
                  setIsLoading(true);
                  await handleConfirmChangePassword();
                  setIsLoading(false);
                }}
              >
                <Text style={styles.modalSaveText}>
                  {isChangingPassword ? "Updating..." : "Confirm"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
