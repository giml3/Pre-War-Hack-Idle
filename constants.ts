import { Job, Upgrade, Unlockable, KillChainPhase, ThreatActor, VaultRoom, Skill, SkillName, Perk, Software, Target } from './types';

export const SKILL_DEFINITIONS: Skill[] = [
  { name: 'Science', value: 0, attribute: 'I', description: 'Hacking efficiency and success rate.' },
  { name: 'Lockpick', value: 0, attribute: 'P', description: 'Bypass physical security layers.' },
  { name: 'Sneak', value: 0, attribute: 'A', description: 'Reduces Heat generation.' },
  { name: 'Barter', value: 0, attribute: 'C', description: 'Reduces hardware/stock costs.' },
  { name: 'Speech', value: 0, attribute: 'C', description: 'Increases Cash yield via social engineering.' },
  { name: 'Repair', value: 0, attribute: 'I', description: 'Reduces Downtime duration.' },
];

export const PRE_WAR_NEWS = [
    "ROBCO STOCK SOARS AS AUTOMATION REPLACES 50,000 APPALACHIAN MINERS",
    "FOOD RIOTS IN BOSTON: RATION COUPONS NOW ACCEPTED AS CURRENCY",
    "VAULT-TEC ASSURES PUBLIC: 'NUCLEAR WAR IS A MATHEMATICAL IMPOSSIBILITY'",
    "GENERAL ATOMICS UNVEILS MR. HANDY TYPE-II: NOW WITH 20% LESS SAWBLADE ACCIDENTS",
    "GAS PRICES HIT $7,450.99 PER GALLON - COMMUTERS URGED TO WALK",
    "NUKA-COLA QUANTUM RECALL DENIED DESPITE GLOWING URINE REPORTS",
    "US GOVERNMENT ANNEXES CANADA TO PROTECT ALASKAN PIPELINE ASSETS",
    "RED ROCKET TRUCK STOP OFFERS FREE COOLANT REFILL WITH PURCHASE OF $500 SNACK CAKE",
    "NEW PLAGUE SYMPTOMS? CONSULT YOUR LOCAL MED-TEK AUTO-DOC IMMEDIATELY",
    "CHRYSLUS MOTORS LAUNCHES NUCLEAR-POWERED COUPE: 0-60 IN 0.2 SECONDS",
    "POSEIDON ENERGY ANNOUNCES RECORD PROFITS AMIDST ROLLOUT BLACKOUTS",
    "UNSTOPPABLES COMIC #42 RECALLED DUE TO SUBVERSIVE COMMUNIST THEMES",
    "LATEST FASHION TREND: LEAD-LINED FEDORAS FOR THE MODERN GENTLEMAN",
    "REPCONN ROCKETS MISSES LAUNCH WINDOW AGAIN, STOCKHOLDERS REVOLT",
    "LABOR UNION LEADER REPLACED BY PROTECTRON - PRODUCTIVITY UP 400%"
];

export const INITIAL_JOBS: Job[] = [
  {
    id: 'j1',
    name: 'Barnaby "Bitwise" Hale',
    title: 'Data Entry Clerk',
    description: 'A cog in the machine who learned to read between the lines.',
    initialSpecial: { S: 3, P: 6, E: 4, C: 3, I: 8, A: 5, L: 4 },
    initialSkills: { Science: 15, Repair: 10 }
  },
  {
    id: 'j2',
    name: 'Myrtle "Mainframe" Vance',
    title: 'Switchboard Operator',
    description: 'Has heard every secret in the Commonwealth.',
    initialSpecial: { S: 2, P: 7, E: 3, C: 8, I: 6, A: 4, L: 5 },
    initialSkills: { Speech: 20, Barter: 10 }
  },
  {
    id: 'j3',
    name: 'Percival "Punchcard" Graves',
    title: 'Jr. Systems Analyst',
    description: 'Thinks in binary. Dreams in code.',
    initialSpecial: { S: 2, P: 5, E: 3, C: 2, I: 10, A: 3, L: 6 },
    initialSkills: { Science: 25, Lockpick: 5 }
  },
  {
    id: 'j4',
    name: 'Ethel "Ethernet" Merman',
    title: 'Telegram Transcriptionist',
    description: 'Fast hands and a charming voice for social engineering.',
    initialSpecial: { S: 3, P: 4, E: 5, C: 7, I: 5, A: 8, L: 3 },
    initialSkills: { Sneak: 15, Speech: 15 }
  },
  {
    id: 'j5',
    name: 'Walter "Waveform" Bishop',
    title: 'Lab Assistant',
    description: 'Used to dangerous experiments. High tolerance for failure.',
    initialSpecial: { S: 4, P: 5, E: 8, C: 3, I: 7, A: 4, L: 4 },
    initialSkills: { Repair: 20, Science: 10 }
  },
  {
    id: 'j6',
    name: 'Stanley "Silicon" Kowalski',
    title: 'Vacuum Tube Replacer',
    description: 'Strong back, steady hands. Good at fixing mistakes.',
    initialSpecial: { S: 8, P: 4, E: 6, C: 3, I: 4, A: 5, L: 5 },
    initialSkills: { Repair: 25, Lockpick: 10 }
  },
  {
    id: 'j10',
    name: 'Howard "Hardware" Hughes',
    title: 'Avionics Tinkerer',
    description: 'Obsessive. Paranoid. Brilliant.',
    initialSpecial: { S: 3, P: 8, E: 2, C: 2, I: 9, A: 6, L: 8 },
    initialSkills: { Science: 20, Sneak: 10 }
  },
];

