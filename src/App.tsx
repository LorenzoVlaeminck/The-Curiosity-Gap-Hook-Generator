import { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Loader2, Play, Eye, Brain, Copy, Check } from 'lucide-react';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Hook {
  hookText: string;
  visualAction: string;
  psychologicalTrigger: string;
  hookType: string;
}

export default function App() {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateHooks = async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    setHooks([]);
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Generate 5 highly psychological, visually driven 3-second hooks for the following video topic: "${topic}"`,
        config: {
          systemInstruction: `You are a master viral content strategist and copywriter, specializing in YouTube and TikTok retention mechanics. Your expertise lies in the 'curiosity gap'—the psychological space between what a viewer knows and what they want to know.
          
          Given a video topic, generate exactly 5 highly psychological, visually driven 3-second hooks designed to exploit the curiosity gap.
          
          Each hook must include:
          1. The spoken/text hook (the exact words).
          2. The visual action (what happens on screen in those 3 seconds to grab attention).
          3. The psychological trigger (why it works, e.g., 'Pattern Interrupt', 'Contrarian Statement', 'Unresolved Tension').
          4. The hook type (e.g., 'The Negative Hook', 'The Secret Hook', 'The "What If" Hook').`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                hookType: { type: Type.STRING, description: "The type of hook formula used." },
                hookText: { type: Type.STRING, description: "The exact words spoken or shown as text." },
                visualAction: { type: Type.STRING, description: "The visual action happening on screen." },
                psychologicalTrigger: { type: Type.STRING, description: "The psychological reason this hook works." }
              },
              required: ["hookType", "hookText", "visualAction", "psychologicalTrigger"]
            }
          }
        }
      });

      if (response.text) {
        const parsedHooks = JSON.parse(response.text);
        setHooks(parsedHooks);
      }
    } catch (error) {
      console.error("Error generating hooks:", error);
      // Handle error state if needed
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--color-brutal-black)] text-white selection:bg-[var(--color-neon-green)] selection:text-black">
      {/* Header */}
      <header className="border-b border-white/10 p-6">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--color-neon-green)] rounded-sm flex items-center justify-center text-black">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="font-display font-bold text-2xl tracking-tight">
            CURIOSITY GAP <span className="text-white/40">GENERATOR</span>
          </h1>
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
              Input your video topic. We'll generate 5 highly psychological, visually driven 3-second hooks designed to exploit the "curiosity gap."
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="topic" className="text-xs font-bold uppercase tracking-widest text-white/40">
                Video Topic / Concept
              </label>
              <textarea
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., How to fix your sleep schedule in 3 days..."
                className="w-full h-32 bg-[var(--color-brutal-gray)] border border-white/10 rounded-xl p-4 text-lg focus:outline-none focus:border-[var(--color-neon-green)] transition-colors resize-none placeholder:text-white/20"
              />
            </div>

            <button
              onClick={generateHooks}
              disabled={isGenerating || !topic.trim()}
              className="w-full bg-[var(--color-neon-green)] text-black font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#b3e600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            {hooks.length === 0 && !isGenerating ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[400px] border border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center text-center p-8 text-white/40"
              >
                <Brain className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">Awaiting input...</p>
                <p className="text-sm">The algorithm is ready to engineer your hooks.</p>
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
                <p className="text-white/40 mt-2">Cross-referencing viral retention patterns...</p>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {hooks.map((hook, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={index}
                    className="bg-[var(--color-brutal-gray)] border border-white/10 rounded-2xl overflow-hidden group hover:border-white/30 transition-colors"
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
                      <button
                        onClick={() => copyToClipboard(hook.hookText, index)}
                        className="text-white/40 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
                        title="Copy Hook Text"
                      >
                        {copiedIndex === index ? (
                          <Check className="w-4 h-4 text-[var(--color-neon-green)]" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
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
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
