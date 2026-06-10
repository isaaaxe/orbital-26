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

export function useGetUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: LoginRequest) => getUser(request),

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

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation<UserDetail, Error, UserUpdate>({
    mutationFn: (request: UserUpdate) => updateUser(request),

    onSuccess: (user) => {
      queryClient.setQueryData(["user", user.user_id], user);
    },
  });
}

export function useDeleteUserMutation(request: LoginRequest) {
  const queryClient = useQueryClient();

  return useMutation<UserDeleted, Error, void>({
    mutationFn: () => deleteUser(request),

    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: ["user", request.username],
      });

      queryClient.removeQueries({
        queryKey: ["savedLocations", request.username],
      });
    },
  });
}
