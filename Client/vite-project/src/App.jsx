import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./Component/Dashboard";
import ProtectedRoute from "./Component/ProtectRoutes";
import Navbar from "./pages/Navbar";
import { setAuthToken } from "./api";

function App() {
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setAuthToken(token);
    }
  }, []);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
