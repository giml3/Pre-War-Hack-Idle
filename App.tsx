import React, { useState, useEffect, useCallback, useRef } from 'react';
import CharacterCreation from './components/CharacterCreation';
import TerminalLog from './components/TerminalLog';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { CenterPanel } from './components/CenterPanel';
import MitreMatrix from './components/MitreMatrix';
import { INITIAL_JOBS, INITIAL_UPGRADES, INITIAL_UNLOCKABLES, INITIAL_SOFTWARE, LEVEL_THRESHOLDS, KILL_CHAIN_PHASES, VAULT_LAYOUT, PRE_WAR_NEWS, THREAT_CONFIG, LIFESTYLE_CONFIG, STOCK_MARKET_COMPANIES, TARGET_REGISTRY, FACTION_DEFINITIONS, INITIAL_ACHIEVEMENTS, CONSUMABLES, MUTATIONS, RANDOM_FIRST_NAMES, RANDOM_LAST_NAMES, RANDOM_NICKNAMES } from './constants';
import { GameState, Job, LogEntry, Target, SkillName, Special, CorpData, PlayerActivity, EconomyState, Bounty, Faction, Message, Consumable, Mutation, ActiveEffect, Peer } from './types';
import { 
  Globe, LayoutDashboard, Terminal, ShoppingCart, Map
} from 'lucide-react';

const FAILURE_REASONS = [
    "Connection Refused by Peer", "Handshake Timeout", "Firewall Filtered", "IDS Signature Match", "Decryption Key Mismatch"
];

const SAVE_KEY = "WIREFRAME_PROTOCOL_V1_SAVE";

const getRandomTarget = (): Target => TARGET_REGISTRY[Math.floor(Math.random() * TARGET_REGISTRY.length)];

const generateBounty = (currentTime: number, level: number): Bounty => {
    const target = getRandomTarget();
    return {
        id: `b-${Date.now()}-${Math.random()}`,
        targetCorp: target.company,
        description: `Extract Data from ${target.company}`,
        reward: (100 * level) + Math.floor(Math.random() * 200),
        expiresAt: currentTime + 604800000,
        type: 'EXTRACT'
    };
};

