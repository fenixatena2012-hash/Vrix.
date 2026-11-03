const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.get("/health", (_req, res) => res.json({ ok: true, game: "ECLIPSE" }));

const players = new Map();
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, Number(n) || 0));

io.on("connection", socket => {
  const player = {
    id: socket.id,
    name: "Viajante",
    x: (Math.random() - .5) * 5,
    y: 0,
    z: 7 + Math.random() * 3,
    rot: 0,
    color: ["#9f2937", "#41658c", "#77704a", "#714b88"][Math.floor(Math.random()*4)]
  };
  players.set(socket.id, player);
  socket.emit("welcome", { id: socket.id, players: [...players.values()] });
  socket.broadcast.emit("playerJoined", player);

  socket.on("move", data => {
    const p = players.get(socket.id);
    if (!p || !data) return;
    p.x = clamp(data.x, -48, 48);
    p.y = clamp(data.y, 0, 8);
    p.z = clamp(data.z, -48, 48);
    p.rot = clamp(data.rot, -1000, 1000);
    if (typeof data.name === "string") p.name = data.name.slice(0, 18) || "Viajante";
    socket.broadcast.emit("playerMoved", p);
  });

  socket.on("chat", msg => {
    if (typeof msg !== "string") return;
    io.emit("chat", { name: players.get(socket.id)?.name || "Viajante", text: msg.slice(0, 140) });
  });

  socket.on("disconnect", () => {
    players.delete(socket.id);
    io.emit("playerLeft", socket.id);
  });
});

server.listen(PORT, "0.0.0.0", () => console.log(`ECLIPSE online na porta ${PORT}`));
