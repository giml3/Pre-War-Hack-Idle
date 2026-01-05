import React, { useState, useEffect, useCallback, useRef } from 'react';
import CharacterCreation from './components/CharacterCreation';
import TerminalLog from './components/TerminalLog';
import { INITIAL_JOBS, INITIAL_UPGRADES, INITIAL_UNLOCKABLES, INITIAL_SOFTWARE, LEVEL_THRESHOLDS, KILL_CHAIN_PHASES, VAULT_LAYOUT, SKILL_DEFINITIONS, PRE_WAR_NEWS, THREAT_CONFIG, LIFESTYLE_CONFIG, STOCK_MARKET_COMPANIES, TARGET_REGISTRY, TECHNIQUE_DETAILS, CORPORATE_LADDER, SPECIAL_TOOLTIPS, FACTION_DEFINITIONS, INITIAL_ACHIEVEMENTS, LORE_TIMELINE, SOFTWARE_TOOLTIPS, CONSUMABLES, MUTATIONS } from './constants';
import { GameState, Job, LogEntry, Target, SkillName, Special, CorpData, PlayerActivity, EconomyState, Bounty, Faction, Achievement, Message, Consumable, Mutation, ActiveEffect } from './types';
import { 
  Shield, Cpu, HardDrive, Wifi, Brain, Disc, Target as TargetIcon,
  Coins, Box, Thermometer, AlertTriangle, PlusCircle, ArrowUp,
  DoorOpen, Coffee, Zap, Monitor, Moon, Play, FastForward, SkipForward, Edit2, Save,
  Briefcase, Globe, Calendar, Clock, Skull, Eye, TrendingUp, TrendingDown, DollarSign, Activity,
  Key, Settings, Download, BarChart2, Home, Crosshair, Coffee as CoffeeIcon, Mail, Radiation, Trophy, Database, FileOutput, Upload, Syringe, Dna, FlaskConical, Pill
} from 'lucide-react';

