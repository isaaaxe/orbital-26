import { EventResponse } from "@/api_debug/event.logged";
import { View, Text, Linking, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

export type EventItemProps = {
  event: EventResponse;
}; //subject to change

function dateFormatter(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);

  const date = new Date(year, month - 1, day);

  const monthName = new Intl.DateTimeFormat("en-GB", {
    month: "long",
  }).format(date);

  const suffix =
    day % 10 == 1 && day % 100 != 11
      ? "st"
      : day % 10 == 2 && day % 100 != 12
        ? "nd"
        : day % 10 == 3 && day % 100 != 13
          ? "rd"
          : "th";

  return `${day}${suffix} ${monthName} ${year}`;
}

function formatTag(tag: string): string {
  return tag
    .split("-")
    .map((word) =>
      word.toLowerCase() == "nus"
        ? "NUS"
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}

const imageStylingScript = `
  (function () {
    const html = document.documentElement;
    const body = document.body;
    const image = document.querySelector("img");

    html.style.margin = "0";
    html.style.width = "100%";
    html.style.height = "100%";
    html.style.overflow = "hidden";
    html.style.background = "#E5E7EB";
    html.style.touchAction = "none";

    body.style.margin = "0";
    body.style.width = "100%";
    body.style.height = "100%";
    body.style.overflow = "hidden";
    body.style.background = "#E5E7EB";
    body.style.touchAction = "none";

    if (image) {
      image.style.width = "100%";
      image.style.height = "100%";
      image.style.objectFit = "cover";
      image.style.objectPosition = "center";
      image.style.display = "block";
      image.style.margin = "0";
      image.style.maxWidth = "none";
      image.style.maxHeight = "none";
      image.style.pointerEvents = "none";
      image.draggable = false;
    }
  })();

  true;
`;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    // shadowOpacity: 0.12,
    // shadowRadius: 6,

    // // Android shadow
    // elevation: 4,
  },

  imageContainer: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 14,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },

  imageWebView: {
    flex: 1,
    backgroundColor: "#E5E7EB",
  },
  title: {
    color: "#0B2D73",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },

  date: {
    color: "#4B5563",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    marginBottom: 12,
  },

  description: {
    color: "#374151",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 14,
  },

  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
    alignItems: "flex-start",
  },

  categoryTag: {
    color: "#0B2D73",
    backgroundColor: "#E8EEF9",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: "600",
    overflow: "hidden",
  },

  audienceTag: {
    color: "#166534",
    backgroundColor: "#DCFCE7",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: "600",
    overflow: "hidden",
  },

  linkText: {
    color: "#4B5563",
    fontSize: 14,
    lineHeight: 20,
  },

  link: {
    color: "#0B2D73",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  textContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
});

export default function EventItem({ event }: EventItemProps) {
  // debugging image error
  return (
    <View style={styles.container}>
      {/* displays image if available */}
      {event.image_url && (
        <View style={styles.imageContainer}>
          <WebView
            source={{ uri: event.image_url }}
            style={styles.imageWebView}
            javaScriptEnabled
            domStorageEnabled
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
            scrollEnabled={false}
            bounces={false}
            overScrollMode="never"
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            userAgent="Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/150 Mobile Safari/537.36"
            injectedJavaScript={imageStylingScript}
          />
        </View>
      )}
      {/* title */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{event.name}</Text>
        <Text style={styles.date}>
          {`From ${dateFormatter(event.start_date)} to ${dateFormatter(event.end_date)}`}
        </Text>

        <Text style={styles.description}>{event.description}</Text>
        <View style={styles.tagContainer}>
          {event.categories.map((category) => (
            <Text key={`category-${category}`} style={styles.categoryTag}>
              {formatTag(category)}
            </Text>
          ))}
          {event.audiences.map((audience) => (
            <Text key={`audience-${audience}`} style={styles.audienceTag}>
              {formatTag(audience)}
            </Text>
          ))}
        </View>
        <Text style={styles.linkText}>
          Click{" "}
          <Text
            style={styles.link}
            onPress={() => Linking.openURL(event.event_url)}
          >
            here
          </Text>{" "}
          to find out more!
        </Text>
      </View>
    </View>
  );
}
