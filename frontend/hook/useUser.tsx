import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUser,
  deleteUser,
  getUser,
  updateUser,
  UserCreate,
  UserDeleted,
  UserDetail,
  UserUpdate,
} from "@/api_debug/users.logged";

export function useGetUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => getUser(userId),

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
  });
}

export function useUpdateUserMutation(userId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation<UserDetail, Error, UserUpdate>({
    mutationFn: (request: UserUpdate) => updateUser(userId!, request),

    onSuccess: (user) => {
      queryClient.setQueryData(["user", user.user_id], user);
    },
  });
}

export function useDeleteUserMutation(userId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation<UserDeleted, Error, void>({
    mutationFn: () => deleteUser(userId!),

    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: ["user", userId],
      });

      queryClient.removeQueries({
        queryKey: ["savedLocations", userId],
      });
    },
  });
}
