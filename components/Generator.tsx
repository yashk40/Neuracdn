'use client';

import { useState, useEffect, useRef } from "react";
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
  LogOut,
  User,
  LayoutGrid,
  Monitor,
  X,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";

interface HistoryItem {
  id: string;
  prompt: string;
  html: string;
  css: string;
  cdnUrl?: string;
  createdAt: any;
}

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
  const { user, logout } = useAuth();
  const router = useRouter();
  const [aiPrompt, setAiPrompt] = useState("");
  const [htmlCode, setHtmlCode] = useState("");
  const [cssCode, setCssCode] = useState("");
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ cdnUrl: string; githubUrl: string } | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [currentView, setCurrentView] = useState<"generator" | "showcase">("generator");
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  // Refs for scrolling
  const generatorRef = useRef<HTMLElement>(null);
  const visualizerRef = useRef<HTMLElement>(null);
  const deploymentRef = useRef<HTMLElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const generateUniqueFileName = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `animation-${timestamp}-${random}.css`;
  };
  const [fileName, setFileName] = useState(generateUniqueFileName());

  // Fetch History
  const fetchHistory = async () => {
    if (!user) return;
    setIsLoadingHistory(true);
    try {
      const q = query(
        collection(db, "users_database"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const items: HistoryItem[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as HistoryItem);
      });

      // Sort in-memory to avoid needing a composite index in Firestore
      items.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });

      setHistory(items);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (user) fetchHistory();
  }, [user]);

  // Save to Firebase
  const saveToFirebase = async (cdnUrl?: string) => {
    if (!user || !cssCode) return;
    try {
      await addDoc(collection(db, "users_database"), {
        userId: user.uid,
        userName: user.displayName || user.email,
        prompt: aiPrompt,
        html: htmlCode,
        css: cssCode,
        cdnUrl: cdnUrl || "",
        createdAt: serverTimestamp(),
      });
      fetchHistory(); // Refresh history
    } catch (err) {
      console.error("Error saving to Firestore:", err);
      toast.error("Failed to sync with dashboard");
    }
  };

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
    setLoadingMessage("Analyzing prompt...");

    try {
      setTimeout(() => setLoadingMessage("Generating logic..."), 1500);
      setTimeout(() => setLoadingMessage("Styling component..."), 3000);
      setTimeout(() => setLoadingMessage("Polishing code..."), 4500);

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      processCode(data.code);
      toast.success("Component generated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
      setLoadingMessage("");
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
      toast.success("Deployed to GitHub CDN!");
      // Save to Firebase after successful deployment
      await saveToFirebase(data.cdnUrl);
    } catch (err: any) {
      console.error(err);
      toast.error("Cloud deployment failed");
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (text: string, label: string = "Content") => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`, { icon: <CheckCircle className="w-4 h-4 text-green-500" /> });
  };

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] font-poppins text-black">
      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 bg-black flex-col items-center py-8 gap-10 z-50">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
          <Brain className="w-6 h-6 text-black" />
        </div>
        <nav className="flex flex-col gap-6">
          <button
            onClick={() => setCurrentView("generator")}
            className={`p-3 rounded-xl transition-all hover:scale-110 ${currentView === "generator" ? "bg-white text-black shadow-lg shadow-white/10" : "text-zinc-500 hover:text-white"}`}
            title="Generator"
          >
            <Zap className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCurrentView("showcase")}
            className={`p-3 rounded-xl transition-all hover:scale-110 ${currentView === "showcase" ? "bg-white text-black shadow-lg shadow-white/10" : "text-zinc-500 hover:text-white"}`}
            title="Showcase"
          >
            <LayoutGrid className="w-6 h-6" />
          </button>
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 h-16 bg-black/90 backdrop-blur-lg rounded-2xl flex items-center justify-around px-6 z-50 border border-white/10 shadow-2xl">
        <button
          onClick={() => setCurrentView("generator")}
          className={`p-3 rounded-xl transition-all ${currentView === "generator" ? "bg-white text-black shadow-lg" : "text-zinc-500"}`}
        >
          <Zap className="w-5 h-5" />
        </button>
        <button
          onClick={() => setCurrentView("showcase")}
          className={`p-3 rounded-xl transition-all ${currentView === "showcase" ? "bg-white text-black shadow-lg" : "text-zinc-500"}`}
        >
          <LayoutGrid className="w-5 h-5" />
        </button>
        <button
          onClick={async () => {
            await logout();
            router.push("/auth");
          }}
          className="p-2 text-zinc-500"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </nav>

      {/* Main Dashboard Workspace */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden md:pl-20">
        {/* Top Professional Header */}
        <header className="h-16 md:h-20 border-b border-zinc-200 bg-white flex items-center justify-between px-6 md:px-10 shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            <h1 className="text-lg md:text-xl font-black tracking-tight uppercase">Neura Lab</h1>
            <div className="h-4 md:h-6 w-[2px] bg-zinc-200" />
            <div className="flex flex-col">
              <span className="text-[10px] md:text-xs font-bold text-zinc-800">
                {user ? `Hi, ${user.displayName || user.email?.split('@')[0]}` : "Generator"}
              </span>
              <span className="text-[8px] md:text-[10px] font-medium text-zinc-400 uppercase tracking-widest">Workspace</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <button
                onClick={async () => {
                  await logout();
                  router.push("/auth");
                }}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-500 hover:text-red-600"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-xs font-bold uppercase">Logout</span>
              </button>
            )}
            <div className="px-3 py-1.5 md:px-4 md:py-2 bg-zinc-100 rounded-full flex items-center gap-2">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[9px] md:text-xs font-bold text-zinc-600 uppercase">ONLINE</span>
            </div>
          </div>
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar pb-32 md:pb-8">
          {currentView === "generator" ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="max-w-7xl mx-auto w-full grid grid-cols-12 gap-6 md:gap-8">
                {/* Left Column: Input & Controls */}
                <div className="col-span-12 lg:col-span-5 space-y-8">
                  {/* AI Prompt Panel */}
                  <section ref={generatorRef} className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm">
                    {/* ... (Keep existing prompt panel content) */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-black rounded-lg">
                          <Stars className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-base md:text-lg font-bold">Dynamic Generator</h3>
                      </div>
                      <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest px-2 py-1 bg-zinc-100 rounded-md">v1.2</span>
                    </div>

                    <div className="relative group">
                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="E.g., A button that drips like liquid on hover..."
                        className="w-full h-32 md:h-40 bg-zinc-50 border border-zinc-200 rounded-2xl p-5 text-sm font-medium focus:ring-2 focus:ring-black outline-none transition-all resize-none shadow-inner"
                      />
                      <div className="absolute top-4 right-4 flex gap-2">
                        {aiPrompt && (
                          <button
                            onClick={() => setAiPrompt("")}
                            className="p-1.5 text-zinc-300 hover:text-red-500 transition-colors"
                            title="Clear Prompt"
                          >
                            <ArrowLeft className="w-4 h-4 rotate-90" />
                          </button>
                        )}
                      </div>
                      <div className="absolute bottom-4 right-4 flex gap-2">
                        <button
                          onClick={generateCode}
                          disabled={isGenerating || !aiPrompt}
                          className="bg-black text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xl hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                        >
                          {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                          {isGenerating ? loadingMessage.toUpperCase() || "CRAFTING" : "INITIALIZE"}
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
                      <p className="mt-4 text-[9px] text-zinc-400 font-medium italic">
                        * Results may vary based on the AI model used.
                      </p>
                    </div>
                  </section>

                  {/* Deployment & Results Panel */}
                  <section ref={deploymentRef} className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm scroll-mt-24">
                    {/* ... (Keep existing deployment content) */}
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2 bg-black rounded-lg">
                        <Rocket className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-base md:text-lg font-bold">Cloud Deployment</h3>
                    </div>

                    {!uploadResult ? (
                      <div className="space-y-6">
                        <div className="p-6 border-2 border-dashed border-zinc-100 rounded-2xl flex flex-col items-center justify-center text-center">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-zinc-50 rounded-full flex items-center justify-center mb-4 text-zinc-300">
                            <Rocket className="w-5 h-5 md:w-6 md:h-6" />
                          </div>
                          <p className="text-[10px] md:text-xs text-zinc-400 font-medium">Ready to deploy generated CSS to Github CDN</p>
                        </div>
                        <button
                          onClick={uploadToGitHub}
                          disabled={isUploading || !cssCode}
                          className="w-full py-4 bg-black text-white rounded-2xl font-black text-xs tracking-widest hover:bg-zinc-800 disabled:opacity-20 transition-all flex items-center justify-center gap-3 shadow-lg shadow-black/10"
                        >
                          {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                          {isUploading ? "DEPLOYING" : "PUSH TO PRODUCTION"}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                        <div className="bg-zinc-50 border border-black/10 p-4 md:p-5 rounded-2xl space-y-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-black" />
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Status: Deployed</span>
                          </div>
                          <div className="relative">
                            <input
                              readOnly
                              value={`<link rel="stylesheet" href="${uploadResult.cdnUrl}">`}
                              className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-[10px] md:text-xs font-mono pr-20"
                            />
                            <button
                              onClick={() => copyToClipboard(`<link rel="stylesheet" href="${uploadResult.cdnUrl}">`, "CDN Link Tag")}
                              className="absolute right-2 top-1.5 p-1.5 bg-black text-white rounded-lg hover:scale-105 active:scale-95 transition-all"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => setUploadResult(null)}
                          className="text-[10px] md:text-[11px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black mx-auto block"
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
                  <section ref={visualizerRef} className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm flex flex-col min-h-[500px] md:min-h-[600px] scroll-mt-24">
                    {/* ... (Keep existing visualizer content) */}
                    <div className="h-14 md:h-16 border-b border-zinc-100 flex items-center justify-between px-4 md:px-8 bg-zinc-50/50">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setActiveTab("preview")}
                          className={`px-3 md:px-5 py-2 text-[10px] md:text-xs font-bold rounded-lg transition-all ${activeTab === "preview" ? "bg-black text-white shadow-lg shadow-black/20" : "text-zinc-500 hover:text-black"}`}
                        >
                          LIVE PREVIEW
                        </button>
                        <button
                          onClick={() => setActiveTab("code")}
                          className={`px-3 md:px-5 py-2 text-[10px] md:text-xs font-bold rounded-lg transition-all ${activeTab === "code" ? "bg-black text-white shadow-lg shadow-black/20" : "text-zinc-500 hover:text-black"}`}
                        >
                          SOURCE CODE
                        </button>
                      </div>
                      <div className="hidden md:flex gap-2">
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
                                <p className="text-[10px] text-zinc-400 mt-2 font-medium italic">Accuracy depends on AI model complexity</p>
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
                  <section className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm">
                    {/* ... (Keep existing html panel content) */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-black rounded-lg">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-base md:text-lg font-bold">Blueprint Markup</h3>
                      </div>
                      <button
                        onClick={() => copyToClipboard(htmlCode, "HTML Code")}
                        className="text-[10px] font-black uppercase text-zinc-400 hover:text-black tracking-widest transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute top-4 right-4 text-[9px] font-bold text-zinc-300 pointer-events-none uppercase">TEMPLATES</div>
                      <textarea
                        readOnly
                        value={htmlCode}
                        className="w-full h-32 md:h-32 bg-zinc-50 border border-zinc-100 rounded-2xl p-6 font-mono text-[10px] md:text-[11px] text-zinc-600 outline-none resize-none shadow-inner"
                        placeholder="<div className='neura-element'>...</div>"
                      />
                    </div>
                  </section>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
              <section className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-10 shadow-sm min-h-[80vh]">
                <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-black rounded-2xl shadow-xl shadow-black/10">
                      <LayoutGrid className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black tracking-tight">Component Showcase</h2>
                      <p className="text-zinc-400 text-sm font-medium">Your personal production library</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-zinc-50 p-2 rounded-2xl border border-zinc-100">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-4">
                      {history.length} Units Deployed
                    </span>
                    <button
                      onClick={fetchHistory}
                      className="p-2 bg-white rounded-xl shadow-sm border border-zinc-200 hover:border-black transition-all"
                    >
                      <Loader2 className={`w-4 h-4 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {history.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="group relative bg-[#FDFDFD] border border-zinc-200 rounded-[2.5rem] p-6 hover:border-black hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 flex flex-col h-[400px]"
                      >
                        <div className="flex-1 flex flex-col gap-6">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Live Content</span>
                            </div>
                            <button
                              onClick={() => setSelectedItem(item)}
                              className="px-4 py-2 bg-zinc-100 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-600 flex items-center gap-2 hover:bg-black hover:text-white transition-all group-hover:shadow-lg"
                            >
                              <Code className="w-3 h-3" />
                              Get Code
                            </button>
                          </div>

                          <div className="flex-1 bg-white rounded-[2rem] border border-zinc-100 shadow-inner overflow-hidden relative group/canvas">
                            <iframe
                              title="Showcase Preview"
                              srcDoc={`<!DOCTYPE html><html><head><style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;overflow:hidden;zoom:0.6;}${item.css}</style></head><body>${item.html}</body></html>`}
                              className="w-full h-full border-none pointer-events-none transition-transform duration-700 group-hover/canvas:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover/canvas:bg-black/5 transition-colors pointer-events-none" />
                          </div>

                          <div>
                            <p className="text-sm font-bold text-zinc-800 line-clamp-1 mb-1 italic">"{item.prompt}"</p>
                            <div className="flex items-center justify-between text-[10px] text-zinc-400 font-medium">
                              <span>{item.createdAt instanceof Timestamp ? item.createdAt.toDate().toLocaleDateString() : 'Recent'}</span>
                              <span className="uppercase tracking-widest text-[8px] font-black">CDN Ready</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="w-24 h-24 bg-zinc-50 rounded-full mb-8 flex items-center justify-center border border-dashed border-zinc-200">
                      <LayoutGrid className="w-10 h-10 text-zinc-300" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No Showcase Items</h3>
                    <p className="text-zinc-400 max-w-sm mx-auto">Generate some premium components to build your production showcase.</p>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </main>

      {/* Get Code Modal Overlay */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-full max-h-[800px] border border-white/20">
            {/* Modal Left: Preview */}
            <div className="md:w-1/2 bg-zinc-50 flex flex-col p-8 md:p-12 border-b md:border-b-0 md:border-r border-zinc-200">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-black rounded-xl">
                    <Monitor className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">Integration Preview</span>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="md:hidden p-2 hover:bg-zinc-200 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 bg-white rounded-[2rem] border border-zinc-200 shadow-2xl overflow-hidden relative">
                <iframe
                  title="Modal Preview"
                  srcDoc={`<!DOCTYPE html><html><head><style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;overflow:hidden;}${selectedItem.css}</style></head><body>${selectedItem.html}</body></html>`}
                  className="w-full h-full border-none"
                />
              </div>
              <p className="mt-8 text-[11px] text-zinc-400 font-medium leading-relaxed italic">
                "Generated based on: {selectedItem.prompt}"
              </p>
            </div>

            {/* Modal Right: Instructions */}
            <div className="flex-1 p-8 md:p-12 flex flex-col overflow-y-auto custom-scrollbar relative">
              <button
                onClick={() => setSelectedItem(null)}
                className="hidden md:flex absolute top-8 right-8 p-3 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="space-y-10">
                <div>
                  <h3 className="text-2xl font-black mb-2">Production Export</h3>
                  <p className="text-zinc-400 text-sm">Follow these 2 steps to integrate this module</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">1</div>
                    <span className="text-[11px] font-black uppercase tracking-widest">Connect CDN (CSS)</span>
                  </div>
                  <div className="relative">
                    <input
                      readOnly
                      value={selectedItem.cdnUrl ? `<link rel="stylesheet" href="${selectedItem.cdnUrl}">` : "Deploy to get link"}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 text-xs font-mono text-zinc-600 pr-16"
                    />
                    <button
                      onClick={() => copyToClipboard(selectedItem.cdnUrl ? `<link rel="stylesheet" href="${selectedItem.cdnUrl}">` : "", "CDN Link Tag")}
                      className="absolute right-3 top-3 p-2 bg-black text-white rounded-xl hover:scale-105 active:scale-95 transition-all"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-medium">Add this to your <code className="bg-zinc-100 px-1 rounded">&lt;head&gt;</code> to load all styles remotely.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">2</div>
                    <span className="text-[11px] font-black uppercase tracking-widest">Inject Markup (HTML)</span>
                  </div>
                  <div className="relative">
                    <textarea
                      readOnly
                      value={selectedItem.html}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-5 text-[11px] font-mono text-zinc-600 h-32 resize-none"
                    />
                    <button
                      onClick={() => copyToClipboard(selectedItem.html, "HTML Markup")}
                      className="absolute right-3 top-3 p-2 bg-black text-white rounded-xl hover:scale-105 active:scale-95 transition-all"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-medium">Paste this markup where you want the component to appear.</p>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

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
