import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "https://acore-task-1.onrender.com/api/auth/register",
        form
      );
      navigate("/");
    } catch (err) {
      alert("Registration Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">
          Register
        </h2>

        <input
          type="text"
          placeholder="Name"
          className="w-full p-3 border rounded mb-4"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

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
          Register
        </button>

        <p className="mt-4 text-center">
          Already have an account?
          <Link to="/" className="text-blue-600 ml-1">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
