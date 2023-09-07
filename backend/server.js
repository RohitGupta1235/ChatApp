const express = require("express");
//const path = require("path");
// require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
//const router = require("./routes/userRoutes");
const dotenv = require("dotenv");
const { chats } = require("./data/data");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");
const colors = require("colors");

dotenv.config();

connectDB();

const app = express();

app.use(express.json()); // to accept JSON data

app.get("/", (req, res) => {
  res.send("Api is running succesfuly");
});

app.use("/api/user", userRoutes);
//new end points for our chat api
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

//----deployment--------

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

//-----deployement-----

// app.get("/api/chat", (req, res) => {
//   res.send(chats);
// });
// //
//This is above one for group chat

// app.get("/api/chat/:id", (req, res) => {
//   // console.log(req.params.id)

//   //cahts iss liye kyuki sare data usme save hein

//   const singleChat = chats.find((c) => (c.id = req.params.id));
//   res.send(singleChat);
// });

// app.get("/api/chat/:id", (req, res) => {
//   const singleChat = chats.find((c) => (c.id = req.params.id));
//   res.send(singleChat);
// });
// app.get("/chat/api/:id", (req, res) => {
//   const single = chats.find((c) => (c.id = req.params.id));
//   res.send(single);
// });
//port ka variable
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server started  at the port ${PORT}`.green.bold)
);
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});
io.on("connection", (socket) => {
  console.log("connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    // console.log(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