export const INITIAL_UPGRADES: Upgrade[] = [
  {
    id: 'u1',
    name: 'Eyebot Optical Sensors',
    description: 'Basic visual targeting. Increases Hack Speed slightly.',
    baseCost: 50,
    costMultiplier: 1.5,
    type: 'CPU',
    value: 0.5, 
    owned: 0,
  },
  {
    id: 'u2',
    name: 'Pip-Boy 2000 Mk VI',
    description: 'Personal info processor. Increases CapCoin mining rate.',
    baseCost: 75,
    costMultiplier: 1.6,
    type: 'RAM',
    value: 5, 
    owned: 0,
  },
  {
    id: 'u3',
    name: 'Protectron Relays',
    description: 'Automated protocols. Increases Critical Chance.',
    baseCost: 200,
    costMultiplier: 1.8,
    type: 'NETWORK',
    value: 1, 
    owned: 0,
  },
  {
    id: 'u4',
    name: 'Robo-Brain Cortex',
    description: 'Organic-synthetic hybrid processing. Massive Speed boost.',
    baseCost: 1500,
    costMultiplier: 2.5,
    type: 'COOLING', // Using Cooling type slot for High End CPU
    value: 15, 
    owned: 0,
  },
];

export const INITIAL_SOFTWARE: Software[] = [
    {
        id: 'sw1',
        name: 'Dataminer_v1.exe',
        description: 'Background process that scrapes extra data.',
        baseCost: 100,
        costMultiplier: 1.4,
        type: 'WORM',
        bonus: { stat: 'CASH', value: 2 },
        owned: 0
    },
    {
        id: 'sw2',
        name: 'Logic_Bomb.bat',
        description: 'Overloads systems to speed up processing.',
        baseCost: 250,
        costMultiplier: 1.5,
        type: 'VIRUS',
        bonus: { stat: 'SPEED', value: 0.2 },
        owned: 0
    },
    {
        id: 'sw3',
        name: 'Backdoor_Trojan',
        description: 'Maintains persistent access for critical strikes.',
        baseCost: 500,
        costMultiplier: 1.6,
        type: 'TROJAN',
        bonus: { stat: 'CRIT', value: 0.5 },
        owned: 0
    },
    {
        id: 'sw4',
        name: 'Coolant_Override',
        description: 'Optimizes fan speeds to reduce heat buildup.',
        baseCost: 800,
        costMultiplier: 1.7,
        type: 'ROOTKIT',
        bonus: { stat: 'HEAT', value: 0.5 },
        owned: 0
    }
];

export const INITIAL_UNLOCKABLES: Unlockable[] = [
  {
    id: 's1',
    name: 'Vault-Tec_Manual.pdf',
    description: 'Standard procedures. +10% XP Gain.',
    icon: 'BookOpen',
    unlockLevel: 2,
    isUnlocked: false,
    bonus: { speedMultiplier: 0, cashMultiplier: 0, xpMultiplier: 0.1, critChanceFlat: 0 }
  },
  {
    id: 's2',
    name: 'VATS_Targeting.exe',
    description: 'Assisted Targeting. +15% Hack Speed.',
    icon: 'Radar',
    unlockLevel: 5,
    isUnlocked: false,
    bonus: { speedMultiplier: 0.15, cashMultiplier: 0, xpMultiplier: 0, critChanceFlat: 0 }
  },
  {
    id: 's3',
    name: 'Silver_Shroud_Script.txt',
    description: 'Deception protocols. +20% CapCoin yield.',
    icon: 'Mail',
    unlockLevel: 10,
    isUnlocked: false,
    bonus: { speedMultiplier: 0, cashMultiplier: 0.2, xpMultiplier: 0, critChanceFlat: 0 }
  },
  {
    id: 's4',
    name: 'Institute_Teleport_Log.dat',
    description: 'Signal interception. +5% Critical Chance.',
    icon: 'Skull',
    unlockLevel: 15,
    isUnlocked: false,
    bonus: { speedMultiplier: 0, cashMultiplier: 0, xpMultiplier: 0, critChanceFlat: 0.05 }
  },
  {
    id: 's5',
    name: 'P.A.M. Prediction Engine',
    description: 'Probabilistic computing. +25% Hack Speed.',
    icon: 'Key',
    unlockLevel: 20,
    isUnlocked: false,
    bonus: { speedMultiplier: 0.25, cashMultiplier: 0, xpMultiplier: 0, critChanceFlat: 0 }
  },
  {
    id: 's6',
    name: 'Enclave_Sat_Link.enc',
    description: 'Global reach. +30% CapCoin yield.',
    icon: 'Globe',
    unlockLevel: 30,
    isUnlocked: false,
    bonus: { speedMultiplier: 0, cashMultiplier: 0.3, xpMultiplier: 0, critChanceFlat: 0 }
  },
  {
    id: 's7',
    name: 'ZAX_Personality_Matrix',
    description: 'Sentient AI integration. All stats +15%.',
    icon: 'Brain',
    unlockLevel: 50,
    isUnlocked: false,
    bonus: { speedMultiplier: 0.15, cashMultiplier: 0.15, xpMultiplier: 0.15, critChanceFlat: 0.05 }
  }
];

