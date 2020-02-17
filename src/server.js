const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const PORT = process.env.PORT || 5000;

const app = express();

const server = http.createServer(app);
const io = socketIo(server);

server.listen(PORT, () => console.log(`starting on on port:${PORT}`))