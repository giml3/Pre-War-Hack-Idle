import React, { useState } from 'react';
import { INITIAL_JOBS, RANDOM_FIRST_NAMES, RANDOM_LAST_NAMES, RANDOM_NICKNAMES, RANDOM_JOB_TITLES, RANDOM_JOB_DESCRIPTIONS, SKILL_DEFINITIONS } from '../constants';
import { Job, Special, SkillName } from '../types';
import { Terminal, User, Briefcase, Activity, Zap, Shuffle, Save, Upload } from 'lucide-react';

interface Props {
  onSelect: (job: Job) => void;
  onLoad: () => void;
  onImport: (saveString: string) => void;
  hasLocalSave: boolean;
}

const CharacterCreation: React.FC<Props> = ({ onSelect, onLoad, onImport, hasLocalSave }) => {
  const [selectedJob, setSelectedJob] = useState<Job>(INITIAL_JOBS[0]);
  const [isCustom, setIsCustom] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importString, setImportString] = useState("");

  const generateRandomJob = (): Job => {
      const first = RANDOM_FIRST_NAMES[Math.floor(Math.random() * RANDOM_FIRST_NAMES.length)];
      const last = RANDOM_LAST_NAMES[Math.floor(Math.random() * RANDOM_LAST_NAMES.length)];
      const nick = RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)];
      const title = RANDOM_JOB_TITLES[Math.floor(Math.random() * RANDOM_JOB_TITLES.length)];
      const desc = RANDOM_JOB_DESCRIPTIONS[Math.floor(Math.random() * RANDOM_JOB_DESCRIPTIONS.length)];

      const stats: Special = { S: 1, P: 1, E: 1, C: 1, I: 1, A: 1, L: 1 };
      let pointsLeft = 33 - 7; 
      while (pointsLeft > 0) {
          const keys = Object.keys(stats) as Array<keyof Special>;
          const key = keys[Math.floor(Math.random() * keys.length)];
          if (stats[key] < 10) { stats[key]++; pointsLeft--; }
      }

      const skillKeys = SKILL_DEFINITIONS.map(s => s.name);
      const tagSkills: Partial<Record<SkillName, number>> = {};
      const s1 = skillKeys[Math.floor(Math.random() * skillKeys.length)] as SkillName;
      tagSkills[s1] = 20;

      return {
          id: `custom-${Date.now()}`,
          name: `${first} "${nick}" ${last}`,
          title: title,
          description: desc,
          initialSpecial: stats,
          initialSkills: tagSkills
      };
  };

  const randomize = () => {
    setSelectedJob(generateRandomJob());
    setIsCustom(true);
  };

  const renderSpecialBar = (val: number, label: string) => (
    <div className="flex items-center gap-2 text-sm">
        <span className="w-5 font-bold">{label}</span>
        <div className="flex-1 flex gap-[2px]">
            {Array.from({length: 10}).map((_, i) => (
                <div key={i} className={`h-3 w-full ${i < val ? 'bg-[#ffb000]' : 'bg-[#ffb000]/10 border border-[#ffb000]/20'}`} />
            ))}
        </div>
        <span className="w-5 text-right font-mono">{val}</span>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-[#ffb000] bg-black">
      <div className="w-full max-w-5xl border-2 border-[#ffb000] p-6 bg-black shadow-[0_0_20px_rgba(255,176,0,0.3)] relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black px-4 text-2xl font-bold tracking-widest border border-[#ffb000]">
          V.A.U.L.T. PERSONNEL RECORD
        </div>

        <div className="flex justify-end gap-2 mb-4">
             {hasLocalSave && <button onClick={onLoad} className="flex items-center gap-2 px-3 py-1 border border-green-500 text-green-500 hover:bg-green-500/10 font-bold uppercase text-xs"><Save size={14} /> Continue</button>}
             <button onClick={() => setShowImport(!showImport)} className="flex items-center gap-2 px-3 py-1 border border-blue-500 text-blue-500 hover:bg-blue-500/10 font-bold uppercase text-xs"><Upload size={14} /> Import</button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 flex flex-col gap-2">
            <button 
                onClick={randomize}
                className="w-full p-5 border-2 border-green-400 text-green-400 bg-green-400/5 hover:bg-green-400/20 font-black text-xl uppercase flex items-center justify-center gap-3 mb-4 animate-pulse shadow-[0_0_15px_rgba(74,222,128,0.2)]"
            >
                <Shuffle size={28} /> RANDOMIZE IDENTITY
            </button>

            <div className="h-[400px] overflow-y-auto border border-[#ffb000]/30 p-2 scrollbar-thin">
                {INITIAL_JOBS.map((job) => (
                <button
                    key={job.id}
                    onClick={() => { setSelectedJob(job); setIsCustom(false); }}
                    className={`w-full text-left p-3 mb-2 border ${selectedJob.id === job.id && !isCustom ? 'bg-[#ffb000] text-black border-[#ffb000]' : 'border-transparent hover:border-[#ffb000]/50'}`}
                >
                    <div className="font-bold uppercase">{job.title}</div>
                    <div className="text-xs opacity-70">{job.name}</div>
                </button>
                ))}
            </div>
          </div>

          <div className="flex-[1.5] border border-[#ffb000]/50 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start gap-4 mb-4 pb-4 border-b border-[#ffb000]/30">
                <div className="w-20 h-20 border border-[#ffb000] flex items-center justify-center bg-[#ffb000]/10 rounded-full"><User size={40} /></div>
                <div>
                  <h2 className="text-3xl font-bold uppercase leading-tight">{selectedJob.name}</h2>
                  <div className="flex items-center gap-2 text-xl opacity-80"><Briefcase size={18} /> {selectedJob.title}</div>
                </div>
              </div>
              <p className="text-lg italic opacity-80 border-l-2 border-[#ffb000]/30 pl-4 mb-6">"{selectedJob.description}"</p>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                    <h3 className="text-lg border-b border-[#ffb000]/30 mb-2 uppercase font-bold flex items-center gap-2"><Activity size={16} /> SPECIAL</h3>
                    {renderSpecialBar(selectedJob.initialSpecial.S, 'S')}
                    {renderSpecialBar(selectedJob.initialSpecial.P, 'P')}
                    {renderSpecialBar(selectedJob.initialSpecial.E, 'E')}
                    {renderSpecialBar(selectedJob.initialSpecial.C, 'C')}
                    {renderSpecialBar(selectedJob.initialSpecial.I, 'I')}
                    {renderSpecialBar(selectedJob.initialSpecial.A, 'A')}
                    {renderSpecialBar(selectedJob.initialSpecial.L, 'L')}
                </div>
                <div>
                    <h3 className="text-lg border-b border-[#ffb000]/30 mb-2 uppercase font-bold flex items-center gap-2"><Zap size={16} /> TAGS</h3>
                    {Object.entries(selectedJob.initialSkills).map(([s, v]) => (
                        <div key={s} className="flex justify-between border p-2 mb-1 bg-[#ffb000]/5 border-[#ffb000]/30">
                            <span className="font-bold uppercase text-sm">{s}</span>
                            <span className="font-mono">{v}</span>
                        </div>
                    ))}
                </div>
              </div>
            </div>
            <button onClick={() => onSelect(selectedJob)} className="mt-8 w-full bg-[#ffb000] text-black font-bold text-2xl py-4 hover:bg-[#ffcc33] uppercase tracking-widest flex items-center justify-center gap-2"><Terminal size={24} /> CONFIRM SELECTION</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreation;