import { Job, Upgrade, Unlockable, KillChainPhase, VaultRoom, Skill, Software, Target, TechniqueDetail, Faction, Achievement, CorpData } from './types';

export const SKILL_DEFINITIONS: Skill[] = [
  { name: 'Science', value: 0, attribute: 'I', description: 'Hacking efficiency and success rate.' },
  { name: 'Lockpick', value: 0, attribute: 'P', description: 'Bypass physical security layers.' },
  { name: 'Sneak', value: 0, attribute: 'A', description: 'Reduces Heat generation.' },
  { name: 'Barter', value: 0, attribute: 'C', description: 'Reduces hardware/stock costs.' },
  { name: 'Speech', value: 0, attribute: 'C', description: 'Increases Cash yield via social engineering.' },
  { name: 'Repair', value: 0, attribute: 'I', description: 'Reduces Downtime duration.' },
];

export const SPECIAL_TOOLTIPS = {
    S: { title: "STRENGTH", desc: "Brute Force Computing Power.\nDetermines the raw processing threshold for cracking high-level encryption." },
    P: { title: "PERCEPTION", desc: "Signal Analysis.\nIncreases critical hit chance and the ability to find rare data loot." },
    E: { title: "ENDURANCE", desc: "System Stability.\nReduces hardware heat generation and decreases lockout downtime duration." },
    C: { title: "CHARISMA", desc: "Social Engineering.\nImproves contract payouts and reduces prices on the Continental Exchange." },
    I: { title: "INTELLIGENCE", desc: "Code Optimization.\nSignificantly boosts hacking speed and generates more skill points per level." },
    A: { title: "AGILITY", desc: "Stealth Protocols.\nIncreases the rate at which system Heat decays, allowing for sustained attacks." },
    L: { title: "LUCK", desc: "RNG Manipulation.\nInfluences everything from critical success rates to avoiding trace detection." }
};

export const PRE_WAR_NEWS = [
    "HAZE ADVISORY: RADIATION LEVELS IN GREATER BOSTON EXCEED SAFE LIMITS FOR 4TH CONSECUTIVE DAY",
    "CHRYSLUS RECALLS 2 MILLION FUSION SEDANS CITING 'MINOR' CORE LEAKAGE RISKS",
    "PACIFIC OPERATION: 7TH FLEET MOVEMENT CONFIRMED AMIDST ENCRYPTED CHATTER",
    "CONTINENTAL EXCHANGE: DEFENSE SECTOR RALLIES ON RUMORS OF NEW CYBER-WARFARE INITIATIVE",
    "MEDICAL ADVISORY: ANTI-RAD MEDS NOW AVAILABLE OVER-THE-COUNTER AT SUPER-DUIT MARTS",
    "GOVERNMENT DENIES 'POISONED SKY' ALLEGATIONS, BLAMES INDUSTRIAL SMOG",
    "INTERNET TRAFFIC SPIKE DETECTED IN PACIFIC RIM REGION - SECURE CHANNELS OVERLOADED",
    "POSEIDON ENERGY ANNOUNCES RECORD PROFITS AMIDST ROLLOUT BLACKOUTS",
    "LATEST FASHION TREND: LEAD-LINED FEDORAS FOR THE MODERN GENTLEMAN",
    "LABOR UNION LEADER REPLACED BY PROTECTRON - PRODUCTIVITY UP 400%",
    "MASS FUSION ASSURES PUBLIC: 'THE GLOW IS NATURAL AND SAFE'",
    "ENCRYPTED LEAKS SUGGEST FULL-SCALE INVASION PLANS DRAFTED FOR MAINLAND CHINA",
    "LOCAL TRAFFIC JAM RADIATION SPIKE HOSPITALIZES TWENTY COMMUTERS",
    "ROBCO INDUSTRIES UNVEILS NEW 'DEFENSE GRID' AI - CRITICS CITE PRIVACY CONCERNS"
];

export const CORPORATE_LADDER = [
    "Unpaid Intern",
    "Junior Associate",
    "Associate",
    "Senior Associate",
    "Team Lead",
    "Department Manager",
    "Regional Director",
    "Vice President",
    "Senior VP",
    "Chief Officer"
];

