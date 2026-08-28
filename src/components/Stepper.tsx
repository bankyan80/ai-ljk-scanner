import React from 'react';
import { UploadCloud, ScanLine, Cpu, CheckCircle2 } from 'lucide-react';
import { ScanStep } from '../types';

interface StepperProps {
  currentStep: ScanStep;
  onStepClick?: (step: ScanStep) => void;
}

export const Stepper: React.FC<StepperProps> = ({ currentStep, onStepClick }) => {
  const steps = [
    { id: 1 as ScanStep, label: '1. Upload', icon: UploadCloud },
    { id: 2 as ScanStep, label: '2. Deteksi LJK', icon: ScanLine },
    { id: 3 as ScanStep, label: '3. Analisis Jawaban', icon: Cpu },
    { id: 4 as ScanStep, label: '4. Hasil', icon: CheckCircle2 },
  ];

  return (
    <div className="w-full py-2 px-2 shrink-0">
      <div className="max-w-4xl mx-auto flex items-center justify-between relative">
        {/* Connecting Background Line */}
        <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-[2px] bg-slate-800 -z-0" />
        
        {/* Active Progress Line */}
        <div 
          className="absolute top-1/2 left-6 -translate-y-1/2 h-[2px] bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-all duration-500 -z-0"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 92}%`,
          }}
        />

        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <button
              key={step.id}
              onClick={() => onStepClick && onStepClick(step.id)}
              className={`relative z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-400/60 scale-105'
                  : isCompleted
                  ? 'bg-slate-900 text-emerald-400 border border-emerald-500/40 hover:bg-slate-800'
                  : 'bg-slate-900/90 text-slate-400 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className={`p-1 rounded-full ${
                isActive ? 'bg-white/20 text-white' : isCompleted ? 'text-emerald-400' : 'text-slate-500'
              }`}>
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'animate-pulse' : ''}`} />
              </div>
              <span className="whitespace-nowrap tracking-wide">{step.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
