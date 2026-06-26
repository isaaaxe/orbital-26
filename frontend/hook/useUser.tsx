import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUser,
  deleteUser,
  getUser,
  LoginRequest,
  updateUser,
  UserCreate,
  UserDeleted,
  UserDetail,
  UserUpdate,
} from "@/api_debug/users.logged";
import {
  AddRecentLocationRequest,
  addRecentlyVisited,
  clearRecentlyVisited,
  deleteLocationRecentlyVisited,
  getRecentlyVisited,
} from "@/api_debug/recently_visited.logged";

export function useGetUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => getUser(token),

    onSuccess: (user) => {
      queryClient.setQueryData(["user", user.user_id], user);
    },
  });
}
export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation<UserDetail, Error, UserCreate>({
    mutationFn: (request: UserCreate) => createUser(request),

    onSuccess: (user) => {
      queryClient.setQueryData(["user", user.user_id], user);
    },

    onError: (error) => {
      console.log("Signup failed");
    },
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    UserDetail,
    Error,
    { token?: string | null; request: UserUpdate }
  >({
    mutationFn: ({ token, request }) => {
      if (!token || !request) {
        throw new Error("Missing token ro request");
      }
      return updateUser(token, request);
    },

    onSuccess: (user) => {
      queryClient.setQueryData(["user", user.user_id], user);
    },
  });
}

export function useDeleteUserMutation(
  token?: string | null,
  user_id?: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation<UserDeleted, Error, void>({
    mutationFn: () => {
      if (!token || !user_id) {
        throw new Error("Missing token or user id");
      }
      return deleteUser(token);
    },

    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: ["user", user_id],
      });

      queryClient.removeQueries({
        queryKey: ["savedLocations", token],
      });
      queryClient.removeQueries({
        queryKey: ["recentlyVisited", token],
      });
    },
  });
}

export function useRecentlyVisitedQuery(token?: string | null) {
  return useQuery({
    queryKey: ["recentlyVisited", token],
    queryFn: () => {
      if (!token) {
        throw new Error("Missing auth token");
      }
      return getRecentlyVisited(token);
    },
    enabled: !!token,
  });
}

export function addRecentlyVisitedMutation(token?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AddRecentLocationRequest) => {
      if (!token) {
        throw new Error("Missing auth token");
      }
      return addRecentlyVisited(token, request);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recentlyVisited", token] });
    },
  });
}

export function deleteRecentlyVisitedMutation(token?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AddRecentLocationRequest) => {
      if (!token) {
        throw new Error("Missing auth token");
      }
      return deleteLocationRecentlyVisited(token, request);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recentlyVisited", token] });
    },
  });
}

export function clearRecentlyVisitedMutation(token?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!token) {
        throw new Error("Missing auth token");
      }
      return clearRecentlyVisited(token!);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recentlyVisited", token] });
    },
  });
}
