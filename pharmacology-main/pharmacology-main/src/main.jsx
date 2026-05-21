import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import App from "./App.jsx";
import AppContextProvider from "./context/AppContext.jsx";
import MedicalContextProvider from "./context/MedicalContext.jsx";
import { ProductProvider } from "./context/ProductContext.jsx";
import { CourseProvider } from "./context/CourseContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppContextProvider>
        <MedicalContextProvider>
          <ProductProvider>
            <CourseProvider>
              <App />
              <ToastContainer
                position="top-left"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </CourseProvider>
          </ProductProvider>
        </MedicalContextProvider>
      </AppContextProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
