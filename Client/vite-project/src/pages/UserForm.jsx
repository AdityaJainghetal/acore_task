import React, { useState } from "react";
import axios from "axios";

export default function UserForm({ fetchUsers }) {
  const [form, setForm] = useState({ name: "", email: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("https://acore-task-1.onrender.com/api/users", form);
    fetchUsers();
    setForm({ name: "", email: "" });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-5 rounded-xl shadow mb-6 max-w-xl mx-auto"
    >
      <h2 className="text-2xl font-semibold mb-4">Add User</h2>

      <input
        type="text"
        placeholder="Name"
        className="w-full border p-3 rounded mb-3"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <input
        type="email"
        placeholder="Email"
        className="w-full border p-3 rounded mb-3"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <button className="bg-blue-600 text-white px-5 py-2 rounded w-full">
        Add User
      </button>
    </form>
  );
}
