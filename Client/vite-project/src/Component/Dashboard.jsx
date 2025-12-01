import React, { useEffect, useState } from "react";
import API from "../api";
import Editor from "../Component/Editor";

export default function Dashboard({ user }) {
  const [notes, setNotes] = useState([]);
  const [selected, setSelected] = useState(null);


const fetchNotes = async () => {
  try {
    const res = await API.get("/notes");
    setNotes(res.data);
  } catch (err) {
    console.error(err);
    alert("Unauthorized — token missing!");
  }
};


  useEffect(() => { fetchNotes(); }, []);

  const createNote = async () => {
    try {
      const res = await API.post("/notes", { title: "Untitled Note" });
      setNotes(prev => [res.data, ...prev]);
      setSelected(res.data);
    } catch (err) {
      console.error(err);
      alert("Create failed");
    }
  };

  const removeNote = async (id) => {
    if (!window.confirm("Delete note?")) return;
    try {
      await API.delete(`/notes/${id}`);
      setNotes(prev => prev.filter(n => n._id !== id));
      if (selected && selected._id === id) setSelected(null);
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Your Notes</h2>
        <div>
          <button onClick={createNote} className="bg-blue-600 text-white px-4 py-2 rounded">New Note</button>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="w-64">
          <div className="space-y-3">
            {notes.map(note => (
              <div key={note._id} className="p-3 bg-white rounded shadow flex flex-col">
                <div className="font-semibold">{note.title}</div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => setSelected(note)} className="text-sm bg-green-500 text-white px-2 py-1 rounded">Open</button>
                  <button onClick={() => removeNote(note._id)} className="text-sm bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1">
          {selected ? <Editor user={user} note={selected} onSaved={() => fetchNotes()} /> : <div className="p-6 bg-white rounded shadow">Open or create a note to start editing.</div>}
        </div>
      </div>
    </div>
  );
}