export const KILL_CHAIN_PHASES: KillChainPhase[] = [
  { name: "Reconnaissance", threshold: 0, techniques: ["T1595 Active Scanning", "T1592 Victim Host Info", "T1593 Search Open Websites", "T1589 Gather Identity Info"] },
  { name: "Resource Development", threshold: 14, techniques: ["T1583 Acquire Infrastructure", "T1588 Obtain Capabilities", "T1587 Develop Capabilities", "T1584 Compromise Infrastructure"] },
  { name: "Initial Access", threshold: 28, techniques: ["T1190 Exploit Public App", "T1566 Phishing", "T1133 External Remote Services", "T1078 Valid Accounts"] },
  { name: "Execution", threshold: 42, techniques: ["T1059 Command Interpreter", "T1203 Client Execution", "T1053 Scheduled Task", "T1106 Native API"] },
  { name: "Persistence", threshold: 56, techniques: ["T1547 Boot Autostart", "T1098 Account Manipulation", "T1543 Modify System Process", "T1136 Create Account"] },
  { name: "Privilege Escalation", threshold: 70, techniques: ["T1068 Privilege Escalation", "T1548 Abuse Elevation Control", "T1055 Process Injection", "T1484 Domain Policy"] },
  { name: "Command & Control", threshold: 84, techniques: ["T1071 App Layer Protocol", "T1573 Encrypted Channel", "T1008 Fallback Channels", "T1105 Ingress Tool Transfer"] },
];

export const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500, 10000, 15000, 22000, 30000, 50000];

export const VAULT_LAYOUT: VaultRoom[] = [
    { id: 'v1', name: 'Vault Door', x: 2, y: 0, unlockLevel: 1, type: 'entrance', baseCost: 100, description: "Heavy plasteel blast door.", bonusDescription: "Reduces base Heat generation." },
    { id: 'v2', name: 'Elevator Shaft', x: 2, y: 1, unlockLevel: 1, type: 'utility', baseCost: 200, description: "Vertical transit access.", bonusDescription: "Speeds up hardware installation." },
    { id: 'v3', name: 'Overseer Office', x: 3, y: 1, unlockLevel: 2, type: 'command', baseCost: 500, description: "Command center for operations.", bonusDescription: "Increases Critical Success Chance." },
    { id: 'v4', name: 'Diner', x: 1, y: 1, unlockLevel: 3, type: 'living', baseCost: 300, description: "Nutritional paste dispensary.", bonusDescription: "Increases XP Gain slightly." },
    { id: 'v5', name: 'Water Treatment', x: 2, y: 2, unlockLevel: 5, type: 'utility', baseCost: 600, description: "Purifies irradiated water.", bonusDescription: "Reduces Heat Spike magnitude." },
    { id: 'v6', name: 'Living Quarters A', x: 1, y: 2, unlockLevel: 7, type: 'living', baseCost: 400, description: "Bunk beds for dwellers.", bonusDescription: "Reduces Downtime duration." },
    { id: 'v7', name: 'Living Quarters B', x: 3, y: 2, unlockLevel: 9, type: 'living', baseCost: 400, description: "Overflow housing.", bonusDescription: "Reduces Downtime duration." },
    { id: 'v8', name: 'Power Plant', x: 2, y: 3, unlockLevel: 12, type: 'utility', baseCost: 1000, description: "General Atomics fusion reactor.", bonusDescription: "Significantly boosts Hack Speed." },
    { id: 'v9', name: 'Clinic', x: 1, y: 3, unlockLevel: 15, type: 'living', baseCost: 800, description: "Auto-Doc medical bay.", bonusDescription: "Prevents Critical Failures." },
    { id: 'v10', name: 'Armory', x: 3, y: 3, unlockLevel: 20, type: 'command', baseCost: 1500, description: "Weapon and gear storage.", bonusDescription: "Increases CapCoin yield." },
];

