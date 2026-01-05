import React from 'react';

export const RetroButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean, uiColor: string }> = ({ 
    active, uiColor, className, children, ...props 
}) => (
    <button 
        className={`border transition-colors uppercase tracking-wider font-bold hover:bg-white/10 ${active ? 'bg-current text-black' : ''} ${className || ''}`}
        style={{ borderColor: uiColor }}
        {...props}
    >
        {children}
    </button>
);

export const RetroPanel: React.FC<{ uiColor: string; title?: string; children: React.ReactNode; className?: string }> = ({ 
    uiColor, title, children, className 
}) => (
    <div className={`border bg-black/90 p-1 flex flex-col ${className || ''}`} style={{ borderColor: uiColor }}>
        {title && (
            <div className="text-[10px] font-bold bg-current text-black px-1 py-[1px] mb-1 text-center uppercase tracking-widest leading-none">
                {title}
            </div>
        )}
        {children}
    </div>
);

export const RetroProgressBar: React.FC<{ 
    label: string; 
    value: number; 
    max?: number; 
    color?: string; 
    uiColor: string; 
    height?: string 
}> = ({ label, value, max = 100, color, uiColor, height = "h-1" }) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    return (
        <div className="flex flex-col w-full text-[10px] font-mono mb-[2px]">
            <div className="flex justify-between mb-[1px] leading-none">
                <span>{label}</span>
                <span>{Math.floor(value)}{max !== 100 ? `/${max}` : '%'}</span>
            </div>
            <div className={`w-full ${height} bg-gray-900 border border-gray-800`}>
                <div 
                    className="h-full transition-all duration-300" 
                    style={{ width: `${percentage}%`, backgroundColor: color || 'currentColor' }} 
                />
            </div>
        </div>
    );
};