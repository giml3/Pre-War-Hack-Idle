import React, { useState, useEffect, useCallback, useRef } from 'react';
import CharacterCreation from './components/CharacterCreation';
import TerminalLog from './components/TerminalLog';
import { INITIAL_JOBS, INITIAL_UPGRADES, INITIAL_UNLOCKABLES, INITIAL_SOFTWARE, LEVEL_THRESHOLDS, KILL_CHAIN_PHASES, VAULT_LAYOUT, SKILL_DEFINITIONS, PRE_WAR_NEWS, THREAT_CONFIG, LIFESTYLE_CONFIG, STOCK_MARKET_COMPANIES, TARGET_REGISTRY, TECHNIQUE_DETAILS, CORPORATE_LADDER, SPECIAL_TOOLTIPS, FACTION_DEFINITIONS, INITIAL_ACHIEVEMENTS, LORE_TIMELINE, SOFTWARE_TOOLTIPS } from './constants';
import { GameState, Job, LogEntry, Target, SkillName, Special, CorpData, PlayerActivity, EconomyState, Bounty, Faction, Achievement, Message } from './types';
import { 
  Shield, Cpu, HardDrive, Wifi, Brain, Disc, Target as TargetIcon,
  Coins, Box, Thermometer, AlertTriangle, PlusCircle, ArrowUp,
  DoorOpen, Coffee, Zap, Monitor, Moon, Play, FastForward, SkipForward, Edit2, Save,
  Briefcase, Globe, Calendar, Clock, Skull, Eye, TrendingUp, TrendingDown, DollarSign, Activity,
  Key, Settings, Download, BarChart2, Home, Crosshair, Coffee as CoffeeIcon, Mail, Radiation, Trophy, Database
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
  const [activeShopTab, setActiveShopTab] = useState<'HARDWARE' | 'SOFTWARE' | 'MARKET' | 'SYSTEM'>('HARDWARE');
  const [activeCenterTab, setActiveCenterTab] = useState<'TERMINAL' | 'INBOX' | 'DATABASE'>('TERMINAL');
  
  // UI State
  const [highlightedTechnique, setHighlightedTechnique] = useState<string | null>(null);
  const [hoverInfo, setHoverInfo] = useState<{title: string, body: string} | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

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
      tutorialStep: 1
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

    const cpuBonus = currentState.upgrades.find(u => u.type === 'CPU')?.value || 0;
    const cpuLevel = currentState.upgrades.find(u => u.type === 'CPU')?.owned || 0;
    const swSpeedBonus = currentState.software.filter(s => s.bonus.stat === 'SPEED').reduce((acc, s) => acc + (s.bonus.value * s.owned), 0);
    const powerPlantLevel = currentState.vaultLevels['v8'] || 0;
    const vaultSpeedBonus = powerPlantLevel * 0.1;
    const intMod = currentState.special.I * 0.1; 
    
    const baseSpeed = 0.05; 
    const speed = (baseSpeed + (cpuLevel * cpuBonus) + swSpeedBonus + vaultSpeedBonus) * (1 + intMod);

    setGameState(prev => {
        if(!prev) return null;
        
        let newProgress = prev.hackingProgress;
        let newHeat = Math.max(0, prev.heat + heatChange);
        let newRadiation = Math.min(100, Math.max(0, prev.globalRadiation + radiationChange));
        let currentCash = prev.cash + cashChange;
        let newTechniqueCounts = { ...prev.techniqueCounts };
        let newTarget = prev.currentTarget;
        let newXp = prev.xp;
        let newLevel = prev.level;
        let newUpgradePoints = prev.upgradePoints;
        let newPerkPoints = prev.perkPoints;
        let newUnlockables = prev.unlockables;
        let newAchievements = [...prev.achievements];

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

            newHeat = Math.max(0, newHeat - (prev.special.A * 0.05) - swHeatBonus - lifestyleHeatDecay);

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
                    const heatGen = (isCritFail ? 20 : 5) * threatConfig.heatMod;
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
                const isCrit = Math.random() < (luckCritChance + swCritBonus);
                const speechBonus = 1 + (prev.skills.Speech * 0.01);
                const swCashBonus = prev.software.filter(s => s.bonus.stat === 'CASH').reduce((acc, s) => acc + (s.bonus.value * s.owned), 0);
                const baseCash = (20 * prev.level) + prev.currentTarget.difficulty * 10 + swCashBonus;
                
                currentCash += Math.floor(baseCash * speechBonus * (isCrit ? 2 : 1) * threatConfig.multiplier);
                
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
        if (newRadiation >= 50 && !newAchievements.find(a => a.id === 'a6')?.unlocked) {
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
            globalRadiation: newRadiation,
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
            achievements: newAchievements
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

  if (!gameState) return <CharacterCreation onSelect={handleJobSelect} />;

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
          <div className="fixed top-20 right-20 z-50 bg-black border-2 p-4 max-w-xs shadow-lg animate-bounce" style={{ borderColor: gameState.uiColor }}>
              <div className="font-bold mb-2">TUTORIAL SEQUENCE ({gameState.tutorialStep}/{tutorialSteps.length})</div>
              <p className="mb-4">{tutorialSteps[gameState.tutorialStep - 1]}</p>
              <button 
                onClick={() => setGameState(p => p ? {...p, tutorialStep: p.tutorialStep + 1} : null)}
                className="border px-2 py-1 text-sm hover:bg-white/10 w-full" style={{ borderColor: gameState.uiColor }}
              >
                  ACKNOWLEDGE
              </button>
          </div>
      )}

      {/* Info Panel */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl text-center pointer-events-none">
          {hoverInfo && (
               <div className="bg-black/90 border-t-2 p-2 shadow-lg" style={{ borderColor: gameState.uiColor }}>
                   <span className="font-bold uppercase mr-2">[{hoverInfo.title}]</span>
               </div>
          )}
      </div>

      {/* NEWS TICKER */}
      <div className="fixed bottom-0 left-0 w-full bg-black h-8 flex items-center overflow-hidden z-50 border-t-2" style={{ borderColor: gameState.uiColor, color: gameState.uiColor }}>
           <div className="whitespace-nowrap animate-[marquee_20s_linear_infinite] px-4 font-bold text-lg uppercase flex items-center gap-8">
               <Globe size={16} />
               <span>BREAKING NEWS: {PRE_WAR_NEWS[currentNewsIndex]}</span>
               <Globe size={16} />
               <span>{PRE_WAR_NEWS[(currentNewsIndex + 1) % PRE_WAR_NEWS.length]}</span>
           </div>
      </div>

      <div className="w-full h-full max-w-7xl mx-auto flex flex-col md:flex-row gap-4 pb-8">
        
        {/* Left Panel */}
        <div className="w-full md:w-1/4 flex flex-col gap-4">
            
            {/* Header / Profile */}
            <div className="border-2 p-4 bg-black/80 backdrop-blur-sm relative shadow-lg" style={{ borderColor: gameState.uiColor }}>
                <div className="flex justify-between items-center border-b pb-2 mb-2 opacity-80" style={{ borderColor: gameState.uiColor }}>
                    {isEditingName ? (
                        <div className="flex items-center gap-2 w-full">
                            <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} className="bg-white/10 border text-inherit px-1 w-full text-sm font-bold uppercase" style={{ borderColor: gameState.uiColor }} autoFocus />
                            <button onClick={() => { if(tempName.trim()) setGameState(p => p ? {...p, playerName: tempName.trim()} : null); setIsEditingName(false); }}><Save size={16} /></button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 overflow-hidden">
                            <h1 className="text-xl font-bold uppercase truncate">{gameState.playerName}</h1>
                            <button onClick={() => { setTempName(gameState.playerName); setIsEditingName(true); }} className="opacity-50 hover:opacity-100"><Edit2 size={12} /></button>
                        </div>
                    )}
                    <div className="text-xs opacity-70 flex items-center gap-1 shrink-0"><Shield size={12} /> LVL {gameState.level}</div>
                </div>

                <div 
                    className="text-xs uppercase font-bold opacity-70 mb-2 cursor-help border border-transparent hover:border-current px-1 rounded transition-colors"
                    onMouseEnter={() => handleMouseEnter("Organizational Chart", getOrgChart())}
                    onMouseLeave={handleMouseLeave}
                >
                    Employed By: {gameState.employer}
                </div>
                 
                <div className="mb-2 p-2 bg-white/5 border flex flex-col gap-1" style={{ borderColor: gameState.uiColor }}>
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2"><Calendar size={14} /><span>{dateInfo.dateStr}</span></div>
                        <div className="flex items-center gap-2 font-mono font-bold"><Clock size={14} /><span>{dateInfo.timeStr}</span></div>
                    </div>
                    
                    {/* JOB & ECONOMY INDICATOR */}
                    <div className="flex justify-between items-center text-xs mt-1 border-t pt-1 opacity-80" style={{ borderColor: gameState.uiColor }}>
                        <div className="flex items-center gap-1">
                            <Briefcase size={12} />
                            <span>Grade {gameState.jobLevel}</span>
                        </div>
                        <div className={`flex items-center gap-1 font-bold ${gameState.economyState === 'BOOM' ? 'text-green-500' : gameState.economyState === 'RECESSION' ? 'text-red-500' : 'text-blue-400'}`}>
                            <BarChart2 size={12} />
                            <span>{gameState.economyState}</span>
                        </div>
                    </div>

                    <div className={`text-center font-bold text-xs uppercase border px-1 py-0.5 mt-1 ${gameState.currentActivity === 'HACKING' ? 'border-green-500 text-green-500' : gameState.currentActivity === 'JOB' ? 'border-red-500 text-red-500' : 'border-blue-500 text-blue-500'}`}>
                        {gameState.currentActivity === 'HACKING' && <span>Hacking Access Allowed</span>}
                        {gameState.currentActivity === 'JOB' && <span>Mandatory Shift (9-5)</span>}
                        {gameState.currentActivity === 'SLEEPING' && <span>Sleep Cycle</span>}
                    </div>
                </div>

                {/* Threat Controls */}
                <div className="mb-2">
                    <div className="flex justify-between text-[10px] uppercase font-bold mb-1">
                        <span>Threat Level</span>
                        <span className={currentThreat.color}>{currentThreat.label} (x{currentThreat.multiplier})</span>
                    </div>
                    <div className="flex gap-1 mb-2">
                        {THREAT_CONFIG.map((r) => (
                            <button 
                                key={r.level}
                                onClick={() => setGameState(prev => prev ? {...prev, threatLevel: r.level} : null)}
                                className={`flex-1 h-2 transition-all ${gameState.threatLevel >= r.level ? r.color.replace('text-', 'bg-') : 'bg-gray-800'}`}
                                onMouseEnter={() => handleMouseEnter(r.label, `${r.desc}\nRewards: x${r.multiplier}\nHeat: x${r.heatMod}`)}
                                onMouseLeave={handleMouseLeave}
                            />
                        ))}
                    </div>

                    {/* Lifestyle Slider */}
                    <div className="flex justify-between text-[10px] uppercase font-bold mb-1">
                        <span>Lifestyle Standard</span>
                        <span>{currentLifestyle.name}</span>
                    </div>
                    <div className="flex gap-1">
                        {LIFESTYLE_CONFIG.map((l) => (
                            <button 
                                key={l.level}
                                onClick={() => setGameState(prev => prev ? {...prev, lifestyleLevel: l.level} : null)}
                                className={`flex-1 h-2 transition-all ${gameState.lifestyleLevel >= l.level ? 'bg-current' : 'bg-gray-800'}`}
                                onMouseEnter={() => handleMouseEnter(l.name, `Cost: ${l.dailyCost} Caps/Day\nBuff: ${l.buff}\nXP Mult: x${l.xpMult}`)}
                                onMouseLeave={handleMouseLeave}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-1 mb-2">
                     <div className="flex justify-between gap-1">
                         <button className={`flex-1 flex justify-center py-1 border ${gameState.gameSpeed === 1 ? 'bg-current text-black' : 'hover:bg-white/10'}`} style={{ borderColor: gameState.uiColor }} onClick={() => setGameState(prev => prev ? {...prev, gameSpeed: 1} : null)}><Play size={14} /></button>
                         <button className={`flex-1 flex justify-center py-1 border ${gameState.gameSpeed === 50 ? 'bg-current text-black' : 'hover:bg-white/10'}`} style={{ borderColor: gameState.uiColor }} onClick={() => setGameState(prev => prev ? {...prev, gameSpeed: 50} : null)}><FastForward size={14} /></button>
                          <button className={`flex-1 flex justify-center py-1 border ${gameState.gameSpeed === 500 ? 'bg-current text-black' : 'hover:bg-white/10'}`} style={{ borderColor: gameState.uiColor }} onClick={() => setGameState(prev => prev ? {...prev, gameSpeed: 500} : null)}><SkipForward size={14} /></button>
                     </div>
                </div>

                 <div>
                    <div className="flex justify-between text-xs mb-1"><span>XP</span><span>{gameState.xp} / {nextXpThreshold}</span></div>
                    <div className="w-full h-2 bg-white/20 border opacity-50" style={{ borderColor: gameState.uiColor }}><div className="h-full bg-current transition-all duration-300" style={{ width: `${xpPercentage}%` }}></div></div>
                </div>
                <div className="mt-2 text-lg font-bold text-center border py-1 bg-white/5 flex items-center justify-center gap-2" style={{ borderColor: gameState.uiColor }}><Coins size={18} /> {gameState.cash.toLocaleString()} NKC</div>
            </div>

             {/* Heat Meter */}
             <div className="border-2 p-2 bg-black/80 relative" style={{ borderColor: gameState.uiColor }} onMouseEnter={() => handleMouseEnter("System Heat", "Heat increases when hacks fail. If it reaches 100%, system lockout occurs.")} onMouseLeave={handleMouseLeave}>
                 <div className="flex justify-between items-center text-xs mb-1">
                     <span className="flex items-center gap-1 font-bold text-red-500"><Thermometer size={12} /> HEAT</span>
                     <span className={gameState.heat > 80 ? 'text-red-500 animate-pulse font-bold' : ''}>{Math.floor(gameState.heat)}%</span>
                 </div>
                 <div className="w-full h-3 bg-red-900/20 border border-red-900/50"><div className={`h-full transition-all duration-500 ${gameState.heat > 80 ? 'bg-red-500' : 'bg-red-700'}`} style={{ width: `${gameState.heat}%` }}></div></div>
                 {gameState.isDowntime && (
                     <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-red-500 z-10 border border-red-500">
                         <AlertTriangle className="animate-bounce" />
                         <span className="text-xl font-bold tracking-widest">LOCKOUT</span>
                         <span className="text-xs">{Math.ceil((gameState.downtimeEndTime - Date.now()) / 1000)}s</span>
                     </div>
                 )}
             </div>

             {/* Radiation Meter */}
             <div className="border-2 p-2 bg-black/80 relative" style={{ borderColor: gameState.uiColor }} onMouseEnter={() => handleMouseEnter("Global Radiation Index", "Higher radiation = more instability. Increases chance of Stock Market chaos events and passive damage to hardware.")} onMouseLeave={handleMouseLeave}>
                 <div className="flex justify-between items-center text-xs mb-1">
                     <span className="flex items-center gap-1 font-bold text-green-400"><Radiation size={12} /> RADS</span>
                     <span className={gameState.globalRadiation > 50 ? 'text-green-400 animate-pulse font-bold' : 'text-green-600'}>{Math.floor(gameState.globalRadiation)}%</span>
                 </div>
                 <div className="w-full h-3 bg-green-900/20 border border-green-900/50"><div className="h-full bg-green-600 transition-all duration-500" style={{ width: `${gameState.globalRadiation}%` }}></div></div>
             </div>

            <div className="flex gap-2">
                <button onClick={() => setActiveTab('SPECIAL')} className={`flex-1 py-1 text-sm font-bold border ${activeTab === 'SPECIAL' ? 'bg-current text-black' : 'hover:bg-white/10'}`} style={{ borderColor: gameState.uiColor }}>S.P.E.C.I.A.L</button>
                <button onClick={() => setActiveTab('SKILLS')} className={`flex-1 py-1 text-sm font-bold border ${activeTab === 'SKILLS' ? 'bg-current text-black' : 'hover:bg-white/10'}`} style={{ borderColor: gameState.uiColor }}>SKILLS</button>
                <button onClick={() => setActiveTab('INTEL')} className={`flex-1 py-1 text-sm font-bold border ${activeTab === 'INTEL' ? 'bg-current text-black' : 'hover:bg-white/10'}`} style={{ borderColor: gameState.uiColor }}>INTEL</button>
                <button onClick={() => setActiveTab('FACTIONS')} className={`flex-1 py-1 text-sm font-bold border ${activeTab === 'FACTIONS' ? 'bg-current text-black' : 'hover:bg-white/10'}`} style={{ borderColor: gameState.uiColor }}>FACTIONS</button>
            </div>

            <div className="flex-1 border-2 p-4 bg-black/80 backdrop-blur-sm relative shadow-lg flex flex-col min-h-[200px] overflow-hidden" style={{ borderColor: gameState.uiColor }}>
                {gameState.upgradePoints > 0 && <div className="mb-2 text-center text-xs bg-current text-black font-bold animate-pulse">POINTS AVAILABLE: {gameState.upgradePoints}</div>}

                {activeTab === 'SPECIAL' && (
                    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin space-y-2">
                        {Object.entries(gameState.special).map(([key, val]) => {
                             const tooltip = SPECIAL_TOOLTIPS[key as keyof typeof SPECIAL_TOOLTIPS];
                             return (
                                <div key={key} className="flex items-center justify-between border-b pb-1 hover:bg-white/5 cursor-help" style={{ borderColor: `${gameState.uiColor}33` }} onMouseEnter={() => tooltip && handleMouseEnter(tooltip.title, tooltip.desc)} onMouseLeave={handleMouseLeave}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 flex items-center justify-center font-bold text-lg bg-white/10 border" style={{ borderColor: `${gameState.uiColor}50` }}>{key}</div>
                                    </div>
                                    <div className="flex items-center gap-2"><span className="font-mono text-xl">{val}</span>{gameState.upgradePoints > 0 && val < 10 && <button onClick={() => spendPoint('SPECIAL', key)} className="hover:text-white"><PlusCircle size={14} /></button>}</div>
                                </div>
                             );
                        })}
                    </div>
                )}
                {activeTab === 'SKILLS' && (
                    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin space-y-2">
                         {SKILL_DEFINITIONS.map(skill => (
                             <div key={skill.name} className="flex flex-col border-b pb-1 hover:bg-white/5 cursor-help" style={{ borderColor: `${gameState.uiColor}33` }} onMouseEnter={() => handleMouseEnter(`Skill: ${skill.name}`, skill.description)} onMouseLeave={handleMouseLeave}>
                                 <div className="flex justify-between items-center">
                                    <span className="font-bold text-sm">{skill.name}</span>
                                    <div className="flex items-center gap-2"><span className="text-xs opacity-50">[{skill.attribute}]</span><span className="font-mono">{gameState.skills[skill.name]}</span>{gameState.upgradePoints > 0 && gameState.skills[skill.name] < 100 && <button onClick={() => spendPoint('SKILL', skill.name)} className="hover:text-white"><ArrowUp size={14} /></button>}</div>
                                 </div>
                             </div>
                         ))}
                    </div>
                )}
                {activeTab === 'INTEL' && (
                    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin space-y-2">
                        {/* Bounties Section */}
                        <div className="mb-4">
                            <h3 className="font-bold text-sm border-b mb-2" style={{ borderColor: `${gameState.uiColor}50` }}>ACTIVE CONTRACTS</h3>
                            {gameState.activeBounties.length === 0 && <div className="text-xs opacity-50">No active contracts available.</div>}
                            {gameState.activeBounties.map(bounty => (
                                <div key={bounty.id} className="border bg-white/5 p-2 mb-2" style={{ borderColor: `${gameState.uiColor}33` }}>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-red-400">TARGET: {bounty.targetCorp}</span>
                                        <span className="text-xs font-mono">{bounty.reward} CAPS</span>
                                    </div>
                                    <div className="text-[10px] opacity-70 flex justify-between">
                                        <span>{bounty.description}</span>
                                        <span className="font-bold">[{bounty.type}]</span>
                                    </div>
                                    <div className="text-[10px] opacity-50 text-right">Expires in: {Math.ceil((bounty.expiresAt - gameState.gameTime) / 3600000)}h</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === 'FACTIONS' && (
                     <div className="flex flex-col h-full overflow-y-auto scrollbar-thin space-y-2">
                        {Object.values(gameState.factions).map(fac => (
                            <div key={fac.id} className="border-b pb-1 cursor-help hover:bg-white/5" style={{ borderColor: `${gameState.uiColor}33` }} onMouseEnter={() => handleMouseEnter(fac.name, fac.tooltip)} onMouseLeave={handleMouseLeave}>
                                <div className="font-bold text-sm">{fac.name}</div>
                                <div className="flex justify-between text-xs opacity-80">
                                    <span>REP: {fac.reputation}</span>
                                    <span className={fac.isHostile ? 'text-red-500' : 'text-green-500'}>{fac.isHostile ? 'HOSTILE' : 'NEUTRAL'}</span>
                                </div>
                                <div className="text-[10px] opacity-60 italic">{fac.description}</div>
                            </div>
                        ))}
                     </div>
                )}
            </div>
        </div>

        {/* Center Panel */}
        <div className="flex-1 flex flex-col border-2 relative bg-black/90 shadow-lg" style={{ borderColor: gameState.uiColor }}>
             <div className="absolute top-0 left-0 text-black px-2 font-bold text-sm z-10 flex items-center gap-4 bg-current">
                 <span>TERMINAL_OUTPUT</span>
                 {gameState.currentActivity === 'JOB' && <span className="text-red-500 animate-pulse flex items-center gap-1 text-[10px]"><Briefcase size={10} /> WORK MODE</span>}
                 {gameState.currentActivity === 'SLEEPING' && <span className="text-blue-500 animate-pulse flex items-center gap-1 text-[10px]"><Moon size={10} /> SLEEP MODE</span>}
             </div>
             
             {/* Center Panel Tabs */}
             <div className="absolute top-0 right-0 flex">
                  <button onClick={() => setActiveCenterTab('TERMINAL')} className={`px-2 text-xs border-l border-b ${activeCenterTab === 'TERMINAL' ? 'bg-white/20' : ''}`} style={{ borderColor: gameState.uiColor }}>CMD</button>
                  <button onClick={() => setActiveCenterTab('INBOX')} className={`px-2 text-xs border-l border-b ${activeCenterTab === 'INBOX' ? 'bg-white/20' : ''}`} style={{ borderColor: gameState.uiColor }}>MSG ({gameState.messages.filter(m => !m.read).length})</button>
                  <button onClick={() => setActiveCenterTab('DATABASE')} className={`px-2 text-xs border-l border-b ${activeCenterTab === 'DATABASE' ? 'bg-white/20' : ''}`} style={{ borderColor: gameState.uiColor }}>DB</button>
             </div>
             
             {activeCenterTab === 'TERMINAL' && (
                 <>
                    {/* Header for Terminal */}
                    <div className="p-4 pt-8 border-b bg-black font-mono text-sm leading-tight opacity-70" style={{ borderColor: `${gameState.uiColor}50` }}>
                        <div className="flex justify-between font-bold">
                            <span>WIREFRAME PROTOCOL v20.75 [SECURE]</span>
                            <span>STATUS: CONNECTED</span>
                        </div>
                        <div className="mt-1">USER: CONTRACTOR_ID_992 [CLEARANCE: RED]</div>
                        <div className="italic opacity-80 my-2">"A world quietly poisoning itself... Probe the systems that keep it running."</div>
                        <div className="flex justify-between items-center text-xs">
                             <span className="flex items-center gap-1"><TargetIcon size={10} /> {gameState.currentTarget.company}</span>
                             <span className="text-purple-400">{currentPhase.name}</span>
                             <span>{Math.floor(gameState.hackingProgress)}%</span>
                        </div>
                    </div>
                    <TerminalLog logs={gameState.logs} />
                 </>
             )}

             {activeCenterTab === 'INBOX' && (
                 <div className="p-4 pt-8 h-full overflow-y-auto scrollbar-thin">
                     <h2 className="text-xl font-bold border-b mb-4 flex items-center gap-2" style={{ borderColor: gameState.uiColor }}><Mail /> SECURE INBOX</h2>
                     {gameState.messages.length === 0 && <div className="opacity-50">No messages.</div>}
                     {gameState.messages.map(msg => (
                         <div key={msg.id} className="mb-4 border p-2 bg-white/5" style={{ borderColor: `${gameState.uiColor}33` }}>
                             <div className="flex justify-between text-xs font-bold mb-1">
                                 <span>FROM: {msg.sender}</span>
                                 <span>{msg.date}</span>
                             </div>
                             <div className="text-sm font-bold mb-2">{msg.subject}</div>
                             <div className="text-sm opacity-80 whitespace-pre-wrap">{msg.body}</div>
                         </div>
                     ))}
                 </div>
             )}

             {activeCenterTab === 'DATABASE' && (
                 <div className="p-4 pt-8 h-full overflow-y-auto scrollbar-thin">
                      <h2 className="text-xl font-bold border-b mb-4 flex items-center gap-2" style={{ borderColor: gameState.uiColor }}><Database /> LORE DATABASE</h2>
                      <div className="space-y-4">
                          {LORE_TIMELINE.map((entry, idx) => (
                              <div key={idx} className="flex gap-4">
                                  <div className="font-bold font-mono whitespace-nowrap">{entry.year}</div>
                                  <div className="opacity-80 text-sm">{entry.event}</div>
                              </div>
                          ))}
                      </div>
                      <h2 className="text-xl font-bold border-b mt-8 mb-4 flex items-center gap-2" style={{ borderColor: gameState.uiColor }}><Trophy /> ACHIEVEMENTS</h2>
                      <div className="grid grid-cols-2 gap-2">
                          {gameState.achievements.map(ach => (
                              <div key={ach.id} className={`border p-2 ${ach.unlocked ? 'bg-white/10' : 'opacity-30'}`} style={{ borderColor: gameState.uiColor }}>
                                  <div className="font-bold text-xs">{ach.name}</div>
                                  <div className="text-[10px]">{ach.description}</div>
                              </div>
                          ))}
                      </div>
                 </div>
             )}
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-1/4 flex flex-col gap-4">
             
             <div className="border-2 p-4 bg-black/80 backdrop-blur-sm relative shadow-lg" style={{ borderColor: gameState.uiColor }}>
                <div className="absolute top-0 left-0 text-black px-2 font-bold text-sm bg-current">COMMAND_NODE.SYS</div>
                <div className="mt-4 flex flex-col items-center">
                    <div className="grid grid-cols-5 gap-1 p-2 bg-white/5 border" style={{ borderColor: `${gameState.uiColor}33` }}>
                        {Array.from({ length: 4 }).map((_, row) => (
                             Array.from({ length: 5 }).map((_, col) => {
                                 const room = VAULT_LAYOUT.find(r => r.x === col && r.y === row);
                                 const isBuilt = room && gameState.level >= room.unlockLevel;
                                 const level = room ? (gameState.vaultLevels[room.id] || 0) : 0;
                                 const Icon = room && ROOM_ICON_MAP[room.type] ? ROOM_ICON_MAP[room.type] : Box;
                                 const upgradeCost = room ? Math.floor(room.baseCost * Math.pow(1.5, level)) : 0;

                                 return (
                                     <button
                                        key={`${row}-${col}`} 
                                        className={`w-10 h-10 flex items-center justify-center border text-[8px] relative group ${isBuilt ? 'bg-white/20 hover:bg-white/40 border-current' : 'border-gray-800 bg-black opacity-20 cursor-default'} ${room && !isBuilt ? 'border-dashed' : ''}`}
                                        onClick={() => isBuilt && room && upgradeVaultRoom(room.id)}
                                        onMouseEnter={() => room && isBuilt && handleMouseEnter(`${room.name} (Lvl ${level})`, `${room.description}\nEffect: ${room.bonusDescription}\nUpgrade Cost: ℂ${upgradeCost}`)}
                                        onMouseLeave={handleMouseLeave}
                                     >
                                         {isBuilt && <><Icon size={16} /><div className="absolute bottom-0 right-0 text-[8px] leading-none px-[2px] bg-black">{level}</div></>}
                                     </button>
                                 );
                             })
                        ))}
                    </div>
                </div>
             </div>
             
             <div className="flex-1 flex flex-col border-2 p-4 bg-black/80 backdrop-blur-sm relative shadow-lg min-h-[300px]" style={{ borderColor: gameState.uiColor }}>
                 <div className="absolute top-0 left-0 text-black px-2 font-bold text-sm z-10 bg-current">SUPPLY_CHAIN</div>
                 
                 <div className="flex gap-1 mt-4 mb-2 border-b pb-2" style={{ borderColor: `${gameState.uiColor}50` }}>
                     <button className={`flex-1 text-[10px] font-bold py-1 ${activeShopTab === 'HARDWARE' ? 'bg-current text-black' : 'border'}`} style={{ borderColor: gameState.uiColor }} onClick={() => setActiveShopTab('HARDWARE')}>HW</button>
                     <button className={`flex-1 text-[10px] font-bold py-1 ${activeShopTab === 'SOFTWARE' ? 'bg-current text-black' : 'border'}`} style={{ borderColor: gameState.uiColor }} onClick={() => setActiveShopTab('SOFTWARE')}>SW</button>
                     <button className={`flex-1 text-[10px] font-bold py-1 ${activeShopTab === 'MARKET' ? 'bg-current text-black' : 'border'}`} style={{ borderColor: gameState.uiColor }} onClick={() => setActiveShopTab('MARKET')}>MKT</button>
                     <button className={`flex-1 text-[10px] font-bold py-1 ${activeShopTab === 'SYSTEM' ? 'bg-current text-black' : 'border'}`} style={{ borderColor: gameState.uiColor }} onClick={() => setActiveShopTab('SYSTEM')}>SYS</button>
                 </div>

                 <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 pr-1">
                    {activeShopTab === 'HARDWARE' && gameState.upgrades.map(upgrade => {
                         const barterMod = 1 - (gameState.skills.Barter * 0.01);
                         const cost = Math.floor((upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.owned)) * barterMod);
                         const canAfford = gameState.cash >= cost;
                         let Icon = Cpu; if (upgrade.type === 'RAM') Icon = HardDrive; if (upgrade.type === 'NETWORK') Icon = Wifi; if (upgrade.type === 'COOLING') Icon = Brain;
                         return (
                            <button key={upgrade.id} disabled={!canAfford} onClick={() => buyUpgrade(upgrade.id)} onMouseEnter={() => handleMouseEnter(upgrade.name, upgrade.description)} onMouseLeave={handleMouseLeave} className={`w-full text-left p-2 border ${canAfford ? 'hover:bg-white/10 cursor-pointer border-current' : 'border-gray-700 text-gray-600 cursor-not-allowed'} transition-all group relative`}>
                                <div className="flex justify-between items-center"><span className="font-bold flex items-center gap-2 text-xs"><Icon size={14} /> {upgrade.name}</span><span className="text-[10px] border border-current px-1">Lvl {upgrade.owned}</span></div>
                                <div className="mt-1 flex justify-between items-center font-mono text-xs"><span className={canAfford ? '' : 'text-red-900'}>ℂ{cost.toLocaleString()}</span>{canAfford && <PlusCircle size={10} />}</div>
                            </button>
                        );
                    })}
                    
                    {activeShopTab === 'SOFTWARE' && gameState.software.map(sw => {
                         const barterMod = 1 - (gameState.skills.Barter * 0.01);
                         const cost = Math.floor((sw.baseCost * Math.pow(sw.costMultiplier, sw.owned)) * barterMod);
                         const canAfford = gameState.cash >= cost;
                         let Icon = Disc; if (sw.type === 'VIRUS') Icon = Skull; if (sw.type === 'WORM') Icon = Activity; if (sw.type === 'TROJAN') Icon = Key; if (sw.type === 'ROOTKIT') Icon = Settings;
                         const tooltip = SOFTWARE_TOOLTIPS[sw.type];
                         return (
                            <button key={sw.id} disabled={!canAfford} onClick={() => buySoftware(sw.id)} onMouseEnter={() => tooltip && handleMouseEnter(sw.name, `${tooltip} (+${sw.bonus.value} ${sw.bonus.stat})`)} onMouseLeave={handleMouseLeave} className={`w-full text-left p-2 border ${canAfford ? 'hover:bg-white/10 cursor-pointer border-current' : 'border-gray-700 text-gray-600 cursor-not-allowed'} transition-all group relative`}>
                                <div className="flex justify-between items-center"><span className="font-bold flex items-center gap-2 text-xs"><Icon size={14} /> {sw.name}</span><span className="text-[10px] border border-current px-1">v{sw.owned}.0</span></div>
                                <div className="mt-1 flex justify-between items-center font-mono text-xs"><span className={canAfford ? '' : 'text-red-900'}>ℂ{cost.toLocaleString()}</span>{canAfford && <Download size={10} />}</div>
                            </button>
                        );
                    })}

                    {activeShopTab === 'MARKET' && (
                        <div className="space-y-2">
                            {gameState.gameSpeed > 50 && <div className="text-red-500 text-xs text-center border border-red-500 p-1">MARKET OFFLINE (HIGH SPEED)</div>}
                            {Object.values(gameState.corporations).map(corp => {
                                const canTrade = gameState.gameSpeed <= 50;
                                return (
                                    <div key={corp.code} className="border p-2 bg-white/5" style={{ borderColor: `${gameState.uiColor}33` }}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-xs truncate w-24">{corp.name}</span>
                                            <div className="flex items-center gap-1">
                                                {corp.stockTrend > 0 ? <TrendingUp size={10} className="text-green-500" /> : <TrendingDown size={10} className="text-red-500" />}
                                                <span className="font-mono text-xs">ℂ{Math.floor(corp.stockPrice)}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] mb-2">
                                            <span className="opacity-70">Owned: {corp.ownedShares}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <button 
                                                disabled={!canTrade || corp.ownedShares <= 0} 
                                                onClick={() => sellStock(corp.code, 1)}
                                                className={`flex-1 py-1 text-xs border ${!canTrade || corp.ownedShares <= 0 ? 'border-gray-700 text-gray-700' : 'border-red-500/50 text-red-500 hover:bg-red-500/10'}`}
                                            >SELL</button>
                                            <button 
                                                disabled={!canTrade || corp.ownedShares >= (gameState.level * 10) || gameState.cash < corp.stockPrice} 
                                                onClick={() => buyStock(corp.code, 1)}
                                                className={`flex-1 py-1 text-xs border ${!canTrade || corp.ownedShares >= (gameState.level * 10) || gameState.cash < corp.stockPrice ? 'border-gray-700 text-gray-700' : 'border-green-500/50 text-green-500 hover:bg-green-500/10'}`}
                                            >BUY</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activeShopTab === 'SYSTEM' && (
                        <div className="space-y-4 p-2">
                             <div>
                                 <div className="font-bold mb-2">INTERFACE COLOR</div>
                                 <button onClick={toggleColor} className="w-full border p-2 bg-white/10 hover:bg-white/20" style={{ borderColor: gameState.uiColor }}>
                                     CYCLE DISPLAY SPECTRUM
                                 </button>
                             </div>
                             <div>
                                 <div className="font-bold mb-2">AUTOMATION PROTOCOLS</div>
                                 <div className="flex items-center justify-between mb-2">
                                     <span className="text-xs">Auto-Buy Hardware</span>
                                     <button onClick={() => setGameState(p => p ? {...p, autoBuyHardware: !p.autoBuyHardware} : null)} className={`w-8 h-4 border ${gameState.autoBuyHardware ? 'bg-current' : ''}`} style={{ borderColor: gameState.uiColor }}></button>
                                 </div>
                             </div>
                        </div>
                    )}
                 </div>
             </div>
             
             <div className="mt-auto border-t pt-4" style={{ borderColor: `${gameState.uiColor}50` }} onMouseEnter={() => handleMouseEnter("MITRE ATT&CK Matrix", "Visualizes the cyber kill-chain. Mouse over specific active cells (lit up) for detailed educational information about the technique.")} onMouseLeave={handleMouseLeave}>
                <div className="flex justify-between items-center mb-2"><span className="text-[10px] opacity-70 uppercase tracking-widest">ATT&CK Matrix</span><span className="text-[10px] opacity-50">Active Session</span></div>
                <div className="grid grid-cols-7 gap-1">
                    {KILL_CHAIN_PHASES.map((phase, i) => (
                        <div key={i} className="flex flex-col gap-1 items-center">
                             {phase.techniques.map((tech, j) => {
                                 const count = gameState.techniqueCounts[tech] || 0;
                                 let opacityClass = 'opacity-10'; let bgClass = 'bg-transparent';
                                 if (count > 0) { opacityClass = 'opacity-100'; if (count < 5) bgClass = 'bg-white/40'; else if (count < 15) bgClass = 'bg-white/70'; else bgClass = 'bg-current'; }
                                 if (highlightedTechnique === tech) { opacityClass = 'opacity-100'; bgClass = 'bg-white shadow-[0_0_10px_white]'; }
                                 
                                 const techDetail = TECHNIQUE_DETAILS[tech];
                                 const tooltipTitle = techDetail ? `${techDetail.id}: ${techDetail.name}` : tech;
                                 const tooltipBody = techDetail ? `${techDetail.description}\n\nMITIGATION:\n${techDetail.mitigation}` : "Standard Procedure.";

                                 return (
                                     <div 
                                        key={j} 
                                        className={`w-full h-2 border ${bgClass} ${opacityClass} transition-all duration-300`}
                                        style={{ borderColor: gameState.uiColor }}
                                        onMouseEnter={(e) => {
                                            e.stopPropagation(); 
                                            if(count > 0 || highlightedTechnique === tech) {
                                                handleMouseEnter(tooltipTitle, tooltipBody);
                                            }
                                        }}
                                        onMouseLeave={handleMouseLeave}
                                     ></div>
                                 );
                             })}
                        </div>
                    ))}
                </div>
             </div>

             <div className="mt-4 pt-4 border-t text-center text-xs opacity-50" style={{ borderColor: `${gameState.uiColor}50` }}>WIREFRAME SECURE LINK [ENCRYPTED]</div>
        </div>

      </div>
    </div>
  );
};

export default App;