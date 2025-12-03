import { Vector3, Color3, Color4 } from '@babylonjs/core/Maths/math';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { GameConfig, OperatorConfig } from '../../../shared/config.js';
import { WeaponStats } from '../../../shared/weapons.js';

export class GameClient {
  constructor(scene, networkManager, uiManager) {
    this.scene = scene;
    this.network = networkManager;
    this.ui = uiManager;
    
    this.localPlayer = null;
    this.players = new Map();
    this.gadgets = new Map();
    this.camera = null;
    this.currentPhase = null;
    this.inputState = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      crouch: false,
      sprint: false,
      shoot: false
    };
  }
  
  async init() {
    this.setupScene();
    this.setupCamera();
    this.setupLighting();
    this.createMap();
    this.setupInput();
    this.setupNetworkHandlers();
  }
  
  setupScene() {
    this.scene.clearColor = new Color4(0.05, 0.05, 0.1, 1);
    this.scene.ambientColor = new Color3(0.2, 0.2, 0.2);
  }
  
  setupCamera() {
    this.camera = new FreeCamera('camera', new Vector3(0, 1.7, 0), this.scene);
    this.camera.attachControl(true);
    this.camera.speed = 0.3;
    this.camera.angularSensibility = 2000;
    this.camera.minZ = 0.1;
    this.camera.fov = 1.2;
  }
  
  setupLighting() {
    const light = new HemisphericLight('light', new Vector3(0, 1, 0), this.scene);
    light.intensity = 0.4;
  }
  
  createMap() {
    // Ground
    const ground = MeshBuilder.CreateGround('ground', { width: 100, height: 100 }, this.scene);
    const groundMat = new StandardMaterial('groundMat', this.scene);
    groundMat.diffuseColor = new Color3(0.3, 0.3, 0.3);
    ground.material = groundMat;
    
    // Create simple building structure
    this.createBuilding();
    this.createBombSites();
  }
  
  createBuilding() {
    const wallMat = new StandardMaterial('wallMat', this.scene);
    wallMat.diffuseColor = new Color3(0.5, 0.5, 0.5);
    
    // Outer walls
    const walls = [
      { pos: [0, 2.5, -25], size: [50, 5, 1] },
      { pos: [0, 2.5, 25], size: [50, 5, 1] },
      { pos: [-25, 2.5, 0], size: [1, 5, 50] },
      { pos: [25, 2.5, 0], size: [1, 5, 50] }
    ];
    
    walls.forEach((w, i) => {
      const wall = MeshBuilder.CreateBox(`wall${i}`, {
        width: w.size[0], height: w.size[1], depth: w.size[2]
      }, this.scene);
      wall.position = new Vector3(...w.pos);
      wall.material = wallMat;
    });
    
    // Interior walls
    const interiorWalls = [
      { pos: [0, 2.5, 0], size: [1, 5, 30] },
      { pos: [-10, 2.5, -10], size: [20, 5, 1] }
    ];
    
    interiorWalls.forEach((w, i) => {
      const wall = MeshBuilder.CreateBox(`intWall${i}`, {
        width: w.size[0], height: w.size[1], depth: w.size[2]
      }, this.scene);
      wall.position = new Vector3(...w.pos);
      wall.material = wallMat;
      wall.metadata = { destructible: true };
    });
  }
  
  createBombSites() {
    const siteMat = new StandardMaterial('siteMat', this.scene);
    siteMat.diffuseColor = new Color3(1, 0.4, 0);
    siteMat.alpha = 0.3;
    
    const siteA = MeshBuilder.CreateBox('bombSiteA', { width: 8, height: 0.1, depth: 8 }, this.scene);
    siteA.position = new Vector3(-15, 0.05, -15);
    siteA.material = siteMat;
    
    const siteB = MeshBuilder.CreateBox('bombSiteB', { width: 8, height: 0.1, depth: 8 }, this.scene);
    siteB.position = new Vector3(15, 0.05, 15);
    siteB.material = siteMat;
  }
  
  setupInput() {
    const canvas = this.scene.getEngine().getRenderingCanvas();
    
    window.addEventListener('keydown', (e) => {
      switch(e.code) {
        case 'KeyW': this.inputState.forward = true; break;
        case 'KeyS': this.inputState.backward = true; break;
        case 'KeyA': this.inputState.left = true; break;
        case 'KeyD': this.inputState.right = true; break;
        case 'KeyC': this.inputState.crouch = true; break;
        case 'ShiftLeft': this.inputState.sprint = true; break;
        case 'KeyE': this.useAbility(); break;
        case 'KeyF': this.deployGadget(); break;
        case 'KeyG': this.plantOrDefuseBomb(); break;
      }
    });
    
    window.addEventListener('keyup', (e) => {
      switch(e.code) {
        case 'KeyW': this.inputState.forward = false; break;
        case 'KeyS': this.inputState.backward = false; break;
        case 'KeyA': this.inputState.left = false; break;
        case 'KeyD': this.inputState.right = false; break;
        case 'KeyC': this.inputState.crouch = false; break;
        case 'ShiftLeft': this.inputState.sprint = false; break;
      }
    });
    
    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.inputState.shoot = true;
        this.shoot();
      }
    });
    
    canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.inputState.shoot = false;
      }
    });
  }

  setupNetworkHandlers() {
    this.network.on('joined_game', (data) => {
      this.localPlayer = data.player;
      console.log('Joined game as:', this.localPlayer);
    });
    
    this.network.on('phase_change', (data) => {
      this.currentPhase = data.phase;
      console.log('Phase changed to:', data.phase);
      
      if (data.phase === GameConfig.PHASE.OPERATOR_SELECT) {
        this.ui.showOperatorSelection(
          data.operators,
          this.localPlayer.team,
          (operatorId) => this.network.selectOperator(operatorId)
        );
      } else if (data.phase === GameConfig.PHASE.PREP || data.phase === GameConfig.PHASE.ACTION) {
        this.ui.showHUD(this.localPlayer);
        
        if (data.playerStates) {
          data.playerStates.forEach(p => {
            if (p.id === this.network.playerId) {
              this.localPlayer = p;
              this.camera.position = new Vector3(p.position.x, 1.7, p.position.z);
            } else {
              this.createOrUpdatePlayer(p);
            }
          });
        }
      }
    });
    
    this.network.on('player_joined', (player) => {
      if (player.id !== this.network.playerId) {
        this.createOrUpdatePlayer(player);
      }
    });
    
    this.network.on('player_moved', (data) => {
      this.createOrUpdatePlayer({
        id: data.playerId,
        position: data.position,
        rotation: data.rotation
      });
    });
    
    this.network.on('player_shot', (data) => {
      // Visual feedback for other players shooting
      console.log('Player shot:', data.playerId);
    });
    
    this.network.on('player_hit', (data) => {
      if (this.localPlayer) {
        this.localPlayer.health -= data.damage;
        this.ui.updateHUD({ health: this.localPlayer.health });
      }
    });
    
    this.network.on('player_killed', (data) => {
      this.ui.addKillFeed(data.killerId, data.victimId, data.weapon);
      
      if (data.victimId === this.network.playerId) {
        console.log('You were killed!');
      }
      
      const playerMesh = this.players.get(data.victimId);
      if (playerMesh) {
        playerMesh.dispose();
        this.players.delete(data.victimId);
      }
    });
    
    this.network.on('bomb_planted', (data) => {
      console.log('Bomb planted at:', data.position);
      this.createBombModel(data.position);
    });
    
    this.network.on('round_end', (data) => {
      console.log('Round ended. Winner:', data.winner);
    });
  }
  
  createOrUpdatePlayer(playerData) {
    let playerMesh = this.players.get(playerData.id);
    
    if (!playerMesh) {
      playerMesh = MeshBuilder.CreateCapsule(`player_${playerData.id}`, {
        height: 1.8, radius: 0.3
      }, this.scene);
      
      const mat = new StandardMaterial(`playerMat_${playerData.id}`, this.scene);
      mat.diffuseColor = playerData.team === 'attackers' 
        ? new Color3(0, 0.6, 1) 
        : new Color3(1, 0.4, 0);
      playerMesh.material = mat;
      
      this.players.set(playerData.id, playerMesh);
    }
    
    if (playerData.position) {
      playerMesh.position = new Vector3(
        playerData.position.x,
        0.9,
        playerData.position.z
      );
    }
  }
  
  createBombModel(position) {
    const bomb = MeshBuilder.CreateBox('bomb', { size: 0.5 }, this.scene);
    bomb.position = new Vector3(position.x, 0.25, position.z);
    
    const mat = new StandardMaterial('bombMat', this.scene);
    mat.diffuseColor = new Color3(1, 0, 0);
    mat.emissiveColor = new Color3(0.5, 0, 0);
    bomb.material = mat;
  }
  
  update() {
    if (!this.localPlayer || !this.camera) return;
    
    // Handle movement
    if (this.currentPhase === GameConfig.PHASE.ACTION || 
        this.currentPhase === GameConfig.PHASE.PREP) {
      this.handleMovement();
    }
    
    // Apply vision cone effect
    this.applyVisionCone();
  }
  
  handleMovement() {
    const speed = this.inputState.sprint ? GameConfig.PLAYER_SPEED.SPRINT :
                  this.inputState.crouch ? GameConfig.PLAYER_SPEED.CROUCH :
                  GameConfig.PLAYER_SPEED.WALK;
    
    const forward = this.camera.getDirection(Vector3.Forward());
    const right = this.camera.getDirection(Vector3.Right());
    
    let movement = Vector3.Zero();
    
    if (this.inputState.forward) movement.addInPlace(forward);
    if (this.inputState.backward) movement.subtractInPlace(forward);
    if (this.inputState.left) movement.subtractInPlace(right);
    if (this.inputState.right) movement.addInPlace(right);
    
    if (movement.length() > 0) {
      movement.normalize();
      movement.scaleInPlace(speed * 0.016); // Assuming 60fps
      this.camera.position.addInPlace(movement);
      
      // Send position update to server (throttled)
      if (!this.lastMoveUpdate || Date.now() - this.lastMoveUpdate > 50) {
        this.network.sendMove(
          { x: this.camera.position.x, y: 0, z: this.camera.position.z },
          { x: this.camera.rotation.x, y: this.camera.rotation.y, z: 0 },
          this.inputState.sprint ? 'sprint' : this.inputState.crouch ? 'crouch' : 'walk'
        );
        this.lastMoveUpdate = Date.now();
      }
    }
  }
  
  applyVisionCone() {
    // Simplified vision cone - darken areas outside player's view
    // In production, use post-processing effects
    this.players.forEach((mesh, id) => {
      const toPlayer = mesh.position.subtract(this.camera.position);
      const forward = this.camera.getDirection(Vector3.Forward());
      const angle = Vector3.GetAngleBetweenVectors(forward, toPlayer, Vector3.Up());
      
      const inVisionCone = Math.abs(angle) < (GameConfig.VISION_CONE_ANGLE / 2) * (Math.PI / 180);
      
      if (mesh.material) {
        mesh.material.alpha = inVisionCone ? 1 : 0.3;
      }
    });
  }
  
  shoot() {
    if (!this.localPlayer || this.currentPhase !== GameConfig.PHASE.ACTION) return;
    
    const direction = this.camera.getDirection(Vector3.Forward());
    const ray = this.scene.createPickingRay(
      this.scene.getEngine().getRenderWidth() / 2,
      this.scene.getEngine().getRenderHeight() / 2,
      null,
      this.camera
    );
    
    const hit = this.scene.pickWithRay(ray);
    
    let targetId = null;
    let hitLocation = 'body';
    
    if (hit.pickedMesh && hit.pickedMesh.name.startsWith('player_')) {
      targetId = hit.pickedMesh.name.replace('player_', '');
      hitLocation = hit.pickedPoint.y > 1.5 ? 'head' : 'body';
    }
    
    const operator = OperatorConfig[this.localPlayer.operator?.toUpperCase()];
    const weapon = operator ? WeaponStats[operator.weapons.primary] : null;
    const baseDamage = weapon ? weapon.damage : 40;
    
    this.network.sendShoot(
      { x: direction.x, y: direction.y, z: direction.z },
      weapon?.name || 'Unknown',
      targetId,
      hitLocation,
      baseDamage
    );
  }
  
  useAbility() {
    if (!this.localPlayer || this.currentPhase !== GameConfig.PHASE.ACTION) return;
    
    this.network.useAbility({
      x: this.camera.position.x,
      y: 0,
      z: this.camera.position.z
    });
  }
  
  deployGadget() {
    if (!this.localPlayer) return;
    
    const forward = this.camera.getDirection(Vector3.Forward());
    const deployPos = this.camera.position.add(forward.scale(2));
    
    this.network.deployGadget('generic', {
      x: deployPos.x,
      y: 0,
      z: deployPos.z
    });
  }
  
  plantOrDefuseBomb() {
    if (!this.localPlayer || this.currentPhase !== GameConfig.PHASE.ACTION) return;
    
    if (this.localPlayer.team === GameConfig.TEAM.DEFENDERS) {
      this.network.plantBomb();
    } else {
      this.network.defuseBomb();
    }
  }
}
