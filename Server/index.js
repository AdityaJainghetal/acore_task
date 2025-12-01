


const express = require("express");
const http = require("http");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const setupSocket = require("./socket"); 

dotenv.config();
const app = express();


const server = http.createServer(app);


const io = require("socket.io")(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});


setupSocket(io);


app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());


connectDB(process.env.MONGO_URI || "mongodb://localhost:27017/realtime_notes");


const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/NoteRoute");

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
