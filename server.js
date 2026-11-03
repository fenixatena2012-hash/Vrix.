import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
app.use(express.static(path.join(__dirname, "public")));
app.get("/health", (_, res) => res.json({ ok: true }));

const players = new Map();
const clean = (v, max=20) => String(v ?? "").replace(/[<>]/g, "").slice(0,max);
io.on("connection", socket => {
  socket.on("join", data => {
    const player = {
      id: socket.id, name: clean(data?.name || "Aventureiro", 16),
      character: Math.max(0, Math.min(9, Number(data?.character) || 0)),
      x: 0, y: 0, z: 0, rot: 0, hp: 100
    };
    players.set(socket.id, player);
    socket.emit("world:init", [...players.values()]);
    socket.broadcast.emit("player:joined", player);
  });
  socket.on("move", data => {
    const p = players.get(socket.id);
    if (!p || !data) return;
    p.x = Math.max(-88, Math.min(88, Number(data.x) || 0));
    p.z = Math.max(-88, Math.min(88, Number(data.z) || 0));
    p.rot = Number(data.rot) || 0;
    socket.broadcast.volatile.emit("player:moved", p);
  });
  socket.on("chat", message => {
    const p = players.get(socket.id);
    if (!p) return;
    const text = clean(message, 120).trim();
    if (text) io.emit("chat", { name: p.name, text, id: socket.id });
  });
  socket.on("disconnect", () => {
    players.delete(socket.id);
    io.emit("player:left", socket.id);
  });
});
const port = process.env.PORT || 3000;
httpServer.listen(port, "0.0.0.0", () => console.log(`Reino online na porta ${port}`));
