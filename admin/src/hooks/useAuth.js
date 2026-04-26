import { useContext } from "react";
import { AdminContext } from "@contexts/AdminContext";
import { DoctorContext } from "@contexts/DoctorContext";

export const useAuth = () => {
  const adminContext = useContext(AdminContext);
  const doctorContext = useContext(DoctorContext);

  const isAdmin = !!adminContext.token;
  const isDoctor = !!doctorContext.token;
  const isAuthenticated = isAdmin || isDoctor;

  return {
    isAuthenticated,
    isAdmin,
    isDoctor,
    user: isAdmin ? adminContext.user : doctorContext.user,
    logout: isAdmin ? adminContext.logout : doctorContext.logout,
  };
};
