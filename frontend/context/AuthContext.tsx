import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { UserDetail } from "@/api/users";
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetUserMutation,
} from "@/hook/useUser";
import { useLoginMutation } from "@/hook/useAuth";

type AuthContextType = {
  user: UserDetail | null;
  token: string | null;
  isLoading: boolean;
  isLogin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (username: string, password: string) => Promise<boolean>;
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
  deleteAccount: () => Promise<void>;
};
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const createMutator = useCreateUserMutation();
  const getUserMutator = useGetUserMutation();
  const loginMutation = useLoginMutation();
  const deleteUserMutation = useDeleteUserMutation(token, user?.user_id);
  useEffect(() => {
    async function loadAuthState() {
      try {
        const tokenCached = await SecureStore.getItemAsync("token");

        if (!tokenCached) {
          setUser(null);
          setToken(tokenCached);
          return;
        }

        const userDetail = await getUserMutator.mutateAsync(tokenCached);
        setUser(userDetail);
        setToken(tokenCached);
      } catch {
        //stale token
        await SecureStore.deleteItemAsync("token");
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadAuthState();
  }, []);

  async function login(username: string, password: string) {
    const token = await loginMutation.mutateAsync({ username, password });
    console.log("Token retrieval succesful");
    await SecureStore.setItemAsync("token", token.access_token);
    setToken(token.access_token);

    const userDetail = await getUserMutator.mutateAsync(token.access_token);
    if (!userDetail) {
      console.log("No user found");
      return;
    }
    console.log("User found");
    setUser(userDetail);
  }

  async function signup(username: string, password: string) {
    const userDetail = await createMutator.mutateAsync({
      username,
      password,
      language: "en",
      profile_settings: [],
    });
    if (!userDetail) {
      return false;
    }
    return true;
  }

  async function logout() {
    await SecureStore.deleteItemAsync("token");
    setUser(null);
    setToken(null);
  }

  async function deleteAccount() {
    await SecureStore.deleteItemAsync("token");
    await deleteUserMutation.mutateAsync();
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isLogin,
        login,
        logout,
        signup,
        setIsLogin,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used inside AuthProvider");
  }

  return context;
}
