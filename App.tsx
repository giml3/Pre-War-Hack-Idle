import React, { useState, useEffect, useCallback, useRef } from 'react';
import CharacterCreation from './components/CharacterCreation';
import TerminalLog from './components/TerminalLog';
import { INITIAL_JOBS, INITIAL_UPGRADES, INITIAL_UNLOCKABLES, INITIAL_SOFTWARE, LEVEL_THRESHOLDS, KILL_CHAIN_PHASES, VAULT_LAYOUT, SKILL_DEFINITIONS, PRE_WAR_NEWS, RISK_CONFIG, MAJOR_CORPORATIONS, TARGET_REGISTRY } from './constants';
import { GameState, Job, LogEntry, Target, SkillName, Special, CorpData, PlayerActivity } from './types';
import { 
  Shield, Cpu, HardDrive, Wifi, Brain, Disc, Target as TargetIcon,
  Coins, Box, Thermometer, AlertTriangle, PlusCircle, ArrowUp,
  DoorOpen, Coffee, Zap, Monitor, Moon, Play, FastForward, SkipForward, Edit2, Save,
  Briefcase, Globe, Calendar, Clock, Skull, Eye, TrendingUp, TrendingDown, DollarSign, Activity,
  Key, Settings, Download
} from 'lucide-react';

const ROOM_ICON_MAP: Record<string, React.ElementType> = {
    'entrance': DoorOpen,
    'living': Coffee,
    'utility': Zap,
    'command': Monitor
};