export const FACTION_DEFINITIONS: Faction[] = [
    { id: 'FCDB', name: 'Federal Cyber Defense Bureau', description: "U.S. government's primary digital security arm.", tooltip: "FCDB systems are heavily monitored. Expect high security and slow response times.", reputation: 0, isHostile: false },
    { id: 'PACSTRAT', name: 'Pacific Strategic Command', description: "Military division coordinating the Pacific operation.", tooltip: "PACSTRAT nodes contain high-value intel but trigger alerts quickly.", reputation: 0, isHostile: false },
    { id: 'HELION', name: 'Helion Motors', description: "World's largest micro-fusion car manufacturer.", tooltip: "Helion servers leak data like their cars leak neutrons.", reputation: 0, isHostile: false },
    { id: 'ATLAS', name: 'Atlas Dynamics', description: "Private defense contractor: autonomous drones & AI.", tooltip: "Atlas AI systems adapt to intrusion attempts. Expect counter-scans.", reputation: 0, isHostile: false },
    { id: 'CIVIC', name: 'The Civic Mesh', description: "Decentralized civilian tech coalition.", tooltip: "Low security, high chaos. Great for beginners.", reputation: 0, isHostile: false },
    { id: 'SINO', name: 'SinoNet Ghost Layer', description: "Shadowy cluster of foreign servers.", tooltip: "High risk. High reward. High chance you'll regret it.", reputation: 0, isHostile: true }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
    { id: 'a1', name: 'Hello World', description: 'Complete your first hack.', unlocked: false },
    { id: 'a2', name: 'Market Mover', description: 'Own 100 shares of any stock.', unlocked: false },
    { id: 'a3', name: 'Meltdown', description: 'Reach 100% Heat and trigger a lockout.', unlocked: false },
    { id: 'a4', name: 'Millionaire', description: 'Amass 1,000,000 Caps.', unlocked: false },
    { id: 'a5', name: 'Ghost in the Shell', description: 'Reach Level 10.', unlocked: false },
    { id: 'a6', name: 'Glowing Sea', description: 'Witness Global Radiation exceed 50%.', unlocked: false }
];

export const STOCK_MARKET_COMPANIES = [
    { name: "Aperture Secure Systems", code: "APSS" }, { name: "Blue Ridge Cybernetics", code: "BRCN" }, { name: "Quantum Shield Analytics", code: "QSHA" },
    { name: "TriCore Digital Defense", code: "TCDD" }, { name: "NovaLink Intrusion Control", code: "NVIC" }, { name: "Sentinel Gridworks", code: "SGRD" },
    { name: "IronGate Network Armor", code: "IGNA" }, { name: "Praxus Data Security", code: "PRXS" }, { name: "OmniCircuit Safeguard", code: "OCSG" },
    { name: "Neon Harbor Cyber Labs", code: "NHCL" }, { name: "Silverline Encryption Group", code: "SLEG" }, { name: "MetroCore Firewall Systems", code: "MCFS" },
    { name: "Hyperion Signal Defense", code: "HYSD" }, { name: "CryoByte Security", code: "CBYT" }, { name: "Titanium Logic Networks", code: "TLNX" },
    { name: "VantagePoint CyberOps", code: "VPCO" }, { name: "DeepVault Analytics", code: "DPVA" }, { name: "PrimeVector SecureTech", code: "PVST" },
    { name: "IonForge Data Armor", code: "IFDA" }, { name: "Circuit Sentinel Solutions", code: "CSSL" }, { name: "BlueNova Integrity Systems", code: "BNIS" },
    { name: "Redline Packet Defense", code: "RLPD" }, { name: "Axiom NetGuard", code: "AXNG" }, { name: "Solaris CyberMatrix", code: "SLCM" },
    { name: "EchoTrace Digital", code: "ECTD" }, { name: "NeuroLink Safenet", code: "NLSN" }, { name: "PillarPoint Cyberworks", code: "PPCW" },
    { name: "FusionByte Integrity Labs", code: "FBIL" }, { name: "Radiant Signal Systems", code: "RDSS" }, { name: "CoreShield Technologies", code: "CRST" }
];

export const LORE_TIMELINE = [
    { year: 2045, event: "The Great Resource Crunch begins. Fossil fuels dwindle." },
    { year: 2052, event: "Helion Motors unveils the first consumer Micro-Fusion Engine." },
    { year: 2060, event: "The European Commonwealth dissolves into warring city-states." },
    { year: 2066, event: "Sino-American relations collapse over Alaskan oil reserves." },
    { year: 2072, event: "The 'Haze' becomes permanent in most major US cities." },
    { year: 2074, event: "FCDB established to counter increasing cyber-terrorism." },
    { year: 2075, event: "Pacific Strategic Command initiates classified 'Operation Anchor'." }
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
    description: 'Basic visual targeting. Increases Hack Speed.',
    baseCost: 50,
    costMultiplier: 1.5,
    type: 'CPU',
    value: 0.05, 
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
    type: 'COOLING', 
    value: 0.25,
    owned: 0,
  },
];

