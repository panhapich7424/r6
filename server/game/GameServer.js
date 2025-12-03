import { GameConfig, OperatorConfig } from '../../shared/config.js';

export class GameServer {
  constructor(io) {
    this.io = io;
    this.matches = new Map();
    this.players = new Map();
    this.currentMatchId = 'match_1'; // Simple single match for now
    this.initMatch(this.currentMatchId);
  }
  
  initMatch(matchId) {
    this.matches.set(matchId, {
      id: matchId,
      phase: GameConfig.PHASE.LOBBY,
      round: 1,
      attackers: [],
      defenders: [],
      playerStates: new Map(),
      gadgets: [],
      bombPlanted: false,
      bombSite: null,
      phaseStartTime: Date.now(),
      scores: { attackers: 0, defenders: 0 }
    });
  }
  
  handlePlayerJoin(socket, data) {
    const match = this.matches.get(this.currentMatchId);
    const playerName = data.name || `Player_${socket.id.slice(0, 4)}`;
    
    // Assign to team with fewer players
    const team = match.attackers.length <= match.defenders.length 
      ? GameConfig.TEAM.ATTACKERS 
      : GameConfig.TEAM.DEFENDERS;
    
    const player = {
      id: socket.id,
      name: playerName,
      team,
      operator: null,
      health: 100,
      armor: 0,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      alive: true,
      gadgets: []
    };
    
    this.players.set(socket.id, { matchId: this.currentMatchId, player });
    
    if (team === GameConfig.TEAM.ATTACKERS) {
      match.attackers.push(socket.id);
    } else {
      match.defenders.push(socket.id);
    }
    
    match.playerStates.set(socket.id, player);
    
    socket.join(this.currentMatchId);
    socket.emit('joined_game', { player, matchId: this.currentMatchId });
    
    this.io.to(this.currentMatchId).emit('player_joined', player);
    
    // Start operator selection if enough players
    if (match.attackers.length + match.defenders.length >= 2) {
      this.startOperatorSelection(this.currentMatchId);
    }
  }

  startOperatorSelection(matchId) {
    const match = this.matches.get(matchId);
    if (match.phase !== GameConfig.PHASE.LOBBY) return;
    
    match.phase = GameConfig.PHASE.OPERATOR_SELECT;
    match.phaseStartTime = Date.now();
    
    this.io.to(matchId).emit('phase_change', {
      phase: GameConfig.PHASE.OPERATOR_SELECT,
      operators: OperatorConfig
    });
    
    setTimeout(() => this.startPrepPhase(matchId), 20000); // 20s to select
  }
  
  handleOperatorSelect(socket, operatorId) {
    const playerData = this.players.get(socket.id);
    if (!playerData) return;
    
    const match = this.matches.get(playerData.matchId);
    const player = match.playerStates.get(socket.id);
    const operator = OperatorConfig[operatorId.toUpperCase()];
    
    if (!operator || operator.team !== player.team) {
      socket.emit('error', { message: 'Invalid operator selection' });
      return;
    }
    
    // Check if operator already selected by teammate
    const teamPlayers = player.team === GameConfig.TEAM.ATTACKERS 
      ? match.attackers : match.defenders;
    
    const alreadySelected = teamPlayers.some(pid => {
      const p = match.playerStates.get(pid);
      return p.operator === operatorId;
    });
    
    if (alreadySelected) {
      socket.emit('error', { message: 'Operator already selected' });
      return;
    }
    
    player.operator = operatorId;
    player.health = operator.health;
    player.armor = operator.armor;
    
    this.io.to(playerData.matchId).emit('operator_selected', {
      playerId: socket.id,
      operatorId
    });
  }
  
  startPrepPhase(matchId) {
    const match = this.matches.get(matchId);
    match.phase = GameConfig.PHASE.PREP;
    match.phaseStartTime = Date.now();
    match.bombPlanted = false;
    
    // Set spawn positions
    match.defenders.forEach((pid, idx) => {
      const player = match.playerStates.get(pid);
      player.position = { x: -20 + idx * 3, y: 0, z: -20 };
      player.alive = true;
    });
    
    match.attackers.forEach((pid, idx) => {
      const player = match.playerStates.get(pid);
      player.position = { x: 20 + idx * 3, y: 0, z: 20 };
      player.alive = true;
    });
    
    this.io.to(matchId).emit('phase_change', {
      phase: GameConfig.PHASE.PREP,
      duration: GameConfig.PREP_PHASE_DURATION,
      playerStates: Array.from(match.playerStates.values())
    });
    
    setTimeout(() => this.startActionPhase(matchId), GameConfig.PREP_PHASE_DURATION);
  }
  
  startActionPhase(matchId) {
    const match = this.matches.get(matchId);
    match.phase = GameConfig.PHASE.ACTION;
    match.phaseStartTime = Date.now();
    
    this.io.to(matchId).emit('phase_change', {
      phase: GameConfig.PHASE.ACTION,
      duration: GameConfig.ACTION_PHASE_DURATION
    });
    
    setTimeout(() => this.endRound(matchId, 'defenders'), GameConfig.ACTION_PHASE_DURATION);
  }
  
  handlePlayerMove(socket, data) {
    const playerData = this.players.get(socket.id);
    if (!playerData) return;
    
    const match = this.matches.get(playerData.matchId);
    const player = match.playerStates.get(socket.id);
    
    if (!player.alive || match.phase === GameConfig.PHASE.LOBBY) return;
    
    player.position = data.position;
    player.rotation = data.rotation;
    player.stance = data.stance; // walk, crouch, sprint
    
    socket.to(playerData.matchId).emit('player_moved', {
      playerId: socket.id,
      position: data.position,
      rotation: data.rotation,
      stance: data.stance
    });
  }
  
