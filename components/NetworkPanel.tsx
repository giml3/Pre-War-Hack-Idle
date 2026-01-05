import React from 'react';
import { Peer } from '../types';
import { RetroButton } from './RetroUI';
import { Shield, AlertTriangle, Cpu, Activity, User } from 'lucide-react';

interface Props {
    peers: Peer[];
    onAid: (peerId: string) => void;
    uiColor: string;
}

const NetworkPanel: React.FC<Props> = ({ peers, onAid, uiColor }) => {
    return (
        <div className="flex-1 flex flex-col p-2 overflow-y-auto scrollbar-thin">
            <div className="flex items-center gap-2 mb-4 opacity-70 border-b pb-2" style={{ borderColor: uiColor }}>
                <Activity size={16} className="animate-pulse" />
                <span className="text-xs font-bold tracking-widest">REGIONAL_NODE_CONNECT: {peers.length} ACTIVE</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
                {peers.map(peer => (
                    <div 
                        key={peer.id} 
                        className={`border p-2 flex items-center gap-3 transition-all ${peer.needsHelp ? 'border-red-500 bg-red-900/10' : 'bg-white/5'}`}
                        style={{ borderColor: peer.needsHelp ? '#ef4444' : uiColor }}
                    >
                        {/* Avatar / Status Icon */}
                        <div className="relative">
                            <div className="w-10 h-10 border flex items-center justify-center" style={{ borderColor: uiColor }}>
                                <User size={20} />
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-black ${peer.status === 'HACKING' ? 'bg-green-500 animate-pulse' : peer.status === 'LOCKED' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-sm truncate">{peer.name}</span>
                                <span className="text-[10px] opacity-70">LVL {peer.level}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                {/* Heat Bar */}
                                <div className="flex items-center gap-2 text-[9px] font-mono">
                                    <span className="w-8">HEAT</span>
                                    <div className="flex-1 h-1 bg-gray-800">
                                        <div 
                                            className="h-full transition-all duration-500" 
                                            style={{ 
                                                width: `${(peer.heat / peer.maxHeat) * 100}%`,
                                                backgroundColor: peer.heat > 80 ? '#ef4444' : uiColor
                                            }} 
                                        />
                                    </div>
                                    <span className={peer.heat > 80 ? 'text-red-500 font-bold' : ''}>{Math.floor(peer.heat)}%</span>
                                </div>
                                {/* Activity Text */}
                                <div className="text-[10px] truncate opacity-60 font-mono">
                                    {peer.status === 'LOCKED' ? 'SYSTEM LOCKOUT - REBOOTING' : `> ${peer.activity}`}
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="shrink-0">
                            <RetroButton 
                                uiColor={uiColor}
                                disabled={!peer.needsHelp}
                                onClick={() => onAid(peer.id)}
                                className={`text-[10px] px-2 py-2 h-full flex flex-col items-center justify-center gap-1 ${peer.needsHelp ? 'animate-pulse bg-red-500/20 text-red-400 border-red-500' : 'opacity-30 cursor-not-allowed'}`}
                            >
                                <Shield size={14} />
                                {peer.needsHelp ? 'AID' : 'OK'}
                            </RetroButton>
                        </div>
                    </div>
                ))}
                
                {peers.length === 0 && (
                    <div className="text-center opacity-50 text-xs mt-10">
                        SCANNING FOR LOCAL NODES...
                    </div>
                )}
            </div>
        </div>
    );
};

export default NetworkPanel;