// --- NEW CONFIGURATION ---

export const RISK_CONFIG = [
    { level: 1, label: "SAFE", multiplier: 0.5, heatMod: 0.1, color: "text-green-500", desc: "Low Risk. Low Reward. Undetectable." },
    { level: 2, label: "CAUTIOUS", multiplier: 0.8, heatMod: 0.5, color: "text-green-300", desc: "Standard protocols. Minimal tracing." },
    { level: 3, label: "STANDARD", multiplier: 1.0, heatMod: 1.0, color: "text-[#ffb000]", desc: "Balanced approach." },
    { level: 4, label: "RISKY", multiplier: 1.5, heatMod: 1.5, color: "text-orange-400", desc: "Aggressive probing. Trace buildup probable." },
    { level: 5, label: "DANGEROUS", multiplier: 2.5, heatMod: 2.5, color: "text-red-400", desc: "Brute force. High rewards. Rapid trace." },
    { level: 6, label: "SUICIDAL", multiplier: 5.0, heatMod: 4.0, color: "text-red-600 animate-pulse", desc: "Burn zero-days. Win big or lose everything." },
];

export const MAJOR_CORPORATIONS = {
    "Vault-Tec": {
        desc: "The end of the world is just the beginning.",
        initialStock: 150,
        subsidiaries: [
            { name: "Project Safehouse", sys: "Cryo-Storage Controls" },
            { name: "Future-Tech", sys: "G.E.C.K. Simulation Node" },
            { name: "Vault-Tec University", sys: "Behavioral Analysis DB" },
            { name: "Vault-Tec Agriculture", sys: "Hydroponics Regulator" },
            { name: "Vault-Tec Defense", sys: "Turret Firmware Server" }
        ]
    },
    "RobCo Industries": {
        desc: "Tomorrow's technology, today!",
        initialStock: 220,
        subsidiaries: [
            { name: "Unified Operating Systems", sys: "Mainframe Kernel" },
            { name: "RobCo Service Center", sys: "Protectron Diagnostic Uplink" },
            { name: "Atomic Automaton", sys: "Pip-Boy OS Source Code" },
            { name: "Mechanist Labs", sys: "Brain-Bot Schematic" },
            { name: "Liberty Defense", sys: "Prime Targeting Array" }
        ]
    },
    "General Atomics": {
        desc: "Making life easier through nuclear power.",
        initialStock: 180,
        subsidiaries: [
            { name: "G.A. Robotics", sys: "Mr. Handy Personality Core" },
            { name: "Galleria Management", sys: "Shopping Plaza Network" },
            { name: "G.A. Nuclear", sys: "Fusion Core Fabrication" },
            { name: "Miss Nanny Corp", sys: "Childcare Algorithms" },
            { name: "G.A. Military", sys: "Mister Gutsy Weapons Control" }
        ]
    },
    "Poseidon Energy": {
        desc: "Powering the future.",
        initialStock: 300,
        subsidiaries: [
            { name: "Poseidon Oil", sys: "Oil Rig Pressure Valve" },
            { name: "HELIOS One", sys: "Archimedes Orbital Link" },
            { name: "Poseidon Radar", sys: "Enclave Deep Net" },
            { name: "Poseidon Gas", sys: "Pipeline Flow Monitor" },
            { name: "Atlas Power", sys: "Reactors 1-4 Override" }
        ]
    },
    "West-Tek": {
        desc: "Better living through chemistry.",
        initialStock: 400,
        subsidiaries: [
            { name: "West-Tek Research", sys: "F.E.V. Sequencing Vat" },
            { name: "Power Armor Div", sys: "T-51b Servos Logic" },
            { name: "Biomedical Research", sys: "Pan-Immunity Virion" },
            { name: "Advanced Weapons", sys: "Laser Rifle Focusing" },
            { name: "West-Tek Logistics", sys: "Hazardous Transport Manifest" }
        ]
    }
};

// Flattened target registry for the game engine
export const TARGET_REGISTRY: Target[] = [];
Object.entries(MAJOR_CORPORATIONS).forEach(([parent, data]) => {
    data.subsidiaries.forEach((sub, idx) => {
        TARGET_REGISTRY.push({
            id: `${parent}-${idx}`,
            company: sub.name,
            parentCorp: parent,
            system: sub.sys,
            difficulty: idx + 1 // increasing difficulty for different subsidiaries just for variation
        });
    });
});