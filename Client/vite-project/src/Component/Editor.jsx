import React, { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import io from "socket.io-client";
import API from "../api.js";

const SOCKET_URL = "https://acore-task.onrender.com";

export default function Editor({ user, note, onSaved, onDeleted }) {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("Idle");

  const socketRef = useRef(null);
  const saveTimeout = useRef(null);

  // Sync state when note changes
  useEffect(() => {
    if (!note) return;
    setContent(note.content || "");
    setTitle(note.title || "");
    setStatus("Idle");
  }, [note?._id]);

  // Setup Socket.IO
  useEffect(() => {
    if (!user || !note) return;

    const userId = user._id || user.id;
    socketRef.current = io(SOCKET_URL, { withCredentials: true });

    socketRef.current.emit("join-note", {
      noteId: note._id,
      userId,
      userName: user.name,
    });

    socketRef.current.on("receive-changes", ({ content: remoteContent }) => {
      // prevent overwriting local typing
      setContent((prev) => (prev !== remoteContent ? remoteContent : prev));
    });

    socketRef.current.on("note-saved", () => setStatus("Saved"));

    return () => {
      socketRef.current.disconnect();
    };
  }, [note?._id, user?._id]);

  // Handle editor changes
  const handleChange = (value) => {
    setContent(value);
    setStatus("Editing");

    if (socketRef.current) {
      socketRef.current.emit("editor-changes", {
        noteId: note._id,
        content: value,
      });
    }

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => saveNote(value), 2000);
  };

  const saveNote = async (updatedContent) => {
    setStatus("Saving...");
    try {
      const res = await API.put(`/notes/${note._id}`, {
        content: updatedContent,
        title,
      });
      socketRef.current?.emit("save-note", {
        noteId: note._id,
        content: updatedContent,
      });
      setStatus("Saved");
      onSaved?.(res.data);
    } catch (err) {
      console.error(err);
      setStatus("Save failed");
    }
  };

  const handleTitleBlur = async () => {
    if (title !== note?.title) saveNote(content);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      await API.delete(`/notes/${note._id}`);
      onDeleted?.(note._id);
    } catch (err) {
      console.error(err);
      alert("Failed to delete note");
    }
  };

  if (!user || !note)
    return <div className="p-6 text-red-500">User or Note missing</div>;

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex justify-between items-center mb-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          placeholder="Note Title"
          className="w-full p-2 border rounded mr-2"
        />
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Delete
        </button>
      </div>

      <ReactQuill value={content} onChange={handleChange} theme="snow" />
      <div className="mt-2 text-sm text-gray-600">Status: {status}</div>
    </div>
  );
}
