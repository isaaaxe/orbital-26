import {
  BusResponse,
  BusStopResponse,
  fetchAllBusStop,
  fetchBus,
  fetchBusStopById,
  fetchBusStopByName,
} from "@/api_debug/bus.logged";
import { useQuery } from "@tanstack/react-query";

//fetch bus stop by number
export function useFetchBusByNameQuery(bus_number: string) {
  return useQuery<BusResponse, Error>({
    queryKey: ["bus", bus_number],
    queryFn: () => fetchBus(bus_number),
    enabled: !!bus_number,
  });
}

//fetch bus stop by id
export function useFetchBusStopByIdQuery(bus_stop_id: string) {
  return useQuery<BusStopResponse, Error>({
    queryKey: ["bus_stop", bus_stop_id],
    queryFn: () => fetchBusStopById(bus_stop_id),
    enabled: !!bus_stop_id,
  });
}
//fetch bus stop by name
export function useFetchBusStopByNameQuery(bus_stop_name: string) {
  return useQuery<BusStopResponse, Error>({
    queryKey: ["bus_stop", bus_stop_name],
    queryFn: () => fetchBusStopByName(bus_stop_name),
    enabled: !!bus_stop_name,
  });
}
//fetch all bus stop
export function useFetchAllBusStop() {
  return useQuery<BusStopResponse[], Error>({
    queryKey: ["bus_stops"],
    queryFn: () => fetchAllBusStop(),
  });
}
