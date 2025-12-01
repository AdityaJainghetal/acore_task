import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="w-full bg-white shadow-sm p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-blue-600">Auth App</h1>

      <div className="flex gap-6">
        <Link to="/" className="text-gray-700 hover:text-black">Login</Link>
        <Link to="/register" className="text-gray-700 hover:text-black">Register</Link>

        {localStorage.getItem("token") && (
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded-md"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
