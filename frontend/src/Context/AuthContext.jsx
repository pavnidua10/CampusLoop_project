import { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "./../config";
const authContext = createContext(null);

export const useAuth = () => useContext(authContext);

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Not authenticated");
      }
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data) {
      setUser(data);
      setToken(data.token); 
      setUserId(data._id);
      console.log("✅ Auth user set:", data);
    }
  }, [data]);

  return (
    <authContext.Provider value={{ user, token, userId, setUser, isLoading, error }}>
      {children}
    </authContext.Provider>
  );
};
