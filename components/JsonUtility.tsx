import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { 
  FileJson, 
  AlignLeft, 
  Minimize2, 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  Trash2, 
  Check,
  FileText
} from 'lucide-react';

export const JsonUtility: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null); // null = empty/idle, true = valid, false = invalid
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ size: 0, lines: 0 });

  useEffect(() => {
    if (!input.trim()) {
      setIsValid(null);
      setError(null);
      setStats({ size: 0, lines: 0 });
      return;
    }

    setStats({
      size: new Blob([input]).size,
      lines: input.split(/\r\n|\r|\n/).length
    });

    try {
      JSON.parse(input);
      setIsValid(true);
      setError(null);
    } catch (e: any) {
      setIsValid(false);
      // Simplify error message for UI
      setError(e.message);
    }
  }, [input]);

  const handleFormat = () => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed, null, 2));
    } catch (e) {
      // Error is already handled by useEffect
    }
  };

  const handleMinify = () => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed));
    } catch (e) {
      // Error is already handled by useEffect
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileJson className="w-6 h-6 text-purple-500" />
            JSON Tools
          </h2>
          <p className="text-slate-400 mt-1">Validate, format, and minify JSON data instantly.</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 flex items-center gap-4 text-sm text-slate-400">
             <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                {stats.lines} lines
             </span>
             <span className="w-px h-4 bg-slate-800"></span>
             <span>{formatSize(stats.size)}</span>
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
          <div className="flex gap-2">
            <Button 
              onClick={handleFormat} 
              disabled={isValid === false || !input}
              className="gap-2"
              size="sm"
            >
              <AlignLeft className="w-4 h-4" />
              Beautify
            </Button>
            <Button 
              onClick={handleMinify} 
              disabled={isValid === false || !input}
              variant="secondary"
              className="gap-2"
              size="sm"
            >
              <Minimize2 className="w-4 h-4" />
              Minify
            </Button>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleCopy} 
              disabled={!input}
              variant="ghost"
              size="sm"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button 
              onClick={handleClear} 
              disabled={!input}
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              title="Clear input"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Input/Output */}
        <div className="relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={`w-full h-[60vh] bg-slate-950 text-slate-200 font-mono text-sm p-6 rounded-xl border-2 outline-none transition-all resize-none
              ${isValid === true ? 'border-green-500/30 focus:border-green-500/50' : 
                isValid === false ? 'border-red-500/30 focus:border-red-500/50' : 
                'border-slate-800 focus:border-blue-500/50'}
            `}
            placeholder="Paste your JSON here..."
            spellCheck={false}
          />
          
          {/* Status Indicator Overlay (Bottom Right) */}
          <div className="absolute bottom-4 right-4 pointer-events-none">
            {isValid === true && (
              <div className="flex items-center gap-2 bg-slate-900/90 text-green-400 px-3 py-1.5 rounded-lg border border-green-500/30 backdrop-blur-md shadow-lg animate-in fade-in slide-in-from-bottom-2">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs font-semibold">Valid JSON</span>
              </div>
            )}
            {isValid === false && (
              <div className="flex items-center gap-2 bg-slate-900/90 text-red-400 px-3 py-1.5 rounded-lg border border-red-500/30 backdrop-blur-md shadow-lg animate-in fade-in slide-in-from-bottom-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-semibold">Invalid JSON</span>
              </div>
            )}
          </div>
        </div>

        {/* Error Message Box */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg text-sm font-mono break-all flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
            <div>
              <p className="font-semibold text-red-400 mb-1">Parsing Error</p>
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};