// Tooltips for Pen-Testing software
export const SOFTWARE_TOOLTIPS: Record<string, string> = {
    'VIRUS': "Exploit Runner: Attempts known vulnerabilities. Results may vary violently.",
    'WORM': "Recon Drone: Sends a lightweight agent to scout a node.",
    'TROJAN': "Brute-Force Engine: Tries every password until one works. Inefficient but satisfying.",
    'ROOTKIT': "Port Mapper: Identifies open ports. Think of it as knocking on every door at once."
};

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
        bonus: { stat: 'SPEED', value: 0.02 }, 
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

export const TECHNIQUE_DETAILS: Record<string, TechniqueDetail> = {
    "T1595 Active Scanning": { id: "T1595", name: "Active Scanning", description: "Adversaries may probe victim infrastructure via network traffic to identify hosts, open ports, and services.", mitigation: "Use firewalls and IPS to detect scanning activity." },
    "T1592 Victim Host Info": { id: "T1592", name: "Gather Victim Host Information", description: "Adversaries may gather information about the victim's hosts, such as administrative names, hostnames, and software versions.", mitigation: "Limit public exposure of system information headers." },
    "T1593 Search Open Websites": { id: "T1593", name: "Search Open Websites/Domains", description: "Adversaries may search freely available websites/domains for information about victims (OSINT).", mitigation: "Monitor public footprint and remove sensitive data." },
    "T1589 Gather Identity Info": { id: "T1589", name: "Gather Victim Identity Information", description: "Adversaries may gather information about identities, such as employee names and emails, to target via Phishing.", mitigation: "Employee training on social engineering." },
    "T1583 Acquire Infrastructure": { id: "T1583", name: "Acquire Infrastructure", description: "Adversaries may buy, lease, or rent infrastructure (domains, servers) to stage attacks.", mitigation: "Monitor for newly registered domains similar to yours." },
    "T1588 Obtain Capabilities": { id: "T1588", name: "Obtain Capabilities", description: "Adversaries may buy or steal software, exploits, or certificates to use during targeting.", mitigation: "Patch management to reduce effectiveness of bought exploits." },
    "T1587 Develop Capabilities": { id: "T1587", name: "Develop Capabilities", description: "Adversaries may develop their own malware or exploits to evade detection.", mitigation: "Behavioral analysis and heuristics detection." },
    "T1584 Compromise Infrastructure": { id: "T1584", name: "Compromise Infrastructure", description: "Adversaries may compromise third-party infrastructure (like waterholes) to support their operations.", mitigation: "Vulnerability scanning of all external facing assets." },
    "T1190 Exploit Public App": { id: "T1190", name: "Exploit Public-Facing Application", description: "Adversaries may attempt to take advantage of a weakness in an Internet-facing computer or program using software, data, or commands in order to cause unintended or unanticipated behavior.", mitigation: "Regular patching and Web Application Firewalls (WAF)." },
    "T1566 Phishing": { id: "T1566", name: "Phishing", description: "Adversaries may send phishing messages to gain access to victim systems.", mitigation: "User training, SPF/DKIM/DMARC, and email filtering." },
    "T1133 External Remote Services": { id: "T1133", name: "External Remote Services", description: "Adversaries may leverage external-facing remote services (VPN, RDP) to initially access and/or persist within a network.", mitigation: "MFA, disable RDP exposure, VPN concentration." },
    "T1078 Valid Accounts": { id: "T1078", name: "Valid Accounts", description: "Adversaries may obtain and abuse credentials of existing accounts as a means of gaining Initial Access, Persistence, Privilege Escalation, or Defense Evasion.", mitigation: "MFA, Credential Hygiene, Least Privilege." },
    "T1059 Command Interpreter": { id: "T1059", name: "Command and Scripting Interpreter", description: "Adversaries may abuse command and script interpreters (PowerShell, Bash) to execute commands, scripts, or binaries.", mitigation: "Disable unnecessary interpreters, script signing, logging." },
    "T1203 Client Execution": { id: "T1203", name: "Exploitation for Client Execution", description: "Adversaries may exploit software vulnerabilities in client applications (browsers, office) to execute code.", mitigation: "Application whitelisting and patching." },
    "T1053 Scheduled Task": { id: "T1053", name: "Scheduled Task/Job", description: "Adversaries may abuse task scheduling functionality to facilitate initial or recurring execution of malicious code.", mitigation: "Monitor creation of new scheduled tasks." },
    "T1106 Native API": { id: "T1106", name: "Native API", description: "Adversaries may interact directly with the OS API to execute behaviors, bypassing high-level logging.", mitigation: "EDR monitoring of API calls." },
    "T1547 Boot Autostart": { id: "T1547", name: "Boot or Logon Autostart Execution", description: "Adversaries may configure settings to automatically execute programs on system boot or logon.", mitigation: "Monitor registry run keys and startup folders." },
    "T1098 Account Manipulation": { id: "T1098", name: "Account Manipulation", description: "Adversaries may manipulate accounts to maintain access to victim systems.", mitigation: "Monitor for changes to account groups or permissions." },
    "T1543 Modify System Process": { id: "T1543", name: "Create or Modify System Process", description: "Adversaries may create or modify system-level processes to repeatedly execute malicious payloads.", mitigation: "File integrity monitoring on system binaries." },
    "T1136 Create Account": { id: "T1136", name: "Create Account", description: "Adversaries may create a new account to maintain access to victim systems.", mitigation: "Audit logs for account creation events." },
    "T1068 Privilege Escalation": { id: "T1068", name: "Exploitation for Privilege Escalation", description: "Adversaries may exploit software vulnerabilities to elevate privileges.", mitigation: "Patching and Least Privilege." },
    "T1548 Abuse Elevation Control": { id: "T1548", name: "Abuse Elevation Control Mechanism", description: "Adversaries may circumvent mechanisms designed to control elevation of privileges (like UAC or sudo).", mitigation: "Set UAC to 'Always Notify', restrict sudoers." },
    "T1055 Process Injection": { id: "T1055", name: "Process Injection", description: "Adversaries may inject code into processes in order to evade process-based defenses as well as possibly elevate privileges.", mitigation: "Endpoint protection (EDR) and memory protection." },
    "T1484 Domain Policy": { id: "T1484", name: "Domain Policy Modification", description: "Adversaries may modify domain-level policies (Group Policy) to gain persistence or escalate privileges.", mitigation: "Strict controls on GPO modification access." },
    "T1071 App Layer Protocol": { id: "T1071", name: "Application Layer Protocol", description: "Adversaries may communicate using common application layer protocols (HTTP, DNS) to avoid detection.", mitigation: "Network traffic analysis and protocol anomaly detection." },
    "T1573 Encrypted Channel": { id: "T1573", name: "Encrypted Channel", description: "Adversaries may employ a known encryption algorithm to conceal command and control traffic.", mitigation: "SSL Inspection where feasible." },
    "T1008 Fallback Channels": { id: "T1008", name: "Fallback Channels", description: "Adversaries may use fallback command and control channels if the primary channel is compromised.", mitigation: "Defense in depth." },
    "T1105 Ingress Tool Transfer": { id: "T1105", name: "Ingress Tool Transfer", description: "Adversaries may transfer tools or other files from an external system into a compromised environment.", mitigation: "Network filtering and block download of executable types." }
};

