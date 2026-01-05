import React, { useState, useEffect, useMemo } from 'react';
import { KILL_CHAIN_PHASES, TECHNIQUE_DETAILS } from '../constants';
import { GameState, LogEntry } from '../types';

interface Props {
    gameState: GameState;
    handleMouseEnter: (title: string, body: string) => void;
    handleMouseLeave: () => void;
}

const MatrixView: React.FC<Props> = ({ gameState, handleMouseEnter, handleMouseLeave }) => (
    <div className="flex gap-1 min-w-max flex-1 h-full">
        {KILL_CHAIN_PHASES.map((phase, i) => (
            <div key={i} className="w-24 flex flex-col gap-[2px] h-full">
                <div className="text-[9px] font-extrabold border-b border-current/50 mb-[2px] truncate opacity-80 shrink-0" style={{ borderColor: gameState.uiColor }}>{phase.name}</div>
                <div className="overflow-y-auto scrollbar-thin pr-[1px] flex-1">
                    {phase.techniques.map((tech) => {
                        const details = TECHNIQUE_DETAILS[tech];
                        const techId = details ? details.id : tech;
                        const count = gameState.techniqueCounts[tech] || 0;
                        const isActive = count > 0;
                        const lastSeen = gameState.techniqueLastSeen[tech];
                        
                        return (
                            <div key={tech} className="flex flex-col mb-[2px]">
                                <div 
                                    className={`text-[9px] h-4 border cursor-help flex items-center justify-center transition-all font-bold ${isActive ? 'bg-current text-black' : 'opacity-50 hover:opacity-100 hover:border-current'}`}
                                    style={{ borderColor: gameState.uiColor }}
                                    onMouseEnter={() => handleMouseEnter(
                                        tech, 
                                        `${details?.description || "Standard Technique"}\n\nMITIGATION: ${details?.mitigation || "N/A"}\n\nLAST ACTIVE: ${lastSeen || "NEVER"}`
                                    )}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    {techId}
                                </div>
                                {/* Subtechniques */}
                                {details?.subtechniques?.map(sub => {
                                    const subDetails = TECHNIQUE_DETAILS[sub];
                                    const subCount = gameState.techniqueCounts[sub] || 0;
                                    const subActive = subCount > 0;
                                    return (
                                        <div 
                                            key={sub}
                                            className={`ml-[2px] mt-[1px] text-[8px] h-3 border-l-2 pl-[2px] cursor-help flex items-center transition-all font-semibold ${subActive ? 'text-current border-current' : 'opacity-40 hover:opacity-80 border-white/20'}`}
                                            style={{ borderColor: subActive ? gameState.uiColor : undefined }}
                                            onMouseEnter={() => handleMouseEnter(
                                                sub, 
                                                `${subDetails?.description || "Sub-Technique"}\n\nMITIGATION: ${subDetails?.mitigation || "N/A"}`
                                            )}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            {sub.split('.')[1]}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        ))}
    </div>
);

const MapView: React.FC<{ gameState: GameState }> = ({ gameState }) => {
    // Parse logs to create a "Procedural Sketch" of the attack
    const events = useMemo(() => {
        // Filter for Phase changes, Failures, and Successes
        const rawEvents = gameState.logs.filter(l => 
            l.type === 'phase' || 
            (l.type === 'warning' && l.message.includes('Error')) || 
            (l.type === 'success' && l.message.includes('Access'))
        );
        // Take the last 6 for the map
        return rawEvents.slice(-6);
    }, [gameState.logs]);

    return (
        <div className="flex h-full w-full gap-2">
            {/* Written Report Column */}
            <div className="w-1/4 border-r border-current/30 pr-2 overflow-hidden flex flex-col" style={{ borderColor: gameState.uiColor }}>
                <div className="text-[10px] font-bold uppercase border-b border-current/30 mb-2 pb-1">Incident Log</div>
                <div className="flex-1 overflow-y-auto scrollbar-thin font-mono text-[9px] leading-relaxed opacity-80">
                    {events.length === 0 && <div>WAITING FOR SIGNAL...</div>}
                    {events.map((e, i) => (
                        <div key={e.id} className="mb-2">
                            <span className="opacity-50">[{e.timestamp.split(' ')[0]}]</span><br/>
                            {e.type === 'phase' && <span className="font-bold">> INIT PHASE:</span>}
                            {e.type === 'warning' && <span className="text-red-400 font-bold">> FAILURE:</span>}
                            {e.type === 'success' && <span className="font-bold underline">> SUCCESS:</span>}
                            <br/>
                            <span className="pl-2 block truncate">{e.message.replace(/\[.*?\]/, '').trim()}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Procedural Sketch Area */}
            <div className="flex-1 relative border border-current/10 bg-current/5 p-2" style={{ borderColor: gameState.uiColor }}>
                <div className="absolute top-1 right-2 text-[9px] font-mono opacity-50">FIG. A: ATTACK VECTOR TOPOLOGY</div>
                
                <svg className="w-full h-full" style={{ overflow: 'visible' }}>
                    <defs>
                        <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                            <path d="M0,0 L6,3 L0,6" fill="none" stroke="currentColor" strokeWidth="1" />
                        </marker>
                    </defs>
                    
                    {/* Render Timeline Nodes */}
                    {events.map((e, i) => {
                        const x = 50 + (i * 120);
                        const y = 80; // Baseline
                        
                        // Connector Line
                        let connector = null;
                        if (i > 0) {
                            connector = <line x1={50 + ((i-1) * 120) + 20} y1={80} x2={x - 20} y2={80} stroke="currentColor" strokeWidth="1" strokeDasharray="4,2" markerEnd="url(#arrow)" />;
                        }

                        // Failure Branch (if this event is a failure)
                        const isFail = e.type === 'warning';
                        const isRoot = e.type === 'success';

                        return (
                            <g key={e.id}>
                                {connector}
                                
                                {isFail ? (
                                    // Failure Sketch: Drop down node
                                    <g transform={`translate(${x}, ${y})`}>
                                        <line x1="0" y1="0" x2="0" y2="30" stroke="currentColor" strokeWidth="1" />
                                        <circle cx="0" cy="35" r="5" fill="none" stroke="red" strokeWidth="1" />
                                        <path d="M-3,32 L3,38 M3,32 L-3,38" stroke="red" strokeWidth="1" transform="translate(0, 0)" />
                                        <text x="10" y="40" fontSize="8" fill="red" fontFamily="monospace" fontWeight="bold">FAILED</text>
                                    </g>
                                ) : isRoot ? (
                                    // Success Sketch: Diamond
                                    <g transform={`translate(${x}, ${y})`}>
                                        <rect x="-10" y="-10" width="20" height="20" fill="currentColor" transform="rotate(45)" />
                                        <text x="-20" y="-20" fontSize="9" fill="currentColor" fontFamily="monospace" fontWeight="bold">ROOT</text>
                                    </g>
                                ) : (
                                    // Phase Sketch: Box
                                    <g transform={`translate(${x}, ${y})`}>
                                        <rect x="-20" y="-10" width="40" height="20" fill="black" stroke="currentColor" strokeWidth="1" />
                                        <text x="0" y="3" fontSize="8" fill="currentColor" textAnchor="middle" fontFamily="monospace">NODE {i}</text>
                                        <text x="0" y="25" fontSize="7" fill="currentColor" textAnchor="middle" fontFamily="monospace" opacity="0.7">
                                            {e.message.includes('Phase:') ? e.message.split('Phase:')[1].trim().split('...')[0].slice(0, 10) : 'ACTION'}
                                        </text>
                                    </g>
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
}

const MitreMatrix: React.FC<Props> = ({ gameState, handleMouseEnter, handleMouseLeave }) => {
    const [viewMode, setViewMode] = useState<'MATRIX' | 'MAP'>('MATRIX');
    
    // Toggle View every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setViewMode(prev => prev === 'MATRIX' ? 'MAP' : 'MATRIX');
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-full w-full border p-1 overflow-hidden bg-black flex flex-col relative transition-colors duration-500" style={{ borderColor: gameState.uiColor }}>
            {/* Header / View Toggle Indicator */}
            <div className="flex justify-between items-center border-b border-current/30 mb-1 pb-1 shrink-0" style={{ borderColor: gameState.uiColor }}>
                <div className="text-xs font-black uppercase tracking-widest opacity-90">
                    {viewMode === 'MATRIX' ? 'ATT&CK MATRIX // TACTICAL OVERVIEW' : 'INCIDENT TIMELINE // LIVE SKETCH'}
                </div>
                <div className="flex gap-1 items-center">
                    <span className="text-[9px] mr-1 opacity-50 font-mono">{viewMode === 'MATRIX' ? 'VIEW A' : 'VIEW B'}</span>
                    <button 
                        onClick={() => setViewMode('MATRIX')}
                        className={`w-2 h-2 rounded-full transition-all ${viewMode === 'MATRIX' ? 'bg-current scale-125' : 'border border-current opacity-50'}`} 
                        style={{ backgroundColor: viewMode === 'MATRIX' ? gameState.uiColor : 'transparent', borderColor: gameState.uiColor }} 
                    />
                    <button 
                        onClick={() => setViewMode('MAP')}
                        className={`w-2 h-2 rounded-full transition-all ${viewMode === 'MAP' ? 'bg-current scale-125' : 'border border-current opacity-50'}`} 
                        style={{ backgroundColor: viewMode === 'MAP' ? gameState.uiColor : 'transparent', borderColor: gameState.uiColor }} 
                    />
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
                {viewMode === 'MATRIX' ? (
                     <div className="h-full w-full overflow-x-auto overflow-y-hidden">
                        <MatrixView gameState={gameState} handleMouseEnter={handleMouseEnter} handleMouseLeave={handleMouseLeave} />
                     </div>
                ) : (
                    <MapView gameState={gameState} />
                )}
            </div>
        </div>
    );
};

export default MitreMatrix;