const ROOM_ICON_MAP: Record<string, React.ElementType> = {
    'entrance': DoorOpen,
    'living': Coffee,
    'utility': Zap,
    'command': Monitor
};

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

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [activeTab, setActiveTab] = useState<'SPECIAL' | 'SKILLS' | 'INTEL' | 'FACTIONS'>('SPECIAL');
  const [activeShopTab, setActiveShopTab] = useState<'HARDWARE' | 'SOFTWARE' | 'MARKET' | 'SYSTEM' | 'AID'>('HARDWARE');
  const [activeCenterTab, setActiveCenterTab] = useState<'TERMINAL' | 'INBOX' | 'DATABASE'>('TERMINAL');
  
  // UI State
  const [highlightedTechnique, setHighlightedTechnique] = useState<string | null>(null);
  const [hoverInfo, setHoverInfo] = useState<{title: string, body: string} | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
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
      
      // Check for local save on mount
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) setHasLocalSave(true);

      return () => clearInterval(interval);
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

  const exportSave = () => {
      if (stateRef.current) {
          try {
              const json = JSON.stringify(stateRef.current);
              const hash = btoa(json);
              navigator.clipboard.writeText(hash).then(() => {
                  addLog("NEURAL LINK EXPORTED TO CLIPBOARD.", 'success');
              });
          } catch (e) {
              addLog("EXPORT FAILED.", 'error');
          }
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

  const handleJobSelect = (job: Job) => {
    const skills: Record<SkillName, number> = {
        Science: 0, Lockpick: 0, Sneak: 0, Barter: 0, Speech: 0, Repair: 0
    };
    Object.entries(job.initialSkills).forEach(([key, val]) => {
        if(key && typeof val === 'number') skills[key as SkillName] = val;
    });

    const initialVaultLevels: Record<string, number> = {};
    VAULT_LAYOUT.forEach(r => initialVaultLevels[r.id] = 0);

    // Init Corporations & Factions
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

    const startDate = new Date('2075-04-12T06:00:00').getTime();
    const initialBounties = [generateBounty(startDate, 1), generateBounty(startDate, 1)];

    // Initial Welcome Message
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
      logs: [],
      messages: [welcomeMsg],
      achievements: INITIAL_ACHIEVEMENTS,
      totalHacks: 0,
      techniqueCounts: {},
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
      globalRadiation: 15, // Starts at 15%
      uiColor: '#ffb000',
      tutorialStep: 1,
      inventory: {},
      activeEffects: [],
      mutations: [],
      playerRadiation: 0,
      addictions: []
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

  const getOrgChart = useCallback(() => {
    if (!gameState) return "";
    return CORPORATE_LADDER.map((title, idx) => {
        const level = idx + 1;
        const isCurrent = gameState.jobLevel === level;
        return `${isCurrent ? '>> ' : '   '}Grade ${level}: ${title}${isCurrent ? ' <<' : ''}`;
    }).join('\n');
  }, [gameState?.jobLevel]);

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
        // Radiation Drift
        if (Math.random() > 0.7) {
            radiationChange += 0.5;
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

    // Player Radiation Accumulation
    if (activity !== 'DOWNTIME' && Math.random() > 0.5) {
        const radExposure = Math.max(1, currentState.globalRadiation / 10);
        playerRadChange += radExposure;
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
             if (effect.effects.xp) cashMult += effect.effects.xp; // Using XP field for general yield buff in this simplified logic
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
        
        // Effective SPECIAL (Effects not implemented fully to modify base stats in this loop for simplicity, direct stat mods applied where checked)
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
        let newTarget = prev.currentTarget;
        let newXp = prev.xp;
        let newLevel = prev.level;
        let newUpgradePoints = prev.upgradePoints;
        let newPerkPoints = prev.perkPoints;
        let newUnlockables = prev.unlockables;
        let newAchievements = [...prev.achievements];
        let newMutations = [...prev.mutations];

        // Mutation Check
        const radThresholds = [200, 400, 600, 800];
        const currentThresholdIdx = radThresholds.findIndex(t => newPlayerRadiation < t); // -1 if > 800
        const prevThresholdIdx = radThresholds.findIndex(t => prev.playerRadiation < t);
        
        // Simple logic: If we crossed a 200 rad boundary upwards
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

        // --- HACKING EXECUTION ---
        if (activity === 'HACKING' && prev.isAutoHacking) {
            
            // Auto Buy
            if (prev.autoBuyHardware) {
                 let priceMult = 1;
                 if (economyState === 'BOOM') priceMult = 1.2;
                 if (economyState === 'RECESSION') priceMult = 0.9;

                 const affordableUpgrade = prev.upgrades
                    .map((u, idx) => ({ ...u, idx, cost: Math.floor((u.baseCost * Math.pow(u.costMultiplier, u.owned)) * (1 - prev.skills.Barter * 0.01) * priceMult) }))
                    .filter(u => u.cost <= currentCash)
                    .sort((a, b) => a.cost - b.cost)[0];

                if (affordableUpgrade) {
                    const upgrades = [...prev.upgrades];
                    upgrades[affordableUpgrade.idx] = { ...upgrades[affordableUpgrade.idx], owned: upgrades[affordableUpgrade.idx].owned + 1 };
                    currentCash -= affordableUpgrade.cost;
                    logsToAdd.push({ id: Date.now(), timestamp: "SHOP", message: `Auto-Bought ${affordableUpgrade.name}.`, type: 'info' });
                    prev.upgrades = upgrades; 
                }
            }

            const swHeatBonus = prev.software.filter(s => s.bonus.stat === 'HEAT').reduce((acc, s) => acc + (s.bonus.value * s.owned), 0);
            let lifestyleHeatDecay = 0;
            if (lifestyleConfig.level >= 4) lifestyleHeatDecay = 0.5;
            if (lifestyleConfig.level >= 6) lifestyleHeatDecay = 1.0;

            let heatDecay = ((prev.special.A * 0.05) + swHeatBonus + lifestyleHeatDecay);
            // Apply Mutation Bonuses to Heat Decay implicitly via heatGenMult if needed, but here we treat it as resistance
            if (heatGenMult < 1) heatDecay = heatDecay * (2 - heatGenMult); // Rough approximation

            newHeat = Math.max(0, newHeat - heatDecay);

            if (newHeat >= 100) {
                 const endurance = prev.special.E;
                 const downtimeMs = Math.max(5000, 30000 - (endurance * 2000));
                 logsToAdd.push({ id: Date.now(), timestamp: "SYS", message: "CRITICAL HEAT. LOCKOUT.", type: 'error' });
                 
                 // Achievement
                 if (!newAchievements.find(a => a.id === 'a3')?.unlocked) {
                     newAchievements = newAchievements.map(a => a.id === 'a3' ? { ...a, unlocked: true } : a);
                     logsToAdd.push({ id: Date.now(), timestamp: "ACHIEVEMENT", message: "Unlocked: Meltdown", type: 'success' });
                 }

                 return { ...prev, gameTime: newTime, currentActivity: activity, heat: 100, isDowntime: true, downtimeEndTime: Date.now() + downtimeMs, logs: [...prev.logs, ...logsToAdd].slice(-50), achievements: newAchievements };
            }

            newProgress += speed;

             // --- DICE ROLL MECHANIC ---
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
                 setHighlightedTechnique(randomTech);
                 if (matrixTimeoutRef.current) clearTimeout(matrixTimeoutRef.current);
                 matrixTimeoutRef.current = setTimeout(() => setHighlightedTechnique(null), 500);
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

                // Reputation Update (Simplistic for now)
                // In future: Map generic targets to specific factions to update faction rep

                // BOUNTY CHECK
                const matchingBountyIdx = newBounties.findIndex(b => b.targetCorp === prev.currentTarget.company);
                if (matchingBountyIdx > -1) {
                    const bounty = newBounties[matchingBountyIdx];
                    currentCash += bounty.reward;
                    logsToAdd.push({ id: Date.now(), timestamp: "CONTRACT", message: `Bounty Complete: ${bounty.description}. Reward: ${bounty.reward}`, type: 'success' });
                    newBounties.splice(matchingBountyIdx, 1);
                }

                // Level Up Logic
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
                
                // First Hack Achievement
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

                logsToAdd.push({
                    id: Date.now(),
                    timestamp: "ROOT",
                    message: `Access Granted: ${prev.currentTarget.company}.`,
                    type: 'success'
                });
                
                newProgress = 0;
                newTarget = getRandomTarget();
                newHeat = Math.max(0, newHeat - 20);
                newTechniqueCounts = {};
                lastPhaseRef.current = -1;
            }
        }

        // Radiation Achievement
        if (newGlobalRadiation >= 50 && !newAchievements.find(a => a.id === 'a6')?.unlocked) {
             newAchievements = newAchievements.map(a => a.id === 'a6' ? { ...a, unlocked: true } : a);
             logsToAdd.push({ id: Date.now(), timestamp: "ACHIEVEMENT", message: "Unlocked: Glowing Sea", type: 'success' });
        }
        
        // Millionaire Achievement
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
            mutations: newMutations
        };
    });

  }, []);

  useEffect(() => {
    if (!gameState) return;
    const interval = setInterval(updateGame, 250); 
    return () => clearInterval(interval);
  }, [gameState ? true : false, updateGame]); 


  const buyUpgrade = (upgradeId: string) => {
    setGameState(prev => {
        if(!prev) return null;
        let priceMult = 1;
        if (prev.economyState === 'BOOM') priceMult = 1.2;
        if (prev.economyState === 'RECESSION') priceMult = 0.9;

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
        let priceMult = 1;
        if (prev.economyState === 'BOOM') priceMult = 1.2;
        if (prev.economyState === 'RECESSION') priceMult = 0.9;

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
          
          let priceMult = 1;
          if (prev.economyState === 'BOOM') priceMult = 1.2;
          if (prev.economyState === 'RECESSION') priceMult = 0.9;
          const barterMod = 1 - (prev.skills.Barter * 0.01);
          const cost = Math.floor(item.baseCost * priceMult * barterMod);
          
          if (prev.cash >= cost) {
              const newInv = { ...prev.inventory };
              newInv[itemId] = (newInv[itemId] || 0) + 1;
              return { ...prev, cash: prev.cash - cost, inventory: newInv, logs: [...prev.logs, { id: Date.now(), timestamp: "SHOP", message: `Purchased ${item.name}.`, type: 'info' } as LogEntry].slice(-50) };
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

          // Instant Effects
          if (item.effects.heat) newHeat = Math.max(0, newHeat + item.effects.heat);
          if (item.effects.rads) newPlayerRadiation = Math.max(0, newPlayerRadiation + item.effects.rads);

          // Special Cases
          if (item.id === 'c8' || item.id === 'c13') { // Fixer / Addictol
              // Clear addictions (not fully implemented in state logic for brevity, but let's clear the array)
             // prev.addictions = []; 
          }
          if (item.id === 'c10') { // Mutagenic Serum
              const availableMutations = MUTATIONS.filter(m => !newMutations.includes(m.id));
              if (availableMutations.length > 0) {
                  const newMut = availableMutations[Math.floor(Math.random() * availableMutations.length)];
                  newMutations.push(newMut.id);
              }
          }

          // Timed Effects
          if (item.duration > 0) {
              newActiveEffects.push({
                  id: `eff-${Date.now()}`,
                  name: item.name,
                  expiresAt: prev.gameTime + item.duration,
                  sourceId: item.id,
                  effects: item.effects
              });
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
          const maxShares = prev.level * 10;
          if (corp.ownedShares + amount > maxShares) return prev; // Limit
          if (prev.cash >= cost) {
              const newCorps = { ...prev.corporations, [corpCode]: { ...corp, ownedShares: corp.ownedShares + amount } };
              
              // Market Mover Achievement
              let newAchievements = prev.achievements;
              if (corp.ownedShares + amount >= 100 && !newAchievements.find(a => a.id === 'a2')?.unlocked) {
                  newAchievements = newAchievements.map(a => a.id === 'a2' ? { ...a, unlocked: true } : a);
              }

              return { ...prev, cash: prev.cash - cost, corporations: newCorps, logs: [...prev.logs, { id: Date.now(), timestamp: "MARKET", message: `Bought ${amount} shares of ${corp.name}.`, type: 'info' } as LogEntry].slice(-50), achievements: newAchievements };
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

  const upgradeVaultRoom = (roomId: string) => {
    setGameState(prev => {
        if(!prev) return null;
        const room = VAULT_LAYOUT.find(r => r.id === roomId);
        if (!room) return prev;
        const currentLevel = prev.vaultLevels[roomId] || 0;
        const cost = Math.floor(room.baseCost * Math.pow(1.5, currentLevel));
        if (prev.cash >= cost && prev.level >= room.unlockLevel) {
            return {
                ...prev,
                cash: prev.cash - cost,
                vaultLevels: { ...prev.vaultLevels, [roomId]: currentLevel + 1 },
                logs: [...prev.logs, { id: Date.now(), timestamp: "VAULT", message: `Upgraded ${room.name}.`, type: 'info' } as LogEntry].slice(-50)
            };
        }
        return prev;
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

  const toggleColor = () => {
      setGameState(prev => {
          if(!prev) return null;
          const colors = ['#ffb000', '#00ff00', '#00ffff', '#ff3333', '#ffffff'];
          const idx = colors.indexOf(prev.uiColor);
          return { ...prev, uiColor: colors[(idx + 1) % colors.length] };
      });
  };

  const handleMouseEnter = (title: string, body: string) => setHoverInfo({ title, body });
  const handleMouseLeave = () => setHoverInfo(null);

  if (!gameState) return <CharacterCreation onSelect={handleJobSelect} onLoad={loadGame} onImport={importSave} hasLocalSave={hasLocalSave} />;

  const nextXpThreshold = LEVEL_THRESHOLDS[gameState.level] || 'MAX';
  const xpPercentage = typeof nextXpThreshold === 'number' ? Math.min(100, (gameState.xp / nextXpThreshold) * 100) : 100;
  const currentPhaseIndex = KILL_CHAIN_PHASES.reduce((found, phase, idx) => gameState.hackingProgress >= phase.threshold ? idx : found, 0);
  const currentPhase = KILL_CHAIN_PHASES[currentPhaseIndex];
  const dateInfo = getGameDate(gameState.gameTime);
  const currentThreat = THREAT_CONFIG.find(r => r.level === gameState.threatLevel) || THREAT_CONFIG[2];
  const currentLifestyle = LIFESTYLE_CONFIG.find(l => l.level === gameState.lifestyleLevel) || LIFESTYLE_CONFIG[0];

  const tutorialSteps = [
      "Welcome, Operator. Check your 'INTEL' tab to see active bounties.",
      "Monitor the 'TERMINAL' output. Your agents hack automatically.",
      "Use 'SUPPLY_CHAIN' to buy upgrades and software.",
      "Watch the 'HEAT' meter. High heat leads to lockout.",
      "Check the 'MARKET' to trade stocks in real-time."
  ];

  return (
    <div className="flex h-screen w-screen p-2 md:p-6 bg-black overflow-hidden transition-colors duration-500" style={{ color: gameState.uiColor }}>
      
      {/* Tooltip Overlay */}
      {hoverInfo && (
          <div className="fixed z-50 pointer-events-none bg-black border-2 p-3 max-w-sm shadow-lg" style={{ borderColor: gameState.uiColor, left: '50%', top: '50%', transform: 'translate(-50%, -50%)'}}>
              <div className="font-bold text-lg mb-1 border-b opacity-80" style={{ borderColor: gameState.uiColor }}>{hoverInfo.title}</div>
              <div className="text-sm opacity-90 whitespace-pre-wrap">{hoverInfo.body}</div>
          </div>
      )}

      {/* Tutorial Overlay */}
      {gameState.tutorialStep > 0 && gameState.tutorialStep <= tutorialSteps.length && (
          <div className="fixed top-20 right-4 md:right-20 z-50 bg-black border-2 p-4 max-w-[280px] md:max-w-xs shadow-lg" style={{ borderColor: gameState.uiColor }}>
              <div className="font-bold mb-2 text-sm md:text-base">TUTORIAL SEQUENCE ({gameState.tutorialStep}/{tutorialSteps.length})</div>
              <p className="mb-4 text-xs md:text-sm">{tutorialSteps[gameState.tutorialStep - 1]}</p>
              <button 
                onClick={() => setGameState(p => p ? {...p, tutorialStep: p.tutorialStep + 1} : null)}
                className="border px-2 py-1 text-xs md:text-sm hover:bg-white/10 w-full" style={{ borderColor: gameState.uiColor }}
              >
                  ACKNOWLEDGE
              </button>
          </div>
      )}

      {/* Info Panel */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl text-center pointer-events-none">
          {hoverInfo && (
               <div className="bg-black/90 border-t-2 p-2 shadow-lg" style={{ borderColor: gameState.uiColor }}>
                   <span className="font-bold uppercase mr-2 text-sm">[{hoverInfo.title}]</span>
               </div>
          )}
      </div>

      {/* NEWS TICKER */}
      <div className="fixed bottom-0 left-0 w-full bg-black h-8 flex items-center overflow-hidden z-50 border-t-2" style={{ borderColor: gameState.uiColor, color: gameState.uiColor }}>
           <div className="whitespace-nowrap animate-[marquee_20s_linear_infinite] px-4 font-bold text-base md:text-lg uppercase flex items-center gap-8">
               <Globe size={16} />
               <span>BREAKING NEWS: {PRE_WAR_NEWS[currentNewsIndex]}</span>
               <Globe size={16} />
               <span>{PRE_WAR_NEWS[(currentNewsIndex + 1) % PRE_WAR_NEWS.length]}</span>
           </div>
      </div>

      <div className="w-full h-full max-w-7xl mx-auto flex flex-col md:flex-row gap-4 pb-8 overflow-y-auto md:overflow-hidden">
        
        {/* Left Panel */}
        <div className="w-full md:w-1/4 flex flex-col gap-4 shrink-0 overflow-y-auto md:overflow-y-visible max-h-[30vh] md:h-full">
            {/* Reconstructed Left Panel Content */}
            <div className="border-2 p-3 space-y-2" style={{ borderColor: gameState.uiColor }}>
                <div className="flex justify-between items-center border-b pb-1 mb-2" style={{ borderColor: gameState.uiColor }}>
                    <span className="font-bold text-lg">{gameState.playerName}</span>
                    <span className="text-xs">LVL {gameState.level}</span>
                </div>
                
                <div className="space-y-1 text-sm font-mono">
                     <div className="flex justify-between"><span>XP</span><span>{gameState.xp}/{nextXpThreshold} ({Math.floor(xpPercentage)}%)</span></div>
                     <div className="w-full h-1 bg-gray-900"><div className="h-full bg-current" style={{ width: `${xpPercentage}%` }}></div></div>
                     
                     <div className="flex justify-between mt-2"><span>HEAT</span><span>{Math.floor(gameState.heat)}%</span></div>
                     <div className="w-full h-1 bg-gray-900"><div className="h-full" style={{ width: `${gameState.heat}%`, backgroundColor: gameState.heat > 80 ? 'red' : 'currentColor' }}></div></div>

                     <div className="flex justify-between mt-2"><span>RADS</span><span>{Math.floor(gameState.playerRadiation/10)}%</span></div>
                     <div className="w-full h-1 bg-gray-900"><div className="h-full bg-green-500" style={{ width: `${gameState.playerRadiation/10}%` }}></div></div>

                     <div className="flex justify-between mt-2 font-bold"><span>CASH</span><span>{gameState.cash} CAPS</span></div>
                </div>
            </div>

            {/* Navigation Tabs */}
             <div className="grid grid-cols-2 gap-2">
                  {(['SPECIAL', 'SKILLS', 'INTEL', 'FACTIONS'] as const).map(tab => (
                      <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)} 
                        className={`px-2 py-2 border text-sm font-bold transition-colors ${activeTab === tab ? 'bg-current text-black' : 'hover:bg-white/10'}`} 
                        style={{ borderColor: gameState.uiColor }}
                      >
                        {tab}
                      </button>
                  ))}
             </div>

             {/* Left Panel Content - Corrected with explicit types */}
             <div className="border-2 p-2 flex-1 overflow-y-auto min-h-[100px]" style={{ borderColor: gameState.uiColor }}>
                 {activeTab === 'SPECIAL' && Object.entries(gameState.special).map(([k,v]) => <div key={k} className="flex justify-between text-xs mb-1"><span>{k}</span><span>{v as number} {gameState.upgradePoints > 0 && (v as number) < 10 && <button onClick={() => spendPoint('SPECIAL', k)}>+</button>}</span></div>)}
                 {activeTab === 'SKILLS' && Object.entries(gameState.skills).map(([k,v]) => <div key={k} className="flex justify-between text-xs mb-1"><span>{k}</span><span>{v as number} {gameState.upgradePoints > 0 && (v as number) < 100 && <button onClick={() => spendPoint('SKILL', k)}>+</button>}</span></div>)}
                 {activeTab === 'INTEL' && gameState.activeBounties.map(b => <div key={b.id} className="text-xs border-b pb-1 mb-1">TARGET: {b.targetCorp} ({b.reward}C)</div>)}
                 {activeTab === 'FACTIONS' && Object.values(gameState.factions).map((f: Faction) => <div key={f.id} className="text-xs mb-1 flex justify-between"><span>{f.name}</span><span>{f.reputation}</span></div>)}
             </div>
        </div>

        {/* Right Panel - Main Content */}
        <div className="flex-1 flex flex-col border-2 h-full min-h-[50vh] relative" style={{ borderColor: gameState.uiColor }}>
             {/* Center Tabs */}
             <div className="flex border-b" style={{ borderColor: gameState.uiColor }}>
                 {(['TERMINAL', 'INBOX', 'DATABASE'] as const).map(tab => (
                      <button 
                        key={tab} 
                        onClick={() => setActiveCenterTab(tab)} 
                        className={`flex-1 py-2 font-bold text-sm ${activeCenterTab === tab ? 'bg-current text-black' : 'hover:bg-white/10'}`}
                      >
                          {tab}
                      </button>
                 ))}
             </div>

             {/* Content Area */}
             <div className="flex-1 overflow-hidden relative flex flex-col">
                 {activeCenterTab === 'TERMINAL' && <TerminalLog logs={gameState.logs} />}
                 {activeCenterTab === 'INBOX' && (
                     <div className="p-4 overflow-y-auto">
                         {gameState.messages.map(msg => (
                             <div key={msg.id} className="border-b py-2 mb-2" style={{ borderColor: gameState.uiColor }}>
                                 <div className="font-bold flex justify-between">
                                     <span>{msg.sender}</span>
                                     <span className="text-xs opacity-70">{msg.date}</span>
                                 </div>
                                 <div className="text-sm font-bold uppercase">{msg.subject}</div>
                                 <div className="text-sm mt-1 opacity-90">{msg.body}</div>
                             </div>
                         ))}
                     </div>
                 )}
                 {activeCenterTab === 'DATABASE' && (
                     <div className="p-4 flex items-center justify-center h-full opacity-50 italic">
                         ACCESS RESTRICTED. ENCRYPTION LEVEL TOO HIGH.
                     </div>
                 )}
             </div>
        </div>

        {/* Far Right Panel - Shop (Corrected with explicit types for MARKET) */}
        <div className="w-full md:w-1/4 flex flex-col gap-4 shrink-0 h-[30vh] md:h-full border-2 bg-black/90 p-2" style={{ borderColor: gameState.uiColor }}>
             <div className="text-sm font-bold bg-current text-black px-2 py-1 mb-2">SUPPLY CHAIN</div>
             
             <div className="flex flex-wrap gap-2 mb-2">
                 {(['HARDWARE', 'SOFTWARE', 'MARKET', 'AID'] as const).map(tab => (
                     <button 
                        key={tab} 
                        onClick={() => setActiveShopTab(tab)} 
                        className={`flex-1 py-2 px-1 text-xs font-bold border ${activeShopTab === tab ? 'bg-white/20 border-white' : 'border-gray-600 opacity-70'}`}
                        style={{ borderColor: activeShopTab === tab ? gameState.uiColor : undefined }}
                     >
                         {tab}
                     </button>
                 ))}
             </div>

             <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                 {activeShopTab === 'HARDWARE' && gameState.upgrades.map(u => (
                     <button key={u.id} onClick={() => buyUpgrade(u.id)} className="w-full border p-2 text-left text-xs hover:bg-white/10" style={{ borderColor: gameState.uiColor }}>
                         <div className="font-bold flex justify-between"><span>{u.name}</span><span>Lvl {u.owned}</span></div>
                         <div className="flex justify-between mt-1"><span>{Math.floor(u.baseCost * Math.pow(u.costMultiplier, u.owned))} C</span><span>+{(u.value * 100).toFixed(0)}%</span></div>
                     </button>
                 ))}

                 {activeShopTab === 'SOFTWARE' && gameState.software.map(s => (
                     <button key={s.id} onClick={() => buySoftware(s.id)} className="w-full border p-2 text-left text-xs hover:bg-white/10" style={{ borderColor: gameState.uiColor }}>
                        <div className="font-bold flex justify-between"><span>{s.name}</span><span>v{s.owned}.0</span></div>
                        <div className="flex justify-between mt-1"><span>{Math.floor(s.baseCost * Math.pow(s.costMultiplier, s.owned))} C</span><span>{s.type}</span></div>
                    </button>
                 ))}

                 {activeShopTab === 'AID' && CONSUMABLES.map(c => (
                     <div key={c.id} className="border p-2 text-xs" style={{ borderColor: gameState.uiColor }}>
                         <div className="flex justify-between font-bold"><span>{c.name}</span><span>x{gameState.inventory[c.id]||0}</span></div>
                         <div className="flex justify-between my-1 opacity-70"><span>Stock: {gameState.shopStock[c.id]||0}</span><span>{c.baseCost} C</span></div>
                         <div className="flex gap-1">
                             <button onClick={() => buyConsumable(c.id)} className="flex-1 border hover:bg-white/10">BUY</button>
                             <button onClick={() => useConsumable(c.id)} className="flex-1 border bg-white/10 hover:bg-white/20">USE</button>
                         </div>
                     </div>
                 ))}

                 {activeShopTab === 'MARKET' && Object.values(gameState.corporations).map((c: CorpData) => (
                     <div key={c.code} className="border p-2 text-xs" style={{ borderColor: gameState.uiColor }}>
                         <div className="flex justify-between font-bold"><span>{c.code}</span><span>{Math.floor(c.stockPrice)}C</span></div>
                         <div className="flex gap-1 mt-1">
                             <button onClick={() => sellStock(c.code, 1)} className="flex-1 border hover:bg-white/10">SELL</button>
                             <button onClick={() => buyStock(c.code, 1)} className="flex-1 border hover:bg-white/10">BUY</button>
                         </div>
                     </div>
                 ))}
             </div>
        </div>

      </div>
    </div>
  );
};

export default App;