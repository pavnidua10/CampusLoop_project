import { createContext,useContext } from "react";
export const authContext=createContext(null);
export const useAuth=()=>useContext(authContext);