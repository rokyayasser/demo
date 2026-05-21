import { useContext } from "react";
import { AppContext } from "../contexts/AppContext";

export const useAuth = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAuth must be used within an AppContextProvider");
  }

  return {
    token: context.token,
    userData: context.userData,
    loading: context.loading,
    logout: context.logout,
    isAuthenticated: !!context.token,
  };
};
