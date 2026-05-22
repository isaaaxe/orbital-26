import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";

type User = {
  id: number;
  email: string;
  username: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isLogin: boolean;
  login: (email:string,  password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email:string,  password: string, username: string) => Promise<void>;
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>
};
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLogin, setIsLogin] = useState(true);

    useEffect(() => {
        async function loadAuthState() {
            const token = await SecureStore.getItemAsync("accessToken");

            if (token) {
                // Later: call backend GET /auth/xxxx to get real user
                setUser({
                    id: 1,
                    email: "test@example.com",
                    username: "Test123"
                });
            } else {
                setUser(null);
            }

            setIsLoading(false);
        }

        loadAuthState();
    }, []);

    async function login(email: string, password: string,) {
        // const response = await loginApi(email, password);

        //add error handling for wrong password / wrong email
        //highlight them individually

        // retrieved should be the user json
        // for now just use testToken
        const token = "testToken"
        await SecureStore.setItemAsync("accessToken", token);
        //example user
        const user: User = {
            id: 1,
            email: email,
            username: "Test"
        }
        setUser(user);
    }

    async function signup(email: string, password: string, username: string) {
        if (username == null || username.length == 0) {
            username = email
        }

        // here suppose to do a POST request to back in to store the relevant data
        // make sure to remember to encrypt the password with SHA256
        await login(email, password)

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