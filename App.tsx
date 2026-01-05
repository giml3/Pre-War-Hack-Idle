import React, { useState, useEffect, useCallback, useRef } from 'react';
import CharacterCreation from './components/CharacterCreation';
import TerminalLog from './components/TerminalLog';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { CenterPanel } from './components/CenterPanel';
import MitreMatrix from './components/MitreMatrix';
import { INITIAL_JOBS, INITIAL_UPGRADES, INITIAL_UNLOCKABLES, INITIAL_SOFTWARE, LEVEL_THRESHOLDS, KILL_CHAIN_PHASES, VAULT_LAYOUT, SKILL_DEFINITIONS, PRE_WAR_NEWS, THREAT_CONFIG, LIFESTYLE_CONFIG, STOCK_MARKET_COMPANIES, TARGET_REGISTRY, TECHNIQUE_DETAILS, CORPORATE_LADDER, SPECIAL_TOOLTIPS, FACTION_DEFINITIONS, INITIAL_ACHIEVEMENTS, LORE_TIMELINE, SOFTWARE_TOOLTIPS, CONSUMABLES, MUTATIONS, RANDOM_FIRST_NAMES, RANDOM_LAST_NAMES, RANDOM_NICKNAMES } from './constants';
import { GameState, Job, LogEntry, Target, SkillName, Special, CorpData, PlayerActivity, EconomyState, Bounty, Faction, Achievement, Message, Consumable, Mutation, ActiveEffect, Peer } from './types';
import { 
  Globe, LayoutDashboard, Terminal, ShoppingCart, Map, Menu
} from 'lucide-react';

const FAILURE_REASONS = [
    "Connection Refused by Peer",
    "Handshake Timeout (SSL/TLS)",
    "Port 22 Filtered by Firewall",
    "IDS Signature Match Detected",
    "Decryption Key Mismatch",
    "Honeypot Triggered",
    "Buffer Overflow Prevented by DEP",
    "Packet Fragmentation Error",
    "Authentication Token Expired",
    "Reverse Shell Blocked"
];

const SAVE_KEY = "WIREFRAME_PROTOCOL_V1_SAVE";

const getRandomTarget = (): Target => {
  return TARGET_REGISTRY[Math.floor(Math.random() * TARGET_REGISTRY.length)];
};

const generateBounty = (currentTime: number, level: number): Bounty => {
    const target = getRandomTarget();
    const isBig = Math.random() > 0.8;
    const reward = (100 * level) + (isBig ? 500 : 0) + Math.floor(Math.random() * 200);
    const typeRoll = Math.random();
    return {
        id: `b-${Date.now()}-${Math.random()}`,
        targetCorp: target.company,
        description: isBig ? `Extract Executive Data from ${target.company}` : `Disrupt operations at ${target.company}`,
        reward,
        expiresAt: currentTime + (Math.random() * 604800000), // 1-7 days roughly
        type: typeRoll < 0.33 ? 'SCOUT' : typeRoll < 0.66 ? 'EXTRACT' : 'DISRUPT'
    };
};

const rollDice = (exploding: boolean = true): { total: number, rolls: number[] } => {
    let rolls: number[] = [];
    let total = 0;
    for(let i=0; i<3; i++) {
        let die = Math.ceil(Math.random() * 6);
        rolls.push(die);
        total += die;
        while(exploding && die === 6) {
             die = Math.ceil(Math.random() * 6);
             rolls.push(die);
             total += die;
        }
    }
    return { total, rolls };
};

