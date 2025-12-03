// Shared configuration between client and server
export const GameConfig = {
  PREP_PHASE_DURATION: 45000, // 45 seconds
  ACTION_PHASE_DURATION: 180000, // 3 minutes
  DEFUSE_TIME: 7000, // 7 seconds
  PLANT_TIME: 5000, // 5 seconds
  
  TEAM: {
    ATTACKERS: 'attackers',
    DEFENDERS: 'defenders'
  },
  
  PHASE: {
    LOBBY: 'lobby',
    OPERATOR_SELECT: 'operator_select',
    PREP: 'prep',
    ACTION: 'action',
    ROUND_END: 'round_end'
  },
  
  VISION_CONE_ANGLE: 70, // degrees
  VISION_RANGE: 50, // units
  
  PLAYER_SPEED: {
    WALK: 3,
    CROUCH: 1.5,
    SPRINT: 5
  },
  
  HEALTH: {
    DEFAULT: 100,
    HEAD_MULTIPLIER: 4,
    BODY_MULTIPLIER: 1,
    LIMB_MULTIPLIER: 0.75
  }
};

export const OperatorConfig = {
  // Defenders
  TRAPMASTER: {
    id: 'trapmaster',
    name: 'TrapMaster',
    team: 'defenders',
    health: 100,
    armor: 2,
    speed: 2,
    ability: {
      name: 'Reinforced Wall',
      cooldown: 0,
      charges: 2,
      description: 'Deploy reinforced walls that resist breaching'
    },
    gadget: {
      name: 'Proximity Mine',
      charges: 3
    },
    weapons: {
      primary: 'MP5',
      secondary: 'P226'
    }
  },
  
  ANCHOR: {
    id: 'anchor',
    name: 'Anchor',
    team: 'defenders',
    health: 120,
    armor: 3,
    speed: 1,
    ability: {
      name: 'Deployable Shield',
      cooldown: 0,
      charges: 2,
      description: 'Deploy bulletproof shields for cover'
    },
    weapons: {
      primary: 'SG-CQB',
      secondary: 'P226'
    }
  },
  
  JAMMER: {
    id: 'jammer',
    name: 'Jammer',
    team: 'defenders',
    health: 100,
    armor: 2,
    speed: 2,
    ability: {
      name: 'Signal Jammer',
      cooldown: 0,
      charges: 3,
      description: 'Blocks drones and disables attacker gadgets in radius'
    },
    weapons: {
      primary: 'M870',
      secondary: 'SMG-11'
    }
  },
  
  ROAMER: {
    id: 'roamer',
    name: 'Roamer',
    team: 'defenders',
    health: 100,
    armor: 1,
    speed: 3,
    ability: {
      name: 'Silent Step',
      cooldown: 30000,
      duration: 10000,
      description: 'Move silently for 10 seconds'
    },
    weapons: {
      primary: 'MP7',
      secondary: 'P226'
    }
  },
  
  MEDIC: {
    id: 'medic',
    name: 'Medic',
    team: 'defenders',
    health: 100,
    armor: 2,
    speed: 2,
    ability: {
      name: 'Stim Pistol',
      cooldown: 20000,
      charges: 3,
      description: 'Heal teammates or boost health temporarily'
    },
    weapons: {
      primary: 'P90',
      secondary: 'P226'
    }
  },
  
  // Attackers
  BREACHER: {
    id: 'breacher',
    name: 'Breacher',
    team: 'attackers',
    health: 100,
    armor: 2,
    speed: 2,
    ability: {
      name: 'Breaching Charge',
      cooldown: 0,
      charges: 3,
      description: 'Explosive charges to breach walls and barricades'
    },
    gadget: {
      name: 'Flashbang',
      charges: 3
    },
    weapons: {
      primary: 'L85A2',
      secondary: 'P226'
    }
  },
  
  SCOUT: {
    id: 'scout',
    name: 'Scout',
    team: 'attackers',
    health: 100,
    armor: 1,
    speed: 3,
    ability: {
      name: 'Recon Drone',
      cooldown: 0,
      charges: 2,
      description: 'Deploy drones to scout and mark enemies'
    },
    weapons: {
      primary: 'R4-C',
      secondary: 'P226'
    }
  },
  
  DISABLER: {
    id: 'disabler',
    name: 'Disabler',
    team: 'attackers',
    health: 100,
    armor: 2,
    speed: 2,
    ability: {
      name: 'EMP Grenade',
      cooldown: 25000,
      charges: 3,
      description: 'Disable all electronic gadgets in radius'
    },
    weapons: {
      primary: 'AK-12',
      secondary: 'PMM'
    }
  },
  
  SHIELD: {
    id: 'shield',
    name: 'Shield',
    team: 'attackers',
    health: 100,
    armor: 3,
    speed: 1,
    ability: {
      name: 'Ballistic Shield',
      cooldown: 0,
      description: 'Equipped shield blocks frontal damage'
    },
    weapons: {
      primary: 'SHIELD',
      secondary: 'P226'
    }
  },
  
  SNIPER: {
    id: 'sniper',
    name: 'Sniper',
    team: 'attackers',
    health: 100,
    armor: 1,
    speed: 3,
    ability: {
      name: 'Thermal Scope',
      cooldown: 40000,
      duration: 15000,
      description: 'See through smoke and detect heat signatures'
    },
    weapons: {
      primary: 'OTS-03',
      secondary: 'PMM'
    }
  }
};
