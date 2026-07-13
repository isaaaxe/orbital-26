import { useEventsQuery } from "@/hook/useEvents";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import EventItem from "@/components/EventItem";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6F8",
  },

  listContent: {
    paddingTop: 16,
    paddingBottom: 32,
  },

  separator: {
    height: 16,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1D2939",
    marginBottom: 6,
  },

  emptyDescription: {
    fontSize: 14,
    color: "#667085",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "500",
    color: "#667085",
  },

  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1D2939",
    marginBottom: 6,
  },

  errorDescription: {
    fontSize: 14,
    color: "#667085",
    textAlign: "center",
  },
});

export default function EventPage() {
  const [timeFrame, setTimeFrame] = useState(60);
  const {
    data: eventsData,
    isLoading: eventsLoading,
    error: eventsError,
  } = useEventsQuery(timeFrame);

  return (
    <SafeAreaView style={styles.container}>
      <Header text={"Events"} description={"Upcoming events in NUS"} />
      {eventsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Fetching events...</Text>
        </View>
      ) : eventsError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Unable to load events</Text>
          {/* 
            <Text style={styles.errorDescription}>
              {eventsError instanceof Error
                ? eventsError.message
                : "Please try again later."}
            </Text> */}
        </View>
      ) : (
        <FlatList
          data={eventsData}
          keyExtractor={(item) => item.event_id}
          renderItem={({ item }) => <EventItem event={item} />}
          contentContainerStyle={[
            styles.listContent,
            eventsData.length === 0 && styles.emptyListContent,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>
                No upcoming events in this period.
              </Text>

              <Text style={styles.emptyDescription}>
                Check back later for new events.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
