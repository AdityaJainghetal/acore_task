import React, { useState } from "react";
import API from "../api.js";

function AuthForm({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const res = await API.post("/auth/login", {
          email: form.email,
          password: form.password,
        });
        onAuth(res.data.user, res.data.accessToken);
      } else {
        const res = await API.post("/auth/register", {
          name: form.name,
          email: form.email,
          password: form.password,
        });
        onAuth(res.data.user, res.data.accessToken);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Auth failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-white shadow-lg rounded-xl p-8"
      >
        <h2 className="text-3xl font-bold text-center mb-6">
          {isLogin ? "Login" : "Register"}
        </h2>

        {!isLogin && (
          <input
            className="w-full mb-4 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
        )}

        <input
          className="w-full mb-4 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
        />

        <input
          className="w-full mb-4 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition mb-3 disabled:bg-blue-300"
        >
          {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
        </button>

        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition"
        >
          {isLogin ? "Switch to Register" : "Switch to Login"}
        </button>
      </form>
    </div>
  );
}

export default AuthForm;