const getRandomTarget = (): Target => {
  return TARGET_REGISTRY[Math.floor(Math.random() * TARGET_REGISTRY.length)];
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
  const [activeTab, setActiveTab] = useState<'SPECIAL' | 'SKILLS' | 'INTEL'>('SPECIAL');
  const [activeShopTab, setActiveShopTab] = useState<'HARDWARE' | 'SOFTWARE' | 'MARKET'>('HARDWARE');
  
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

    // Init Corporations
    const corporations: Record<string, CorpData> = {};
    Object.entries(MAJOR_CORPORATIONS).forEach(([name, data]) => {
        corporations[name] = {
            name,
            reputation: 0,
            trace: 0,
            stockPrice: data.initialStock,
            stockTrend: 0,
            ownedShares: 0
        };
    });

    const startDate = new Date('2076-01-01T06:00:00').getTime();

    setGameState({
      cash: 50, 
      xp: 0,
      level: 1,
      job,
      playerName: job.name,
      gameTime: startDate,
      gameSpeed: 1,
      currentActivity: 'SLEEPING',
      hackingProgress: 0,
      isAutoHacking: true,
      upgrades: INITIAL_UPGRADES.map(u => ({...u})), 
      software: INITIAL_SOFTWARE.map(s => ({...s})),
      unlockables: INITIAL_UNLOCKABLES.map(u => ({...u})),
      vaultLevels: initialVaultLevels,
      autoBuyHardware: false,
      autoBuySoftware: false,
      logs: [],
      totalHacks: 0,
      techniqueCounts: {},
      currentTarget: getRandomTarget(),
      special: { ...job.initialSpecial },
      skills: skills,
      perks: [],
      upgradePoints: 0,
      perkPoints: 0,
      heat: 0,
      riskLevel: 3, // Standard default
      isDowntime: false,
      downtimeEndTime: 0,
      corporations,
      marketLastUpdate: startDate
    });
    lastPhaseRef.current = -1;
  };

  const getGameDate = (ts: number) => {
      const date = new Date(ts);
      return {
          dateStr: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          timeStr: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          hour: date.getHours()
      };
  };

  const getReputationRank = (rep: number) => {
      if (rep < 10) return "UNKNOWN";
      if (rep < 50) return "NUISANCE";
      if (rep < 150) return "THREAT";
      if (rep < 300) return "DANGEROUS";
      if (rep < 600) return "NEMESIS";
      return "OWNER";
  };

  // Main Game Loop
  const updateGame = useCallback(() => {
    const currentState = stateRef.current;
    if (!currentState) return;
    
    const timeDeltaMs = 60000 * currentState.gameSpeed; 
    const newTime = currentState.gameTime + timeDeltaMs;
    const { hour } = getGameDate(newTime);

    let activity: PlayerActivity = 'HACKING';
    if (hour >= 8 && hour < 17) activity = 'JOB';
    else if (hour >= 23 || hour < 7) activity = 'SLEEPING';
    if (currentState.isDowntime) activity = 'DOWNTIME';

    let cashChange = 0;
    let heatChange = 0;
    let logToAdd: LogEntry | null = null;
    let activityLog: LogEntry | null = null;

    if (activity !== currentState.currentActivity) {
         if (activity === 'JOB') activityLog = { id: Date.now(), timestamp: "SYSTEM", message: "SHIFT START. Terminal Locked.", type: 'warning' };
         if (activity === 'SLEEPING') activityLog = { id: Date.now(), timestamp: "SYSTEM", message: "REST PERIOD.", type: 'info' };
         if (activity === 'HACKING' && currentState.currentActivity === 'JOB') activityLog = { id: Date.now(), timestamp: "SYSTEM", message: "SHIFT END. Accessing networks...", type: 'success' };
    }

    // Market Update Logic (Hourly)
    let newCorporations = { ...currentState.corporations };
    if (newTime - lastMarketUpdateRef.current >= 3600000) { // 1 Hour
        lastMarketUpdateRef.current = newTime;
        // Fluctuate prices
        Object.keys(newCorporations).forEach(key => {
            const corp = newCorporations[key];
            const changePercent = (Math.random() - 0.5) * 0.1; // +/- 5%
            const newPrice = Math.max(1, corp.stockPrice * (1 + changePercent));
            newCorporations[key] = { 
                ...corp, 
                stockPrice: newPrice,
                stockTrend: changePercent
            };
        });
    }

    if (activity === 'JOB') {
        if (newTime - lastJobPayTimeRef.current > 3600000) { 
            cashChange += 5; 
            lastJobPayTimeRef.current = newTime;
        }
    } else if (activity === 'SLEEPING') {
        heatChange = -2;
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
    
    const baseSpeed = 0.5;
    const speed = (baseSpeed + (cpuLevel * cpuBonus) + swSpeedBonus + vaultSpeedBonus) * (1 + intMod);

    setGameState(prev => {
        if(!prev) return null;
        
        let newProgress = prev.hackingProgress;
        let newHeat = Math.max(0, prev.heat + heatChange);
        let currentCash = prev.cash + cashChange;
        let logsToAdd: LogEntry[] = activityLog ? [activityLog] : [];
        let newTechniqueCounts = { ...prev.techniqueCounts };
        let newTarget = prev.currentTarget;
        let newXp = prev.xp;
        let newLevel = prev.level;
        let newUpgradePoints = prev.upgradePoints;
        let newPerkPoints = prev.perkPoints;
        let newUnlockables = prev.unlockables;

        const riskConfig = RISK_CONFIG.find(r => r.level === prev.riskLevel) || RISK_CONFIG[2];

        // --- HACKING EXECUTION ---
        if (activity === 'HACKING' && prev.isAutoHacking) {
            
            // Auto Buy
            if (prev.autoBuyHardware) {
                 const affordableUpgrade = prev.upgrades
                    .map((u, idx) => ({ ...u, idx, cost: Math.floor((u.baseCost * Math.pow(u.costMultiplier, u.owned)) * (1 - prev.skills.Barter * 0.01)) }))
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

            // Normal Decay
            const swHeatBonus = prev.software.filter(s => s.bonus.stat === 'HEAT').reduce((acc, s) => acc + (s.bonus.value * s.owned), 0);
            newHeat = Math.max(0, newHeat - (prev.special.A * 0.05) - swHeatBonus);

            // Heat Check
            if (newHeat >= 100) {
                 const endurance = prev.special.E;
                 const downtimeMs = Math.max(5000, 30000 - (endurance * 2000));
                 logsToAdd.push({ id: Date.now(), timestamp: "SYS", message: "CRITICAL HEAT. LOCKOUT.", type: 'error' });
                 return { ...prev, gameTime: newTime, currentActivity: activity, heat: 100, isDowntime: true, downtimeEndTime: Date.now() + downtimeMs, logs: [...prev.logs, ...logsToAdd].slice(-50) };
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
                
                // Risk Adjustment for fail chance?
                // Actually Risk affects PUNISHMENT.
                
                if (total > (targetNumber - difficulty)) {
                    // FAILURE
                    const heatGen = (isCritFail ? 20 : 5) * riskConfig.heatMod;
                    newHeat += heatGen;
                    
                    // SUBTLE FAILURE: TRACE
                    if (prev.riskLevel >= 3) {
                        const parentCorp = prev.currentTarget.parentCorp;
                        if (newCorporations[parentCorp]) {
                            const traceAmt = (isCritFail ? 5 : 1) * (prev.riskLevel - 2);
                            const newTrace = Math.min(100, newCorporations[parentCorp].trace + traceAmt);
                            newCorporations[parentCorp] = { ...newCorporations[parentCorp], trace: newTrace };
                            
                            if (newTrace >= 100) {
                                // TRACE EVENT
                                logsToAdd.push({ id: Date.now(), timestamp: "ALERT", message: `TRACE COMPLETE: ${parentCorp} assets frozen! Lost 20% Cash.`, type: 'error' });
                                currentCash = Math.floor(currentCash * 0.8);
                                newCorporations[parentCorp] = { ...newCorporations[parentCorp], trace: 0 }; // Reset
                            } else if (newTrace > 50 && Math.random() > 0.8) {
                                logsToAdd.push({ id: Date.now(), timestamp: "WARN", message: `Tracing signal detected from ${parentCorp}...`, type: 'warning' });
                            }
                        }
                    }

                    logsToAdd.push({ id: Date.now() + Math.random(), timestamp: "ALERT", message: `Check Failed. Heat +${Math.floor(heatGen)}.`, type: 'warning' });
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
                
                // Risk Multiplier
                currentCash += Math.floor(baseCash * speechBonus * (isCrit ? 2 : 1) * riskConfig.multiplier);
                
                const intXpBonus = 1 + (prev.special.I * 0.05);
                const baseXp = 20 + (prev.currentTarget.difficulty * 5);
                newXp += Math.floor(baseXp * intXpBonus * riskConfig.multiplier);

                // Reputation Update
                const parent = prev.currentTarget.parentCorp;
                if (newCorporations[parent]) {
                     newCorporations[parent] = { ...newCorporations[parent], reputation: newCorporations[parent].reputation + (1 * riskConfig.level) };
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

        return {
            ...prev,
            gameTime: newTime,
            currentActivity: activity,
            hackingProgress: newProgress,
            heat: Math.min(100, newHeat),
            cash: currentCash,
            logs: logsToAdd.length > 0 ? [...prev.logs, ...logsToAdd].slice(-50) : prev.logs,
            techniqueCounts: newTechniqueCounts,
            currentTarget: newTarget,
            xp: newXp,
            level: newLevel,
            upgradePoints: newUpgradePoints,
            perkPoints: newPerkPoints,
            unlockables: newUnlockables,
            corporations: newCorporations
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
        const upgradeIndex = prev.upgrades.findIndex(u => u.id === upgradeId);
        if (upgradeIndex === -1) return prev;
        
        const barterMod = 1 - (prev.skills.Barter * 0.01);
        const upgrade = prev.upgrades[upgradeIndex];
        const cost = Math.floor((upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.owned)) * barterMod);

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
        const swIndex = prev.software.findIndex(s => s.id === swId);
        if (swIndex === -1) return prev;
        
        const barterMod = 1 - (prev.skills.Barter * 0.01);
        const sw = prev.software[swIndex];
        const cost = Math.floor((sw.baseCost * Math.pow(sw.costMultiplier, sw.owned)) * barterMod);

        if (prev.cash >= cost) {
            const newSW = [...prev.software];
            newSW[swIndex] = { ...sw, owned: sw.owned + 1 };
            return { ...prev, cash: prev.cash - cost, software: newSW, logs: [...prev.logs, { id: Date.now(), timestamp: "SHOP", message: `Compiled ${sw.name}.`, type: 'info' } as LogEntry].slice(-50) };
        }
        return prev;
    });
  };

  const buyStock = (corpName: string, amount: number) => {
      setGameState(prev => {
          if(!prev) return null;
          const corp = prev.corporations[corpName];
          const cost = Math.ceil(corp.stockPrice * amount);
          const maxShares = prev.level * 10;
          if (corp.ownedShares + amount > maxShares) return prev; // Limit
          if (prev.cash >= cost) {
              const newCorps = { ...prev.corporations, [corpName]: { ...corp, ownedShares: corp.ownedShares + amount } };
              return { ...prev, cash: prev.cash - cost, corporations: newCorps, logs: [...prev.logs, { id: Date.now(), timestamp: "MARKET", message: `Bought ${amount} shares of ${corpName}.`, type: 'info' } as LogEntry].slice(-50) };
          }
          return prev;
      });
  };

  const sellStock = (corpName: string, amount: number) => {
      setGameState(prev => {
          if(!prev) return null;
          const corp = prev.corporations[corpName];
          if (corp.ownedShares < amount) return prev;
          const value = Math.floor(corp.stockPrice * amount);
          const newCorps = { ...prev.corporations, [corpName]: { ...corp, ownedShares: corp.ownedShares - amount } };
          return { ...prev, cash: prev.cash + value, corporations: newCorps, logs: [...prev.logs, { id: Date.now(), timestamp: "MARKET", message: `Sold ${amount} shares of ${corpName}.`, type: 'info' } as LogEntry].slice(-50) };
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

  const handleMouseEnter = (title: string, body: string) => setHoverInfo({ title, body });
  const handleMouseLeave = () => setHoverInfo(null);

  if (!gameState) return <CharacterCreation onSelect={handleJobSelect} />;

  const nextXpThreshold = LEVEL_THRESHOLDS[gameState.level] || 'MAX';
  const xpPercentage = typeof nextXpThreshold === 'number' ? Math.min(100, (gameState.xp / nextXpThreshold) * 100) : 100;
  const currentPhaseIndex = KILL_CHAIN_PHASES.reduce((found, phase, idx) => gameState.hackingProgress >= phase.threshold ? idx : found, 0);
  const currentPhase = KILL_CHAIN_PHASES[currentPhaseIndex];
  const dateInfo = getGameDate(gameState.gameTime);
  const currentRisk = RISK_CONFIG.find(r => r.level === gameState.riskLevel) || RISK_CONFIG[2];

  return (
    <div className="flex h-screen w-screen p-2 md:p-6 bg-black text-[#ffb000] overflow-hidden">
      
      {/* Tooltip Overlay */}
      {hoverInfo && (
          <div className="fixed z-50 pointer-events-none bg-black border-2 border-[#ffb000] p-3 max-w-sm shadow-[0_0_20px_rgba(255,176,0,0.3)]" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)'}}>
              <div className="font-bold text-lg mb-1 border-b border-[#ffb000]/30">{hoverInfo.title}</div>
              <div className="text-sm opacity-90">{hoverInfo.body}</div>
          </div>
      )}

      {/* Info Panel */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl text-center pointer-events-none">
          {hoverInfo && (
               <div className="bg-black/90 border-t-2 border-[#ffb000] p-2 text-[#ffb000] shadow-[0_-5px_20px_rgba(0,0,0,0.8)]">
                   <span className="font-bold uppercase mr-2">[{hoverInfo.title}]</span>
                   <span className="opacity-80">{hoverInfo.body}</span>
               </div>
          )}
      </div>

      {/* NEWS TICKER */}
      <div className="fixed bottom-0 left-0 w-full bg-[#ffb000] text-black h-8 flex items-center overflow-hidden z-50 border-t-2 border-black">
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
            <div className="border-2 border-[#ffb000] p-4 bg-black/80 backdrop-blur-sm relative shadow-[0_0_15px_rgba(255,176,0,0.2)]">
                <div className="flex justify-between items-center border-b border-[#ffb000]/30 pb-2 mb-2">
                    {isEditingName ? (
                        <div className="flex items-center gap-2 w-full">
                            <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} className="bg-[#ffb000]/20 border border-[#ffb000] text-[#ffb000] px-1 w-full text-sm font-bold uppercase" autoFocus />
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
                 
                <div className="mb-2 p-2 bg-[#ffb000]/5 border border-[#ffb000]/20 flex flex-col gap-1">
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2"><Calendar size={14} /><span>{dateInfo.dateStr}</span></div>
                        <div className="flex items-center gap-2 font-mono font-bold text-[#ffb000]"><Clock size={14} /><span>{dateInfo.timeStr}</span></div>
                    </div>
                    <div className={`text-center font-bold text-xs uppercase border px-1 py-0.5 ${gameState.currentActivity === 'HACKING' ? 'border-green-500 text-green-500' : gameState.currentActivity === 'JOB' ? 'border-red-500 text-red-500' : 'border-blue-500 text-blue-500'}`}>
                        {gameState.currentActivity === 'HACKING' && <span>Hacking Access Allowed</span>}
                        {gameState.currentActivity === 'JOB' && <span>Mandatory Shift (9-5)</span>}
                        {gameState.currentActivity === 'SLEEPING' && <span>Sleep Cycle</span>}
                    </div>
                </div>

                {/* Risk Controls */}
                <div className="mb-2">
                    <div className="flex justify-between text-[10px] uppercase font-bold mb-1">
                        <span>Risk Protocol</span>
                        <span className={currentRisk.color}>{currentRisk.label} (x{currentRisk.multiplier})</span>
                    </div>
                    <div className="flex gap-1">
                        {RISK_CONFIG.map((r) => (
                            <button 
                                key={r.level}
                                onClick={() => setGameState(prev => prev ? {...prev, riskLevel: r.level} : null)}
                                className={`flex-1 h-2 transition-all ${gameState.riskLevel >= r.level ? r.color.replace('text-', 'bg-') : 'bg-gray-800'}`}
                                onMouseEnter={() => handleMouseEnter(r.label, `${r.desc}\nRewards: x${r.multiplier}\nHeat: x${r.heatMod}`)}
                                onMouseLeave={handleMouseLeave}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-1 mb-2">
                     <div className="flex justify-between gap-1">
                         <button className={`flex-1 flex justify-center py-1 border ${gameState.gameSpeed === 1 ? 'bg-[#ffb000] text-black' : 'border-[#ffb000]/50 hover:bg-[#ffb000]/10'}`} onClick={() => setGameState(prev => prev ? {...prev, gameSpeed: 1} : null)}><Play size={14} /></button>
                         <button className={`flex-1 flex justify-center py-1 border ${gameState.gameSpeed === 50 ? 'bg-[#ffb000] text-black' : 'border-[#ffb000]/50 hover:bg-[#ffb000]/10'}`} onClick={() => setGameState(prev => prev ? {...prev, gameSpeed: 50} : null)}><FastForward size={14} /></button>
                          <button className={`flex-1 flex justify-center py-1 border ${gameState.gameSpeed === 500 ? 'bg-[#ffb000] text-black' : 'border-[#ffb000]/50 hover:bg-[#ffb000]/10'}`} onClick={() => setGameState(prev => prev ? {...prev, gameSpeed: 500} : null)}><SkipForward size={14} /></button>
                     </div>
                     <input type="range" min="1" max="500" value={gameState.gameSpeed} onChange={(e) => setGameState(prev => prev ? {...prev, gameSpeed: parseInt(e.target.value)} : null)} className="w-full h-2 bg-[#ffb000]/20 appearance-none cursor-pointer" style={{accentColor: '#ffb000'}} />
                </div>

                 <div>
                    <div className="flex justify-between text-xs mb-1"><span>XP</span><span>{gameState.xp} / {nextXpThreshold}</span></div>
                    <div className="w-full h-2 bg-[#ffb000]/20 border border-[#ffb000]/50"><div className="h-full bg-[#ffb000] transition-all duration-300" style={{ width: `${xpPercentage}%` }}></div></div>
                </div>
                <div className="mt-2 text-lg font-bold text-center border border-[#ffb000]/20 py-1 bg-[#ffb000]/5 flex items-center justify-center gap-2"><Coins size={18} /> {gameState.cash.toLocaleString()} NKC</div>
            </div>

             {/* Heat Meter */}
             <div className="border-2 border-[#ffb000] p-2 bg-black/80 relative" onMouseEnter={() => handleMouseEnter("System Heat", "Heat increases when hacks fail. If it reaches 100%, system lockout occurs.")} onMouseLeave={handleMouseLeave}>
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

            <div className="flex gap-2">
                <button onClick={() => setActiveTab('SPECIAL')} className={`flex-1 py-1 text-sm font-bold border border-[#ffb000] ${activeTab === 'SPECIAL' ? 'bg-[#ffb000] text-black' : 'hover:bg-[#ffb000]/10'}`}>S.P.E.C.I.A.L</button>
                <button onClick={() => setActiveTab('SKILLS')} className={`flex-1 py-1 text-sm font-bold border border-[#ffb000] ${activeTab === 'SKILLS' ? 'bg-[#ffb000] text-black' : 'hover:bg-[#ffb000]/10'}`}>SKILLS</button>
                <button onClick={() => setActiveTab('INTEL')} className={`flex-1 py-1 text-sm font-bold border border-[#ffb000] ${activeTab === 'INTEL' ? 'bg-[#ffb000] text-black' : 'hover:bg-[#ffb000]/10'}`}>INTEL</button>
            </div>

            <div className="flex-1 border-2 border-[#ffb000] p-4 bg-black/80 backdrop-blur-sm relative shadow-[0_0_15px_rgba(255,176,0,0.2)] flex flex-col min-h-[200px] overflow-hidden">
                {gameState.upgradePoints > 0 && <div className="mb-2 text-center text-xs bg-[#ffb000] text-black font-bold animate-pulse">POINTS AVAILABLE: {gameState.upgradePoints}</div>}

                {activeTab === 'SPECIAL' && (
                    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin space-y-2">
                        {Object.entries(gameState.special).map(([key, val]) => (
                            <div key={key} className="flex items-center justify-between border-b border-[#ffb000]/20 pb-1 hover:bg-[#ffb000]/5 cursor-help" onMouseEnter={() => handleMouseEnter(`Attribute: ${key}`, "")} onMouseLeave={handleMouseLeave}>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 flex items-center justify-center font-bold text-lg bg-[#ffb000]/10 border border-[#ffb000]/30">{key}</div>
                                </div>
                                <div className="flex items-center gap-2"><span className="font-mono text-xl">{val}</span>{gameState.upgradePoints > 0 && val < 10 && <button onClick={() => spendPoint('SPECIAL', key)} className="text-[#ffb000] hover:text-white"><PlusCircle size={14} /></button>}</div>
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === 'SKILLS' && (
                    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin space-y-2">
                         {SKILL_DEFINITIONS.map(skill => (
                             <div key={skill.name} className="flex flex-col border-b border-[#ffb000]/20 pb-1 hover:bg-[#ffb000]/5 cursor-help" onMouseEnter={() => handleMouseEnter(`Skill: ${skill.name}`, skill.description)} onMouseLeave={handleMouseLeave}>
                                 <div className="flex justify-between items-center">
                                    <span className="font-bold text-sm">{skill.name}</span>
                                    <div className="flex items-center gap-2"><span className="text-xs opacity-50">[{skill.attribute}]</span><span className="font-mono">{gameState.skills[skill.name]}</span>{gameState.upgradePoints > 0 && gameState.skills[skill.name] < 100 && <button onClick={() => spendPoint('SKILL', skill.name)} className="text-[#ffb000] hover:text-white"><ArrowUp size={14} /></button>}</div>
                                 </div>
                             </div>
                         ))}
                    </div>
                )}
                {activeTab === 'INTEL' && (
                    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin space-y-2">
                        {Object.values(gameState.corporations).map(corp => (
                             <div key={corp.name} className="flex flex-col border-b border-[#ffb000]/20 pb-1">
                                 <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-sm">{corp.name}</span>
                                    <span className={`text-[10px] font-bold ${corp.trace > 50 ? 'text-red-500 animate-pulse' : 'opacity-50'}`}>{corp.trace > 0 ? `TRACE: ${Math.floor(corp.trace)}%` : ''}</span>
                                 </div>
                                 <div className="flex justify-between items-center text-xs">
                                     <span className="opacity-70">STATUS:</span>
                                     <span className="font-mono font-bold text-[#ffb000]">{getReputationRank(corp.reputation)} ({corp.reputation})</span>
                                 </div>
                                 <div className="w-full h-1 bg-gray-800 mt-1"><div className="h-full bg-red-500" style={{width: `${corp.trace}%`}}></div></div>
                             </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Center Panel */}
        <div className="flex-1 flex flex-col border-2 border-[#ffb000] relative bg-black/90 shadow-[0_0_15px_rgba(255,176,0,0.2)]">
             <div className="absolute top-0 left-0 bg-[#ffb000] text-black px-2 font-bold text-sm z-10">TERMINAL_OUTPUT</div>
             <div className="absolute top-0 right-0 bg-black/80 border-b border-l border-[#ffb000] px-2 flex items-center gap-4 text-xs z-10">
                 <span className="flex items-center gap-1"><TargetIcon size={10} /> {gameState.currentTarget.company}</span>
                 <span className="text-purple-400">{currentPhase.name}</span>
                 <span>{Math.floor(gameState.hackingProgress)}%</span>
             </div>
             
             {gameState.currentActivity !== 'HACKING' && (
                 <div className="absolute inset-0 bg-black/90 z-20 flex flex-col items-center justify-center p-8 text-center border-t-2 border-[#ffb000]/50">
                     {gameState.currentActivity === 'JOB' && (
                         <><Briefcase size={64} className="mb-4 text-red-500 animate-pulse" /><h2 className="text-3xl font-bold text-red-500 mb-2">MANDATORY SHIFT</h2><p className="max-w-md opacity-70">Company protocols prohibit personal terminal usage during billable hours.</p></>
                     )}
                     {gameState.currentActivity === 'SLEEPING' && (
                         <><Moon size={64} className="mb-4 text-blue-500 animate-pulse" /><h2 className="text-3xl font-bold text-blue-500 mb-2">SLEEP MODE</h2><p className="max-w-md opacity-70">User is unconscious. Heat levels dissipating.</p></>
                     )}
                 </div>
             )}

             <TerminalLog logs={gameState.logs} />
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-1/4 flex flex-col gap-4">
             
             <div className="border-2 border-[#ffb000] p-4 bg-black/80 backdrop-blur-sm relative shadow-[0_0_15px_rgba(255,176,0,0.2)]">
                <div className="absolute top-0 left-0 bg-[#ffb000] text-black px-2 font-bold text-sm">VAULT_LAYOUT.BPM</div>
                <div className="mt-4 flex flex-col items-center">
                    <div className="grid grid-cols-5 gap-1 p-2 bg-[#ffb000]/5 border border-[#ffb000]/20">
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
                                        className={`w-10 h-10 flex items-center justify-center border text-[8px] relative group ${isBuilt ? 'border-[#ffb000] bg-[#ffb000]/20 text-[#ffb000] hover:bg-[#ffb000]/40' : 'border-gray-800 bg-black opacity-20 cursor-default'} ${room && !isBuilt ? 'border-dashed' : ''}`}
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
             
             <div className="flex-1 flex flex-col border-2 border-[#ffb000] p-4 bg-black/80 backdrop-blur-sm relative shadow-[0_0_15px_rgba(255,176,0,0.2)] min-h-[300px]">
                 <div className="absolute top-0 left-0 bg-[#ffb000] text-black px-2 font-bold text-sm z-10">SUPPLY_CHAIN</div>
                 
                 <div className="flex gap-1 mt-4 mb-2 border-b border-[#ffb000]/30 pb-2">
                     <button className={`flex-1 text-[10px] font-bold py-1 ${activeShopTab === 'HARDWARE' ? 'bg-[#ffb000] text-black' : 'text-[#ffb000] border border-[#ffb000]'}`} onClick={() => setActiveShopTab('HARDWARE')}>HARDWARE</button>
                     <button className={`flex-1 text-[10px] font-bold py-1 ${activeShopTab === 'SOFTWARE' ? 'bg-[#ffb000] text-black' : 'text-[#ffb000] border border-[#ffb000]'}`} onClick={() => setActiveShopTab('SOFTWARE')}>SOFTWARE</button>
                     <button className={`flex-1 text-[10px] font-bold py-1 ${activeShopTab === 'MARKET' ? 'bg-[#ffb000] text-black' : 'text-[#ffb000] border border-[#ffb000]'}`} onClick={() => setActiveShopTab('MARKET')}>MARKET</button>
                 </div>

                 <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 pr-1">
                    {activeShopTab === 'HARDWARE' && gameState.upgrades.map(upgrade => {
                         const barterMod = 1 - (gameState.skills.Barter * 0.01);
                         const cost = Math.floor((upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.owned)) * barterMod);
                         const canAfford = gameState.cash >= cost;
                         let Icon = Cpu; if (upgrade.type === 'RAM') Icon = HardDrive; if (upgrade.type === 'NETWORK') Icon = Wifi; if (upgrade.type === 'COOLING') Icon = Brain;
                         return (
                            <button key={upgrade.id} disabled={!canAfford} onClick={() => buyUpgrade(upgrade.id)} onMouseEnter={() => handleMouseEnter(upgrade.name, upgrade.description)} onMouseLeave={handleMouseLeave} className={`w-full text-left p-2 border ${canAfford ? 'border-[#ffb000] hover:bg-[#ffb000]/10 cursor-pointer' : 'border-gray-700 text-gray-600 cursor-not-allowed'} transition-all group relative`}>
                                <div className="flex justify-between items-center"><span className="font-bold flex items-center gap-2 text-xs"><Icon size={14} /> {upgrade.name}</span><span className="text-[10px] border border-current px-1">Lvl {upgrade.owned}</span></div>
                                <div className="mt-1 flex justify-between items-center font-mono text-xs"><span className={canAfford ? 'text-[#ffb000]' : 'text-red-900'}>ℂ{cost.toLocaleString()}</span>{canAfford && <PlusCircle size={10} />}</div>
                            </button>
                        );
                    })}
                    
                    {activeShopTab === 'SOFTWARE' && gameState.software.map(sw => {
                         const barterMod = 1 - (gameState.skills.Barter * 0.01);
                         const cost = Math.floor((sw.baseCost * Math.pow(sw.costMultiplier, sw.owned)) * barterMod);
                         const canAfford = gameState.cash >= cost;
                         let Icon = Disc; if (sw.type === 'VIRUS') Icon = Skull; if (sw.type === 'WORM') Icon = Activity; if (sw.type === 'TROJAN') Icon = Key; if (sw.type === 'ROOTKIT') Icon = Settings;
                         return (
                            <button key={sw.id} disabled={!canAfford} onClick={() => buySoftware(sw.id)} onMouseEnter={() => handleMouseEnter(sw.name, `${sw.description} (+${sw.bonus.value} ${sw.bonus.stat})`)} onMouseLeave={handleMouseLeave} className={`w-full text-left p-2 border ${canAfford ? 'border-[#ffb000] hover:bg-[#ffb000]/10 cursor-pointer' : 'border-gray-700 text-gray-600 cursor-not-allowed'} transition-all group relative`}>
                                <div className="flex justify-between items-center"><span className="font-bold flex items-center gap-2 text-xs"><Icon size={14} /> {sw.name}</span><span className="text-[10px] border border-current px-1">v{sw.owned}.0</span></div>
                                <div className="mt-1 flex justify-between items-center font-mono text-xs"><span className={canAfford ? 'text-[#ffb000]' : 'text-red-900'}>ℂ{cost.toLocaleString()}</span>{canAfford && <Download size={10} />}</div>
                            </button>
                        );
                    })}

                    {activeShopTab === 'MARKET' && (
                        <div className="space-y-2">
                            {gameState.gameSpeed > 50 && <div className="text-red-500 text-xs text-center border border-red-500 p-1">MARKET OFFLINE (HIGH SPEED)</div>}
                            {Object.values(gameState.corporations).map(corp => {
                                const canTrade = gameState.gameSpeed <= 50;
                                return (
                                    <div key={corp.name} className="border border-[#ffb000]/30 p-2 bg-[#ffb000]/5">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-xs">{corp.name}</span>
                                            <div className="flex items-center gap-1">
                                                {corp.stockTrend > 0 ? <TrendingUp size={10} className="text-green-500" /> : <TrendingDown size={10} className="text-red-500" />}
                                                <span className="font-mono text-xs">ℂ{Math.floor(corp.stockPrice)}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] mb-2">
                                            <span className="opacity-70">Owned: {corp.ownedShares}</span>
                                            <span className="opacity-70">Limit: {gameState.level * 10}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <button 
                                                disabled={!canTrade || corp.ownedShares <= 0} 
                                                onClick={() => sellStock(corp.name, 1)}
                                                className={`flex-1 py-1 text-xs border ${!canTrade || corp.ownedShares <= 0 ? 'border-gray-700 text-gray-700' : 'border-red-500/50 text-red-500 hover:bg-red-500/10'}`}
                                            >SELL</button>
                                            <button 
                                                disabled={!canTrade || corp.ownedShares >= (gameState.level * 10) || gameState.cash < corp.stockPrice} 
                                                onClick={() => buyStock(corp.name, 1)}
                                                className={`flex-1 py-1 text-xs border ${!canTrade || corp.ownedShares >= (gameState.level * 10) || gameState.cash < corp.stockPrice ? 'border-gray-700 text-gray-700' : 'border-green-500/50 text-green-500 hover:bg-green-500/10'}`}
                                            >BUY</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                 </div>
             </div>
             
             <div className="mt-auto border-t border-[#ffb000]/30 pt-4" onMouseEnter={() => handleMouseEnter("MITRE ATT&CK Matrix", "Visualizes the cyber kill-chain.")} onMouseLeave={handleMouseLeave}>
                <div className="flex justify-between items-center mb-2"><span className="text-[10px] opacity-70 uppercase tracking-widest">ATT&CK Matrix</span><span className="text-[10px] opacity-50">Active Session</span></div>
                <div className="grid grid-cols-7 gap-1">
                    {KILL_CHAIN_PHASES.map((phase, i) => (
                        <div key={i} className="flex flex-col gap-1 items-center">
                             {phase.techniques.map((tech, j) => {
                                 const count = gameState.techniqueCounts[tech] || 0;
                                 let opacityClass = 'opacity-10'; let bgClass = 'bg-transparent';
                                 if (count > 0) { opacityClass = 'opacity-100'; if (count < 5) bgClass = 'bg-[#ffb000]/40'; else if (count < 15) bgClass = 'bg-[#ffb000]/70'; else bgClass = 'bg-[#ffb000]'; }
                                 if (highlightedTechnique === tech) { opacityClass = 'opacity-100'; bgClass = 'bg-white shadow-[0_0_10px_white]'; }
                                 return <div key={j} className={`w-full h-2 border border-[#ffb000] ${bgClass} ${opacityClass} transition-all duration-300`}></div>;
                             })}
                        </div>
                    ))}
                </div>
             </div>

             <div className="mt-4 pt-4 border-t border-[#ffb000]/30 text-center text-xs opacity-50">ROBCO INDUSTRIES (TM) TERM-LINK PROTOCOL</div>
        </div>

      </div>
    </div>
  );
};

export default App;