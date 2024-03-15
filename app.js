const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname + "/public"));

const messageFile = "./messages.json";

function saveMessage(message) {
  fs.readFile(messageFile, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading messages file:", err);
      return;
    }
    let messages = JSON.parse(data);
    messages.push(message);
    if (messages.length > 20) {
      messages = messages.slice(messages.length - 20);
    }
    fs.writeFile(messageFile, JSON.stringify(messages), (err) => {
      if (err) {
        console.error("Error writing messages file:", err);
      }
    });
  });
}

io.on("connection", (socket) => {
  console.log("New user connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  socket.on("chat message", (message) => {
    saveMessage(message);
    io.emit("chat message", message);
  });

  // Load initial messages
  fs.readFile(messageFile, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading messages file:", err);
      return;
    }
    let messages = JSON.parse(data);
    socket.emit("initial messages", messages);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