// BOT GENERATION
const generateBot = (level: number): Peer => {
    const first = RANDOM_FIRST_NAMES[Math.floor(Math.random() * RANDOM_FIRST_NAMES.length)];
    const last = RANDOM_LAST_NAMES[Math.floor(Math.random() * RANDOM_LAST_NAMES.length)];
    const nick = RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)];
    
    return {
        id: `bot-${Date.now()}-${Math.random()}`,
        name: `${nick}`,
        level: Math.max(1, level + Math.floor(Math.random() * 5) - 2),
        heat: Math.floor(Math.random() * 30),
        maxHeat: 100,
        status: 'HACKING',
        activity: 'Initializing...',
        needsHelp: false,
        avatarId: Math.floor(Math.random() * 10)
    };
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [activeTab, setActiveTab] = useState<'SPECIAL' | 'SKILLS' | 'INTEL' | 'FACTIONS'>('SPECIAL');
  const [activeShopTab, setActiveShopTab] = useState<'HARDWARE' | 'SOFTWARE' | 'MARKET' | 'SYSTEM' | 'AID' | 'LIFESTYLE'>('HARDWARE');
  const [activeCenterTab, setActiveCenterTab] = useState<'TERMINAL' | 'INBOX' | 'DATABASE' | 'NETWORK'>('TERMINAL');
  
  // Mobile Navigation State
  const [mobileTab, setMobileTab] = useState<'STATUS' | 'TERMINAL' | 'SUPPLY' | 'VISUAL'>('TERMINAL');

  // UI State
  const [hoverInfo, setHoverInfo] = useState<{title: string, body: string} | null>(null);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [hasLocalSave, setHasLocalSave] = useState(false);

  // Game loop refs
  const stateRef = useRef<GameState | null>(null);
  const lastPhaseRef = useRef<number>(-1);
  const matrixTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastJobPayTimeRef = useRef<number>(0);
  const lastMarketUpdateRef = useRef<number>(0);
  
  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
      const interval = setInterval(() => {
          setCurrentNewsIndex(prev => (prev + 1) % PRE_WAR_NEWS.length);
      }, 10000);
      
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) setHasLocalSave(true);

      return () => clearInterval(interval);
  }, []);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    setGameState((prev) => {
      if (!prev) return null;
      const newLog: LogEntry = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }),
        message,
        type,
      };
      return { ...prev, logs: [...prev.logs, newLog].slice(-50) };
    });
  }, []);

  // --- SAVE / LOAD SYSTEM ---
  const saveGame = () => {
      if (stateRef.current) {
          try {
              const saveString = JSON.stringify(stateRef.current);
              localStorage.setItem(SAVE_KEY, saveString);
              setHasLocalSave(true);
              addLog("GAME SAVED TO LOCAL STORAGE.", 'success');
          } catch (e) {
              console.error("Save failed", e);
              addLog("SAVE FAILED: STORAGE ERROR.", 'error');
          }
      }
  };

  const loadGame = () => {
      try {
          const saved = localStorage.getItem(SAVE_KEY);
          if (saved) {
              const parsed = JSON.parse(saved);
              setGameState(parsed);
              addLog("GAME LOADED FROM LOCAL STORAGE.", 'success');
          }
      } catch (e) {
          console.error("Load failed", e);
      }
  };

  const importSave = (saveString: string) => {
      try {
          const json = atob(saveString);
          const parsed = JSON.parse(json);
          setGameState(parsed);
          addLog("NEURAL LINK IMPORT SUCCESSFUL.", 'success');
      } catch (e) {
          alert("Invalid Save String");
      }
  };

  const handleJobSelect = (job: Job) => {
    const skills: Record<SkillName, number> = {
        Science: 0, Lockpick: 0, Sneak: 0, Barter: 0, Speech: 0, Repair: 0
    };
    Object.entries(job.initialSkills).forEach(([key, val]) => {
        if(key && typeof val === 'number') skills[key as SkillName] = val;
    });

    const initialVaultLevels: Record<string, number> = {};
    VAULT_LAYOUT.forEach(r => initialVaultLevels[r.id] = 0);

    const corporations: Record<string, CorpData> = {};
    const factions: Record<string, Faction> = {};

    STOCK_MARKET_COMPANIES.forEach(comp => {
         corporations[comp.code] = {
             name: comp.name,
             code: comp.code,
             desc: "Publicly Traded Entity",
             reputation: 0,
             trace: 0,
             stockPrice: 10 + Math.random() * 200,
             stockTrend: 0,
             ownedShares: 0
         };
    });

    FACTION_DEFINITIONS.forEach(fac => {
        factions[fac.id] = { ...fac };
    });

    const shopStock: Record<string, number> = {};
    CONSUMABLES.forEach(c => {
        shopStock[c.id] = Math.floor(Math.random() * 20) + 5; 
    });

    const startDate = new Date('2075-04-12T06:00:00').getTime();
    const initialBounties = [generateBounty(startDate, 1), generateBounty(startDate, 1)];

    const welcomeMsg: Message = {
        id: 'msg-001',
        sender: 'Handler',
        subject: 'Contract Active',
        body: "Welcome to the Wireframe Protocol. World's falling apart, but the pay is good. Check your tasks, keep your head down, and watch the radiation levels.",
        read: false,
        date: '2075-04-12'
    };

    setGameState({
      cash: 250, 
      xp: 0,
      level: 1,
      job,
      playerName: job.name,
      employer: "Freelance",
      gameTime: startDate,
      gameSpeed: 1,
      currentActivity: 'SLEEPING',
      jobLevel: 1,
      economyState: 'STABLE',
      lastYearChecked: 2075,
      lifestyleLevel: 2, 
      lastRentPaidDay: -1,
      activeBounties: initialBounties,
      hackingProgress: 0,
      isAutoHacking: true,
      upgrades: INITIAL_UPGRADES.map(u => ({...u})), 
      software: INITIAL_SOFTWARE.map(s => ({...s})),
      unlockables: INITIAL_UNLOCKABLES.map(u => ({...u})),
      vaultLevels: initialVaultLevels,
      autoBuyHardware: false,
      autoBuySoftware: false,
      autoBuyConsumables: false,
      shopStock,
      lastRestockDay: 0, 
      logs: [],
      messages: [welcomeMsg],
      achievements: INITIAL_ACHIEVEMENTS,
      totalHacks: 0,
      techniqueCounts: {},
      techniqueLastSeen: {},
      currentTarget: getRandomTarget(),
      special: { ...job.initialSpecial },
      skills: skills,
      perks: [],
      upgradePoints: 0,
      perkPoints: 0,
      heat: 0,
      threatLevel: 3, 
      isDowntime: false,
      downtimeEndTime: 0,
      corporations,
      factions,
      marketLastUpdate: startDate,
      globalRadiation: 15,
      uiColor: '#ffb000',
      tutorialStep: 0,
      inventory: {},
      activeEffects: [],
      mutations: [],
      playerRadiation: 0,
      addictions: [],
      peers: [] 
    });
    lastPhaseRef.current = -1;
  };

  const getGameDate = (ts: number) => {
      const date = new Date(ts);
      const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
      return {
          dateStr: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          timeStr: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          hour: date.getHours(),
          year: date.getFullYear(),
          dayOfYear
      };
  };

  // Main Game Loop
  const updateGame = useCallback(() => {
    const currentState = stateRef.current;
    if (!currentState) return;
    
    const timeDeltaMs = 60000 * currentState.gameSpeed; 
    const newTime = currentState.gameTime + timeDeltaMs;
    const { hour, year, dayOfYear } = getGameDate(newTime);

    let activity: PlayerActivity = 'HACKING';
    if (hour >= 8 && hour < 17) activity = 'JOB';
    else if (hour >= 23 || hour < 7) activity = 'SLEEPING';
    if (currentState.isDowntime) activity = 'DOWNTIME';

    let cashChange = 0;
    let heatChange = 0;
    let radiationChange = 0;
    let playerRadChange = 0;
    let logsToAdd: LogEntry[] = [];
    let activityLog: LogEntry | null = null;
    let newLifestyleLevel = currentState.lifestyleLevel;
    let newShopStock = { ...currentState.shopStock };
    let newLastRestockDay = currentState.lastRestockDay;

    // --- EXPENSES LOGIC ---
    if (dayOfYear !== currentState.lastRentPaidDay) {
        // Rent due
        const lifestyle = LIFESTYLE_CONFIG.find(l => l.level === currentState.lifestyleLevel) || LIFESTYLE_CONFIG[0];
        if (lifestyle.dailyCost > 0) {
            cashChange -= lifestyle.dailyCost;
            logsToAdd.push({ id: Date.now(), timestamp: "FINANCE", message: `Daily Expenses Paid: -${lifestyle.dailyCost} Caps (${lifestyle.name})`, type: 'info' });
            
            if (currentState.cash + cashChange < 0) {
                 cashChange = -currentState.cash; 
                 if (newLifestyleLevel > 1) {
                     newLifestyleLevel = 1;
                     logsToAdd.push({ id: Date.now() + 1, timestamp: "FINANCE", message: "EVICTION NOTICE. Downgraded to homeless status.", type: 'error' });
                 }
            }
        }
        // Radiation Drift - SLOWED DOWN BY 60X
        if (Math.random() > 0.7) {
            radiationChange += (0.5 / 60);
        }

        // Shop Restock (2 weeks)
        if (dayOfYear - newLastRestockDay >= 14 || (dayOfYear < newLastRestockDay)) { 
             newLastRestockDay = dayOfYear;
             CONSUMABLES.forEach(c => {
                 newShopStock[c.id] = Math.floor(Math.random() * 20) + 10;
             });
             logsToAdd.push({ id: Date.now(), timestamp: "SUPPLY", message: "Market vendor restocked inventory.", type: 'info' });
        }
    }
    const updatedRentPaidDay = dayOfYear;

    if (activity !== currentState.currentActivity) {
         if (activity === 'JOB') activityLog = { id: Date.now(), timestamp: "SYSTEM", message: "MANDATORY PRODUCTIVITY PERIOD START.", type: 'warning' };
         if (activity === 'SLEEPING') activityLog = { id: Date.now(), timestamp: "SYSTEM", message: "BIOLOGICAL MAINTENANCE CYCLE START.", type: 'info' };
         if (activity === 'HACKING' && currentState.currentActivity === 'JOB') activityLog = { id: Date.now(), timestamp: "SYSTEM", message: "SHIFT END. PERSONAL TERMINAL UNLOCKED.", type: 'success' };
    }
    if (activityLog) logsToAdd.push(activityLog);

    // ECONOMY & CAREER LOGIC
    let economyState = currentState.economyState;
    let jobLevel = currentState.jobLevel;
    
    // Annual Review
    if (year > currentState.lastYearChecked) {
        const performanceRoll = rollDice(true).total + currentState.special.I + (currentState.special.C / 2);
        const requiredPerformance = 15 + (jobLevel * 2);
        
        let reviewMsg = "";
        let reviewType: LogEntry['type'] = 'info';

        if (performanceRoll >= requiredPerformance) {
            jobLevel++;
            reviewMsg = `ANNUAL REVIEW: Performance Exceeded Expectations. PROMOTED to Grade ${jobLevel}. Wage Increased.`;
            reviewType = 'success';
        } else if (performanceRoll < 10 && jobLevel > 1) {
            jobLevel--;
            reviewMsg = `ANNUAL REVIEW: Performance Sub-Optimal. DEMOTED to Grade ${jobLevel}. Wage Reduced.`;
            reviewType = 'error';
        } else {
            reviewMsg = `ANNUAL REVIEW: Performance Meets Expectations. Grade ${jobLevel} maintained.`;
        }
        logsToAdd.push({ id: Date.now(), timestamp: "HR_DEPT", message: reviewMsg, type: reviewType });

        const ecoRoll = Math.random();
        if (ecoRoll < 0.3) {
            const states: EconomyState[] = ['RECESSION', 'STABLE', 'BOOM'];
            const newState = states[Math.floor(Math.random() * states.length)];
            if (newState !== economyState) {
                economyState = newState;
                logsToAdd.push({ 
                    id: Date.now() + 1, 
                    timestamp: "NEWS", 
                    message: `MARKET SHIFT: Analysts declare economy entered ${newState} phase.`, 
                    type: newState === 'BOOM' ? 'success' : newState === 'RECESSION' ? 'error' : 'info' 
                });
            }
        }
    }

    // Market Update Logic (Hourly)
    let newCorporations = { ...currentState.corporations };
    if (newTime - lastMarketUpdateRef.current >= 3600000) { 
        lastMarketUpdateRef.current = newTime;
        let ecoBias = 0;
        if (economyState === 'BOOM') ecoBias = 0.02; 
        if (economyState === 'RECESSION') ecoBias = -0.02; 

        Object.keys(newCorporations).forEach(key => {
            const corp = newCorporations[key];
            const randomFlux = (Math.random() - 0.5) * 0.1; 
            const changePercent = randomFlux + ecoBias; 
            const newPrice = Math.max(1, corp.stockPrice * (1 + changePercent));
            newCorporations[key] = { 
                ...corp, 
                stockPrice: newPrice,
                stockTrend: changePercent
            };
        });
    }

    // BOUNTY CLEANUP (Every hour check)
    let newBounties = [...currentState.activeBounties];
    if (newTime % 3600000 < 60000) {
        const validBounties = newBounties.filter(b => b.expiresAt > newTime);
        if (validBounties.length < newBounties.length) {
            logsToAdd.push({ id: Date.now(), timestamp: "INFO", message: "A bounty contract has expired.", type: 'info' });
        }
        newBounties = validBounties;
        
        if (newBounties.length < 3 && Math.random() > 0.7) {
            newBounties.push(generateBounty(newTime, currentState.level));
            logsToAdd.push({ id: Date.now(), timestamp: "NET", message: "New Bounty Contract available.", type: 'info' });
        }
    }

    // Player Radiation Accumulation - SLOWED DOWN BY 60X
    if (activity !== 'DOWNTIME' && Math.random() > 0.5) {
        const radExposure = Math.max(1, currentState.globalRadiation / 10);
        const lifestyleConfig = LIFESTYLE_CONFIG.find(l => l.level === newLifestyleLevel) || LIFESTYLE_CONFIG[0];
        const lifestyleMod = Math.max(0, (6 - lifestyleConfig.level) * 0.4); 
        playerRadChange += (radExposure * (1 + lifestyleMod)) / 60;
    }

    if (activity === 'JOB') {
        if (newTime - lastJobPayTimeRef.current > 3600000) { 
            let ecoMult = 1;
            if (economyState === 'BOOM') ecoMult = 1.5;
            if (economyState === 'RECESSION') ecoMult = 0.8;
            
            const hourlyWage = Math.floor((10 * jobLevel * ecoMult) * (1 + (currentState.special.C * 0.05)));
            cashChange += hourlyWage; 
            lastJobPayTimeRef.current = newTime;
        }
    } else if (activity === 'SLEEPING') {
        const lifestyle = LIFESTYLE_CONFIG.find(l => l.level === newLifestyleLevel) || LIFESTYLE_CONFIG[0];
        let decay = -2;
        if (lifestyle.level >= 3) decay = -3;
        if (lifestyle.level >= 5) decay = -5;
        heatChange = decay;
    } else if (activity === 'DOWNTIME') {
         if (Date.now() > currentState.downtimeEndTime) {
            setGameState(prev => prev ? { ...prev, isDowntime: false, heat: 0, logs: [...prev.logs, {
                id: Date.now(),
                timestamp: new Date().toLocaleTimeString(),
                message: "HEAT DISSIPATED. Systems cooled.",
                type: 'success'
            } as LogEntry].slice(-50) } : null);
            return; 
         }
    }

    setGameState(prev => {
        if(!prev) return null;

        // CALCULATE BONUSES
        let speedMult = 1;
        let heatGenMult = 1;
        let critFlat = 0;
        let cashMult = 1;
        
        let newActiveEffects = prev.activeEffects.filter(e => e.expiresAt > newTime);
        
        // Active Effects
        newActiveEffects.forEach(effect => {
             if (effect.effects.speed) speedMult += effect.effects.speed;
             if (effect.effects.heatGen) heatGenMult += effect.effects.heatGen;
             if (effect.effects.crit) critFlat += effect.effects.crit;
             if (effect.effects.xp) cashMult += effect.effects.xp; 
        });

        // Mutations
        prev.mutations.forEach(mId => {
             const mut = MUTATIONS.find(m => m.id === mId);
             if (mut) {
                 if (mut.effects.speed) speedMult += mut.effects.speed;
                 if (mut.effects.heatGen) heatGenMult += mut.effects.heatGen;
                 if (mut.effects.crit) critFlat += mut.effects.crit;
                 if (mut.effects.cash) cashMult += mut.effects.cash;
             }
        });

        const cpuBonus = prev.upgrades.find(u => u.type === 'CPU')?.value || 0;
        const cpuLevel = prev.upgrades.find(u => u.type === 'CPU')?.owned || 0;
        const swSpeedBonus = prev.software.filter(s => s.bonus.stat === 'SPEED').reduce((acc, s) => acc + (s.bonus.value * s.owned), 0);
        const powerPlantLevel = prev.vaultLevels['v8'] || 0;
        const vaultSpeedBonus = powerPlantLevel * 0.1;
        
        let effectiveInt = prev.special.I;
        newActiveEffects.forEach(e => { if(e.effects.stat?.I) effectiveInt += e.effects.stat.I; });
        prev.mutations.forEach(mId => { const m = MUTATIONS.find(x => x.id === mId); if(m?.effects.stat?.I) effectiveInt += m.effects.stat.I; });

        const intMod = effectiveInt * 0.1; 
        
        const baseSpeed = 0.05; 
        const speed = (baseSpeed + (cpuLevel * cpuBonus) + swSpeedBonus + vaultSpeedBonus) * (1 + intMod) * speedMult;

        let newProgress = prev.hackingProgress;
        let newHeat = Math.max(0, prev.heat + heatChange);
        let newGlobalRadiation = Math.min(100, Math.max(0, prev.globalRadiation + radiationChange));
        let newPlayerRadiation = Math.min(1000, prev.playerRadiation + playerRadChange);
        let currentCash = prev.cash + cashChange;
        let newTechniqueCounts = { ...prev.techniqueCounts };
        let newTechniqueLastSeen = { ...prev.techniqueLastSeen };
        let newTarget = prev.currentTarget;
        let newXp = prev.xp;
        let newLevel = prev.level;
        let newUpgradePoints = prev.upgradePoints;
        let newPerkPoints = prev.perkPoints;
        let newUnlockables = prev.unlockables;
        let newAchievements = [...prev.achievements];
        let newMutations = [...prev.mutations];
        let newUpgrades = prev.upgrades;
        let newSoftware = prev.software;
        let newInventory = { ...prev.inventory };
        let newShopStock = { ...prev.shopStock };

        // Bot Management
        let newPeers = [...prev.peers];
        if (Math.random() > 0.95 && newPeers.length < 4) { // 5% chance to spawn bot if slots available
            const bot = generateBot(prev.level);
            newPeers.push(bot);
            logsToAdd.push({ id: Date.now(), timestamp: "NETWORK", message: `Node Connected: ${bot.name}`, type: 'network' });
        }
        
        // Update Bot Stats
        newPeers = newPeers.map(bot => {
            if (bot.status === 'LOCKED') return bot; // Stuck until help or timeout logic (not imp here)
            
            let bh = bot.heat;
            let bs = bot.status;
            let ba = bot.activity;
            let bhelp = bot.needsHelp;

            if (Math.random() > 0.7) bh += 5; // Bots gain heat
            if (bh > 85) bhelp = true;
            if (bh >= 100) {
                 bs = 'LOCKED';
                 ba = 'CRITICAL FAILURE';
                 bh = 100;
            } else {
                if (Math.random() > 0.9) {
                    const activities = ["Brute-forcing...", "Injecting payload...", "Analyzing packets...", "Compiling worm..."];
                    ba = activities[Math.floor(Math.random() * activities.length)];
                }
            }
            return { ...bot, heat: bh, status: bs, activity: ba, needsHelp: bhelp };
        });

        // Mutation Check
        if (Math.floor(newPlayerRadiation / 200) > Math.floor(prev.playerRadiation / 200)) {
            if (Math.random() > 0.5) { // 50% chance
                 const availableMutations = MUTATIONS.filter(m => !newMutations.includes(m.id));
                 if (availableMutations.length > 0) {
                     const newMut = availableMutations[Math.floor(Math.random() * availableMutations.length)];
                     newMutations.push(newMut.id);
                     logsToAdd.push({ id: Date.now(), timestamp: "BIO_HAZARD", message: `DNA Corrupted. Mutation Gained: ${newMut.name}`, type: 'mutation' });
                 }
            }
        }

        const threatConfig = THREAT_CONFIG.find(r => r.level === prev.threatLevel) || THREAT_CONFIG[2];
        const lifestyleConfig = LIFESTYLE_CONFIG.find(l => l.level === newLifestyleLevel) || LIFESTYLE_CONFIG[0];
        const barterMod = 1 - (prev.skills.Barter * 0.01);
        let priceMult = 1;
        if (economyState === 'BOOM') priceMult = 1.2;
        if (economyState === 'RECESSION') priceMult = 0.9;

        // --- HACKING EXECUTION ---
        if (activity === 'HACKING' && prev.isAutoHacking) {
            
            // Auto Buy Logic
            if (prev.autoBuyHardware) {
                 const affordableUpgrade = newUpgrades
                    .map((u, idx) => ({ ...u, idx, cost: Math.floor((u.baseCost * Math.pow(u.costMultiplier, u.owned)) * barterMod * priceMult) }))
                    .filter(u => u.cost <= currentCash)
                    .sort((a, b) => a.cost - b.cost)[0];

                if (affordableUpgrade) {
                    newUpgrades = [...newUpgrades];
                    newUpgrades[affordableUpgrade.idx] = { ...newUpgrades[affordableUpgrade.idx], owned: newUpgrades[affordableUpgrade.idx].owned + 1 };
                    currentCash -= affordableUpgrade.cost;
                    logsToAdd.push({ id: Date.now(), timestamp: "SHOP", message: `Auto-Bought ${affordableUpgrade.name}.`, type: 'info' });
                }
            }
            if (prev.autoBuySoftware) {
                const affordableSoft = newSoftware
                   .map((s, idx) => ({ ...s, idx, cost: Math.floor((s.baseCost * Math.pow(s.costMultiplier, s.owned)) * barterMod * priceMult) }))
                   .filter(s => s.cost <= currentCash)
                   .sort((a, b) => a.cost - b.cost)[0];

               if (affordableSoft) {
                   newSoftware = [...newSoftware];
                   newSoftware[affordableSoft.idx] = { ...newSoftware[affordableSoft.idx], owned: newSoftware[affordableSoft.idx].owned + 1 };
                   currentCash -= affordableSoft.cost;
                   logsToAdd.push({ id: Date.now(), timestamp: "SHOP", message: `Auto-Compiled ${affordableSoft.name}.`, type: 'info' });
               }
            }
            if (prev.autoBuyConsumables) {
                const essentials = ['c1', 'c3']; // Stimpak, RadAway
                essentials.forEach(eid => {
                    const currentCount = newInventory[eid] || 0;
                    if (currentCount < 5) {
                        const item = CONSUMABLES.find(c => c.id === eid);
                        if (item && (newShopStock[eid] || 0) > 0) {
                             const cost = Math.floor(item.baseCost * priceMult * barterMod);
                             if (currentCash >= cost) {
                                 currentCash -= cost;
                                 newInventory[eid] = (newInventory[eid] || 0) + 1;
                                 newShopStock[eid] = (newShopStock[eid] || 0) - 1;
                                 logsToAdd.push({ id: Date.now(), timestamp: "SHOP", message: `Auto-Resupplied ${item.name}.`, type: 'info' });
                             }
                        }
                    }
                });
            }

            const swHeatBonus = prev.software.filter(s => s.bonus.stat === 'HEAT').reduce((acc, s) => acc + (s.bonus.value * s.owned), 0);
            let lifestyleHeatDecay = 0;
            if (lifestyleConfig.level >= 4) lifestyleHeatDecay = 0.5;
            if (lifestyleConfig.level >= 6) lifestyleHeatDecay = 1.0;

            let heatDecay = ((prev.special.A * 0.05) + swHeatBonus + lifestyleHeatDecay);
            if (heatGenMult < 1) heatDecay = heatDecay * (2 - heatGenMult);

            newHeat = Math.max(0, newHeat - heatDecay);

            if (newHeat >= 100) {
                 const endurance = prev.special.E;
                 const downtimeMs = Math.max(5000, 30000 - (endurance * 2000));
                 logsToAdd.push({ id: Date.now(), timestamp: "SYS", message: "CRITICAL HEAT. LOCKOUT.", type: 'error' });
                 
                 if (!newAchievements.find(a => a.id === 'a3')?.unlocked) {
                     newAchievements = newAchievements.map(a => a.id === 'a3' ? { ...a, unlocked: true } : a);
                     logsToAdd.push({ id: Date.now(), timestamp: "ACHIEVEMENT", message: "Unlocked: Meltdown", type: 'success' });
                 }

                 return { ...prev, gameTime: newTime, currentActivity: activity, heat: 100, isDowntime: true, downtimeEndTime: Date.now() + downtimeMs, logs: [...prev.logs, ...logsToAdd].slice(-50), achievements: newAchievements, peers: newPeers };
            }

            newProgress += speed;

            const currentPhaseIndex = KILL_CHAIN_PHASES.reduce((found, phase, idx) => {
                return newProgress >= phase.threshold ? idx : found;
            }, 0);

            if (currentPhaseIndex > lastPhaseRef.current && newProgress < 100) {
                const phaseName = KILL_CHAIN_PHASES[currentPhaseIndex].name;
                logsToAdd.push({ id: Date.now() + Math.random(), timestamp: "HACK", message: `[${prev.currentTarget.company}] Phase: ${phaseName}...`, type: 'phase' });

                const targetNumber = prev.special.I + prev.skills.Science;
                const difficulty = prev.currentTarget.difficulty;
                const { total } = rollDice(true);
                const isCritFail = total > 25; 
                
                if (total > (targetNumber - difficulty)) {
                    // FAILURE
                    const heatGen = (isCritFail ? 20 : 5) * threatConfig.heatMod * heatGenMult;
                    newHeat += heatGen;
                    const reason = FAILURE_REASONS[Math.floor(Math.random() * FAILURE_REASONS.length)];
                    logsToAdd.push({ id: Date.now() + Math.random(), timestamp: "FAIL", message: `Error: ${reason}. Heat +${Math.floor(heatGen)}.`, type: 'warning' });
                    newProgress -= 5; 
                }
                lastPhaseRef.current = currentPhaseIndex;
            }
            
            if (Math.random() > 0.9 && newProgress < 100) {
                 const techniques = KILL_CHAIN_PHASES[currentPhaseIndex].techniques;
                 const randomTech = techniques[Math.floor(Math.random() * techniques.length)];
                 newTechniqueCounts[randomTech] = (newTechniqueCounts[randomTech] || 0) + 1;
                 newTechniqueLastSeen[randomTech] = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
            }

            // SUCCESS
            if (newProgress >= 100) {
                const luckCritChance = prev.special.L * 0.02; 
                const swCritBonus = prev.software.filter(s => s.bonus.stat === 'CRIT').reduce((acc, s) => acc + (s.bonus.value * s.owned), 0);
                const isCrit = Math.random() < (luckCritChance + swCritBonus + critFlat);
                const speechBonus = 1 + (prev.skills.Speech * 0.01);
                const swCashBonus = prev.software.filter(s => s.bonus.stat === 'CASH').reduce((acc, s) => acc + (s.bonus.value * s.owned), 0);
                const baseCash = (20 * prev.level) + prev.currentTarget.difficulty * 10 + swCashBonus;
                
                currentCash += Math.floor(baseCash * speechBonus * (isCrit ? 2 : 1) * threatConfig.multiplier * cashMult);
                
                const intXpBonus = 1 + (prev.special.I * 0.05);
                const baseXp = 20 + (prev.currentTarget.difficulty * 5);
                newXp += Math.floor(baseXp * intXpBonus * threatConfig.multiplier * lifestyleConfig.xpMult);

                const matchingBountyIdx = newBounties.findIndex(b => b.targetCorp === prev.currentTarget.company);
                if (matchingBountyIdx > -1) {
                    const bounty = newBounties[matchingBountyIdx];
                    currentCash += bounty.reward;
                    logsToAdd.push({ id: Date.now(), timestamp: "CONTRACT", message: `Bounty Complete: ${bounty.description}. Reward: ${bounty.reward}`, type: 'success' });
                    newBounties.splice(matchingBountyIdx, 1);
                }

                const nextThreshold = LEVEL_THRESHOLDS[prev.level] || 99999999;
                if (newXp >= nextThreshold) {
                    newLevel += 1;
                    if (newLevel % 5 === 0) {
                        newUpgradePoints += 1;
                        newPerkPoints += 1;
                        logsToAdd.push({ id: Date.now(), timestamp: "LVL", message: `Level ${newLevel}. +1 Upgrade Point.`, type: 'warning' });
                    } else {
                        logsToAdd.push({ id: Date.now(), timestamp: "LVL", message: `Level ${newLevel}.`, type: 'warning' });
                    }
                    if (newLevel >= 10 && !newAchievements.find(a => a.id === 'a5')?.unlocked) {
                         newAchievements = newAchievements.map(a => a.id === 'a5' ? { ...a, unlocked: true } : a);
                         logsToAdd.push({ id: Date.now(), timestamp: "ACHIEVEMENT", message: "Unlocked: Ghost in the Shell", type: 'success' });
                    }
                }
                
                if (prev.totalHacks === 0 && !newAchievements.find(a => a.id === 'a1')?.unlocked) {
                    newAchievements = newAchievements.map(a => a.id === 'a1' ? { ...a, unlocked: true } : a);
                    logsToAdd.push({ id: Date.now(), timestamp: "ACHIEVEMENT", message: "Unlocked: Hello World", type: 'success' });
                }

                newUnlockables = prev.unlockables.map(u => {
                    if (!u.isUnlocked && newLevel >= u.unlockLevel) return { ...u, isUnlocked: true };
                    return u;
                });
                const newlyUnlocked = newUnlockables.filter(u => u.isUnlocked && !prev.unlockables.find(pu => pu.id === u.id)?.isUnlocked);
                newlyUnlocked.forEach(u => logsToAdd.push({ id: Date.now(), timestamp: "SYS", message: `Installed ${u.name}.`, type: 'system' }));

                logsToAdd.push({ id: Date.now(), timestamp: "ROOT", message: `Access Granted: ${prev.currentTarget.company}.`, type: 'success' });
                
                newProgress = 0;
                newTarget = getRandomTarget();
                newHeat = Math.max(0, newHeat - 20);
                newTechniqueCounts = {};
                lastPhaseRef.current = -1;
            }
        }

        if (newGlobalRadiation >= 50 && !newAchievements.find(a => a.id === 'a6')?.unlocked) {
             newAchievements = newAchievements.map(a => a.id === 'a6' ? { ...a, unlocked: true } : a);
             logsToAdd.push({ id: Date.now(), timestamp: "ACHIEVEMENT", message: "Unlocked: Glowing Sea", type: 'success' });
        }
        
        if (currentCash >= 1000000 && !newAchievements.find(a => a.id === 'a4')?.unlocked) {
             newAchievements = newAchievements.map(a => a.id === 'a4' ? { ...a, unlocked: true } : a);
             logsToAdd.push({ id: Date.now(), timestamp: "ACHIEVEMENT", message: "Unlocked: Millionaire", type: 'success' });
        }

        return {
            ...prev,
            gameTime: newTime,
            jobLevel,
            economyState,
            lastYearChecked: year > prev.lastYearChecked ? year : prev.lastYearChecked,
            currentActivity: activity,
            hackingProgress: newProgress,
            heat: Math.min(100, newHeat),
            globalRadiation: newGlobalRadiation,
            playerRadiation: newPlayerRadiation,
            cash: currentCash,
            logs: logsToAdd.length > 0 ? [...prev.logs, ...logsToAdd].slice(-50) : prev.logs,
            techniqueCounts: newTechniqueCounts,
            techniqueLastSeen: newTechniqueLastSeen,
            currentTarget: newTarget,
            xp: newXp,
            level: newLevel,
            upgradePoints: newUpgradePoints,
            perkPoints: newPerkPoints,
            unlockables: newUnlockables,
            corporations: newCorporations,
            lifestyleLevel: newLifestyleLevel,
            lastRentPaidDay: updatedRentPaidDay,
            activeBounties: newBounties,
            achievements: newAchievements,
            activeEffects: newActiveEffects,
            mutations: newMutations,
            upgrades: newUpgrades,
            software: newSoftware,
            inventory: newInventory,
            shopStock: newShopStock,
            lastRestockDay: newLastRestockDay,
            peers: newPeers
        };
    });

  }, []);

  useEffect(() => {
    if (!gameState) return;
    const interval = setInterval(updateGame, 250); 
    return () => clearInterval(interval);
  }, [gameState ? true : false, updateGame]); 

  // --- INTERACTION HANDLERS ---
  const aidPeer = (peerId: string) => {
      setGameState(prev => {
          if (!prev) return null;
          const peerIndex = prev.peers.findIndex(p => p.id === peerId);
          if (peerIndex === -1) return prev;
          
          const peers = [...prev.peers];
          peers[peerIndex] = { ...peers[peerIndex], heat: Math.max(0, peers[peerIndex].heat - 30), needsHelp: false, status: 'HACKING', activity: 'Heat flushed by user.' };
          
          return {
              ...prev,
              peers,
              cash: prev.cash + 50,
              logs: [...prev.logs, { id: Date.now(), timestamp: "NETWORK", message: `Assisted ${peers[peerIndex].name}. Reward: 50C`, type: 'success' } as LogEntry].slice(-50)
          };
      });
  };

  const buyUpgrade = (upgradeId: string) => {
    setGameState(prev => {
        if(!prev) return null;
        let priceMult = prev.economyState === 'BOOM' ? 1.2 : prev.economyState === 'RECESSION' ? 0.9 : 1;
        const upgradeIndex = prev.upgrades.findIndex(u => u.id === upgradeId);
        if (upgradeIndex === -1) return prev;
        
        const barterMod = 1 - (prev.skills.Barter * 0.01);
        const upgrade = prev.upgrades[upgradeIndex];
        const cost = Math.floor((upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.owned)) * barterMod * priceMult);

        if (prev.cash >= cost) {
            const newUpgrades = [...prev.upgrades];
            newUpgrades[upgradeIndex] = { ...upgrade, owned: upgrade.owned + 1 };
            return { ...prev, cash: prev.cash - cost, upgrades: newUpgrades, logs: [...prev.logs, { id: Date.now(), timestamp: "SHOP", message: `Bought ${upgrade.name}.`, type: 'info' } as LogEntry].slice(-50) };
        }
        return prev;
    });
  };

  const buySoftware = (swId: string) => {
    setGameState(prev => {
        if(!prev) return null;
        let priceMult = prev.economyState === 'BOOM' ? 1.2 : prev.economyState === 'RECESSION' ? 0.9 : 1;
        const swIndex = prev.software.findIndex(s => s.id === swId);
        if (swIndex === -1) return prev;
        
        const barterMod = 1 - (prev.skills.Barter * 0.01);
        const sw = prev.software[swIndex];
        const cost = Math.floor((sw.baseCost * Math.pow(sw.costMultiplier, sw.owned)) * barterMod * priceMult);

        if (prev.cash >= cost) {
            const newSW = [...prev.software];
            newSW[swIndex] = { ...sw, owned: sw.owned + 1 };
            return { ...prev, cash: prev.cash - cost, software: newSW, logs: [...prev.logs, { id: Date.now(), timestamp: "SHOP", message: `Compiled ${sw.name}.`, type: 'info' } as LogEntry].slice(-50) };
        }
        return prev;
    });
  };
  
  const buyConsumable = (itemId: string) => {
      setGameState(prev => {
          if(!prev) return null;
          const item = CONSUMABLES.find(c => c.id === itemId);
          if (!item) return prev;
          if ((prev.shopStock[itemId] || 0) <= 0) return prev;

          let priceMult = prev.economyState === 'BOOM' ? 1.2 : prev.economyState === 'RECESSION' ? 0.9 : 1;
          const barterMod = 1 - (prev.skills.Barter * 0.01);
          const cost = Math.floor(item.baseCost * priceMult * barterMod);
          
          if (prev.cash >= cost) {
              const newInv = { ...prev.inventory };
              newInv[itemId] = (newInv[itemId] || 0) + 1;
              const newStock = { ...prev.shopStock };
              newStock[itemId] -= 1;
              return { ...prev, cash: prev.cash - cost, inventory: newInv, shopStock: newStock, logs: [...prev.logs, { id: Date.now(), timestamp: "SHOP", message: `Purchased ${item.name}.`, type: 'info' } as LogEntry].slice(-50) };
          }
          return prev;
      });
  };

  const useConsumable = (itemId: string) => {
      setGameState(prev => {
          if (!prev) return null;
          const count = prev.inventory[itemId] || 0;
          if (count <= 0) return prev;
          const item = CONSUMABLES.find(c => c.id === itemId);
          if (!item) return prev;

          const newInv = { ...prev.inventory, [itemId]: count - 1 };
          let newHeat = prev.heat;
          let newPlayerRadiation = prev.playerRadiation;
          let newMutations = [...prev.mutations];
          let newActiveEffects = [...prev.activeEffects];

          if (item.effects.heat) newHeat = Math.max(0, newHeat + item.effects.heat);
          if (item.effects.rads) newPlayerRadiation = Math.max(0, newPlayerRadiation + item.effects.rads);
          if (item.id === 'c10') { 
              const availableMutations = MUTATIONS.filter(m => !newMutations.includes(m.id));
              if (availableMutations.length > 0) {
                  const newMut = availableMutations[Math.floor(Math.random() * availableMutations.length)];
                  newMutations.push(newMut.id);
              }
          }
          if (item.duration > 0) {
              newActiveEffects.push({ id: `eff-${Date.now()}`, name: item.name, expiresAt: prev.gameTime + item.duration, sourceId: item.id, effects: item.effects });
          }
          return {
              ...prev,
              inventory: newInv,
              heat: newHeat,
              playerRadiation: newPlayerRadiation,
              mutations: newMutations,
              activeEffects: newActiveEffects,
              logs: [...prev.logs, { id: Date.now(), timestamp: "ITEM", message: `Used ${item.name}.`, type: 'success' } as LogEntry].slice(-50)
          };
      });
  };

  const buyStock = (corpCode: string, amount: number) => {
      setGameState(prev => {
          if(!prev) return null;
          const corp = prev.corporations[corpCode];
          if (!corp) return prev;
          const cost = Math.ceil(corp.stockPrice * amount);
          if (prev.cash >= cost) {
              const newCorps = { ...prev.corporations, [corpCode]: { ...corp, ownedShares: corp.ownedShares + amount } };
              return { ...prev, cash: prev.cash - cost, corporations: newCorps, logs: [...prev.logs, { id: Date.now(), timestamp: "MARKET", message: `Bought ${amount} shares of ${corp.name}.`, type: 'info' } as LogEntry].slice(-50) };
          }
          return prev;
      });
  };

  const sellStock = (corpCode: string, amount: number) => {
      setGameState(prev => {
          if(!prev) return null;
          const corp = prev.corporations[corpCode];
          if (!corp || corp.ownedShares < amount) return prev;
          const value = Math.floor(corp.stockPrice * amount);
          const newCorps = { ...prev.corporations, [corpCode]: { ...corp, ownedShares: corp.ownedShares - amount } };
          return { ...prev, cash: prev.cash + value, corporations: newCorps, logs: [...prev.logs, { id: Date.now(), timestamp: "MARKET", message: `Sold ${amount} shares of ${corp.name}.`, type: 'info' } as LogEntry].slice(-50) };
      });
  };

  const toggleAutoBuy = (type: 'HARDWARE' | 'SOFTWARE' | 'AID') => {
      setGameState(prev => {
          if(!prev) return null;
          if (type === 'HARDWARE') return { ...prev, autoBuyHardware: !prev.autoBuyHardware };
          if (type === 'SOFTWARE') return { ...prev, autoBuySoftware: !prev.autoBuySoftware };
          if (type === 'AID') return { ...prev, autoBuyConsumables: !prev.autoBuyConsumables };
          return prev;
      });
  };
  
  const setLifestyle = (level: number) => {
      setGameState(prev => {
          if (!prev) return null;
          const config = LIFESTYLE_CONFIG.find(l => l.level === level);
          if (!config) return prev;
          
          return {
              ...prev,
              lifestyleLevel: level,
              logs: [...prev.logs, { 
                  id: Date.now(), 
                  timestamp: "LIFESTYLE", 
                  message: `Relocated to ${config.name}. Daily expenses updated.`, 
                  type: 'info' 
              } as LogEntry].slice(-50)
          };
      });
  };

  const spendPoint = (type: 'SPECIAL' | 'SKILL', key: string) => {
      setGameState(prev => {
          if(!prev || prev.upgradePoints <= 0) return prev;
          if (type === 'SPECIAL') {
             const attr = key as keyof Special;
             if (prev.special[attr] >= 10) return prev;
             return { ...prev, upgradePoints: prev.upgradePoints - 1, special: { ...prev.special, [attr]: prev.special[attr] + 1 } };
          } else {
              const skill = key as SkillName;
              if (prev.skills[skill] >= 100) return prev;
              return { ...prev, upgradePoints: prev.upgradePoints - 1, skills: { ...prev.skills, [skill]: prev.skills[skill] + 5 } };
          }
      });
  };
  
  const setUiColor = (color: string) => {
      setGameState(prev => prev ? { ...prev, uiColor: color } : null);
  };

  const setGameSpeed = (speed: number) => {
      setGameState(prev => prev ? { ...prev, gameSpeed: speed } : null);
  };

  const handleCommand = (cmd: string) => {
      if (!gameState) return;
      const clean = cmd.trim().toLowerCase();
      addLog(`> ${cmd}`, 'info');
      
      if (clean === 'help') {
          addLog('AVAILABLE COMMANDS: STATUS, CLEAR, WHOAMI, TARGET, UPGRADE, EXIT', 'system');
      } else if (clean === 'status') {
          addLog(`HEAT: ${gameState.heat}% | CASH: ${gameState.cash} | RADS: ${gameState.playerRadiation}`, 'info');
      } else if (clean === 'clear') {
          setGameState(prev => prev ? ({...prev, logs: []}) : null);
      } else if (clean === 'whoami') {
          addLog(`USER: ${gameState.playerName} | LEVEL: ${gameState.level} | JOB: ${gameState.job?.title}`, 'info');
      } else if (clean === 'target') {
          addLog(`CURRENT TARGET: ${gameState.currentTarget.company} [DIFF: ${gameState.currentTarget.difficulty}]`, 'info');
      } else if (clean === 'upgrade') {
          if (gameState.upgradePoints > 0) addLog(`POINTS AVAILABLE: ${gameState.upgradePoints}. SPEND IN LEFT PANEL.`, 'success');
          else addLog('NO UPGRADE POINTS AVAILABLE.', 'warning');
      } else if (clean === 'exit') {
          addLog('LOGOUT SEQUENCE INITIATED... ERROR: LINK LOCKED BY ADMIN.', 'error');
      } else {
          addLog('COMMAND NOT RECOGNIZED.', 'error');
      }
  };

  const handleMouseEnter = (title: string, body: string) => setHoverInfo({ title, body });
  const handleMouseLeave = () => setHoverInfo(null);

  if (!gameState) return <CharacterCreation onSelect={handleJobSelect} onLoad={loadGame} onImport={importSave} hasLocalSave={hasLocalSave} />;

  return (
    <div className="flex flex-col h-screen w-screen p-1 bg-black overflow-hidden transition-colors duration-500" style={{ color: gameState.uiColor }}>
      
      {/* Tooltip Overlay */}
      {hoverInfo && (
          <div className="fixed z-50 pointer-events-none bg-black border-2 p-2 max-w-xs shadow-lg" style={{ borderColor: gameState.uiColor, left: '50%', top: '50%', transform: 'translate(-50%, -50%)'}}>
              <div className="font-bold text-sm mb-1 border-b opacity-80" style={{ borderColor: gameState.uiColor }}>{hoverInfo.title}</div>
              <div className="text-xs opacity-90 whitespace-pre-wrap">{hoverInfo.body}</div>
          </div>
      )}

      {/* NEWS TICKER (TOP) */}
      <div className="w-full bg-black h-5 flex items-center overflow-hidden z-40 border-b shrink-0 mb-1" style={{ borderColor: gameState.uiColor, color: gameState.uiColor }}>
           <div className="whitespace-nowrap animate-[marquee_20s_linear_infinite] px-4 font-bold text-xs uppercase flex items-center gap-8">
               <Globe size={10} />
               <span>BREAKING NEWS: {PRE_WAR_NEWS[currentNewsIndex]}</span>
               <Globe size={10} />
               <span>{PRE_WAR_NEWS[(currentNewsIndex + 1) % PRE_WAR_NEWS.length]}</span>
           </div>
      </div>

      <div className="flex-1 flex flex-col gap-1 min-h-0 relative">
        
        {/* Top Section: Panels */}
        <div className={`flex-1 flex gap-1 min-h-0 ${mobileTab === 'VISUAL' ? 'hidden md:flex' : 'flex'}`}>
            
            {/* Left Panel: Stats */}
            <div className={`w-full md:w-60 shrink-0 flex flex-col ${mobileTab === 'STATUS' ? 'flex' : 'hidden md:flex'}`}>
                <LeftPanel 
                    gameState={gameState} 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab} 
                    spendPoint={spendPoint} 
                />
            </div>

            {/* Center Panel: Terminal */}
            <div className={`flex-1 flex flex-col min-w-0 ${mobileTab === 'TERMINAL' ? 'flex' : 'hidden md:flex'}`}>
                <CenterPanel 
                    gameState={gameState} 
                    activeCenterTab={activeCenterTab} 
                    setActiveCenterTab={setActiveCenterTab}
                    handleMouseEnter={handleMouseEnter}
                    handleMouseLeave={handleMouseLeave}
                    onCommand={handleCommand}
                    onAid={aidPeer}
                />
            </div>

            {/* Right Panel: Shop */}
            <div className={`w-full md:w-60 shrink-0 flex flex-col ${mobileTab === 'SUPPLY' ? 'flex' : 'hidden md:flex'}`}>
                <RightPanel 
                    gameState={gameState} 
                    activeShopTab={activeShopTab} 
                    setActiveShopTab={setActiveShopTab}
                    handlers={{
                        buyUpgrade, buySoftware, buyConsumable, useConsumable, buyStock, sellStock, toggleAutoBuy, setUiColor, setGameSpeed,
                        setLifestyle
                    }}
                />
            </div>
        </div>

        {/* Bottom Section: Full Width Matrix */}
        <div className={`shrink-0 ${mobileTab === 'VISUAL' ? 'flex-1 h-full' : 'hidden md:block md:h-48'} transition-all`}>
            <MitreMatrix 
                gameState={gameState} 
                handleMouseEnter={handleMouseEnter} 
                handleMouseLeave={handleMouseLeave} 
            />
        </div>

      </div>

      {/* MOBILE NAVIGATION BAR (BOTTOM) */}
      <div className="md:hidden h-12 border-t mt-1 flex shrink-0 bg-black z-50" style={{ borderColor: gameState.uiColor }}>
           <button 
               onClick={() => setMobileTab('STATUS')} 
               className={`flex-1 flex flex-col items-center justify-center gap-1 border-r ${mobileTab === 'STATUS' ? 'bg-current text-black' : 'text-current'}`}
               style={{ borderColor: gameState.uiColor }}
           >
               <LayoutDashboard size={16} />
               <span className="text-[9px] font-bold">STATUS</span>
           </button>
           <button 
               onClick={() => setMobileTab('TERMINAL')} 
               className={`flex-1 flex flex-col items-center justify-center gap-1 border-r ${mobileTab === 'TERMINAL' ? 'bg-current text-black' : 'text-current'}`}
               style={{ borderColor: gameState.uiColor }}
           >
               <Terminal size={16} />
               <span className="text-[9px] font-bold">TERM</span>
           </button>
           <button 
               onClick={() => setMobileTab('SUPPLY')} 
               className={`flex-1 flex flex-col items-center justify-center gap-1 border-r ${mobileTab === 'SUPPLY' ? 'bg-current text-black' : 'text-current'}`}
               style={{ borderColor: gameState.uiColor }}
           >
               <ShoppingCart size={16} />
               <span className="text-[9px] font-bold">SUPPLY</span>
           </button>
           <button 
               onClick={() => setMobileTab('VISUAL')} 
               className={`flex-1 flex flex-col items-center justify-center gap-1 ${mobileTab === 'VISUAL' ? 'bg-current text-black' : 'text-current'}`}
           >
               <Map size={16} />
               <span className="text-[9px] font-bold">MAP</span>
           </button>
      </div>

    </div>
  );
};

export default App;