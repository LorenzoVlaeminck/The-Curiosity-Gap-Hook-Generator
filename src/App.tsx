import { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Loader2, Play, Eye, Brain, Copy, Check, Download, Bookmark, BookmarkCheck, Trash2, Activity } from 'lucide-react';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Hook {
  id: string;
  hookText: string;
  visualAction: string;
  psychologicalTrigger: string;
  hookType: string;
  viralityScore: number;
}

const PLATFORMS = ['TikTok', 'YouTube Shorts', 'Instagram Reels', 'LinkedIn Video'];
const TONES = ['Mysterious', 'Contrarian', 'Educational', 'Urgent', 'Storytelling'];

export default function App() {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [tone, setTone] = useState(TONES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'generator' | 'saved'>('generator');
  const [savedHooks, setSavedHooks] = useState<Hook[]>(() => {
    const saved = localStorage.getItem('curiosity_saved_hooks');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('curiosity_saved_hooks', JSON.stringify(savedHooks));
  }, [savedHooks]);

  const generateHooks = async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    setHooks([]);
    setActiveTab('generator');
    
    try {
      const audienceContext = audience.trim() ? `Target audience: ${audience}.` : '';
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Generate 5 highly psychological, visually driven 3-second hooks for the following video topic: "${topic}". Target platform: ${platform}. Desired tone: ${tone}. ${audienceContext}`,
        config: {
          systemInstruction: `You are a master viral content strategist and copywriter, specializing in short-form video retention mechanics. Your expertise lies in the 'curiosity gap'—the psychological space between what a viewer knows and what they want to know.
          
          Given a video topic, target platform, tone, and audience, generate exactly 5 highly psychological, visually driven 3-second hooks designed to exploit the curiosity gap. Tailor the pacing and visual actions to the specific platform.
          
          Each hook must include:
          1. The spoken/text hook (the exact words).
          2. The visual action (what happens on screen in those 3 seconds to grab attention).
          3. The psychological trigger (why it works, e.g., 'Pattern Interrupt', 'Contrarian Statement', 'Unresolved Tension').
          4. The hook type (e.g., 'The Negative Hook', 'The Secret Hook', 'The "What If" Hook').
          5. A virality score between 85 and 99 based on its psychological potency.`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                hookType: { type: Type.STRING, description: "The type of hook formula used." },
                hookText: { type: Type.STRING, description: "The exact words spoken or shown as text." },
                visualAction: { type: Type.STRING, description: "The visual action happening on screen." },
                psychologicalTrigger: { type: Type.STRING, description: "The psychological reason this hook works." },
                viralityScore: { type: Type.INTEGER, description: "A score from 85 to 99 indicating virality potential." }
              },
              required: ["hookType", "hookText", "visualAction", "psychologicalTrigger", "viralityScore"]
            }
          }
        }
      });

      if (response.text) {
        const parsedHooks = JSON.parse(response.text);
        // Add unique IDs to generated hooks
        const hooksWithIds = parsedHooks.map((h: any) => ({
          ...h,
          id: crypto.randomUUID()
        }));
        setHooks(hooksWithIds);
      }
    } catch (error) {
      console.error("Error generating hooks:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSaveHook = (hook: Hook) => {
    if (savedHooks.some(h => h.id === hook.id)) {
      setSavedHooks(savedHooks.filter(h => h.id !== hook.id));
    } else {
      setSavedHooks([...savedHooks, hook]);
    }
  };

  const exportHooks = () => {
    const sourceHooks = activeTab === 'generator' ? hooks : savedHooks;
    if (sourceHooks.length === 0) return;

    const text = sourceHooks.map((h, i) => `HOOK 0${i+1}: ${h.hookType} (Score: ${h.viralityScore}/99)\nScript: "${h.hookText}"\nVisual (0-3s): ${h.visualAction}\nPsychology: ${h.psychologicalTrigger}\n\n`).join('');
    const title = activeTab === 'generator' ? `Topic: ${topic}\nPlatform: ${platform}\nTone: ${tone}` : 'Saved Hooks Library';
    const blob = new Blob([`CURIOSITY GAP HOOKS\n${title}\n\n${text}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hooks-${activeTab}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const displayHooks = activeTab === 'generator' ? hooks : savedHooks;

  return (
    <div className="min-h-screen bg-[var(--color-brutal-black)] text-white selection:bg-[var(--color-neon-green)] selection:text-black pb-20">
      {/* Header */}
      <header className="border-b border-white/10 p-6 sticky top-0 bg-[var(--color-brutal-black)]/80 backdrop-blur-md z-20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--color-neon-green)] rounded-sm flex items-center justify-center text-black shadow-[0_0_15px_rgba(204,255,0,0.3)]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="font-display font-bold text-2xl tracking-tight">
              CURIOSITY GAP <span className="text-white/40">GENERATOR</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
              <button
                onClick={() => setActiveTab('generator')}
                className={`px-4 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition-colors ${
                  activeTab === 'generator' 
                    ? 'bg-[var(--color-brutal-gray)] text-white shadow-sm' 
                    : 'text-white/40 hover:text-white'
                }`}
              >
                Generator
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-4 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${
                  activeTab === 'saved' 
                    ? 'bg-[var(--color-brutal-gray)] text-white shadow-sm' 
                    : 'text-white/40 hover:text-white'
                }`}
              >
                Saved
                {savedHooks.length > 0 && (
                  <span className="bg-[var(--color-neon-green)] text-black px-1.5 py-0.5 rounded text-[10px] leading-none">
                    {savedHooks.length}
                  </span>
                )}
              </button>
            </div>

            {displayHooks.length > 0 && (
              <button
                onClick={exportHooks}
                className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--color-neon-green)] hover:text-white transition-colors px-4 py-2 border border-[var(--color-neon-green)] hover:border-white rounded-lg"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12 mt-8">
        {/* Left Column: Input */}
        <div className="space-y-8">
          <div>
            <h2 className="font-display text-5xl font-bold leading-[0.9] tracking-tighter mb-6">
              ENGINEER<br/>
              <span className="text-[var(--color-neon-green)]">VIRAL</span><br/>
              RETENTION.
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              Input your concept. We'll generate highly psychological, visually driven 3-second hooks designed to exploit the "curiosity gap."
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="topic" className="text-xs font-bold uppercase tracking-widest text-white/40">
                Video Topic / Concept *
              </label>
              <textarea
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., How to fix your sleep schedule in 3 days..."
                className="w-full h-24 bg-[var(--color-brutal-gray)] border border-white/10 rounded-xl p-4 text-lg focus:outline-none focus:border-[var(--color-neon-green)] transition-colors resize-none placeholder:text-white/20"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="audience" className="text-xs font-bold uppercase tracking-widest text-white/40 flex justify-between">
                <span>Target Audience</span>
                <span className="text-white/20">Optional</span>
              </label>
              <input
                id="audience"
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g., Burnout professionals, New moms..."
                className="w-full bg-[var(--color-brutal-gray)] border border-white/10 rounded-xl p-4 text-base focus:outline-none focus:border-[var(--color-neon-green)] transition-colors placeholder:text-white/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40">
                  Platform
                </label>
                <div className="relative">
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full bg-[var(--color-brutal-gray)] border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-[var(--color-neon-green)] transition-colors appearance-none cursor-pointer"
                  >
                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-white/40">
                    ▼
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40">
                  Tone
                </label>
                <div className="relative">
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full bg-[var(--color-brutal-gray)] border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-[var(--color-neon-green)] transition-colors appearance-none cursor-pointer"
                  >
                    {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-white/40">
                    ▼
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={generateHooks}
              disabled={isGenerating || !topic.trim()}
              className="w-full bg-[var(--color-neon-green)] text-black font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#b3e600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-[0_0_20px_rgba(204,255,0,0.15)] hover:shadow-[0_0_30px_rgba(204,255,0,0.3)]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  ANALYZING PSYCHOLOGY...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  GENERATE HOOKS
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {activeTab === 'saved' && savedHooks.length === 0 ? (
              <motion.div
                key="empty-saved"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[400px] border border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center text-center p-8 text-white/40"
              >
                <Bookmark className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">No saved hooks yet.</p>
                <p className="text-sm mt-2 max-w-xs">Generate some hooks and click the bookmark icon to save your favorites here.</p>
              </motion.div>
            ) : activeTab === 'generator' && hooks.length === 0 && !isGenerating ? (
              <motion.div
                key="empty-generator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[400px] border border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center text-center p-8 text-white/40"
              >
                <Brain className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">Awaiting input...</p>
                <p className="text-sm mt-2 max-w-xs">Configure your topic, platform, and tone to engineer your hooks.</p>
              </motion.div>
            ) : isGenerating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8"
              >
                <div className="w-16 h-16 border-4 border-[var(--color-brutal-gray)] border-t-[var(--color-neon-green)] rounded-full animate-spin mb-6" />
                <p className="font-display text-xl font-bold tracking-tight animate-pulse">
                  SYNTHESIZING CURIOSITY GAPS
                </p>
                <p className="text-white/40 mt-2">Cross-referencing viral retention patterns for {platform}...</p>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between md:hidden mb-4">
                  <h3 className="font-display font-bold text-xl">
                    {activeTab === 'generator' ? 'Results' : 'Saved Library'}
                  </h3>
                  <button
                    onClick={exportHooks}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-neon-green)]"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
                
                {activeTab === 'saved' && savedHooks.length > 0 && (
                  <div className="flex justify-end mb-4">
                    <button 
                      onClick={() => {
                        if(confirm('Are you sure you want to clear all saved hooks?')) {
                          setSavedHooks([]);
                        }
                      }}
                      className="text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> Clear Library
                    </button>
                  </div>
                )}

                {displayHooks.map((hook, index) => {
                  const isSaved = savedHooks.some(h => h.id === hook.id);
                  
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      key={hook.id}
                      className="bg-[var(--color-brutal-gray)] border border-white/10 rounded-2xl overflow-hidden group hover:border-white/30 transition-colors relative"
                    >
                      {/* Hook Header */}
                      <div className="bg-black/40 px-6 py-3 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-display font-bold text-[var(--color-neon-green)] text-xl">
                            0{index + 1}
                          </span>
                          <span className="text-sm font-bold uppercase tracking-wider text-white/60">
                            {hook.hookType}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded text-xs font-bold text-[var(--color-neon-green)] mr-2" title="Virality Score">
                            <Activity className="w-3 h-3" />
                            {hook.viralityScore}
                          </div>
                          <button
                            onClick={() => toggleSaveHook(hook)}
                            className={`p-2 rounded-lg transition-colors ${isSaved ? 'text-[var(--color-neon-green)] bg-[var(--color-neon-green)]/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                            title={isSaved ? "Remove from Saved" : "Save Hook"}
                          >
                            {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(hook.hookText, hook.id)}
                            className="text-white/40 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
                            title="Copy Hook Text"
                          >
                            {copiedId === hook.id ? (
                              <Check className="w-4 h-4 text-[var(--color-neon-green)]" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Hook Content */}
                      <div className="p-6 space-y-6">
                        {/* Text */}
                        <div>
                          <div className="flex items-center gap-2 mb-2 text-[var(--color-neon-green)]/80">
                            <Play className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">The Script</span>
                          </div>
                          <p className="text-xl font-medium leading-snug">
                            "{hook.hookText}"
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                          {/* Visual */}
                          <div>
                            <div className="flex items-center gap-2 mb-2 text-white/40">
                              <Eye className="w-4 h-4" />
                              <span className="text-xs font-bold uppercase tracking-widest">Visual Action (0-3s)</span>
                            </div>
                            <p className="text-sm text-white/80 leading-relaxed">
                              {hook.visualAction}
                            </p>
                          </div>

                          {/* Psychology */}
                          <div>
                            <div className="flex items-center gap-2 mb-2 text-white/40">
                              <Brain className="w-4 h-4" />
                              <span className="text-xs font-bold uppercase tracking-widest">Why It Works</span>
                            </div>
                            <p className="text-sm text-white/80 leading-relaxed">
                              {hook.psychologicalTrigger}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
