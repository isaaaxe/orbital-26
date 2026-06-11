import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
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

export default function AccountSettings() {
  const { user, setIsLogin, logout, deleteAccount } = useAuthContext();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