const generateBot = (level: number): Peer => {
    const nick = RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)];
    return {
        id: `bot-${Date.now()}-${Math.random()}`,
        name: `${nick}_BOT`,
        level: Math.max(1, level + Math.floor(Math.random() * 3) - 1),
        heat: Math.floor(Math.random() * 40),
        maxHeat: 100,
        status: 'HACKING',
        activity: 'Scanning Nodes...',
        needsHelp: false,
        avatarId: Math.floor(Math.random() * 5)
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
  const [activeShopTab, setActiveShopTab] = useState<'HARDWARE' | 'SOFTWARE' | 'MARKET' | 'AID' | 'LIFESTYLE' | 'SYSTEM'>('HARDWARE');
  const [activeCenterTab, setActiveCenterTab] = useState<'TERMINAL' | 'INBOX' | 'DATABASE' | 'NETWORK'>('TERMINAL');
  const [mobileTab, setMobileTab] = useState<'STATUS' | 'TERMINAL' | 'SUPPLY' | 'VISUAL'>('TERMINAL');
  const [hoverInfo, setHoverInfo] = useState<{title: string, body: string} | null>(null);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [hasLocalSave, setHasLocalSave] = useState(false);

  const stateRef = useRef<GameState | null>(null);
  const lastPhaseRef = useRef<number>(-1);
  const lastMarketUpdateRef = useRef<number>(0);
  
  useEffect(() => { stateRef.current = gameState; }, [gameState]);

  useEffect(() => {
      const interval = setInterval(() => setCurrentNewsIndex(prev => (prev + 1) % PRE_WAR_NEWS.length), 10000);
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
        message, type,
      };
      return { ...prev, logs: [...prev.logs, newLog].slice(-50) };
    });
  }, []);

  const loadGame = () => {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) setGameState(JSON.parse(saved));
  };

  const importSave = (saveString: string) => {
      try { setGameState(JSON.parse(atob(saveString))); } catch (e) { alert("Invalid Save"); }
  };

  const handleJobSelect = (job: Job) => {
    const skills: Record<SkillName, number> = { Science: 0, Lockpick: 0, Sneak: 0, Barter: 0, Speech: 0, Repair: 0 };
    Object.entries(job.initialSkills).forEach(([key, val]) => { if(key) skills[key as SkillName] = val as number; });
    
    const corporations: Record<string, CorpData> = {};
    STOCK_MARKET_COMPANIES.forEach(comp => {
         corporations[comp.code] = { name: comp.name, code: comp.code, desc: "Public Corp", reputation: 0, trace: 0, stockPrice: 10 + Math.random() * 100, stockTrend: 0, ownedShares: 0 };
    });

    const factions: Record<string, Faction> = {};
    FACTION_DEFINITIONS.forEach(fac => { factions[fac.id] = { ...fac }; });

    const startDate = new Date('2075-04-12T06:00:00').getTime();
    setGameState({
      cash: 250, xp: 0, level: 1, job, playerName: job.name, employer: "Freelance",
      gameTime: startDate, gameSpeed: 1, currentActivity: 'SLEEPING',
      jobLevel: 1, economyState: 'STABLE', lastYearChecked: 2075,
      lifestyleLevel: 2, lastRentPaidDay: -1, activeBounties: [generateBounty(startDate, 1)],
      hackingProgress: 0, isAutoHacking: true, upgrades: INITIAL_UPGRADES.map(u => ({...u})), 
      software: INITIAL_SOFTWARE.map(s => ({...s})), unlockables: INITIAL_UNLOCKABLES.map(u => ({...u})),
      vaultLevels: {}, autoBuyHardware: false, autoBuySoftware: false, autoBuyConsumables: false,
      shopStock: {}, lastRestockDay: 0, logs: [], messages: [], achievements: INITIAL_ACHIEVEMENTS,
      totalHacks: 0, techniqueCounts: {}, techniqueLastSeen: {}, currentTarget: getRandomTarget(),
      special: { ...job.initialSpecial }, skills, perks: [], upgradePoints: 0, perkPoints: 0,
      heat: 0, threatLevel: 3, isDowntime: false, downtimeEndTime: 0, corporations, factions,
      marketLastUpdate: startDate, globalRadiation: 15, uiColor: '#ffb000', tutorialStep: 0,
      inventory: {}, activeEffects: [], mutations: [], playerRadiation: 0, addictions: [], peers: []
    });
  };

  const updateGame = useCallback(() => {
    const curr = stateRef.current;
    if (!curr) return;
    
    const timeDelta = 60000 * curr.gameSpeed;
    const newTime = curr.gameTime + timeDelta;
    const date = new Date(newTime);
    const hour = date.getHours();
    const day = Math.floor(newTime / 86400000);

    let activity: PlayerActivity = hour >= 8 && hour < 17 ? 'JOB' : (hour >= 23 || hour < 7 ? 'SLEEPING' : 'HACKING');
    if (curr.isDowntime) activity = 'DOWNTIME';

    let cashChange = 0;
    let radChange = (Math.random() > 0.7 ? 0.5 : 0) / 60; // SLOWED 60X
    let pRadChange = (activity !== 'DOWNTIME' ? (curr.globalRadiation / 10) : 0) / 60; // SLOWED 60X

    setGameState(prev => {
        if(!prev) return null;
        let nPeers = [...prev.peers];
        if (nPeers.length < 4 && Math.random() > 0.95) nPeers.push(generateBot(prev.level));
        
        nPeers = nPeers.map(p => {
            let h = p.heat + (Math.random() > 0.8 ? 2 : 0);
            let s = p.status;
            let help = p.needsHelp;
            if (h >= 100) { h = 100; s = 'LOCKED'; help = true; }
            else if (h > 80) help = true;
            return { ...p, heat: h, status: s, needsHelp: help };
        });

        let nProg = prev.hackingProgress;
        let nHeat = prev.heat;
        let nXp = prev.xp;
        let nLevel = prev.level;
        let nCash = prev.cash + cashChange;

        if (activity === 'HACKING') {
            nProg += 0.05 * (1 + prev.special.I * 0.1);
            nHeat = Math.max(0, nHeat - (prev.special.A * 0.05));
            if (nProg >= 100) {
                nProg = 0;
                nCash += 50 * nLevel;
                nXp += 20;
                if (nXp >= (LEVEL_THRESHOLDS[nLevel] || 9999)) { nLevel++; }
            }
        }

        return {
            ...prev, gameTime: newTime, hackingProgress: nProg, heat: nHeat, cash: nCash, xp: nXp, level: nLevel,
            globalRadiation: Math.min(100, prev.globalRadiation + radChange),
            playerRadiation: Math.min(1000, prev.playerRadiation + pRadChange),
            peers: nPeers, currentActivity: activity
        };
    });
  }, []);

  useEffect(() => {
    if (!gameState) return;
    const interval = setInterval(updateGame, 250);
    return () => clearInterval(interval);
  }, [gameState !== null, updateGame]);

  const onAid = (id: string) => {
      setGameState(prev => {
          if (!prev) return null;
          const idx = prev.peers.findIndex(p => p.id === id);
          if (idx === -1) return prev;
          const nPeers = [...prev.peers];
          nPeers[idx] = { ...nPeers[idx], heat: 0, status: 'HACKING', needsHelp: false };
          return { ...prev, peers: nPeers, cash: prev.cash + 50 };
      });
  };

  if (!gameState) return <CharacterCreation onSelect={handleJobSelect} onLoad={loadGame} onImport={importSave} hasLocalSave={hasLocalSave} />;

  return (
    <div className="flex flex-col h-screen w-screen p-1 bg-black overflow-hidden" style={{ color: gameState.uiColor }}>
      <div className="w-full bg-black h-5 border-b flex items-center overflow-hidden shrink-0 mb-1" style={{ borderColor: gameState.uiColor }}>
           <div className="whitespace-nowrap animate-[marquee_20s_linear_infinite] px-4 font-bold text-xs uppercase flex items-center gap-8">
               <Globe size={10} /> <span>BREAKING NEWS: {PRE_WAR_NEWS[currentNewsIndex]}</span>
           </div>
      </div>
      <div className="flex-1 flex flex-col gap-1 min-h-0 relative">
        <div className={`flex-1 flex gap-1 min-h-0 ${mobileTab === 'VISUAL' ? 'hidden md:flex' : 'flex'}`}>
            <div className={`w-full md:w-60 shrink-0 flex flex-col ${mobileTab === 'STATUS' ? 'flex' : 'hidden md:flex'}`}>
                <LeftPanel gameState={gameState} activeTab={activeTab} setActiveTab={setActiveTab} spendPoint={() => {}} />
            </div>
            <div className={`flex-1 flex flex-col min-w-0 ${mobileTab === 'TERMINAL' ? 'flex' : 'hidden md:flex'}`}>
                <CenterPanel gameState={gameState} activeCenterTab={activeCenterTab} setActiveCenterTab={setActiveCenterTab} handleMouseEnter={() => {}} handleMouseLeave={() => {}} onCommand={() => {}} onAid={onAid} />
            </div>
            <div className={`w-full md:w-60 shrink-0 flex flex-col ${mobileTab === 'SUPPLY' ? 'flex' : 'hidden md:flex'}`}>
                <RightPanel gameState={gameState} activeShopTab={activeShopTab} setActiveShopTab={setActiveShopTab} handlers={{ buyUpgrade: () => {}, buySoftware: () => {}, buyConsumable: () => {}, useConsumable: () => {}, buyStock: () => {}, sellStock: () => {}, toggleAutoBuy: () => {}, setUiColor: (c) => setGameState(p => p ? {...p, uiColor: c}:p), setGameSpeed: (s) => setGameState(p => p?{...p, gameSpeed:s}:p), setLifestyle: () => {} }} />
            </div>
        </div>
        <div className={`shrink-0 ${mobileTab === 'VISUAL' ? 'flex-1 h-full' : 'hidden md:block md:h-48'}`}>
            <MitreMatrix gameState={gameState} handleMouseEnter={() => {}} handleMouseLeave={() => {}} />
        </div>
      </div>
      <div className="md:hidden h-12 border-t mt-1 flex shrink-0 bg-black z-50" style={{ borderColor: gameState.uiColor }}>
           {(['STATUS', 'TERMINAL', 'SUPPLY', 'VISUAL'] as const).map(t => (
               <button key={t} onClick={() => setMobileTab(t)} className={`flex-1 flex flex-col items-center justify-center gap-1 ${mobileTab === t ? 'bg-current text-black' : ''}`} style={{ borderColor: gameState.uiColor }}>
                   <span className="text-[9px] font-bold">{t}</span>
               </button>
           ))}
      </div>
    </div>
  );
};

export default App;