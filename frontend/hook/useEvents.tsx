import { useQuery } from "@tanstack/react-query";

import { getEvents, type EventResponse } from "@/api_debug/event.logged";

export function useEventsQuery(days: number) {
  return useQuery<EventResponse[], Error>({
    queryKey: ["events", days],
    queryFn: () => getEvents(days),
  });
}
