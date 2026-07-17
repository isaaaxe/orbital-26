import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { RouteStep } from "@/api_debug/routes.logged";
import { router } from "expo-router";
import { useRouteContext } from "@/context/RouteContext";

type NavigationInstructionsSheetProps = {
  steps: string[];
};

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  sheetCollapsed: {
    height: 150,
  },
  sheetExpanded: {
    height: "60%",
  },
  handleArea: {
    alignItems: "center",
    paddingBottom: 12,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#D1D5DB",
    marginBottom: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  stepsContainer: {
    flex: 1,
    marginVertical: 4,
  },
  stepRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  stepNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  stepNumber: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  stepTextContainer: {
    flex: 1,
  },
  instruction: {
    fontSize: 15,
    color: "#111827",
    lineHeight: 21,
  },
  meta: {
    marginTop: 4,
    fontSize: 13,
    color: "#6B7280",
  },
  actionRow: {
    flexDirection: "row",
    marginHorizontal: 10,
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingTop: 12,
  },
  actionButtonWrapper: {
    width: "48%",
  },

  backButton: {
    height: 40,
    borderRadius: 15,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },

  backButtonText: {
    color: "#0B2D73",
    fontSize: 15,
    fontWeight: "700",
  },

  completeButton: {
    height: 40,
    borderRadius: 15,
    backgroundColor: "#0B2D73",
    alignItems: "center",
    justifyContent: "center",
  },

  completeButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});

function formatDistance(distanceMeters: number) {
  return distanceMeters >= 1000
    ? `${(distanceMeters / 1000).toFixed(1)} km`
    : `${Math.round(distanceMeters)} m`;
}

export default function NavigationInstructionsSheet({
  steps,
}: NavigationInstructionsSheetProps) {
  const [expanded, setExpanded] = useState(false);
  const { setUserSearch } = useRouteContext();
  function reset() {
    setUserSearch("");
    router.dismissTo("/");
  }
  return (
    <View
      style={[
        styles.sheet,
        expanded ? styles.sheetExpanded : styles.sheetCollapsed,
      ]}
    >
      <TouchableOpacity
        style={styles.handleArea}
        onPress={() => setExpanded((prev) => !prev)}
      >
        <View style={styles.handle} />
        <Text style={styles.title}>
          {expanded ? "Route instructions" : "Click for instructions"}
        </Text>
      </TouchableOpacity>

      {expanded && (
        <ScrollView style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <View key={`step-${index + 1}`} style={styles.stepRow}>
              <View style={styles.stepNumberCircle}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
              </View>

              <View style={styles.stepTextContainer}>
                <Text style={styles.instruction}>{step}</Text>

                {/* {step.distance_for_step !== undefined && (
                  <Text style={styles.meta}>
                    {formatDistance(step.distance_for_step)}
                  </Text>
                )} */}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
      <View style={styles.actionRow}>
        <View style={styles.actionButtonWrapper}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.actionButtonWrapper}>
          <TouchableOpacity style={styles.completeButton} onPress={reset}>
            <Text style={styles.completeButtonText}>Complete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
