import React, { useState } from 'react';
import { TabId, TabConfig } from './types';
import { TimeUtility } from './components/TimeUtility';
import { JsonUtility } from './components/JsonUtility';
import { ChunkUtility } from './components/ChunkUtility';
import { Clock, Home, Code, ScissorsLineDashed, Terminal, Zap } from 'lucide-react';

const TABS: TabConfig[] = [
  { id: TabId.HOME, label: 'Dashboard', icon: <Home className="w-4 h-4" /> },
  { id: TabId.TIME, label: 'Time Utility', icon: <Clock className="w-4 h-4" /> },
  { id: TabId.JSON, label: 'JSON Tools', icon: <Code className="w-4 h-4" /> },
  { id: TabId.CHUNK, label: 'Text Chunker', icon: <ScissorsLineDashed className="w-4 h-4" /> },
  { id: TabId.UUID, label: 'Generators', icon: <Terminal className="w-4 h-4" /> },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>(TabId.HOME);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-white cursor-pointer" onClick={() => setActiveTab(TabId.HOME)}>
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            Wise Utils
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${activeTab === tab.id 
                    ? 'bg-slate-800 text-blue-400 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Mobile Tab Scrollbar */}
        <div className="md:hidden w-full overflow-x-auto border-t border-slate-800/50 scrollbar-hide">
           <div className="flex p-2 gap-2 min-w-max">
             {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                  ${activeTab === tab.id 
                    ? 'bg-slate-800 text-blue-400' 
                    : 'text-slate-400 hover:bg-slate-900'
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
           </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        {activeTab === TabId.HOME && (
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4 pt-8">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
                Developer <span className="text-blue-500">Essentials</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Wise Utils is a unified suite of utilities designed to accelerate your workflow. 
                Simple, fast, and respectful of your data.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-12 text-left">
              <div 
                className="group p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/80 transition-all cursor-pointer"
                onClick={() => setActiveTab(TabId.TIME)}
              >
                <div className="bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Time Utility</h3>
                <p className="text-slate-400 text-sm">Convert timestamps, manipulate dates, and handle timezones effortlessy.</p>
              </div>

              <div 
                className="group p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900/80 transition-all cursor-pointer"
                onClick={() => setActiveTab(TabId.JSON)}
              >
                <div className="bg-purple-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                  <Code className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">JSON Tools</h3>
                <p className="text-slate-400 text-sm">Validate, minify, and beautify JSON data instantly.</p>
              </div>

              <div 
                className="group p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all cursor-pointer"
                onClick={() => setActiveTab(TabId.CHUNK)}
              >
                <div className="bg-emerald-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                  <ScissorsLineDashed className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Text Chunker</h3>
                <p className="text-slate-400 text-sm">Split long paragraph text into copyable chunks with a configurable character limit.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === TabId.TIME && <TimeUtility />}
        {activeTab === TabId.JSON && <JsonUtility />}
        {activeTab === TabId.CHUNK && <ChunkUtility />}
        
        {/* Placeholders for other tabs */}
        {activeTab === TabId.UUID && (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 animate-in zoom-in-95 duration-300">
             <div className="bg-slate-900 p-6 rounded-full mb-4 border border-slate-800">
                <Terminal className="w-12 h-12 opacity-50" />
             </div>
             <p className="text-lg font-medium">This module is under construction.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 mt-auto">
        <div className="container mx-auto px-4 py-8 text-center text-slate-600 text-sm">
          &copy; {new Date().getFullYear()} Wise Utils.
        </div>
      </footer>
    </div>
  );
};

export default App;
