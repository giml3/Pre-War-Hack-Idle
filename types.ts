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
  name: string;
  threshold: number; 
  techniques: string[];
}

export interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system' | 'phase';
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

export interface CorpData {
    name: string;
    reputation: number; // 0-1000
    trace: number; // 0-100 (Hidden risk)
    stockPrice: number;
    stockTrend: number; // -1 to 1
    ownedShares: number;
}

export interface GameState {
  cash: number;
  xp: number;
  level: number;
  job: Job | null;
  playerName: string;
  
  // Time System
  gameTime: number; // Timestamp
  gameSpeed: number; // Multiplier
  currentActivity: PlayerActivity;

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
  riskLevel: number; // 1 to 6
  isDowntime: boolean; // Heat lockout
  downtimeEndTime: number;

  upgrades: Upgrade[];
  software: Software[];
  unlockables: Unlockable[];
  
  // Vault
  vaultLevels: Record<string, number>; // Room ID -> Level

  // Market & Corps
  corporations: Record<string, CorpData>;
  marketLastUpdate: number;

  // Automation
  autoBuyHardware: boolean;
  autoBuySoftware: boolean;

  logs: LogEntry[];
  totalHacks: number;
  techniqueCounts: Record<string, number>;
  currentTarget: Target;
}