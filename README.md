# Tactical Shooter 5v5

A Rainbow Six Siege-style tactical shooter built for web browsers using Babylon.js and Socket.io.

## Features

- **5v5 Multiplayer**: Real-time tactical gameplay with attackers vs defenders
- **10 Unique Operators**: 5 attackers and 5 defenders with specialized abilities
- **Round-Based Gameplay**: Prep phase and action phase with bomb plant/defuse mechanics
- **Tactical Vision System**: Limited 70° vision cone for stealth gameplay
- **Destructible Environment**: Breach walls and create new paths
- **Operator Abilities**: Unique gadgets and abilities for each operator
- **Real-time Networking**: Authoritative server with lag compensation

## Installation

```bash
npm install
```

## Running the Game

Start both server and client:
```bash
npm run dev
```

Or run separately:
```bash
# Terminal 1 - Server
npm run server

# Terminal 2 - Client
npm run client
```

The game will be available at `http://localhost:3000`

## Controls

- **WASD**: Movement
- **Mouse**: Look around
- **Left Click**: Shoot
- **C**: Crouch
- **Shift**: Sprint
- **E**: Use ability
- **F**: Deploy gadget
- **G**: Plant/Defuse bomb

## Operators

### Defenders
- **TrapMaster**: Reinforced walls and proximity mines
- **Anchor**: Deployable shields for defense
- **Jammer**: Signal jammers to block drones
- **Roamer**: Silent movement ability
- **Medic**: Heal teammates with stim pistol

### Attackers
- **Breacher**: Explosive charges and flashbangs
- **Scout**: Recon drones for intel
- **Disabler**: EMP grenades to disable gadgets
- **Shield**: Ballistic shield for frontal protection
- **Sniper**: Thermal scope to see through smoke

## Game Phases

1. **Operator Selection** (20s): Choose your operator
2. **Prep Phase** (45s): Defenders set up defenses, attackers scout with drones
3. **Action Phase** (3min): Attackers breach and try to defuse, defenders protect bomb
4. **Round End**: Winner determined by bomb status or team elimination

## Architecture

- **Client**: Babylon.js for 3D rendering, Socket.io-client for networking
- **Server**: Node.js with Socket.io for authoritative game state
- **Shared**: Common configuration and operator definitions

## Development

The project is structured for easy extension:

- Add new operators in `shared/config.js`
- Add new weapons in `shared/weapons.js`
- Extend game logic in `server/game/GameServer.js`
- Add client features in `client/src/game/GameClient.js`

## Future Enhancements

- Multiple maps
- Matchmaking system
- Player progression and stats
- More operators and gadgets
- Advanced destruction physics
- Voice chat integration
- Spectator mode
- Replay system

## License

MIT
