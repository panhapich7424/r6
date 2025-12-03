import { io } from 'socket.io-client';

export class NetworkManager {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.playerId = null;
    this.callbacks = new Map();
  }
  
  connect() {
    // Use environment variable or default to current host in production
    const serverUrl = import.meta.env.VITE_SERVER_URL || 
                     (window.location.hostname === 'localhost' 
                       ? 'http://localhost:3001' 
                       : window.location.origin);
    
    this.socket = io(serverUrl);
    
    this.socket.on('connect', () => {
      this.connected = true;
      this.playerId = this.socket.id;
      console.log('Connected to server:', this.playerId);
      this.trigger('connected');
    });
    
    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('Disconnected from server');
      this.trigger('disconnected');
    });
    
    this.setupEventHandlers();
  }
  
  setupEventHandlers() {
    const events = [
      'joined_game', 'player_joined', 'player_left',
      'phase_change', 'operator_selected',
      'player_moved', 'player_shot', 'player_hit', 'player_killed',
      'ability_used', 'gadget_deployed',
      'bomb_planted', 'defuse_started', 'round_end',
      'error'
    ];
    
    events.forEach(event => {
      this.socket.on(event, (data) => {
        this.trigger(event, data);
      });
    });
  }
  
  on(event, callback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event).push(callback);
  }
  
  trigger(event, data) {
    if (this.callbacks.has(event)) {
      this.callbacks.get(event).forEach(cb => cb(data));
    }
  }
  
  joinGame(playerName) {
    if (!this.connected) {
      this.connect();
      setTimeout(() => this.joinGame(playerName), 500);
      return;
    }
    this.socket.emit('join_game', { name: playerName });
  }
  
  selectOperator(operatorId) {
    this.socket.emit('select_operator', operatorId);
  }
  
  sendMove(position, rotation, stance) {
    this.socket.emit('player_move', { position, rotation, stance });
  }
  
  sendShoot(direction, weapon, targetId, hitLocation, baseDamage) {
    this.socket.emit('player_shoot', {
      direction, weapon, targetId, hitLocation, baseDamage
    });
  }
  
  useAbility(position) {
    this.socket.emit('use_ability', { position });
  }
  
  deployGadget(type, position) {
    this.socket.emit('deploy_gadget', { type, position });
  }
  
  plantBomb() {
    this.socket.emit('plant_bomb');
  }
  
  defuseBomb() {
    this.socket.emit('defuse_bomb');
  }
}
