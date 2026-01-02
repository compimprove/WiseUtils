import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import { Button } from './Button';
import { 
  Clock, 
  Calendar, 
  ArrowRight, 
  ArrowLeft, 
  SkipForward, 
  RefreshCw,
  Copy,
  Check,
  Globe,
  MapPin,
  Sparkles
} from 'lucide-react';

const DATE_FORMAT = 'yyyy-MM-dd HH:mm:ss.SSS';

export const TimeUtility: React.FC = () => {
  // Master state is strictly the Luxon DateTime object
  const [currentDate, setCurrentDate] = useState<DateTime>(DateTime.now());
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Local state for inputs to allow typing before validation
  const [timestampInput, setTimestampInput] = useState<string>(DateTime.now().toMillis().toString());
  const [utcInput, setUtcInput] = useState<string>(DateTime.now().toUTC().toFormat(DATE_FORMAT));
  const [localInput, setLocalInput] = useState<string>(DateTime.now().toLocal().toFormat(DATE_FORMAT));

  // Sync inputs when the master currentDate changes (e.g. via buttons)
  useEffect(() => {
    setTimestampInput(currentDate.toMillis().toString());
    setUtcInput(currentDate.toUTC().toFormat(DATE_FORMAT));
    setLocalInput(currentDate.toLocal().toFormat(DATE_FORMAT));
  }, [currentDate]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // --- Change Handlers ---

  const handleTimestampChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTimestampInput(val);
    
    const num = Number(val);
    if (!isNaN(num) && val.trim() !== '') {
      const dt = DateTime.fromMillis(num);
      if (dt.isValid) setCurrentDate(dt);
    }
  };

  const handleUtcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUtcInput(val);
    const dt = DateTime.fromFormat(val, DATE_FORMAT, { zone: 'utc' });
    if (dt.isValid) setCurrentDate(dt);
  };

  const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalInput(val);
    const dt = DateTime.fromFormat(val, DATE_FORMAT, { zone: 'local' });
    if (dt.isValid) setCurrentDate(dt);
  };

  // --- Manipulation Handlers ---

  const setNow = () => setCurrentDate(DateTime.now());

  // Generalized boundary function that respects zone
  const applyBoundary = (unit: 'day' | 'month' | 'year', type: 'start' | 'end', zone: 'local' | 'utc') => {
    let dt = zone === 'local' ? currentDate.toLocal() : currentDate.toUTC();
    dt = type === 'start' ? dt.startOf(unit) : dt.endOf(unit);
    setCurrentDate(dt);
  };

  const add = (amount: number, unit: 'day' | 'week' | 'month' | 'year') => {
    setCurrentDate(current => current.plus({ [unit + 's']: amount }));
  };

  const subtract = (amount: number, unit: 'day' | 'week' | 'month' | 'year') => {
    setCurrentDate(current => current.minus({ [unit + 's']: amount }));
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-500" />
            Time Converter
          </h2>
          <p className="text-slate-400 mt-1">Convert timestamps and manipulate dates with precision.</p>
        </div>
        <Button variant="secondary" onClick={setNow} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Reset to Now
        </Button>
      </div>

      {/* Main Converter Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Timestamp Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-blue-500/30 transition-colors">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-slate-400">Unix Timestamp (ms)</label>
            <button 
              onClick={() => handleCopy(timestampInput, 'ts')}
              className="text-slate-500 hover:text-white transition-colors"
              title="Copy to clipboard"
            >
              {copiedField === 'ts' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              value={timestampInput}
              onChange={handleTimestampChange}
              className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg px-4 py-3 font-mono text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. 1679934200000"
            />
          </div>
        </div>

        {/* UTC Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-blue-500/30 transition-colors">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-slate-400 flex items-center gap-1">
              <Globe className="w-3 h-3" /> UTC Date
            </label>
            <button 
              onClick={() => handleCopy(utcInput, 'utc')}
              className="text-slate-500 hover:text-white transition-colors"
              title="Copy to clipboard"
            >
              {copiedField === 'utc' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              value={utcInput}
              onChange={handleUtcChange}
              className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg px-4 py-3 font-mono text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder={DATE_FORMAT}
            />
          </div>
        </div>

        {/* Local Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-blue-500/30 transition-colors">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Local Date
            </label>
            <button 
              onClick={() => handleCopy(localInput, 'local')}
              className="text-slate-500 hover:text-white transition-colors"
              title="Copy to clipboard"
            >
              {copiedField === 'local' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
           <div className="relative">
            <input
              type="text"
              value={localInput}
              onChange={handleLocalChange}
              className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg px-4 py-3 font-mono text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder={DATE_FORMAT}
            />
          </div>
        </div>
      </div>

      {/* Manipulation Controls */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Boundary Navigation - Split View */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center gap-2 bg-slate-800/50">
            <SkipForward className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-200">Boundary Navigation</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
            {/* UTC Section */}
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-blue-400 font-medium text-xs uppercase tracking-wider mb-2">
                <Globe className="w-3 h-3" /> UTC Zone
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <Button variant="secondary" size="sm" onClick={() => applyBoundary('day', 'start', 'utc')}>Start Day</Button>
                 <Button variant="secondary" size="sm" onClick={() => applyBoundary('day', 'end', 'utc')}>End Day</Button>
                 <Button variant="secondary" size="sm" onClick={() => applyBoundary('month', 'start', 'utc')}>Start Month</Button>
                 <Button variant="secondary" size="sm" onClick={() => applyBoundary('month', 'end', 'utc')}>End Month</Button>
                 <Button variant="secondary" size="sm" onClick={() => applyBoundary('year', 'start', 'utc')}>Start Year</Button>
                 <Button variant="secondary" size="sm" onClick={() => applyBoundary('year', 'end', 'utc')}>End Year</Button>
              </div>
            </div>

            {/* Local Section */}
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-medium text-xs uppercase tracking-wider mb-2">
                <MapPin className="w-3 h-3" /> Local Zone
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <Button variant="secondary" size="sm" onClick={() => applyBoundary('day', 'start', 'local')}>Start Day</Button>
                 <Button variant="secondary" size="sm" onClick={() => applyBoundary('day', 'end', 'local')}>End Day</Button>
                 <Button variant="secondary" size="sm" onClick={() => applyBoundary('month', 'start', 'local')}>Start Month</Button>
                 <Button variant="secondary" size="sm" onClick={() => applyBoundary('month', 'end', 'local')}>End Month</Button>
                 <Button variant="secondary" size="sm" onClick={() => applyBoundary('year', 'start', 'local')}>Start Year</Button>
                 <Button variant="secondary" size="sm" onClick={() => applyBoundary('year', 'end', 'local')}>End Year</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Incremental Navigation */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4 bg-slate-800/50 -mx-4 -mt-4 md:-mx-6 md:-mt-6 p-4 border-b border-slate-800">
            <Calendar className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-200">Incremental Travel</h3>
          </div>
          
          <div className="space-y-3 pt-2">
            {/* Days */}
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-sm text-slate-400 ml-2">Day</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => subtract(1, 'day')}><ArrowLeft className="w-4 h-4" /></Button>
                <div className="w-px h-6 bg-slate-800 mx-1"></div>
                <Button variant="ghost" size="sm" onClick={() => add(1, 'day')}><ArrowRight className="w-4 h-4" /></Button>
              </div>
            </div>
             {/* Weeks */}
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-sm text-slate-400 ml-2">Week</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => subtract(1, 'week')}><ArrowLeft className="w-4 h-4" /></Button>
                <div className="w-px h-6 bg-slate-800 mx-1"></div>
                <Button variant="ghost" size="sm" onClick={() => add(1, 'week')}><ArrowRight className="w-4 h-4" /></Button>
              </div>
            </div>
             {/* Months */}
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-sm text-slate-400 ml-2">Month</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => subtract(1, 'month')}><ArrowLeft className="w-4 h-4" /></Button>
                 <div className="w-px h-6 bg-slate-800 mx-1"></div>
                <Button variant="ghost" size="sm" onClick={() => add(1, 'month')}><ArrowRight className="w-4 h-4" /></Button>
              </div>
            </div>
             {/* Years */}
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-sm text-slate-400 ml-2">Year</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => subtract(1, 'year')}><ArrowLeft className="w-4 h-4" /></Button>
                 <div className="w-px h-6 bg-slate-800 mx-1"></div>
                <Button variant="ghost" size="sm" onClick={() => add(1, 'year')}><ArrowRight className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};