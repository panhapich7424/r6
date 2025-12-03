import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { GameClient } from './game/GameClient.js';
import { NetworkManager } from './network/NetworkManager.js';
import { UIManager } from './ui/UIManager.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('renderCanvas');
    this.engine = new Engine(this.canvas, true);
    this.scene = new Scene(this.engine);
    
    this.networkManager = new NetworkManager();
    this.uiManager = new UIManager();
    this.gameClient = new GameClient(this.scene, this.networkManager, this.uiManager);
    
    this.init();
  }
  
  async init() {
    await this.gameClient.init();
    
    this.engine.runRenderLoop(() => {
      this.gameClient.update();
      this.scene.render();
    });
    
    window.addEventListener('resize', () => {
      this.engine.resize();
    });
    
    // Show join screen
    this.uiManager.showJoinScreen((playerName) => {
      this.networkManager.joinGame(playerName);
    });
  }
}

new Game();
