import React, { useState } from "react";
import axios from "axios";

export default function UserList({ users, fetchUsers }) {
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });

  const deleteUser = async (id) => {
    await axios.delete(`http://localhost:8000/api/users/${id}`);
    fetchUsers();
  };

  const updateUser = async (id) => {
    await axios.put(`http://localhost:8000/api/users/${id}`, editForm);
    setEditId(null);
    fetchUsers();
  };

  return (
    <div className="max-w-2xl mx-auto">
      {users.map((user) => (
        <div
          key={user._id}
          className="bg-white p-4 rounded shadow flex justify-between items-center mb-3"
        >
          {editId === user._id ? (
            <div className="w-full flex gap-2">
              <input
                className="border p-2 rounded w-1/2"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
              <input
                className="border p-2 rounded w-1/2"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
              />
            </div>
          ) : (
            <div>
              <h3 className="font-bold">{user.name}</h3>
              <p className="text-gray-600">{user.email}</p>
            </div>
          )}

          <div className="flex gap-2">
            {editId === user._id ? (
              <button
                onClick={() => updateUser(user._id)}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Save
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditId(user._id);
                  setEditForm({ name: user.name, email: user.email });
                }}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
            )}

            <button
              onClick={() => deleteUser(user._id)}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
