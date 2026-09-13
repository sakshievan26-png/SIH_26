// src/App.tsx
import { useState } from "react";
import { Shield, Radio, Terminal } from "lucide-react";
import { UploadScreen } from "./components/upload/UploadScreen";
import { ResultsScreen } from "./components/results/ResultsScreen";
import { useScreeningFlow, type ScreeningInput } from "./hooks/useScreeningFlow";

export default function App() {
  const [view, setView] = useState<"upload" | "results">("upload");
  const [currentInput, setCurrentInput] = useState<ScreeningInput | null>(null);

  const { progress, start, reset } = useScreeningFlow();

  const handleStartScreening = (input: ScreeningInput) => {
    setCurrentInput(input);
    setView("results");
    start(input);
  };

  const handleReset = () => {
    reset();
    setCurrentInput(null);
    setView("upload");
  };

  const handleRetry = () => {
    if (currentInput) {
      start(currentInput);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-500 selection:text-white">
      {/* Top Navigation / Terminal Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold text-sm tracking-wider">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-100 tracking-tight">
                  SIH'26 AI Document Screening System
                </h1>
                <span className="hidden sm:inline-flex text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Officer Terminal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>Checkpoint CP-01</span>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-slate-500">M6 Integration Console • 8 AI Modules</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-mono text-[11px]">MOCK API ACTIVE</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-mono text-[11px]">OFFICER #9421</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {view === "upload" ? (
          <UploadScreen onStartScreening={handleStartScreening} />
        ) : (
          currentInput && (
            <ResultsScreen
              input={currentInput}
              progress={progress}
              onReset={handleReset}
              onRetry={handleRetry}
            />
          )
        )}
      </main>

      {/* Footer / Architecture Grid for Hackathon Demo */}
      <footer className="border-t border-slate-900 bg-slate-950/60 px-4 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px]">
            <span className="text-slate-400 font-medium">Team Architecture:</span>
            <span>M1: Tampering (ELA)</span>
            <span className="text-slate-700">•</span>
            <span>M2: OCR AI</span>
            <span className="text-slate-700">•</span>
            <span>M3: Face Biometrics</span>
            <span className="text-slate-700">•</span>
            <span>M4: Validation &amp; Risk</span>
            <span className="text-slate-700">•</span>
            <span>M5: Blockchain Audit</span>
            <span className="text-slate-700">•</span>
            <span>Barcode &amp; Watermark</span>
            <span className="text-slate-700">•</span>
            <span className="text-blue-400 font-medium">M6: Full-Stack &amp; Integration</span>
          </div>
          <div className="text-[11px] font-mono text-slate-600">
            SIH 2026 • 8-Vector Inspection Terminal
          </div>
        </div>
      </footer>
    </div>
  );
}
