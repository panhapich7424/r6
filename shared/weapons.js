export const WeaponStats = {
  // Defender Weapons
  MP5: {
    name: 'MP5',
    type: 'smg',
    damage: 27,
    fireRate: 800, // rounds per minute
    magazineSize: 30,
    reloadTime: 2.5,
    recoil: { horizontal: 0.3, vertical: 0.5 },
    range: 25
  },
  
  'SG-CQB': {
    name: 'SG-CQB',
    type: 'shotgun',
    damage: 48,
    fireRate: 85,
    magazineSize: 7,
    reloadTime: 3.0,
    recoil: { horizontal: 0.8, vertical: 1.2 },
    range: 15
  },
  
  M870: {
    name: 'M870',
    type: 'shotgun',
    damage: 60,
    fireRate: 100,
    magazineSize: 7,
    reloadTime: 3.5,
    recoil: { horizontal: 1.0, vertical: 1.5 },
    range: 12
  },
  
  MP7: {
    name: 'MP7',
    type: 'smg',
    damage: 32,
    fireRate: 900,
    magazineSize: 30,
    reloadTime: 2.2,
    recoil: { horizontal: 0.4, vertical: 0.6 },
    range: 20
  },
  
  P90: {
    name: 'P90',
    type: 'smg',
    damage: 22,
    fireRate: 970,
    magazineSize: 50,
    reloadTime: 3.0,
    recoil: { horizontal: 0.5, vertical: 0.7 },
    range: 20
  },
  
  // Attacker Weapons
  L85A2: {
    name: 'L85A2',
    type: 'assault_rifle',
    damage: 47,
    fireRate: 670,
    magazineSize: 30,
    reloadTime: 2.5,
    recoil: { horizontal: 0.4, vertical: 0.6 },
    range: 35
  },
  
  'R4-C': {
    name: 'R4-C',
    type: 'assault_rifle',
    damage: 39,
    fireRate: 860,
    magazineSize: 30,
    reloadTime: 2.3,
    recoil: { horizontal: 0.6, vertical: 0.8 },
    range: 30
  },
  
  'AK-12': {
    name: 'AK-12',
    type: 'assault_rifle',
    damage: 45,
    fireRate: 700,
    magazineSize: 30,
    reloadTime: 2.5,
    recoil: { horizontal: 0.5, vertical: 0.7 },
    range: 35
  },
  
  'OTS-03': {
    name: 'OTS-03',
    type: 'marksman_rifle',
    damage: 71,
    fireRate: 380,
    magazineSize: 10,
    reloadTime: 2.8,
    recoil: { horizontal: 0.3, vertical: 1.0 },
    range: 60
  },
  
  SHIELD: {
    name: 'Ballistic Shield',
    type: 'shield',
    damage: 0,
    fireRate: 0,
    magazineSize: 0,
    reloadTime: 0,
    recoil: { horizontal: 0, vertical: 0 },
    range: 0
  },
  
  // Secondary Weapons
  P226: {
    name: 'P226',
    type: 'pistol',
    damage: 50,
    fireRate: 450,
    magazineSize: 15,
    reloadTime: 2.0,
    recoil: { horizontal: 0.3, vertical: 0.5 },
    range: 20
  },
  
  PMM: {
    name: 'PMM',
    type: 'pistol',
    damage: 61,
    fireRate: 400,
    magazineSize: 8,
    reloadTime: 2.2,
    recoil: { horizontal: 0.5, vertical: 0.8 },
    range: 18
  },
  
  'SMG-11': {
    name: 'SMG-11',
    type: 'machine_pistol',
    damage: 35,
    fireRate: 1270,
    magazineSize: 16,
    reloadTime: 1.5,
    recoil: { horizontal: 0.8, vertical: 1.2 },
    range: 12
  }
};
