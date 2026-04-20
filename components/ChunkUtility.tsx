import React, { useEffect, useState } from 'react';
import { Button } from './Button';
import {
  ScissorsLineDashed,
  AlertCircle,
  Check,
  Copy,
  FileText,
  Hash,
  SplitSquareVertical,
  Trash2
} from 'lucide-react';

const DEFAULT_MAX_CHARS = 5000;
const PARAGRAPH_SPLIT_RE = /\n\s*\n+/g;
const LEADING_MARKER_RE = /^\s*\d+\s*[\.\-\)]\s*/;
const SENTENCE_SPLIT_RE = /(?<=[.!?])(?:\s+|\n+)/u;

const normalizeRawScript = (script: string) => {
  if (!script.includes('\\n')) {
    return script;
  }

  return script.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n');
};

const cleanParagraph = (paragraph: string) => {
  const lines = paragraph.split(/\r?\n/);
  const cleanedLines = lines.map((line, index) =>
    index === 0 ? line.replace(LEADING_MARKER_RE, '').trim() : line.trimEnd()
  );

  return cleanedLines.join('\n').trim();
};

const normalizeParagraphs = (text: string) =>
  text
    .trim()
    .split(PARAGRAPH_SPLIT_RE)
    .map((paragraph) => cleanParagraph(paragraph))
    .filter(Boolean);

const splitLongParagraph = (paragraph: string, maxChars: number) => {
  const sentences = paragraph
    .trim()
    .split(SENTENCE_SPLIT_RE)
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (sentences.length === 0) {
    throw new Error('Encountered an empty paragraph during sentence splitting.');
  }

  const oversized = sentences.filter((sentence) => sentence.length > maxChars);
  if (oversized.length > 0) {
    const longest = oversized.reduce((best, sentence) => Math.max(best, sentence.length), 0);
    throw new Error(
      `A single sentence exceeds the character limit (${longest} > ${maxChars}). Increase the limit or edit the source text.`
    );
  }

  const units: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    if (current) {
      units.push(current);
    }
    current = sentence;
  }

  if (current) {
    units.push(current);
  }

  return units;
};

const expandSafeUnits = (paragraphs: string[], maxChars: number) => {
  const units: string[] = [];

  for (const paragraph of paragraphs) {
    if (paragraph.length <= maxChars) {
      units.push(paragraph);
      continue;
    }

    units.push(...splitLongParagraph(paragraph, maxChars));
  }

  return units;
};

const assembleChunks = (units: string[], maxChars: number) => {
  const chunks: string[] = [];
  let currentUnits: string[] = [];
  let currentLength = 0;

  for (const unit of units) {
    const separatorLength = currentUnits.length > 0 ? 2 : 0;
    const candidateLength = currentLength + separatorLength + unit.length;

    if (candidateLength <= maxChars) {
      currentUnits.push(unit);
      currentLength = candidateLength;
      continue;
    }

    if (currentUnits.length > 0) {
      chunks.push(currentUnits.join('\n\n'));
    }

    currentUnits = [unit];
    currentLength = unit.length;
  }

  if (currentUnits.length > 0) {
    chunks.push(currentUnits.join('\n\n'));
  }

  return chunks;
};

const chunkText = (script: string, maxChars: number) => {
  if (!script.trim()) {
    return [];
  }

  const paragraphs = normalizeParagraphs(normalizeRawScript(script));
  if (paragraphs.length === 0) {
    throw new Error('No usable content found after cleaning.');
  }

  const safeUnits = expandSafeUnits(paragraphs, maxChars);
  return assembleChunks(safeUnits, maxChars);
};

export const ChunkUtility: React.FC = () => {
  const [input, setInput] = useState('');
  const [maxChars, setMaxChars] = useState(DEFAULT_MAX_CHARS);
  const [chunks, setChunks] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedChunk, setCopiedChunk] = useState<number | null>(null);

  useEffect(() => {
    if (!input.trim()) {
      setChunks([]);
      setError(null);
      return;
    }

    try {
      const nextChunks = chunkText(input, maxChars);
      setChunks(nextChunks);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to chunk this text.';
      setChunks([]);
      setError(message);
    }
  }, [input, maxChars]);

  const handleMaxCharsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    const parsed = Number.parseInt(rawValue, 10);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      setMaxChars(DEFAULT_MAX_CHARS);
      return;
    }

    setMaxChars(parsed);
  };

  const handleCopyChunk = (chunk: string, index: number) => {
    navigator.clipboard.writeText(chunk);
    setCopiedChunk(index);
    window.setTimeout(() => setCopiedChunk((current) => (current === index ? null : current)), 2000);
  };

  const handleClear = () => {
    setInput('');
    setChunks([]);
    setError(null);
  };

  const characterCount = input.length;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ScissorsLineDashed className="w-6 h-6 text-emerald-400" />
            Text Chunker
          </h2>
          <p className="text-slate-400 mt-1">
            Split long paragraphs into safe chunks while preserving paragraph breaks whenever possible.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-slate-300">
            <Hash className="w-4 h-4 text-emerald-400" />
            <span>Max chars</span>
            <input
              type="number"
              min={1}
              value={maxChars}
              onChange={handleMaxCharsChange}
              className="w-28 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-right text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </label>

          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              {characterCount} chars
            </span>
            <span className="w-px h-4 bg-slate-800"></span>
            <span className="flex items-center gap-1.5">
              <SplitSquareVertical className="w-3.5 h-3.5" />
              {chunks.length} chunks
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-6">
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
            <div className="px-2">
              <p className="text-sm font-medium text-slate-200">Source text</p>
              <p className="text-xs text-slate-500">Paste paragraphs here. Numbered paragraph prefixes like 1. or 2-) are cleaned.</p>
            </div>

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

          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="w-full min-h-[420px] xl:min-h-[640px] bg-slate-950 text-slate-200 font-mono text-sm p-6 rounded-xl border-2 border-slate-800 focus:border-emerald-500/50 outline-none transition-all resize-y"
            placeholder="Paste the paragraph text you want to split into chunks..."
            spellCheck={false}
          />
        </section>

        <section className="space-y-4">
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <p className="text-sm font-medium text-slate-200">Chunked output</p>
            <p className="text-xs text-slate-500 mt-1">Each chunk is rendered separately so chunk 1, chunk 2, and later chunks are easy to copy one by one.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
              <div>
                <p className="font-semibold text-red-400 mb-1">Chunking error</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {!error && chunks.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[420px] rounded-xl border border-dashed border-slate-800 bg-slate-950/60 text-center px-6">
              <ScissorsLineDashed className="w-10 h-10 text-slate-700 mb-4" />
              <p className="text-slate-300 font-medium">No chunks yet</p>
              <p className="text-sm text-slate-500 mt-2 max-w-md">
                Add text on the left and the chunked results will appear here automatically.
              </p>
            </div>
          )}

          {chunks.length > 0 && !error && (
            <div className="space-y-4">
              {chunks.map((chunk, index) => (
                <article key={index} className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden">
                  <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900">
                    <div>
                      <h3 className="text-sm font-semibold text-white">Chunk {index + 1}</h3>
                      <p className="text-xs text-slate-500">{chunk.length} characters</p>
                    </div>

                    <Button
                      onClick={() => handleCopyChunk(chunk, index)}
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                    >
                      {copiedChunk === index ? (
                        <>
                          <Check className="w-4 h-4 text-green-400" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>

                  <pre className="h-72 overflow-y-auto whitespace-pre-wrap break-words px-4 py-4 text-sm text-slate-200 font-mono leading-6">
                    {chunk}
                  </pre>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
