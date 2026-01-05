import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface Props {
  logs: LogEntry[];
}

const TerminalLog: React.FC<Props> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex-1 bg-black border border-[#ffb000]/50 p-4 overflow-hidden flex flex-col font-mono text-lg relative">
      <div className="absolute top-2 right-2 text-xs opacity-50 border border-[#ffb000]/30 px-2">
        SYS.LOG.V.2.0.76
      </div>
      <div className="overflow-y-auto flex-1 scrollbar-thin pr-2">
        {logs.length === 0 && <div className="text-[#ffb000]/50 italic">Waiting for input...</div>}
        {logs.map((log) => (
          <div key={log.id} className="mb-1 break-words leading-tight">
            <span className="opacity-50 text-sm mr-2">[{log.timestamp}]</span>
            <span
              className={`
                ${log.type === 'error' ? 'text-red-500' : ''}
                ${log.type === 'success' ? 'text-[#ffb000] font-bold' : ''}
                ${log.type === 'info' ? 'text-[#ffb000]/80' : ''}
                ${log.type === 'warning' ? 'text-orange-400' : ''}
                ${log.type === 'system' ? 'text-cyan-400 font-bold' : ''}
                ${log.type === 'phase' ? 'text-purple-400 font-bold uppercase underline decoration-dashed' : ''}
              `}
            >
              {log.type === 'success' ? '> ' : ''}
              {log.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default TerminalLog;