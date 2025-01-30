import http from "http";
import nanobuffer from "nanobuffer";
import handler from "serve-handler";
import { Server } from "socket.io";

const msg = new nanobuffer(50);
const getMsgs = () => Array.from(msg).reverse();

msg.push({
  user: "brian",
  text: "hi",
  time: Date.now(),
});

// serve static assets
const server = http.createServer((request, response) => {
  return handler(request, response, {
    public: "./frontend",
  });
});

const io = new Server(server, {});

io.on("connection", (socket) => {
  console.log("connected to " + socket.id);
  socket.emit("msg:get", { msg: getMsgs() });

  socket.on("disconnected", () => {
    console.log("disconnected from " + socket.id);
  });

  socket.on("msg:post", (data) => {
    msg.push({
      user: data.user,
      text: data.text,
      time: Date.now(),
    });
    io.emit("msg:get", { msg: getMsgs() });
  });
});

const port = process.env.PORT || 8080;
server.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);
