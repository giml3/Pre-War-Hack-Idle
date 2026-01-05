import React, { useEffect, useRef, useState } from 'react';
import { LogEntry } from '../types';

interface Props {
  logs: LogEntry[];
  onCommand?: (cmd: string) => void;
  uiColor?: string;
}

const TerminalLog: React.FC<Props> = ({ logs, onCommand, uiColor = '#ffb000' }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          if (input.trim() && onCommand) {
              onCommand(input);
              setHistory(prev => [...prev, input]);
              setHistoryIndex(null); 
              setInput('');
          }
      } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (history.length === 0) return;
          const newIndex = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
      } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (historyIndex === null) return;
          const newIndex = historyIndex + 1;
          if (newIndex >= history.length) {
              setHistoryIndex(null);
              setInput('');
          } else {
              setHistoryIndex(newIndex);
              setInput(history[newIndex]);
          }
      }
  };

  return (
    <div className="flex-1 bg-black p-1 overflow-hidden flex flex-col font-mono text-xs relative" onClick={() => inputRef.current?.focus()}>
      <div className="absolute top-1 right-2 text-[9px] opacity-50 border border-current px-1" style={{ color: uiColor }}>
        SYS.LOG.V.2.0.76
      </div>
      <div className="overflow-y-auto flex-1 scrollbar-thin pr-1 leading-tight">
        {logs.length === 0 && <div className="text-current/50 italic">Waiting for input...</div>}
        {logs.map((log) => (
          <div key={log.id} className="mb-[1px] break-words">
            <span className="opacity-50 text-[9px] mr-1">[{log.timestamp}]</span>
            <span
              className={`
                ${log.type === 'error' ? 'text-red-500' : ''}
                ${log.type === 'success' ? 'font-bold' : ''}
                ${log.type === 'info' ? 'opacity-80' : ''}
                ${log.type === 'warning' ? 'text-orange-400' : ''}
                ${log.type === 'system' ? 'text-cyan-400 font-bold' : ''}
                ${log.type === 'phase' ? 'text-purple-400 font-bold uppercase underline decoration-dashed' : ''}
                ${log.type === 'mutation' ? 'text-green-400 font-bold' : ''}
              `}
              style={{ color: log.type === 'success' ? uiColor : undefined }}
            >
              {log.type === 'success' ? '> ' : ''}
              {log.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      
      {onCommand && (
          <div className="flex items-center gap-1 mt-1 border-t border-current/30 pt-[2px]" style={{ color: uiColor }}>
              <span className="font-bold text-xs animate-pulse">{'>'}</span>
              <input 
                  ref={inputRef}
                  className="bg-transparent border-none outline-none font-mono flex-1 uppercase text-xs"
                  style={{ color: uiColor }}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  placeholder="ENTER COMMAND..."
              />
          </div>
      )}
    </div>
  );
};

export default TerminalLog;