export const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500, 10000, 15000, 22000, 30000, 50000];

export const VAULT_LAYOUT: VaultRoom[] = [
    { id: 'v1', name: 'Command Node', x: 2, y: 0, unlockLevel: 1, type: 'entrance', baseCost: 100, description: "Secure entry to your basement hub.", bonusDescription: "Reduces base Heat generation." },
    { id: 'v2', name: 'Server Rack A', x: 2, y: 1, unlockLevel: 1, type: 'utility', baseCost: 200, description: "Basic processing cluster.", bonusDescription: "Speeds up hardware installation." },
    { id: 'v3', name: 'Ops Center', x: 3, y: 1, unlockLevel: 2, type: 'command', baseCost: 500, description: "Command center for operations.", bonusDescription: "Increases Critical Success Chance." },
    { id: 'v4', name: 'Break Room', x: 1, y: 1, unlockLevel: 3, type: 'living', baseCost: 300, description: "Nutritional paste dispensary.", bonusDescription: "Increases XP Gain slightly." },
    { id: 'v5', name: 'Coolant Pump', x: 2, y: 2, unlockLevel: 5, type: 'utility', baseCost: 600, description: "Liquid nitrogen cooling loop.", bonusDescription: "Reduces Heat Spike magnitude." },
    { id: 'v6', name: 'Bunk A', x: 1, y: 2, unlockLevel: 7, type: 'living', baseCost: 400, description: "Sleeping pod.", bonusDescription: "Reduces Downtime duration." },
    { id: 'v7', name: 'Bunk B', x: 3, y: 2, unlockLevel: 9, type: 'living', baseCost: 400, description: "Overflow pod.", bonusDescription: "Reduces Downtime duration." },
    { id: 'v8', name: 'Reactor Core', x: 2, y: 3, unlockLevel: 12, type: 'utility', baseCost: 1000, description: "Compact fusion generator.", bonusDescription: "Significantly boosts Hack Speed." },
    { id: 'v9', name: 'Med-Bay', x: 1, y: 3, unlockLevel: 15, type: 'living', baseCost: 800, description: "Auto-Doc medical station.", bonusDescription: "Prevents Critical Failures." },
    { id: 'v10', name: 'Armory', x: 3, y: 3, unlockLevel: 20, type: 'command', baseCost: 1500, description: "Weapon and gear storage.", bonusDescription: "Increases CapCoin yield." },
];

