import React from 'react';
import { GameState, CorpData } from '../types';
import { RetroPanel, RetroButton } from './RetroUI';
import { CONSUMABLES } from '../constants';

type ShopTab = 'HARDWARE' | 'SOFTWARE' | 'MARKET' | 'AID' | 'SYSTEM';

interface Props {
    gameState: GameState;
    activeShopTab: ShopTab;
    setActiveShopTab: (tab: ShopTab) => void;
    handlers: {
        buyUpgrade: (id: string) => void;
        buySoftware: (id: string) => void;
        buyConsumable: (id: string) => void;
        useConsumable: (id: string) => void;
        buyStock: (code: string, amount: number) => void;
        sellStock: (code: string, amount: number) => void;
        toggleAutoBuy: (type: 'HARDWARE' | 'SOFTWARE' | 'AID') => void;
        setUiColor: (color: string) => void;
        setGameSpeed: (speed: number) => void;
    }
}

export const RightPanel: React.FC<Props> = ({ gameState, activeShopTab, setActiveShopTab, handlers }) => {
    
    const colors = ['#ffb000', '#22c55e', '#06b6d4', '#ef4444', '#d946ef', '#ffffff'];

    return (
        <div className="flex-1 flex flex-col gap-1 overflow-hidden">
             <RetroPanel uiColor={gameState.uiColor} title="SUPPLY" className="h-full">
                <div className="flex flex-wrap gap-[2px] mb-1">
                    {(['HARDWARE', 'SOFTWARE', 'MARKET', 'AID', 'SYSTEM'] as const).map(tab => (
                        <RetroButton 
                            key={tab} 
                            active={activeShopTab === tab} 
                            uiColor={gameState.uiColor}
                            onClick={() => setActiveShopTab(tab)}
                            className="flex-1 py-[2px] px-1 text-[9px] min-w-[40px]"
                        >
                            {tab}
                        </RetroButton>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                    {/* Auto Buy Toggles */}
                    {activeShopTab === 'HARDWARE' && (
                        <div className="flex items-center justify-between border p-[2px] mb-1 bg-white/5" style={{ borderColor: gameState.uiColor }}>
                            <span className="text-[9px] font-bold">AUTO-UPGRADE</span>
                            <button onClick={() => handlers.toggleAutoBuy('HARDWARE')} className={`w-5 h-2 border ${gameState.autoBuyHardware ? 'bg-green-500' : 'bg-red-900'}`}></button>
                        </div>
                    )}
                    {activeShopTab === 'SOFTWARE' && (
                        <div className="flex items-center justify-between border p-[2px] mb-1 bg-white/5" style={{ borderColor: gameState.uiColor }}>
                            <span className="text-[9px] font-bold">AUTO-COMPILE</span>
                            <button onClick={() => handlers.toggleAutoBuy('SOFTWARE')} className={`w-5 h-2 border ${gameState.autoBuySoftware ? 'bg-green-500' : 'bg-red-900'}`}></button>
                        </div>
                    )}
                    {activeShopTab === 'AID' && (
                        <div className="flex items-center justify-between border p-[2px] mb-1 bg-white/5" style={{ borderColor: gameState.uiColor }}>
                            <span className="text-[9px] font-bold">AUTO-RESTOCK</span>
                            <button onClick={() => handlers.toggleAutoBuy('AID')} className={`w-5 h-2 border ${gameState.autoBuyConsumables ? 'bg-green-500' : 'bg-red-900'}`}></button>
                        </div>
                    )}

                    {activeShopTab === 'HARDWARE' && gameState.upgrades.map(u => (
                        <button key={u.id} onClick={() => handlers.buyUpgrade(u.id)} className="w-full border border-white/20 p-1 text-left hover:bg-white/10 flex items-center justify-between group h-8">
                            <div className="flex flex-col overflow-hidden">
                                <span className="font-bold text-[9px] leading-none group-hover:text-white truncate">{u.name}</span>
                                <span className="text-[8px] opacity-70">Lvl {u.owned} | +{(u.value * 100).toFixed(0)}%</span>
                            </div>
                            <div className="text-right bg-[#ffb000]/20 px-1 border border-[#ffb000]/50 shrink-0">
                                <span className="block font-mono text-[9px] text-[#ffb000] font-bold">{Math.floor(u.baseCost * Math.pow(u.costMultiplier, u.owned))}</span>
                            </div>
                        </button>
                    ))}

                    {activeShopTab === 'SOFTWARE' && gameState.software.map(s => (
                        <button key={s.id} onClick={() => handlers.buySoftware(s.id)} className="w-full border border-white/20 p-1 text-left hover:bg-white/10 flex items-center justify-between group h-8">
                            <div className="flex flex-col overflow-hidden">
                                <span className="font-bold text-[9px] leading-none group-hover:text-white truncate">{s.name}</span>
                                <span className="text-[8px] opacity-70">v{s.owned} | {s.type}</span>
                            </div>
                            <div className="text-right bg-[#ffb000]/20 px-1 border border-[#ffb000]/50 shrink-0">
                                <span className="block font-mono text-[9px] text-[#ffb000] font-bold">{Math.floor(s.baseCost * Math.pow(s.costMultiplier, s.owned))}</span>
                            </div>
                        </button>
                    ))}

                    {activeShopTab === 'AID' && CONSUMABLES.map(c => (
                        <div key={c.id} className="border border-white/20 p-[2px] text-[9px] flex justify-between items-center h-8 gap-1">
                            <div className="flex flex-col flex-1 overflow-hidden">
                                <span className="font-bold truncate">{c.name}</span>
                                <span className="opacity-60 text-[8px]">Inv:{gameState.inventory[c.id]||0} | Stk:{gameState.shopStock[c.id]||0}</span>
                            </div>
                            <div className="flex gap-[2px] h-full items-center shrink-0">
                                <button onClick={() => handlers.buyConsumable(c.id)} className="px-[2px] border border-[#ffb000]/50 bg-[#ffb000]/10 hover:bg-[#ffb000]/30 h-6 flex items-center min-w-[24px] justify-center font-mono text-[8px]">{c.baseCost}</button>
                                <button onClick={() => handlers.useConsumable(c.id)} className="px-[2px] border border-green-500/50 bg-green-500/10 hover:bg-green-500/30 h-6 flex items-center text-green-400 text-[8px]">USE</button>
                            </div>
                        </div>
                    ))}

                    {activeShopTab === 'MARKET' && Object.values(gameState.corporations).map((c: CorpData) => (
                        <div key={c.code} className="border border-white/20 p-[2px] text-[9px] flex justify-between items-center h-7 hover:bg-white/5">
                            <div className="font-bold w-10">{c.code}</div>
                            <div className="font-mono text-[#ffb000] w-10 text-right">{Math.floor(c.stockPrice)}</div>
                            <div className="flex gap-[2px]">
                                <button onClick={() => handlers.sellStock(c.code, 1)} className="px-1 border hover:bg-white/20 text-[8px]">S</button>
                                <button onClick={() => handlers.buyStock(c.code, 1)} className="px-1 border hover:bg-white/20 text-[8px]">B</button>
                            </div>
                        </div>
                    ))}

                    {activeShopTab === 'SYSTEM' && (
                        <div className="flex flex-col gap-1 p-[2px]">
                            <div className="border p-1" style={{ borderColor: gameState.uiColor }}>
                                <div className="text-[9px] font-bold mb-1 uppercase opacity-70">Color Theme</div>
                                <div className="flex gap-1 flex-wrap">
                                    {colors.map(c => (
                                        <button 
                                            key={c}
                                            onClick={() => handlers.setUiColor(c)}
                                            className={`w-5 h-5 border transition-transform hover:scale-110 ${gameState.uiColor === c ? 'ring-1 ring-white' : ''}`}
                                            style={{ backgroundColor: c, borderColor: gameState.uiColor === c ? 'white' : 'transparent' }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="border p-1" style={{ borderColor: gameState.uiColor }}>
                                <div className="text-[9px] font-bold mb-1 uppercase opacity-70">CPU Speed</div>
                                <div className="flex gap-[2px]">
                                    {[0, 1, 2, 5].map(s => (
                                        <RetroButton 
                                            key={s} 
                                            active={gameState.gameSpeed === s} 
                                            uiColor={gameState.uiColor}
                                            onClick={() => handlers.setGameSpeed(s)}
                                            className="flex-1 py-[2px] text-[9px]"
                                        >
                                            {s === 0 ? '||' : `${s}x`}
                                        </RetroButton>
                                    ))}
                                </div>
                            </div>

                            <div className="border p-1 mt-1 text-center" style={{ borderColor: gameState.uiColor }}>
                                <div className="text-[8px] opacity-50">
                                    WIREFRAME v1.0.4<br/>
                                    ID: {gameState.job?.id.split('-')[1] || 'UNK'}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
             </RetroPanel>
        </div>
    );
};