  handlePlayerShoot(socket, data) {
    const playerData = this.players.get(socket.id);
    if (!playerData) return;
    
    const match = this.matches.get(playerData.matchId);
    const shooter = match.playerStates.get(socket.id);
    
    if (!shooter.alive || match.phase !== GameConfig.PHASE.ACTION) return;
    
    // Server-side hit detection
    const { targetId, hitLocation, damage } = this.calculateHit(data, match);
    
    if (targetId) {
      const target = match.playerStates.get(targetId);
      target.health -= damage;
      
      if (target.health <= 0) {
        target.alive = false;
        this.io.to(playerData.matchId).emit('player_killed', {
          killerId: socket.id,
          victimId: targetId,
          weapon: data.weapon
        });
        
        this.checkRoundEnd(playerData.matchId);
      } else {
        this.io.to(targetId).emit('player_hit', { damage, from: socket.id });
      }
    }
    
    socket.to(playerData.matchId).emit('player_shot', {
      playerId: socket.id,
      direction: data.direction,
      weapon: data.weapon
    });
  }
  
  calculateHit(data, match) {
    // Simplified hit detection - in production use raycast
    const { targetId, hitLocation } = data;
    
    if (!targetId) return { targetId: null, damage: 0 };
    
    const target = match.playerStates.get(targetId);
    if (!target || !target.alive) return { targetId: null, damage: 0 };
    
    let damage = data.baseDamage || 40;
    
    if (hitLocation === 'head') {
      damage *= GameConfig.HEALTH.HEAD_MULTIPLIER;
    } else if (hitLocation === 'limb') {
      damage *= GameConfig.HEALTH.LIMB_MULTIPLIER;
    }
    
    return { targetId, hitLocation, damage };
  }
  
  handleUseAbility(socket, data) {
    const playerData = this.players.get(socket.id);
    if (!playerData) return;
    
    const match = this.matches.get(playerData.matchId);
    const player = match.playerStates.get(socket.id);
    
    if (!player.alive) return;
    
    this.io.to(playerData.matchId).emit('ability_used', {
      playerId: socket.id,
      operator: player.operator,
      position: data.position
    });
  }
  
  handleDeployGadget(socket, data) {
    const playerData = this.players.get(socket.id);
    if (!playerData) return;
    
    const match = this.matches.get(playerData.matchId);
    const player = match.playerStates.get(socket.id);
    
    if (!player.alive) return;
    
    const gadget = {
      id: `gadget_${Date.now()}_${socket.id}`,
      type: data.type,
      ownerId: socket.id,
      position: data.position,
      active: true
    };
    
    match.gadgets.push(gadget);
    
    this.io.to(playerData.matchId).emit('gadget_deployed', gadget);
  }
  
  handlePlantBomb(socket) {
    const playerData = this.players.get(socket.id);
    if (!playerData) return;
    
    const match = this.matches.get(playerData.matchId);
    const player = match.playerStates.get(socket.id);
    
    if (player.team !== GameConfig.TEAM.DEFENDERS || match.bombPlanted) return;
    
    match.bombPlanted = true;
    match.bombSite = player.position;
    match.bombPlantTime = Date.now();
    
    this.io.to(playerData.matchId).emit('bomb_planted', {
      position: player.position,
      planterId: socket.id
    });
    
    // Bomb timer
    setTimeout(() => {
      if (match.bombPlanted) {
        this.endRound(playerData.matchId, 'defenders');
      }
    }, 45000); // 45s bomb timer
  }
  
  handleDefuseBomb(socket) {
    const playerData = this.players.get(socket.id);
    if (!playerData) return;
    
    const match = this.matches.get(playerData.matchId);
    const player = match.playerStates.get(socket.id);
    
    if (player.team !== GameConfig.TEAM.ATTACKERS || !match.bombPlanted) return;
    
    this.io.to(playerData.matchId).emit('defuse_started', {
      defuserId: socket.id
    });
    
    setTimeout(() => {
      if (match.bombPlanted) {
        match.bombPlanted = false;
        this.endRound(playerData.matchId, 'attackers');
      }
    }, GameConfig.DEFUSE_TIME);
  }
  
  checkRoundEnd(matchId) {
    const match = this.matches.get(matchId);
    
    const attackersAlive = match.attackers.some(pid => 
      match.playerStates.get(pid).alive
    );
    const defendersAlive = match.defenders.some(pid => 
      match.playerStates.get(pid).alive
    );
    
    if (!attackersAlive) {
      this.endRound(matchId, 'defenders');
    } else if (!defendersAlive && !match.bombPlanted) {
      this.endRound(matchId, 'attackers');
    }
  }
  
  endRound(matchId, winner) {
    const match = this.matches.get(matchId);
    if (match.phase === GameConfig.PHASE.ROUND_END) return;
    
    match.phase = GameConfig.PHASE.ROUND_END;
    match.scores[winner]++;
    
    this.io.to(matchId).emit('round_end', {
      winner,
      scores: match.scores,
      reason: winner === 'defenders' ? 'Bomb exploded' : 'Bomb defused'
    });
    
    setTimeout(() => {
      match.round++;
      this.startOperatorSelection(matchId);
    }, 5000);
  }
  
  handlePlayerDisconnect(socket) {
    const playerData = this.players.get(socket.id);
    if (!playerData) return;
    
    const match = this.matches.get(playerData.matchId);
    
    match.attackers = match.attackers.filter(id => id !== socket.id);
    match.defenders = match.defenders.filter(id => id !== socket.id);
    match.playerStates.delete(socket.id);
    
    this.players.delete(socket.id);
    
    this.io.to(playerData.matchId).emit('player_left', { playerId: socket.id });
  }
}
