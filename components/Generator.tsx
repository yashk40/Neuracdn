'use client';

import { useState, useEffect } from "react";
import {
  Brain,
  Copy,
  Zap,
  Code,
  FileText,
  Rocket,
  CheckCircle,
  ArrowLeft,
  Play,
  Stars,
  Loader2,
} from "lucide-react";

// =============================================
// FLIP CARD STYLES (Pure CSS)
// =============================================
const flipCardStyles = `
  .flip-card {
    background-color: transparent;
    perspective: 1000px;
    height: 100%;
    min-height: 560px;
  }
  .flip-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    transition: transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1);
    transform-style: preserve-3d;
  }
  .flip-card.flipped .flip-card-inner {
    transform: rotateY(180deg);
  }
  .flip-card-front, .flip-card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    border-radius: 1.5rem;
    display: flex;
    flex-direction: column;
    background: white;
    border: 4px solid black;
    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  }
  .flip-card-back {
    transform: rotateY(180deg);
  }
  @keyframes shimmer {
    0% { transform: translateX(-100%) skewX(-12deg); }
    100% { transform: translateX(200%) skewX(-12deg); }
  }
  .animate-shimmer { animation: shimmer 2s infinite; }
  @media (max-width: 640px) { .flip-card { min-height: 650px; } }
`;

// =============================================
// SUGGESTIONS
// =============================================
const suggestions = [
  "Create a glowing neon button with hover pulse",
  "Make a futuristic card with glassmorphism and hover tilt",
  "Generate a smooth particle wave background animation",
];

