import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { GameServer } from './game/GameServer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { 
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST']
  }
});

// Serve static files from dist folder in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'));
  });
}

const gameServer = new GameServer(io);

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);
  
  socket.on('join_game', (data) => {
    gameServer.handlePlayerJoin(socket, data);
  });
  
  socket.on('select_operator', (operatorId) => {
    gameServer.handleOperatorSelect(socket, operatorId);
  });
  
  socket.on('player_move', (data) => {
    gameServer.handlePlayerMove(socket, data);
  });
  
  socket.on('player_shoot', (data) => {
    gameServer.handlePlayerShoot(socket, data);
  });
  
  socket.on('use_ability', (data) => {
    gameServer.handleUseAbility(socket, data);
  });
  
  socket.on('deploy_gadget', (data) => {
    gameServer.handleDeployGadget(socket, data);
  });
  
  socket.on('plant_bomb', () => {
    gameServer.handlePlantBomb(socket);
  });
  
  socket.on('defuse_bomb', () => {
    gameServer.handleDefuseBomb(socket);
  });
  
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    gameServer.handlePlayerDisconnect(socket);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Game server running on port ${PORT}`);
});
