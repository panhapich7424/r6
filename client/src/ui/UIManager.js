export class UIManager {
  constructor() {
    this.overlay = document.getElementById('ui-overlay');
    this.currentScreen = null;
  }
  
  showJoinScreen(onJoin) {
    this.clearScreen();
    
    const screen = document.createElement('div');
    screen.className = 'ui-element';
    screen.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(20, 20, 20, 0.95);
      padding: 40px;
      border-radius: 10px;
      border: 2px solid #ff6b00;
      text-align: center;
    `;
    
    screen.innerHTML = `
      <h1 style="color: #ff6b00; margin-bottom: 20px;">TACTICAL SHOOTER 5v5</h1>
      <input type="text" id="playerName" placeholder="Enter your name" 
        style="padding: 10px; width: 250px; margin-bottom: 20px; font-size: 16px; 
        background: #1a1a1a; color: #fff; border: 1px solid #ff6b00; border-radius: 5px;">
      <br>
      <button id="joinBtn" style="padding: 12px 40px; font-size: 18px; 
        background: #ff6b00; color: #fff; border: none; border-radius: 5px; 
        cursor: pointer; font-weight: bold;">JOIN GAME</button>
    `;
    
    this.overlay.appendChild(screen);
    this.currentScreen = screen;
    
    const input = document.getElementById('playerName');
    const btn = document.getElementById('joinBtn');
    
    btn.onclick = () => {
      const name = input.value.trim() || 'Anonymous';
      onJoin(name);
      this.clearScreen();
    };
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') btn.click();
    });
    
    input.focus();
  }
  
  showOperatorSelection(operators, team, onSelect) {
    this.clearScreen();
    
    const screen = document.createElement('div');
    screen.className = 'ui-element';
    screen.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(20, 20, 20, 0.95);
      padding: 30px;
      border-radius: 10px;
      border: 2px solid ${team === 'attackers' ? '#00a8ff' : '#ff6b00'};
      max-width: 90%;
      max-height: 90%;
      overflow-y: auto;
    `;
    
    const teamOps = Object.values(operators).filter(op => op.team === team);
    
    let html = `
      <h2 style="color: ${team === 'attackers' ? '#00a8ff' : '#ff6b00'}; 
        margin-bottom: 20px; text-transform: uppercase;">
        SELECT ${team === 'attackers' ? 'ATTACKER' : 'DEFENDER'}
      </h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
        gap: 15px;">
    `;
    
    teamOps.forEach(op => {
      html += `
        <div class="operator-card" data-id="${op.id}" style="
          background: rgba(40, 40, 40, 0.8);
          padding: 15px;
          border-radius: 8px;
          border: 2px solid #555;
          cursor: pointer;
          transition: all 0.3s;
        ">
          <h3 style="color: #fff; margin-bottom: 10px;">${op.name}</h3>
          <p style="color: #aaa; font-size: 14px; margin-bottom: 10px;">
            ${op.ability.description}
          </p>
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: #888;">
            <span>Health: ${op.health}</span>
            <span>Armor: ${op.armor}</span>
            <span>Speed: ${op.speed}</span>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    screen.innerHTML = html;
    
    this.overlay.appendChild(screen);
    this.currentScreen = screen;
    
    document.querySelectorAll('.operator-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.borderColor = team === 'attackers' ? '#00a8ff' : '#ff6b00';
        card.style.transform = 'scale(1.05)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.borderColor = '#555';
        card.style.transform = 'scale(1)';
      });
      card.addEventListener('click', () => {
        onSelect(card.dataset.id);
        this.clearScreen();
      });
    });
  }
  
  showHUD(playerData) {
    this.clearScreen();
    
    const hud = document.createElement('div');
    hud.className = 'ui-element';
    hud.id = 'game-hud';
    hud.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    `;
    
    hud.innerHTML = `
      <!-- Top Bar -->
      <div style="position: absolute; top: 20px; left: 50%; transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.7); padding: 10px 30px; border-radius: 5px;">
        <div id="phase-timer" style="color: #fff; font-size: 24px; font-weight: bold;">
          PREP PHASE - 0:45
        </div>
      </div>
      
      <!-- Health & Armor -->
      <div style="position: absolute; bottom: 30px; left: 30px;">
        <div style="color: #0f0; font-size: 36px; font-weight: bold; text-shadow: 2px 2px 4px #000;">
          <span id="health">100</span>
        </div>
        <div style="color: #00a8ff; font-size: 18px; margin-top: 5px;">
          ARMOR: <span id="armor">0</span>
        </div>
      </div>
      
      <!-- Ammo -->
      <div style="position: absolute; bottom: 30px; right: 30px; text-align: right;">
        <div style="color: #fff; font-size: 32px; font-weight: bold; text-shadow: 2px 2px 4px #000;">
          <span id="ammo">30</span> / <span id="reserve">90</span>
        </div>
        <div style="color: #aaa; font-size: 16px; margin-top: 5px;" id="weapon-name">
          MP5
        </div>
      </div>
      
      <!-- Ability -->
      <div style="position: absolute; bottom: 120px; right: 30px;">
        <div style="background: rgba(0, 0, 0, 0.7); padding: 10px; border-radius: 5px;
          border: 2px solid #ff6b00;">
          <div style="color: #ff6b00; font-size: 14px; margin-bottom: 5px;">ABILITY</div>
          <div id="ability-name" style="color: #fff; font-size: 16px;">Ready</div>
        </div>
      </div>
      
      <!-- Crosshair -->
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
        <div style="width: 20px; height: 2px; background: #0f0; margin-bottom: 8px;"></div>
        <div style="width: 2px; height: 20px; background: #0f0; margin: 0 auto;"></div>
      </div>
      
      <!-- Kill Feed -->
      <div id="kill-feed" style="position: absolute; top: 80px; right: 30px; 
        width: 300px; max-height: 200px; overflow: hidden;">
      </div>
      
      <!-- Team Status -->
      <div style="position: absolute; top: 20px; left: 30px;">
        <div style="background: rgba(0, 0, 0, 0.7); padding: 10px; border-radius: 5px;">
          <div style="color: #00a8ff; margin-bottom: 5px;">ATTACKERS: <span id="attackers-alive">5</span></div>
          <div style="color: #ff6b00;">DEFENDERS: <span id="defenders-alive">5</span></div>
        </div>
      </div>
    `;
    
    this.overlay.appendChild(hud);
    this.currentScreen = hud;
  }
  
  updateHUD(data) {
    const elements = {
      health: document.getElementById('health'),
      armor: document.getElementById('armor'),
      ammo: document.getElementById('ammo'),
      reserve: document.getElementById('reserve'),
      weaponName: document.getElementById('weapon-name'),
      phaseTimer: document.getElementById('phase-timer')
    };
    
    if (data.health !== undefined && elements.health) {
      elements.health.textContent = Math.max(0, Math.floor(data.health));
    }
    if (data.armor !== undefined && elements.armor) {
      elements.armor.textContent = data.armor;
    }
    if (data.ammo !== undefined && elements.ammo) {
      elements.ammo.textContent = data.ammo;
    }
    if (data.phase && elements.phaseTimer) {
      elements.phaseTimer.textContent = data.phase;
    }
  }
  
  addKillFeed(killer, victim, weapon) {
    const feed = document.getElementById('kill-feed');
    if (!feed) return;
    
    const entry = document.createElement('div');
    entry.style.cssText = `
      background: rgba(0, 0, 0, 0.8);
      padding: 8px;
      margin-bottom: 5px;
      border-radius: 3px;
      color: #fff;
      font-size: 14px;
      animation: slideIn 0.3s;
    `;
    entry.textContent = `${killer} ☠ ${victim}`;
    
    feed.insertBefore(entry, feed.firstChild);
    
    setTimeout(() => entry.remove(), 5000);
  }
  
  clearScreen() {
    if (this.currentScreen) {
      this.currentScreen.remove();
      this.currentScreen = null;
    }
  }
}
