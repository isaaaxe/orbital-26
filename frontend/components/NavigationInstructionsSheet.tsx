import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { RouteStep } from "@/api/routes";

type NavigationInstructionsSheetProps = {
  steps: RouteStep[];
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
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  sheetCollapsed: {
    height: 96,
  },
  sheetExpanded: {
    height: "45%",
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
    marginTop: 4,
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
});

export default function NavigationInstructionsSheet({
  steps,
}: NavigationInstructionsSheetProps) {
  const [expanded, setExpanded] = useState(false);

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
            <View key={step.step_number} style={styles.stepRow}>
              <View style={styles.stepNumberCircle}>
                <Text style={styles.stepNumber}>{step.step_number}</Text>
              </View>

              <View style={styles.stepTextContainer}>
                <Text style={styles.instruction}>{step.step_instruction}</Text>

                {step.distance_for_step !== undefined && (
                  <Text style={styles.meta}>
                    {(step.distance_for_step / 1000).toFixed(1)} km
                  </Text>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
