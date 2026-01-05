import React from 'react';
import { GameState, Faction } from '../types';
import { RetroPanel, RetroButton, RetroProgressBar } from './RetroUI';
import { LEVEL_THRESHOLDS } from '../constants';

interface Props {
    gameState: GameState;
    activeTab: 'SPECIAL' | 'SKILLS' | 'INTEL' | 'FACTIONS';
    setActiveTab: (tab: 'SPECIAL' | 'SKILLS' | 'INTEL' | 'FACTIONS') => void;
    spendPoint: (type: 'SPECIAL' | 'SKILL', key: string) => void;
}

export const LeftPanel: React.FC<Props> = ({ gameState, activeTab, setActiveTab, spendPoint }) => {
    const nextXpThreshold = LEVEL_THRESHOLDS[gameState.level] || 'MAX';
    
    return (
        <div className="flex-1 flex flex-col gap-1 overflow-hidden">
            <RetroPanel uiColor={gameState.uiColor}>
                <div className="flex justify-between items-center border-b pb-[2px] mb-1" style={{ borderColor: gameState.uiColor }}>
                    <span className="font-bold text-xs truncate">{gameState.playerName}</span>
                    <span className="text-[9px]">LVL {gameState.level}</span>
                </div>
                
                <RetroProgressBar 
                    label="XP" 
                    value={gameState.xp} 
                    max={typeof nextXpThreshold === 'number' ? nextXpThreshold : 100} 
                    uiColor={gameState.uiColor} 
                />
                <RetroProgressBar 
                    label="HEAT" 
                    value={gameState.heat} 
                    color={gameState.heat > 80 ? 'red' : undefined} 
                    uiColor={gameState.uiColor} 
                />
                <RetroProgressBar 
                    label="RADS" 
                    value={gameState.playerRadiation} 
                    max={1000} 
                    color="#4ade80" 
                    uiColor={gameState.uiColor} 
                />

                <div className="flex justify-between mt-[2px] font-bold text-[10px] border-t pt-[2px]" style={{ borderColor: gameState.uiColor }}>
                    <span>CASH</span>
                    <span>{gameState.cash} CAPS</span>
                </div>
            </RetroPanel>

             <div className="grid grid-cols-2 gap-[2px]">
                  {(['SPECIAL', 'SKILLS', 'INTEL', 'FACTIONS'] as const).map(tab => (
                      <RetroButton 
                        key={tab} 
                        active={activeTab === tab} 
                        uiColor={gameState.uiColor}
                        onClick={() => setActiveTab(tab)}
                        className="py-1 text-[9px]"
                      >
                        {tab}
                      </RetroButton>
                  ))}
             </div>

             <RetroPanel uiColor={gameState.uiColor} className="flex-1 overflow-y-auto scrollbar-thin">
                 {activeTab === 'SPECIAL' && Object.entries(gameState.special).map(([k,v]) => (
                     <div key={k} className="flex justify-between text-[10px] mb-[2px] px-1 hover:bg-white/5">
                         <span>{k}</span>
                         <span>{v as number} {gameState.upgradePoints > 0 && (v as number) < 10 && <button onClick={() => spendPoint('SPECIAL', k)} className="ml-1 text-[9px] font-bold hover:text-white">[+]</button>}</span>
                     </div>
                 ))}
                 {activeTab === 'SKILLS' && Object.entries(gameState.skills).map(([k,v]) => (
                     <div key={k} className="flex justify-between text-[10px] mb-[2px] px-1 hover:bg-white/5">
                         <span>{k}</span>
                         <span>{v as number} {gameState.upgradePoints > 0 && (v as number) < 100 && <button onClick={() => spendPoint('SKILL', k)} className="ml-1 text-[9px] font-bold hover:text-white">[+]</button>}</span>
                     </div>
                 ))}
                 {activeTab === 'INTEL' && gameState.activeBounties.map(b => (
                     <div key={b.id} className="text-[10px] border-b pb-[2px] mb-1 last:border-0 px-1" style={{ borderColor: gameState.uiColor }}>
                         <div className="font-bold truncate">{b.targetCorp}</div>
                         <div className="opacity-70 text-[9px]">REWARD: {b.reward}C</div>
                     </div>
                 ))}
                 {activeTab === 'FACTIONS' && Object.values(gameState.factions).map((f: Faction) => (
                     <div key={f.id} className="text-[10px] mb-[2px] flex justify-between px-1 hover:bg-white/5">
                         <span>{f.name}</span>
                         <span>{f.reputation}</span>
                     </div>
                 ))}
             </RetroPanel>
        </div>
    );
};