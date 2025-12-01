import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { setAuthToken } from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "https://acore-task-1.onrender.com/api/auth/login",
        form
      );
      const token = res.data.accessToken;
      localStorage.setItem("accessToken", token);
      setAuthToken(token);
      navigate("/dashboard");
    } catch (err) {
      alert("Invalid Credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">
          Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border rounded mb-4"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded mb-6"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Login
        </button>

        <p className="mt-4 text-center">
          Don't have an account?
          <Link to="/register" className="text-blue-600 ml-1">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
