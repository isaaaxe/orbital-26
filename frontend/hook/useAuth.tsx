import { login } from "@/api_debug/auth.logged";
import { useMutation } from "@tanstack/react-query";

export function useLoginMutation() {
  return useMutation({
    mutationFn: login,
  });
}
