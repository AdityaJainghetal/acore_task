const Note = require("./models/Notes");

function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log("socket connected:", socket.id);

    socket.on("join-note", async ({ noteId, userId, userName }) => {
      socket.join(noteId);
      socket.noteId = noteId;
      socket.userId = userId;
      socket.userName = userName;
      // broadcast active users in room
      const clients = await io.in(noteId).allSockets();
      const users = Array.from(clients).map((id) => ({ socketId: id }));
      io.to(noteId).emit("user-joined", { socketId: socket.id, userName });
    });

    socket.on("editor-changes", ({ noteId, content }) => {
      // broadcast to others in room
      socket.to(noteId).emit("receive-changes", { content });
    });

    socket.on("cursor-change", ({ noteId, cursor }) => {
      socket.to(noteId).emit("receive-cursor", { socketId: socket.id, cursor });
    });

    socket.on("save-note", async ({ noteId, content, userId }) => {
      try {
        await Note.findByIdAndUpdate(noteId, { content }, { new: true });
        socket.to(noteId).emit("note-saved", { noteId });
      } catch (err) {
        console.error("save-note error:", err);
      }
    });

    socket.on("disconnect", () => {
      if (socket.noteId) {
        socket.to(socket.noteId).emit("user-left", { socketId: socket.id, userName: socket.userName });
      }
      console.log("socket disconnected:", socket.id);
    });
  });
}

module.exports = setupSocket;
