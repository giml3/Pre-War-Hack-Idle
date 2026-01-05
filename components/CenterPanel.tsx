import React from 'react';
import { GameState } from '../types';
import TerminalLog from './TerminalLog';
import { RetroButton } from './RetroUI';

type CenterTab = 'TERMINAL' | 'INBOX' | 'DATABASE';

interface Props {
    gameState: GameState;
    activeCenterTab: CenterTab;
    setActiveCenterTab: (tab: CenterTab) => void;
    handleMouseEnter: (title: string, body: string) => void;
    handleMouseLeave: () => void;
    onCommand: (cmd: string) => void;
}

export const CenterPanel: React.FC<Props> = ({ 
    gameState, activeCenterTab, setActiveCenterTab, onCommand 
}) => {
    return (
        <div className="flex-1 flex flex-col border h-full min-h-0 relative" style={{ borderColor: gameState.uiColor }}>
             <div className="flex border-b shrink-0" style={{ borderColor: gameState.uiColor }}>
                 {(['TERMINAL', 'INBOX', 'DATABASE'] as const).map(tab => (
                      <RetroButton 
                        key={tab} 
                        active={activeCenterTab === tab}
                        uiColor={gameState.uiColor}
                        onClick={() => setActiveCenterTab(tab)} 
                        className="flex-1 py-1 font-bold text-xs border-0 border-r last:border-r-0"
                      >
                          {tab}
                      </RetroButton>
                 ))}
             </div>

             <div className="flex-1 overflow-hidden relative flex flex-col min-h-0">
                 {activeCenterTab === 'TERMINAL' && (
                    <TerminalLog logs={gameState.logs} onCommand={onCommand} uiColor={gameState.uiColor} />
                 )}
                 {activeCenterTab === 'INBOX' && (
                     <div className="p-2 overflow-y-auto h-full scrollbar-thin">
                         {gameState.messages.map(msg => (
                             <div key={msg.id} className="border-b py-2 mb-2" style={{ borderColor: gameState.uiColor }}>
                                 <div className="font-bold flex justify-between text-xs">
                                     <span>{msg.sender}</span>
                                     <span className="opacity-70">{msg.date}</span>
                                 </div>
                                 <div className="text-xs font-bold uppercase mt-1">{msg.subject}</div>
                                 <div className="text-[10px] mt-1 opacity-90 leading-relaxed">{msg.body}</div>
                             </div>
                         ))}
                     </div>
                 )}
                 {activeCenterTab === 'DATABASE' && (
                     <div className="p-4 flex items-center justify-center h-full opacity-50 italic text-xs">
                         ACCESS RESTRICTED. ENCRYPTION LEVEL TOO HIGH.
                     </div>
                 )}
             </div>
        </div>
    );
};