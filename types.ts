export interface Special {
  S: number; // Strength - Brute force threshold
  P: number; // Perception - Crit chance / Loot find
  E: number; // Endurance - Heat resistance / Downtime reduction
  C: number; // Charisma - Shop prices / XP gain
  I: number; // Intelligence - Hack speed / Skill points
  A: number; // Agility - Heat decay / Evasion
  L: number; // Luck - Rerolls / Rare events
}

export type SkillName = 'Science' | 'Lockpick' | 'Sneak' | 'Barter' | 'Speech' | 'Repair';

export interface Skill {
  name: SkillName;
  value: number; // 0 to 100
  attribute: keyof Special;
  description: string;
}

export interface Perk {
  id: string;
  name: string;
  description: string;
  cost: number; // Perk points cost
  rank: number;
  maxRank: number;
}

export interface Job {
  id: string;
  title: string;
  name: string; 
  description: string;
  initialSpecial: Special;
  initialSkills: Partial<Record<SkillName, number>>;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  type: 'CPU' | 'RAM' | 'NETWORK' | 'COOLING';
  value: number; 
  owned: number;
}

export interface Software {
    id: string;
    name: string;
    description: string;
    baseCost: number;
    costMultiplier: number;
    type: 'VIRUS' | 'WORM' | 'TROJAN' | 'ROOTKIT';
    bonus: {
        stat: 'SPEED' | 'CASH' | 'CRIT' | 'HEAT';
        value: number;
    };
    owned: number;
}

export interface Unlockable {
  id: string;
  name: string;
  description: string;
  icon: string; 
  unlockLevel: number;
  isUnlocked: boolean;
  bonus: {
    speedMultiplier: number; 
    cashMultiplier: number;
    xpMultiplier: number;
    critChanceFlat: number; 
  };
}

export interface ThreatActor {
  id: string;
  name: string;
  aliases: string[];
  description: string;
  services: string;
  techniques: string[];
  unlockLevel: number;
}

export interface KillChainPhase {
  id: string; // e.g. "reconnaissance"
  name: string; // e.g. "Reconnaissance"
  threshold: number; 
  techniques: string[];
}

export interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system' | 'phase' | 'bounty' | 'story' | 'mutation' | 'network';
}

export interface Target {
  id: string;
  company: string; // The specific subsidiary name
  parentCorp: string; // The major corp (for stock/rep)
  system: string;
  difficulty: number; // 0 to 20 modifier
}

export interface VaultRoom {
  id: string;
  name: string;
  x: number;
  y: number;
  unlockLevel: number;
  type: 'entrance' | 'living' | 'utility' | 'command';
  baseCost: number;
  description: string;
  bonusDescription: string;
}

export type PlayerActivity = 'HACKING' | 'JOB' | 'SLEEPING' | 'DOWNTIME';
export type EconomyState = 'RECESSION' | 'STABLE' | 'BOOM';

export interface CorpData {
    name: string;
    code: string;
    reputation: number; // 0-1000
    trace: number; // 0-100 (Hidden risk)
    stockPrice: number;
    stockTrend: number; // -1 to 1
    ownedShares: number;
    desc: string;
}

export interface Faction {
    id: string;
    name: string;
    description: string;
    tooltip: string;
    reputation: number;
    isHostile: boolean;
}

export interface Bounty {
    id: string;
    targetCorp: string; // Parent corp name
    description: string;
    reward: number;
    expiresAt: number;
    type: 'SCOUT' | 'EXTRACT' | 'DISRUPT';
}

export interface TechniqueDetail {
    id: string;
    name: string;
    description: string;
    mitigation: string;
    subtechniques?: string[]; // IDs of subtechniques
    isSubtechnique?: boolean;
    parent?: string;
}

export interface Message {
    id: string;
    sender: string;
    subject: string;
    body: string;
    read: boolean;
    date: string;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    unlocked: boolean;
}

export interface Consumable {
    id: string;
    name: string;
    description: string;
    effectDescription: string;
    baseCost: number;
    type: 'MEDICAL' | 'CHEM' | 'ALCOHOL' | 'FOOD' | 'DRINK' | 'SERUM' | 'OTHER';
    addictionChance: number; // 0-1
    duration: number; // ms
    effects: {
        stat?: Partial<Record<keyof Special, number>>;
        heat?: number; // Instant reduction (negative) or increase (positive)
        rads?: number; // Instant reduction (negative) or increase (positive)
        speed?: number; // Multiplier (e.g. 0.1 = +10%)
        heatGen?: number; // Multiplier
        crit?: number; // Flat
        xp?: number; // Multiplier
    }
}

export interface Mutation {
    id: string;
    name: string;
    description: string;
    positive: string;
    negative: string;
    effects: {
        stat?: Partial<Record<keyof Special, number>>;
        speed?: number;
        heatGen?: number;
        crit?: number;
        cash?: number;
    }
}

export interface ActiveEffect {
    id: string;
    name: string;
    expiresAt: number;
    sourceId: string;
    effects: Consumable['effects'];
}

export interface Peer {
    id: string;
    name: string;
    level: number;
    heat: number;
    maxHeat: number;
    status: 'IDLE' | 'HACKING' | 'LOCKED' | 'DOWNTIME';
    activity: string; // "Cracking Bank...", "Compiling...", etc.
    needsHelp: boolean;
    avatarId: number;
}

export interface GameState {
  cash: number;
  xp: number;
  level: number;
  job: Job | null;
  playerName: string;
  employer: string;
  
  // Time System
  gameTime: number; // Timestamp
  gameSpeed: number; // Multiplier
  currentActivity: PlayerActivity;

  // Career & Economy
  jobLevel: number; // 1 to 10
  economyState: EconomyState;
  lastYearChecked: number;
  globalRadiation: number; // 0-100 Environmental Stat
  
  // Lifestyle & Bounties
  lifestyleLevel: number;
  lastRentPaidDay: number; // Day of year
  activeBounties: Bounty[];

  // Stats
  special: Special;
  skills: Record<SkillName, number>;
  perks: string[]; // IDs of owned perks
  upgradePoints: number; // For SPECIAL/Skills
  perkPoints: number;

  // Hacking State
  hackingProgress: number; 
  isAutoHacking: boolean;
  heat: number; // 0 to 100
  threatLevel: number; // 1 to 6 (Renamed from Risk)
  isDowntime: boolean; // Heat lockout
  downtimeEndTime: number;

  upgrades: Upgrade[];
  software: Software[];
  unlockables: Unlockable[];
  
  // Vault / Bunker
  vaultLevels: Record<string, number>; // Room ID -> Level

  // Market & Corps
  corporations: Record<string, CorpData>;
  factions: Record<string, Faction>;
  marketLastUpdate: number;

  // Automation
  autoBuyHardware: boolean;
  autoBuySoftware: boolean;
  autoBuyConsumables: boolean; // New

  logs: LogEntry[];
  messages: Message[];
  achievements: Achievement[];
  totalHacks: number;
  techniqueCounts: Record<string, number>;
  techniqueLastSeen: Record<string, string>; // New: timestamp string
  currentTarget: Target;
  
  // Items & Status
  inventory: Record<string, number>; // itemId -> count
  shopStock: Record<string, number>; // itemId -> count (NEW)
  lastRestockDay: number; // NEW
  activeEffects: ActiveEffect[];
  mutations: string[]; // Mutation IDs
  playerRadiation: number; // 0-1000, affects stats/max heat
  addictions: string[]; // Consumable IDs
  
  // Multiplayer
  peers: Peer[];

  // Meta
  uiColor: string;
  tutorialStep: number; // 0 = done
}