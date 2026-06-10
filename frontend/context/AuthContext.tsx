import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { UserDetail } from "@/api/users";
import { useCreateUserMutation, useGetUserMutation } from "@/hook/useUser";

type AuthContextType = {
  user: UserDetail | null;
  isLoading: boolean;
  isLogin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
};
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const createMutator = useCreateUserMutation();
  const getUserMutator = useGetUserMutation();
  // useEffect(() => {
  //   async function loadAuthState() {
  //     const token = await SecureStore.getItemAsync("accessToken");

  //     if (token) {
  //       // Later: call backend GET /auth/xxxx to get real user
  //       setUser({
  //         user_id: "test",
  //         username: "Test123",
  //         profile_settings: [],
  //         language: "en",
  //       });
  //     } else {
  //       setUser(null);
  //     }

  //     setIsLoading(false);
  //   }

  //   loadAuthState();
  // }, []);

  async function login(username: string, password: string) {
    // const response = await loginApi(email, password);

    //add error handling for wrong password / wrong email
    //highlight them individually

    // retrieved should be the user json
    // for now just use testToken
    const token = "testToken";
    await SecureStore.setItemAsync("accessToken", token);
    //example user
    // const user: UserDetail = {
    //   user_id: "test",
    //   username: "Test",
    //   profile_settings: [],
    //   language: "en",
    // };
    const userDetail = await getUserMutator.mutateAsync({ username, password });
    if (!userDetail) {
      return;
    }
    setUser(userDetail);
  }

  async function signup(username: string, password: string) {
    // here suppose to do a POST request to back in to store the relevant data
    // make sure to remember to encrypt the password with SHA256

    const userDetail = await createMutator.mutateAsync({
      username,
      password,
      language: "en",
      profile_settings: [],
    });
    login(username, password);
  }

  async function logout() {
    await SecureStore.deleteItemAsync("accessToken");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLogin,
        login,
        logout,
        signup,
        setIsLogin,
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
