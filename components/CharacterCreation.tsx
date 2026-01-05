import React, { useState } from 'react';
import { INITIAL_JOBS } from '../constants';
import { Job } from '../types';
import { Terminal, User, Briefcase, Activity, Zap } from 'lucide-react';

interface Props {
  onSelect: (job: Job) => void;
}

const CharacterCreation: React.FC<Props> = ({ onSelect }) => {
  const [selectedId, setSelectedId] = useState<string>(INITIAL_JOBS[0].id);

  const selectedJob = INITIAL_JOBS.find((j) => j.id === selectedId) || INITIAL_JOBS[0];

  const renderSpecialBar = (val: number, label: string) => {
      // Scale 1-10
      return (
        <div className="flex items-center gap-2 text-sm">
            <span className="w-4 font-bold">{label}</span>
            <div className="flex-1 flex gap-[2px]">
                {Array.from({length: 10}).map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-3 w-full ${i < val ? 'bg-[#ffb000]' : 'bg-[#ffb000]/10 border border-[#ffb000]/20'}`}
                    />
                ))}
            </div>
            <span className="w-4 text-right">{val}</span>
        </div>
      );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-[#ffb000]">
      <div className="w-full max-w-5xl border-2 border-[#ffb000] p-6 bg-black shadow-[0_0_20px_rgba(255,176,0,0.3)] relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black px-4 text-2xl font-bold tracking-widest border border-[#ffb000]">
          V.A.U.L.T. PERSONNEL RECORD
        </div>

        <div className="flex flex-col md:flex-row gap-8 mt-8">
          {/* List */}
          <div className="flex-1 h-[500px] overflow-y-auto border border-[#ffb000]/50 p-2 scrollbar-thin">
            {INITIAL_JOBS.map((job) => (
              <button
                key={job.id}
                onClick={() => setSelectedId(job.id)}
                className={`w-full text-left p-3 mb-2 transition-all duration-200 border ${
                  selectedId === job.id
                    ? 'bg-[#ffb000] text-black border-[#ffb000]'
                    : 'bg-transparent text-[#ffb000] border-transparent hover:border-[#ffb000]/50'
                }`}
              >
                <div className="font-bold text-lg uppercase">{job.title}</div>
                <div className="text-sm opacity-80">{job.name}</div>
              </button>
            ))}
          </div>

          {/* Details */}
          <div className="flex-[1.5] flex flex-col justify-between border border-[#ffb000]/50 p-6 relative">
            
             {/* Decorative Corners */}
             <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#ffb000]"></div>
             <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#ffb000]"></div>
             <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#ffb000]"></div>
             <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#ffb000]"></div>

            <div>
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[#ffb000]/30">
                <div className="w-16 h-16 border border-[#ffb000] flex items-center justify-center bg-[#ffb000]/10 rounded-full">
                   <User size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold uppercase">{selectedJob.name}</h2>
                  <div className="flex items-center gap-2 text-xl opacity-80">
                    <Briefcase size={18} />
                    {selectedJob.title}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-lg leading-relaxed italic opacity-80">"{selectedJob.description}"</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg border-b border-[#ffb000]/30 mb-2 uppercase tracking-wider flex items-center gap-2">
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
                    <h3 className="text-lg border-b border-[#ffb000]/30 mb-2 uppercase tracking-wider flex items-center gap-2">
                        <Zap size={16} /> Tag Skills
                    </h3>
                    <div className="space-y-2">
                        {Object.entries(selectedJob.initialSkills).map(([skill, val]) => (
                            <div key={skill} className="flex justify-between items-center border border-[#ffb000]/30 p-2 bg-[#ffb000]/5">
                                <span className="font-bold uppercase">{skill}</span>
                                <span className="font-mono text-xl">{val}</span>
                            </div>
                        ))}
                         {Object.keys(selectedJob.initialSkills).length === 0 && <span className="opacity-50">None</span>}
                    </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelect(selectedJob)}
              className="mt-8 w-full bg-[#ffb000] text-black font-bold text-2xl py-3 hover:bg-[#ffcc33] transition-colors uppercase tracking-widest flex items-center justify-center gap-2"
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