// =============================================
// MAIN COMPONENT: DASHBOARD VERSION
// =============================================
export default function HomePage() {
  const [aiPrompt, setAiPrompt] = useState("");
  const [htmlCode, setHtmlCode] = useState("");
  const [cssCode, setCssCode] = useState("");
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ cdnUrl: string; githubUrl: string } | null>(null);

  const generateUniqueFileName = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `animation-${timestamp}-${random}.css`;
  };
  const [fileName] = useState(generateUniqueFileName());

  // Split AI code into HTML and CSS
  const processCode = (code: string) => {
    // 1. Clean the code: Remove markdown code blocks and extraneous text
    let cleanCode = code;

    // Remove triple backticks and language identifiers
    cleanCode = cleanCode.replace(/```(?:html|css)?/gi, "").replace(/```/g, "").trim();

    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanCode, "text/html");

    // Extract CSS from style tags
    let css = "";
    doc.querySelectorAll("style").forEach((s) => {
      css += s.innerHTML + "\n\n";
      s.remove();
    });

    // If no style tags, check if it's raw CSS
    if (!css.trim() && /{\s*[\w-]+\s*:/.test(cleanCode) && /@keyframes|animation/.test(cleanCode)) {
      css = cleanCode;
      setHtmlCode("");
    } else {
      doc.querySelectorAll("script").forEach((s) => s.remove());
      setHtmlCode(doc.body.innerHTML);
    }

    setCssCode(css.trim());
    setActiveTab("preview");
  };

  const htmlBoilerplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          margin: 0; 
          padding: 2rem; 
          background: white; 
          color: black; 
          font-family: system-ui, sans-serif; 
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          overflow: hidden;
        }
        ${cssCode}
      </style>
    </head>
    <body>
      <div id="preview-root">
        ${htmlCode || '<div style="color: #666; font-size: 1.2rem; font-weight: 500;">Preview rendering area...</div>'}
      </div>
    </body>
    </html>
  `;

  // AI Generation
  const generateCode = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      processCode(data.code);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // GitHub Upload
  const uploadToGitHub = async () => {
    if (!cssCode.trim()) return;
    setIsUploading(true);
    try {
      const res = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, content: cssCode }),
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setUploadResult(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] font-poppins text-black">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 bottom-0 w-20 bg-black flex flex-col items-center py-8 gap-10 z-50">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
          <Brain className="w-6 h-6 text-black" />
        </div>
        <nav className="flex flex-col gap-6">
          <button className="p-3 bg-zinc-800 rounded-xl text-white shadow-lg shadow-black/20">
            <Zap className="w-6 h-6" />
          </button>
          <button className="p-3 text-zinc-500 hover:text-white transition-colors">
            <Code className="w-6 h-6" />
          </button>
          <button className="p-3 text-zinc-500 hover:text-white transition-colors">
            <Rocket className="w-6 h-6" />
          </button>
        </nav>
      </aside>

      {/* Main Dashboard Workspace */}
      <main className="pl-20 flex-1 flex flex-col h-screen">
        {/* Top Professional Header */}
        <header className="h-20 border-b border-zinc-200 bg-white flex items-center justify-between px-10 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black tracking-tight uppercase">Neura Lab</h1>
            <div className="h-6 w-[2px] bg-zinc-200" />
            <span className="text-sm font-medium text-zinc-400">Generator / Workshop</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-zinc-100 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-zinc-600">AI AGENT ONLINE</span>
            </div>
          </div>
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-12 gap-8">

            {/* Left Column: Input & Controls */}
            <div className="col-span-12 lg:col-span-5 space-y-8">

              {/* AI Prompt Panel */}
              <section className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-black rounded-lg">
                      <Stars className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold">Dynamic Generator</h3>
                  </div>
                  <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">v1.2</span>
                </div>

                <div className="relative group">
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="E.g., A button that drips like liquid on hover..."
                    className="w-full h-40 bg-zinc-50 border border-zinc-200 rounded-2xl p-5 text-sm font-medium focus:ring-2 focus:ring-black outline-none transition-all resize-none"
                  />
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <button
                      onClick={generateCode}
                      disabled={isGenerating || !aiPrompt}
                      className="bg-black text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xl hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                      {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                      {isGenerating ? "CRAFTING" : "INITIALIZE"}
                    </button>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Suggestions</span>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.slice(0, 2).map((s, i) => (
                      <button
                        key={i}
                        onClick={() => { setAiPrompt(s); }}
                        className="text-[11px] font-semibold bg-white border border-zinc-200 px-4 py-2 rounded-full hover:border-black transition-colors"
                      >
                        {s.split("with")[0]}...
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* Deployment & Results Panel */}
              <section className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-black rounded-lg">
                    <Rocket className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold">Cloud Deployment</h3>
                </div>

                {!uploadResult ? (
                  <div className="space-y-6">
                    <div className="p-6 border-2 border-dashed border-zinc-100 rounded-2xl flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mb-4 text-zinc-300">
                        <Rocket className="w-6 h-6" />
                      </div>
                      <p className="text-xs text-zinc-400 font-medium">Ready to deploy generated CSS to Github CDN</p>
                    </div>
                    <button
                      onClick={uploadToGitHub}
                      disabled={isUploading || !cssCode}
                      className="w-full py-4 bg-black text-white rounded-2xl font-black text-xs tracking-widest hover:bg-zinc-800 disabled:opacity-20 transition-all flex items-center justify-center gap-3"
                    >
                      {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isUploading ? "DEPLOYING TO CLOUD" : "PUSH TO PRODUCTION"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                    <div className="bg-zinc-50 border border-black p-5 rounded-2xl space-y-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-black" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Status: Deployed</span>
                      </div>
                      <div className="relative">
                        <input
                          readOnly
                          value={uploadResult.cdnUrl}
                          className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-xs font-mono pr-20"
                        />
                        <button
                          onClick={() => copyToClipboard(uploadResult.cdnUrl)}
                          className="absolute right-2 top-1.5 p-1.5 bg-black text-white rounded-lg hover:scale-105 active:scale-95 transition-all"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => setUploadResult(null)}
                      className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black mx-auto block"
                    >
                      New Deployment Profile
                    </button>
                  </div>
                )}
              </section>

            </div>

            {/* Right Column: Visualizer & Source */}
            <div className="col-span-12 lg:col-span-7 space-y-8">

              {/* Main Visualizer Panel */}
              <section className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm flex flex-col min-h-[600px]">
                <div className="h-16 border-b border-zinc-100 flex items-center justify-between px-8 bg-zinc-50/50">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setActiveTab("preview")}
                      className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === "preview" ? "bg-black text-white shadow-lg" : "text-zinc-500 hover:text-black"}`}
                    >
                      LIVE PREVIEW
                    </button>
                    <button
                      onClick={() => setActiveTab("code")}
                      className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === "code" ? "bg-black text-white shadow-lg" : "text-zinc-500 hover:text-black"}`}
                    >
                      SOURCE CODE
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-zinc-200" />
                    <div className="w-3 h-3 rounded-full bg-zinc-200" />
                    <div className="w-3 h-3 rounded-full bg-zinc-200" />
                  </div>
                </div>

                <div className="flex-1 relative">
                  {activeTab === "preview" ? (
                    <div className="absolute inset-0 bg-[#f8f8f8] p-8 flex items-center justify-center">
                      <div className="w-full h-full bg-white rounded-2xl border border-zinc-200 shadow-inner overflow-hidden relative">
                        {cssCode || htmlCode ? (
                          <iframe
                            title="Visualizer"
                            srcDoc={htmlBoilerplate}
                            className="w-full h-full"
                            sandbox="allow-scripts"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-zinc-300">
                            <Zap className="w-16 h-16 mb-4 animate-pulse" />
                            <p className="text-sm font-medium">Awaiting AI generation results...</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-zinc-900 p-8">
                      <div className="w-full h-full overflow-hidden flex flex-col gap-4">
                        <div className="flex-1">
                          <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                            CSS Module
                          </div>
                          <textarea
                            value={cssCode}
                            onChange={(e) => setCssCode(e.target.value)}
                            className="w-full h-full bg-transparent text-zinc-100 font-mono text-xs outline-none p-4 custom-scrollbar border border-zinc-800 rounded-xl"
                            placeholder="/* Generated styles will appear here */"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* HTML Markup Panel */}
              <section className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-black rounded-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold">Blueprint Markup</h3>
                  </div>
                  <button
                    onClick={() => copyToClipboard(htmlCode)}
                    className="text-[10px] font-black uppercase text-zinc-400 hover:text-black tracking-widest transition-colors"
                  >
                    Copy Structure
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute top-4 right-4 text-[10px] font-bold text-zinc-300 pointer-events-none">TEMPLATES / JSX</div>
                  <textarea
                    readOnly
                    value={htmlCode}
                    className="w-full h-32 bg-zinc-50 border border-zinc-100 rounded-2xl p-6 font-mono text-[11px] text-zinc-600 outline-none resize-none"
                    placeholder="<div className='neura-element'>...</div>"
                  />
                </div>
              </section>

            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e4e4e7;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d4d4d8;
        }
      `}</style>
    </div>
  );
}