export const THREAT_CONFIG = [
    { level: 1, label: "SAFE", multiplier: 0.5, heatMod: 0.1, color: "text-green-500", desc: "Low Threat. Low Reward. Undetectable." },
    { level: 2, label: "CAUTIOUS", multiplier: 0.8, heatMod: 0.5, color: "text-green-300", desc: "Standard protocols. Minimal tracing." },
    { level: 3, label: "STANDARD", multiplier: 1.0, heatMod: 1.0, color: "text-inherit", desc: "Balanced approach." },
    { level: 4, label: "RISKY", multiplier: 1.5, heatMod: 1.5, color: "text-orange-400", desc: "Aggressive probing. Trace buildup probable." },
    { level: 5, label: "DANGEROUS", multiplier: 2.5, heatMod: 2.5, color: "text-red-400", desc: "Brute force. High rewards. Rapid trace." },
    { level: 6, label: "SUICIDAL", multiplier: 5.0, heatMod: 4.0, color: "text-red-600 animate-pulse", desc: "Burn zero-days. Win big or lose everything." },
];

export const LIFESTYLE_CONFIG = [
    { level: 1, name: "Street Urchin", dailyCost: 0, desc: "Sleeping on steam vents. Avoid the riot police.", buff: "Heat Decay -20%", xpMult: 0.8 },
    { level: 2, name: "Tenement Room", dailyCost: 15, desc: "Single room, shared bathroom. 40W bulb.", buff: "None", xpMult: 1.0 },
    { level: 3, name: "Studio Apartment", dailyCost: 45, desc: "Private sink. Rad-roach free (mostly).", buff: "Heat Decay +10%", xpMult: 1.1 },
    { level: 4, name: "Suburban Ranch", dailyCost: 120, desc: "The American Dream. White picket fence. Codsworth model included.", buff: "Heat Decay +25%", xpMult: 1.25 },
    { level: 5, name: "High-Rise Condo", dailyCost: 300, desc: "Downtown view. Filtered air. Miss Nanny service.", buff: "Heat Decay +50%, Downtime -50%", xpMult: 1.5 },
    { level: 6, name: "Executive Suite", dailyCost: 800, desc: "Top floor. Private Vertibird pad. Total immunity.", buff: "Heat Decay +100%, Downtime -90%", xpMult: 2.0 }
];

// Combine FACTIONS and STOCK COMPANIES into a target registry for the game engine
export const TARGET_REGISTRY: Target[] = [];

// Populate from Factions
FACTION_DEFINITIONS.forEach(faction => {
     TARGET_REGISTRY.push({
         id: faction.id,
         company: faction.name,
         parentCorp: faction.id,
         system: "Mainframe",
         difficulty: 10
     });
});

// Populate from Stock Market
STOCK_MARKET_COMPANIES.forEach((comp, idx) => {
    TARGET_REGISTRY.push({
        id: `stk-${idx}`,
        company: comp.name,
        parentCorp: comp.name,
        system: "Public Access Node",
        difficulty: (idx % 10) + 1
    });
});