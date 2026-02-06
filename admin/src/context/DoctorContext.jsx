/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from "react";
export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {
  const [dToken, setDToken] = useState(localStorage.getItem("dToken") || "");
  const [doctorEmail, setDoctorEmail] = useState("");
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // Check if doctor token exists in localStorage
  useEffect(() => {
    const token = localStorage.getItem("dToken");
    if (token) {
      setDToken(token);
    }
  }, []);

  // Update token in localStorage when it changes
  useEffect(() => {
    if (dToken) {
      localStorage.setItem("dToken", dToken);
    } else {
      localStorage.removeItem("dToken");
    }
  }, [dToken]);

  const value = {
    dToken,
    setDToken,
    doctorEmail,
    setDoctorEmail,
    backendUrl,
  };

  return (
    <DoctorContext.Provider value={value}>
      {props.children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;
