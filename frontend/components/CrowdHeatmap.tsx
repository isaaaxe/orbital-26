import { View, StyleSheet, Text } from "react-native";
import { getDensityColor } from "@/app/(tabs)/map";

type DensityByHour = Record<string, number>;

type CrowdHeatmapProps = {
  densityByHour?: DensityByHour;
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    width: "100%",
  },

  valuesRow: {
    flexDirection: "row",
    marginBottom: 4,
  },

  valueWrapper: {
    flex: 1,
    alignItems: "center",
  },

  valueText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#374151",
  },

  barWrapper: {
    height: 22,
    borderRadius: 11,
    overflow: "hidden",
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
  },

  barSegment: {
    flex: 1,
    height: "100%",
  },

  segmentDivider: {
    borderRightWidth: 1,
    borderRightColor: "rgba(0, 0, 0, 0.35)",
  },

  labelsRow: {
    flexDirection: "row",
    marginTop: 5,
  },

  hourLabelWrapper: {
    flex: 1,
    alignItems: "center",
  },

  hourLabel: {
    fontSize: 9,
    color: "#6B7280",
  },

  emptyText: {
    fontSize: 12,
    color: "#6B7280",
  },
});

function formatHour(hour: string) {
  const n = Number(hour);

  if (n === 0) return "12 am";
  if (n < 12) return `${n} am`;
  if (n === 12) return "12 pm";
  return `${n - 12} pm`;
}

export default function CrowdHeatmap({ densityByHour }: CrowdHeatmapProps) {
  const sortedHours = Object.entries(densityByHour ?? {}).sort(
    ([hourA], [hourB]) => Number(hourA) - Number(hourB),
  );

  if (sortedHours.length === 0) {
    return <Text style={styles.emptyText}>No crowd data available</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.valuesRow}>
        {sortedHours.map(([hour, density], index) => (
          <View key={`${hour}-value`} style={styles.valueWrapper}>
            <Text style={styles.valueText}>
              {index % 2 === 0 ? density : ""}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.barWrapper}>
        {sortedHours.map(([hour, density], index) => {
          const isLast = index === sortedHours.length - 1;

          return (
            <View
              key={hour}
              style={[
                styles.barSegment,
                { backgroundColor: getDensityColor(density) },
                !isLast && styles.segmentDivider,
              ]}
            />
          );
        })}
      </View>

      <View style={styles.labelsRow}>
        {sortedHours.map(([hour], index) => {
          const shouldShowLabel =
            index === 0 || index === sortedHours.length - 1 || index % 2 === 0;

          return (
            <View key={`${hour}-label`} style={styles.hourLabelWrapper}>
              <Text style={styles.hourLabel}>
                {shouldShowLabel ? formatHour(hour) : ""}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
