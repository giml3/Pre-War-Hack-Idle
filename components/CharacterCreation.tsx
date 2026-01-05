import React, { useState, useEffect } from 'react';
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
  const [importString, setImportString] = useState("");
  const [showImport, setShowImport] = useState(false);

  const generateRandomJob = (): Job => {
      const first = RANDOM_FIRST_NAMES[Math.floor(Math.random() * RANDOM_FIRST_NAMES.length)];
      const last = RANDOM_LAST_NAMES[Math.floor(Math.random() * RANDOM_LAST_NAMES.length)];
      const nick = RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)];
      const title = RANDOM_JOB_TITLES[Math.floor(Math.random() * RANDOM_JOB_TITLES.length)];
      const desc = RANDOM_JOB_DESCRIPTIONS[Math.floor(Math.random() * RANDOM_JOB_DESCRIPTIONS.length)];

      // Distribute 33 points across 7 stats (min 1, max 10)
      const stats: Special = { S: 1, P: 1, E: 1, C: 1, I: 1, A: 1, L: 1 };
      let pointsLeft = 33 - 7; 
      
      while (pointsLeft > 0) {
          const keys = Object.keys(stats) as Array<keyof Special>;
          const key = keys[Math.floor(Math.random() * keys.length)];
          if (stats[key] < 10) {
              stats[key]++;
              pointsLeft--;
          }
      }

      // Pick 2 random tag skills
      const skillKeys = SKILL_DEFINITIONS.map(s => s.name);
      const tagSkills: Partial<Record<SkillName, number>> = {};
      const skill1 = skillKeys[Math.floor(Math.random() * skillKeys.length)];
      let skill2 = skillKeys[Math.floor(Math.random() * skillKeys.length)];
      while (skill2 === skill1) skill2 = skillKeys[Math.floor(Math.random() * skillKeys.length)];

      tagSkills[skill1 as SkillName] = 20;
      tagSkills[skill2 as SkillName] = 20;

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
    const newJob = generateRandomJob();
    setSelectedJob(newJob);
    setIsCustom(true);
  };

  const handlePresetSelect = (job: Job) => {
      setSelectedJob(job);
      setIsCustom(false);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (importString.trim()) {
          onImport(importString.trim());
      }
  };

  const renderSpecialBar = (val: number, label: string) => {
      // Scale 1-10
      return (
        <div className="flex items-center gap-2 text-sm md:text-base">
            <span className="w-5 font-bold">{label}</span>
            <div className="flex-1 flex gap-[2px]">
                {Array.from({length: 10}).map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-3 md:h-4 w-full ${i < val ? 'bg-[#ffb000]' : 'bg-[#ffb000]/10 border border-[#ffb000]/20'}`}
                    />
                ))}
            </div>
            <span className="w-5 text-right font-mono">{val}</span>
        </div>
      );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-2 md:p-4 text-[#ffb000] overflow-y-auto">
      <div className="w-full max-w-5xl border-2 border-[#ffb000] p-4 md:p-6 bg-black shadow-[0_0_20px_rgba(255,176,0,0.3)] relative my-auto">
        <div className="md:absolute top-0 left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 bg-black px-4 py-2 md:py-0 text-xl md:text-2xl font-bold tracking-widest border border-[#ffb000] text-center mb-4 md:mb-0">
          V.A.U.L.T. PERSONNEL RECORD
        </div>

        {/* Load / Import Controls */}
        <div className="flex justify-end gap-2 mb-4">
             {hasLocalSave && (
                 <button onClick={onLoad} className="flex items-center gap-2 px-3 py-1 border border-green-500 text-green-500 hover:bg-green-500/10 font-bold uppercase text-sm">
                     <Save size={16} /> Continue Campaign
                 </button>
             )}
             <button onClick={() => setShowImport(!showImport)} className="flex items-center gap-2 px-3 py-1 border border-blue-500 text-blue-500 hover:bg-blue-500/10 font-bold uppercase text-sm">
                 <Upload size={16} /> Import Neural Link
             </button>
        </div>

        {showImport && (
            <form onSubmit={handleImportSubmit} className="mb-4 border border-blue-500/50 p-2 bg-blue-900/10">
                <div className="text-xs mb-1 text-blue-400">PASTE NEURAL LINK DATA STRING:</div>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={importString} 
                        onChange={(e) => setImportString(e.target.value)} 
                        className="flex-1 bg-black border border-blue-500/30 text-blue-300 px-2 py-1 font-mono text-xs" 
                        placeholder="eyJ..."
                    />
                    <button type="submit" className="px-4 py-1 bg-blue-500/20 text-blue-300 hover:bg-blue-500/40 text-xs font-bold border border-blue-500">LOAD</button>
                </div>
            </form>
        )}

        <div className="flex flex-col md:flex-row gap-4 md:gap-8 mt-2 md:mt-4">
          {/* List */}
          <div className="flex-1 flex flex-col gap-2">
            
            {/* ENHANCED RANDOMIZE BUTTON */}
            <button 
                onClick={randomize}
                className={`w-full p-4 border-2 ${isCustom ? 'border-[#ffb000] bg-[#ffb000] text-black shadow-[0_0_15px_#ffb000]' : 'border-green-400 text-green-400 hover:bg-green-400/20'} font-black text-lg uppercase flex items-center justify-center gap-3 mb-4 transition-all duration-300 animate-pulse`}
            >
                <Shuffle size={24} /> 
                {isCustom ? "IDENTITY RANDOMIZED" : "RANDOMIZE IDENTITY"}
            </button>

            <div className="h-48 md:h-[500px] overflow-y-auto border border-[#ffb000]/50 p-2 scrollbar-thin">
                {INITIAL_JOBS.map((job) => (
                <button
                    key={job.id}
                    onClick={() => handlePresetSelect(job)}
                    className={`w-full text-left p-3 mb-2 transition-all duration-200 border ${
                    selectedJob.id === job.id && !isCustom
                        ? 'bg-[#ffb000] text-black border-[#ffb000]'
                        : 'bg-transparent text-[#ffb000] border-transparent hover:border-[#ffb000]/50'
                    }`}
                >
                    <div className="font-bold text-base md:text-lg uppercase">{job.title}</div>
                    <div className="text-xs md:text-sm opacity-80">{job.name}</div>
                </button>
                ))}
            </div>
          </div>

          {/* Details */}
          <div className="flex-[1.5] flex flex-col justify-between border border-[#ffb000]/50 p-4 md:p-6 relative">
            
             {/* Decorative Corners */}
             <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#ffb000]"></div>
             <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#ffb000]"></div>
             <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#ffb000]"></div>
             <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#ffb000]"></div>

            <div>
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-4 pb-4 border-b border-[#ffb000]/30 text-center md:text-left">
                <div className="w-16 h-16 md:w-20 md:h-20 border border-[#ffb000] flex items-center justify-center bg-[#ffb000]/10 rounded-full shrink-0">
                   <User size={32} className="md:w-10 md:h-10" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold uppercase leading-tight">{selectedJob.name}</h2>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-lg md:text-xl opacity-80 mt-1">
                    <Briefcase size={18} />
                    {selectedJob.title}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-base md:text-lg leading-relaxed italic opacity-80 border-l-2 border-[#ffb000]/30 pl-4">"{selectedJob.description}"</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-base md:text-lg border-b border-[#ffb000]/30 mb-2 uppercase tracking-wider flex items-center gap-2 font-bold">
                        <Activity size={16} /> S.P.E.C.I.A.L.
                    </h3>
                    <div className="space-y-1">
                        {renderSpecialBar(selectedJob.initialSpecial.S, 'S')}
                        {renderSpecialBar(selectedJob.initialSpecial.P, 'P')}
                        {renderSpecialBar(selectedJob.initialSpecial.E, 'E')}
                        {renderSpecialBar(selectedJob.initialSpecial.C, 'C')}
                        {renderSpecialBar(selectedJob.initialSpecial.I, 'I')}
                        {renderSpecialBar(selectedJob.initialSpecial.A, 'A')}
                        {renderSpecialBar(selectedJob.initialSpecial.L, 'L')}
                    </div>
                </div>
                <div>
                    <h3 className="text-base md:text-lg border-b border-[#ffb000]/30 mb-2 uppercase tracking-wider flex items-center gap-2 font-bold">
                        <Zap size={16} /> Tag Skills
                    </h3>
                    <div className="space-y-2">
                        {Object.entries(selectedJob.initialSkills).map(([skill, val]) => (
                            <div key={skill} className="flex justify-between items-center border border-[#ffb000]/30 p-2 bg-[#ffb000]/5 text-sm md:text-base">
                                <span className="font-bold uppercase">{skill}</span>
                                <span className="font-mono text-lg md:text-xl">{val}</span>
                            </div>
                        ))}
                         {Object.keys(selectedJob.initialSkills).length === 0 && <span className="opacity-50">None</span>}
                    </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelect(selectedJob)}
              className="mt-6 md:mt-8 w-full bg-[#ffb000] text-black font-bold text-xl md:text-2xl py-3 md:py-4 hover:bg-[#ffcc33] transition-colors uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Terminal size={24} />
              CONFIRM SELECTION
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreation;