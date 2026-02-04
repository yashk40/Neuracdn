'use client';

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
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
  Bot, // New Icon
  FileCode,
} from "lucide-react";
import WebsiteBuilder from "@/components/WebsiteBuilder"; // Import new component
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
  const [framework, setFramework] = useState<"css" | "tailwind" | "bootstrap">("css");
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ cdnUrl: string; filename: string } | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Framework Switch Warning State
  const [showWarning, setShowWarning] = useState(false);
  const [pendingFramework, setPendingFramework] = useState<"css" | "tailwind" | "bootstrap" | null>(null);

  const [currentView, setCurrentView] = useState<"generator" | "showcase" | "website-beta">("generator");
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

  const cancelSwitch = () => {
    setShowWarning(false);
    setPendingFramework(null);
  };

  const confirmSwitch = () => {
    if (pendingFramework) {
      setFramework(pendingFramework);
      setHtmlCode("");
      setCssCode("");
      setActiveTab("preview");
      setShowWarning(false);
      setPendingFramework(null);
    }
  };

  const handleFrameworkChange = (newFramework: "css" | "tailwind" | "bootstrap") => {
    if (newFramework === framework) return;

    // If there is active code (generated content), show warning
    if (htmlCode || cssCode) {
      setPendingFramework(newFramework);
      setShowWarning(true);
    } else {
      // No active code, switch immediately
      setFramework(newFramework);
    }
  };

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
      ${framework === "tailwind" ? '<script src="https://cdn.tailwindcss.com"></script>' : ""}
      ${framework === "bootstrap" ? '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"><script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>' : ""}
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
        }
        #preview-root {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
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
        body: JSON.stringify({ prompt: aiPrompt, framework }),
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
    // For Tailwind, we generate a JS script that injects the Tailwind CDN and any custom CSS
    const isTailwind = framework === "tailwind";

    // Validate: For CSS framework, we need existing CSS code. For Tailwind, we might just need the setup script.
    if (!isTailwind && !cssCode.trim()) return;

    setIsUploading(true);
    try {
      let uploadFileName = fileName;
      let content = cssCode;

      if (isTailwind) {
        // Generate a unique JS filename
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        uploadFileName = `script-${timestamp}-${random}.js`;

        // Create the JS script that injects Tailwind and custom styles
        content = `
(function () {
${cssCode.trim() ? `  // Inject Custom CSS
  var style = document.createElement('style');
  style.innerHTML = ${JSON.stringify(cssCode)};
  document.head.appendChild(style);
` : ''}
  function loadTailwind() {
    if (window.tailwind) {
      document.documentElement.classList.remove("tw-loading");
      return;
    }
    setTimeout(loadTailwind, 50);
  }

  if (!document.querySelector('script[src*="cdn.tailwindcss.com"]')) {
    const s = document.createElement("script");
    s.src = "https://cdn.tailwindcss.com";
    document.head.appendChild(s);
  }

  document.documentElement.classList.add("tw-loading");
  loadTailwind();
})();
        `.trim();
      }

      const res = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: uploadFileName, content }),
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setUploadResult(data);
      toast.success("Deployed to GitHub CDN!");

      // Save to Firebase (store the CDN URL)
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
    <div className="flex min-h-screen bg-gradient-to-br from-zinc-50 via-slate-50 to-zinc-100 font-poppins text-black">
      {/* Circular Floating Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex fixed left-6 top-1/2 -translate-y-1/2 z-50">
        <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-full py-16 px-4 shadow-2xl shadow-black/5 flex flex-col items-center gap-12 transition-all hover:shadow-black/10">

          {/* Logo Circle */}
          <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center shadow-lg shadow-black/20 hover:scale-110 transition-transform cursor-default ring-4 ring-white/50 z-10">
            <Image src="/brain.svg" alt="Neura Logo" width={28} height={28} className="invert brightness-200" />
          </div>

          {/* Divider */}
          <div className="w-8 h-[1px] bg-zinc-300/80" />

          <nav className="flex flex-col gap-8">
            {/* Generator Button */}
            <button
              onClick={() => setCurrentView("generator")}
              className={`group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${currentView === "generator"
                ? "bg-black text-white shadow-xl shadow-black/20 scale-110"
                : "text-zinc-400 hover:bg-white/80 hover:text-zinc-700 hover:shadow-md"
                }`}
              title="Generator"
            >
              <Zap className="w-5 h-5" />
              {currentView === "generator" && (
                <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-md -z-10"></div>
              )}
            </button>

            {/* Showcase Button */}
            <button
              onClick={() => setCurrentView("showcase")}
              className={`group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${currentView === "showcase"
                ? "bg-black text-white shadow-xl shadow-black/20 scale-110"
                : "text-zinc-400 hover:bg-white/80 hover:text-zinc-700 hover:shadow-md"
                }`}
              title="Showcase"
            >
              <LayoutGrid className="w-5 h-5" />
              {currentView === "showcase" && (
                <div className="absolute inset-0 rounded-full bg-green-500/10 blur-md -z-10"></div>
              )}
            </button>

            {/* Website Beta Button */}
            <button
              onClick={() => setCurrentView("website-beta")}
              className={`group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${currentView === "website-beta"
                ? "bg-black text-white shadow-xl shadow-black/20 scale-110"
                : "text-zinc-400 hover:bg-white/80 hover:text-zinc-700 hover:shadow-md"
                }`}
              title="Website Builder (Beta)"
            >
              <Bot className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
              </span>
              {currentView === "website-beta" && (
                <div className="absolute inset-0 rounded-full bg-purple-500/10 blur-md -z-10"></div>
              )}
            </button>
          </nav>
        </div>
      </aside>

      {/* Mobile Circular Bottom Navigation */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 h-16 px-4 bg-white/80 backdrop-blur-xl rounded-full flex items-center justify-center gap-3 z-50 border border-white/60 shadow-2xl shadow-black/20">
        <button
          onClick={() => setCurrentView("generator")}
          className={`w-12 h-12 rounded-full transition-all ${currentView === "generator" ? "bg-gradient-to-br from-zinc-800 to-black text-white shadow-lg scale-110" : "text-zinc-400 hover:bg-white/50"}`}
        >
          <Zap className="w-5 h-5 mx-auto" />
        </button>
        <button
          onClick={() => setCurrentView("showcase")}
          className={`w-12 h-12 rounded-full transition-all ${currentView === "showcase" ? "bg-gradient-to-br from-zinc-800 to-black text-white shadow-lg scale-110" : "text-zinc-400 hover:bg-white/50"}`}
        >
          <LayoutGrid className="w-5 h-5 mx-auto" />
        </button>
        <button
          onClick={() => setCurrentView("website-beta")}
          className={`w-12 h-12 rounded-full transition-all ${currentView === "website-beta" ? "bg-gradient-to-br from-zinc-800 to-black text-white shadow-lg scale-110" : "text-zinc-400 hover:bg-white/50"}`}
        >
          <Bot className="w-5 h-5 mx-auto" />
        </button>
        <div className="w-[1px] h-8 bg-white/40" />
        <button
          onClick={async () => {
            await logout();
            router.push("/auth");
          }}
          className="w-12 h-12 rounded-full text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-all"
        >
          <LogOut className="w-5 h-5 mx-auto" />
        </button>
      </nav>

      {/* Main Dashboard Workspace */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden md:pl-24">
        {/* Circular Top Header */}
        <header className="h-24 md:h-28 flex items-center justify-center px-4 md:px-8 shrink-0 relative z-40">
          <div className="w-full max-w-[98%] md:max-w-[96%] bg-white/70 backdrop-blur-xl border border-white/50 rounded-full h-16 md:h-20 shadow-2xl shadow-black/5 flex items-center justify-between px-3 md:px-6 relative transition-all hover:shadow-black/10">

            {/* Left: User Info Pill */}
            <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm border border-white/40 rounded-full px-2 py-1.5 pr-6 shadow-sm hover:bg-white hover:shadow-md transition-all group cursor-default">
              <div className="w-10 md:w-12 h-10 md:h-12 bg-gradient-to-br from-zinc-800 to-black rounded-full flex items-center justify-center shadow-lg shadow-black/20 group-hover:scale-105 transition-transform">
                <User className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm md:text-base font-semibold text-zinc-900 leading-tight max-w-[80px] md:max-w-none truncate">
                  {user ? `${user.displayName || user.email?.split('@')[0]}` : "Guest"}
                </span>
                <span className="text-[10px] md:text-xs font-medium text-zinc-400 group-hover:text-zinc-500 transition-colors">
                  <span className="md:hidden">Neura Dashboard</span>
                  <span className="hidden md:inline">Workspace</span>
                </span>
              </div>
            </div>

            {/* Center: Dashboard Title */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-3 md:gap-4 pointer-events-none">

              <h1 className="text-lg md:text-2xl font-semibold tracking-tight text-zinc-800  space-x-1">
                <span className="" style={{ fontWeight: "bold" }}>Neura</span>
                <span className="font-light text-zinc-500">Dashboard</span>
              </h1>

            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* Online Status Circle */}
              <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-full pl-4 pr-2 py-1.5 flex items-center gap-3 shadow-sm hover:bg-white transition-all">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                  <span className="text-xs font-semibold text-zinc-600 hidden md:block tracking-wide">ONLINE</span>
                </div>

                {/* Logout Button */}
                {user && (
                  <button
                    onClick={async () => {
                      await logout();
                      router.push("/auth");
                    }}
                    className="w-10 md:w-12 h-10 md:h-12 flex items-center justify-center bg-black text-white rounded-full hover:scale-110 active:scale-95 transition-all shadow-lg hover:shadow-xl hover:shadow-black/20"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar pb-32 md:pb-8" data-lenis-prevent>
          {currentView === "website-beta" ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 h-full">
              <WebsiteBuilder />
            </div>
          ) : currentView === "generator" ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="max-w-7xl mx-auto w-full grid grid-cols-12 gap-6 md:gap-8">
                {/* Left Column: Input & Controls */}
                <div className="col-span-12 lg:col-span-5 space-y-8">
                  {/* AI Prompt Panel */}
                  <section ref={generatorRef} className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-6 md:p-10 shadow-2xl shadow-black/5">
                    {/* ... (Keep existing prompt panel content) */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-zinc-800 to-black rounded-full shadow-lg shadow-black/20 ring-4 ring-white/50">
                          <Stars className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg md:text-xl font-medium tracking-tight">Dynamic Generator</h3>
                      </div>
                      <span className="text-[10px] font-semibold text-zinc-500 tracking-wider px-4 py-2 bg-white/60 backdrop-blur-md rounded-full border border-white/40 shadow-sm">v1.2</span>
                    </div>

                    <div className="flex flex-col gap-4">
                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="E.g., A button that drips like liquid on hover..."
                        className="w-full h-40 md:h-52 bg-white/50 backdrop-blur-sm border border-white/40 rounded-[2.5rem] p-6 md:p-8 text-sm font-medium text-zinc-700 placeholder:text-zinc-400 focus:ring-4 focus:ring-zinc-100 hover:bg-white/60 outline-none transition-all resize-none shadow-inner"
                      />

                      {/* Controls Container */}
                      <div className="flex flex-col items-center justify-between gap-4">

                        {/* Framework Selection */}
                        <div className="grid grid-cols-3 gap-2 w-full">
                          <button
                            onClick={() => handleFrameworkChange("tailwind")}
                            className={`group relative flex items-center justify-center gap-2 px-2 lg:px-4 py-3 lg:py-2 rounded-full border transition-all duration-300 ${framework === "tailwind"
                              ? "bg-black text-white border-black shadow-lg shadow-black/10 scale-[1.02]"
                              : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:shadow-sm"
                              }`}
                          >
                            <div className={`hidden lg:flex w-4 h-4 rounded-full border items-center justify-center transition-colors ${framework === "tailwind" ? "border-transparent bg-white/20" : "border-zinc-300 group-hover:border-zinc-400"
                              }`}>
                              {framework === "tailwind" && <CheckCircle className="w-3 h-3 text-white" />}
                            </div>

                            <svg viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 transition-colors ${framework === "tailwind" ? "text-[#38BDF8]" : "text-zinc-400 group-hover:text-[#38BDF8]"}`}>
                              <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z" />
                            </svg>
                            <span className="font-semibold text-[10px] lg:text-xs tracking-wide truncate">Tailwind</span>
                          </button>

                          <button
                            onClick={() => handleFrameworkChange("bootstrap")}
                            className={`group relative flex items-center justify-center gap-2 px-2 lg:px-4 py-3 lg:py-2 rounded-full border transition-all duration-300 ${framework === "bootstrap"
                              ? "bg-black text-white border-black shadow-lg shadow-black/10 scale-[1.02]"
                              : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:shadow-sm"
                              }`}
                          >
                            <div className={`hidden lg:flex w-4 h-4 rounded-full border items-center justify-center transition-colors ${framework === "bootstrap" ? "border-transparent bg-white/20" : "border-zinc-300 group-hover:border-zinc-400"
                              }`}>
                              {framework === "bootstrap" && <CheckCircle className="w-3 h-3 text-white" />}
                            </div>
                            <svg viewBox="0 0 118 94" fill="currentColor" className={`w-4 h-4 transition-colors ${framework === "bootstrap" ? "text-[#7952B3]" : "text-zinc-400 group-hover:text-[#7952B3]"}`}>
                              <path fillRule="evenodd" clipRule="evenodd" d="M24.509 0c-6.733 0-11.715 5.893-11.492 12.284.214 6.14-.064 14.092-2.066 20.577C8.943 39.365 5.547 43.485 0 44.014v5.972c5.547.529 8.943 4.649 10.951 11.153 2.002 6.485 2.28 14.437 2.066 20.577C12.794 88.106 17.776 94 24.51 94H93.5c6.733 0 11.714-5.893 11.491-12.284-.214-6.14.064-14.092 2.066-20.577 2.009-6.504 5.396-10.624 10.943-11.153v-5.972c-5.547-.529-8.934-4.649-10.943-11.153-2.002-6.484-2.28-14.437-2.066-20.577C105.214 5.894 100.233 0 93.5 0H24.508zM80 57.863C80 66.663 73.436 72 62.543 72H44a2 2 0 01-2-2V24a2 2 0 012-2h18.437c9.083 0 15.044 4.92 15.044 12.474 0 5.302-4.01 10.049-9.119 10.88v.277C75.317 46.394 80 51.21 80 57.863zM60.521 28.34H49.948v14.934h8.905c6.884 0 10.68-2.772 10.68-7.727 0-4.643-3.264-7.207-9.012-7.207zM49.948 49.2v16.458H60.91c7.167 0 10.964-2.876 10.964-8.281 0-5.406-3.903-8.178-11.425-8.178H49.948z" />
                            </svg>
                            <span className="font-semibold text-[10px] lg:text-xs tracking-wide truncate">Bootstrap</span>
                          </button>

                          <button
                            onClick={() => handleFrameworkChange("css")}
                            className={`group relative flex items-center justify-center gap-2 px-2 lg:px-4 py-3 lg:py-2 rounded-full border transition-all duration-300 ${framework === "css"
                              ? "bg-black text-white border-black shadow-lg shadow-black/10 scale-[1.02]"
                              : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:shadow-sm"
                              }`}
                          >
                            <div className={`hidden lg:flex w-4 h-4 rounded-full border items-center justify-center transition-colors ${framework === "css" ? "border-transparent bg-white/20" : "border-zinc-300 group-hover:border-zinc-400"
                              }`}>
                              {framework === "css" && <CheckCircle className="w-3 h-3 text-white" />}
                            </div>
                            <FileCode className={`w-4 h-4 transition-colors ${framework === "css" ? "text-blue-400" : "text-zinc-400 group-hover:text-blue-400"}`} />
                            <span className="font-semibold text-[10px] lg:text-xs tracking-wide truncate">Raw CSS</span>
                          </button>
                        </div>

                        {/* Generate Button */}
                        <div className="flex-shrink-0 w-full">
                          <button
                            onClick={generateCode}
                            disabled={isGenerating || !aiPrompt}
                            className="w-full bg-gradient-to-r from-zinc-800 to-black text-white px-5 lg:px-7 py-3 lg:py-3 rounded-full font-medium text-xs lg:text-sm flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl hover:hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                          >
                            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                            {isGenerating ? loadingMessage || "Crafting" : "Generate"}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-3">
                      <span className="text-[10px] font-medium text-zinc-400 tracking-wide ml-1">Suggestions</span>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.slice(0, 2).map((s, i) => (
                          <button
                            key={i}
                            onClick={() => { setAiPrompt(s); }}
                            className="text-[11px] font-normal bg-white/60 backdrop-blur-sm border border-white/60 px-4 py-2 rounded-full hover:bg-white hover:shadow-md transition-all"
                          >
                            {s.split("with")[0]}...
                          </button>
                        ))}
                      </div>
                      <p className="mt-4 text-[9px] text-zinc-400 font-normal italic">
                        * Results may vary based on the AI model used.
                      </p>
                    </div>
                  </section>

                  {/* Deployment & Results Panel */}
                  <section ref={deploymentRef} className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[3rem] p-6 md:p-10 shadow-2xl shadow-black/5 scroll-mt-24">
                    {/* ... (Keep existing deployment content) */}
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-gradient-to-br from-zinc-800 to-black rounded-full shadow-lg shadow-black/20 ring-4 ring-white/50">
                        <Rocket className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg md:text-xl font-medium tracking-tight">Cloud Deployment</h3>
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
                          disabled={isUploading || (!cssCode && framework !== "tailwind")}
                          className="w-full py-4 bg-gradient-to-r from-zinc-800 to-black text-white rounded-full font-medium text-xs tracking-wide hover:shadow-2xl hover:scale-[1.02] disabled:opacity-20 transition-all flex items-center justify-center gap-3 shadow-lg shadow-black/10"
                        >
                          {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                          {isUploading ? "Deploying" : "Push to Production"}
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
                              value={
                                framework === "tailwind"
                                  ? `<script src="${uploadResult.cdnUrl}"></script>`
                                  : `<link rel="stylesheet" href="${uploadResult.cdnUrl}">`
                              }
                              className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-[10px] md:text-xs font-mono pr-20"
                            />
                            <button
                              onClick={() => copyToClipboard(
                                framework === "tailwind"
                                  ? `<script src="${uploadResult.cdnUrl}"></script>`
                                  : `<link rel="stylesheet" href="${uploadResult.cdnUrl}">`,
                                framework === "tailwind" ? "Script Tag" : "CDN Link Tag"
                              )}
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
                  <section ref={visualizerRef} className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[3rem] overflow-hidden shadow-2xl shadow-black/5 flex flex-col min-h-[500px] md:min-h-[650px] scroll-mt-24 transition-all duration-500 hover:shadow-black/10">
                    {/* ... (Keep existing visualizer content) */}
                    <div className="h-16 md:h-20 border-b border-white/50 flex items-center justify-between px-6 md:px-10 bg-white/40 backdrop-blur-md">
                      <div className="flex gap-2 p-1.5 bg-white/50 rounded-full border border-white/50 shadow-inner">
                        <button
                          onClick={() => setActiveTab("preview")}
                          className={`px-5 md:px-6 py-2.5 text-[10px] md:text-xs font-semibold rounded-full transition-all duration-300 ${activeTab === "preview"
                            ? "bg-black text-white shadow-lg shadow-black/20 scale-105"
                            : "text-zinc-500 hover:text-black hover:bg-white/40"}`}
                        >
                          Live Preview
                        </button>
                        <button
                          onClick={() => setActiveTab("code")}
                          className={`px-5 md:px-6 py-2.5 text-[10px] md:text-xs font-semibold rounded-full transition-all duration-300 ${activeTab === "code"
                            ? "bg-black text-white shadow-lg shadow-black/20 scale-105"
                            : "text-zinc-500 hover:text-black hover:bg-white/40"}`}
                        >
                          Source Code
                        </button>
                      </div>
                      <div className="hidden md:flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-white/50" />
                        <div className="w-3 h-3 rounded-full bg-white/50" />
                        <div className="w-3 h-3 rounded-full bg-white/50" />
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
                  <section className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[3rem] p-6 md:p-10 shadow-2xl shadow-black/5 transition-all hover:shadow-black/10">
                    {/* ... (Keep existing html panel content) */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-zinc-800 to-black rounded-full shadow-lg shadow-black/20 ring-4 ring-white/50">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg md:text-xl font-medium tracking-tight">Blueprint Markup</h3>
                      </div>
                      <button
                        onClick={() => copyToClipboard(htmlCode, "HTML Code")}
                        className="text-[10px] font-semibold text-zinc-400 hover:text-black tracking-wider transition-colors px-4 py-2 hover:bg-white rounded-full"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute top-6 right-8 text-[9px] font-bold text-zinc-300 pointer-events-none uppercase tracking-widest">TEMPLATE</div>
                      <textarea
                        readOnly
                        value={htmlCode}
                        className="w-full h-32 md:h-40 bg-zinc-50/50 border border-white/60 rounded-[2.5rem] p-8 font-mono text-[10px] md:text-[11px] text-zinc-600 outline-none resize-none shadow-inner"
                        placeholder="<div className='neura-element'>...</div>"
                      />
                    </div>
                  </section>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
              <section className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-6 md:p-10 shadow-2xl shadow-black/5 min-h-[80vh]">
                <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-zinc-800 to-black rounded-full shadow-lg shadow-black/20 ring-4 ring-white/50">
                      <LayoutGrid className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-medium tracking-tight">Component Showcase</h2>
                      <p className="text-zinc-400 text-sm font-normal">Your personal production library</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm p-2 rounded-full border border-white/40 shadow-inner">
                    <span className="text-[10px] font-medium text-zinc-400 tracking-wide px-4">
                      {history.length} Units Deployed
                    </span>
                    <button
                      onClick={fetchHistory}
                      className="p-2.5 bg-white rounded-full shadow-sm border border-white/60 hover:border-zinc-300 transition-all hover:shadow-md active:scale-95"
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
                        className="group relative bg-white/60 backdrop-blur-lg border border-white/50 rounded-[2.5rem] p-8 hover:bg-white/80 hover:border-white hover:shadow-2xl hover:shadow-black/10 transition-all duration-500 flex flex-col h-[420px]"
                      >
                        <div className="flex-1 flex flex-col gap-6">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 rounded-full border border-white/30">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                              <span className="text-[9px] font-medium text-zinc-400 tracking-wide">Live Content</span>
                            </div>
                            <button
                              onClick={() => setSelectedItem(item)}
                              className="px-5 py-2 bg-white rounded-full text-[10px] font-semibold tracking-wide text-zinc-600 flex items-center gap-2 hover:bg-black hover:text-white transition-all shadow-sm border border-zinc-100 group-hover:scale-105 active:scale-95"
                            >
                              <Code className="w-3 h-3" />
                              Get Code
                            </button>
                          </div>

                          <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-[2rem] border border-white/60 shadow-inner overflow-hidden relative group/canvas transition-all group-hover:shadow-md">
                            <iframe
                              title="Showcase Preview"
                              srcDoc={`<!DOCTYPE html><html><head><style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;overflow:hidden;zoom:0.6;}${item.css}</style></head><body>${item.html}</body></html>`}
                              className="w-full h-full border-none pointer-events-none transition-transform duration-700 group-hover/canvas:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover/canvas:bg-black/5 transition-colors pointer-events-none" />
                          </div>

                          <div>
                            <p className="text-sm font-medium text-zinc-800 line-clamp-1 mb-2 italic px-2">"{item.prompt}"</p>
                            <div className="flex items-center justify-between text-[10px] text-zinc-400 font-normal px-2">
                              <span className="bg-zinc-100 px-3 py-1 rounded-full">{item.createdAt instanceof Timestamp ? item.createdAt.toDate().toLocaleDateString() : 'Recent'}</span>
                              <span className="tracking-wide text-[9px] font-semibold bg-green-50 text-green-600 px-3 py-1 rounded-full">CDN READY</span>
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
          )
          }
        </div >
      </main >

      {/* Get Code Modal Overlay */}
      {
        selectedItem && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-full max-h-[800px] border border-white/20 ring-1 ring-white/20">
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
                <div className="flex-1 bg-white rounded-[2.5rem] border border-zinc-200 shadow-2xl overflow-hidden relative">
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
                        value={
                          selectedItem.cdnUrl
                            ? (selectedItem.cdnUrl.endsWith('.js')
                              ? `<script src="${selectedItem.cdnUrl}"></script>`
                              : `<link rel="stylesheet" href="${selectedItem.cdnUrl}">`)
                            : "Deploy to get link"
                        }
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-[2rem] px-6 py-4 text-xs font-mono text-zinc-600 pr-16"
                      />
                      <button
                        onClick={() => copyToClipboard(
                          selectedItem.cdnUrl
                            ? (selectedItem.cdnUrl.endsWith('.js')
                              ? `<script src="${selectedItem.cdnUrl}"></script>`
                              : `<link rel="stylesheet" href="${selectedItem.cdnUrl}">`)
                            : "",
                          "CDN Tag"
                        )}
                        className="absolute right-3 top-3 p-2 bg-black text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-medium">Add this to your <code className="bg-zinc-100 px-1 rounded">&lt;head&gt;</code> or <code className="bg-zinc-100 px-1 rounded">&lt;body&gt;</code> to load the component.</p>
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
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-[2rem] p-6 text-[11px] font-mono text-zinc-600 h-32 resize-none"
                      />
                      <button
                        onClick={() => copyToClipboard(selectedItem.html, "HTML Markup")}
                        className="absolute right-3 top-3 p-2 bg-black text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg"
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
        )
      }

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
      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={cancelSwitch} />
          <div className="relative bg-white rounded-[2rem] p-6 md:p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-zinc-100">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-4 text-amber-500 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 0 0 0 4 21h16a2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
            </div>

            <h3 className="text-xl font-bold text-center mb-2">Unsaved Changes</h3>
            <p className="text-zinc-500 text-center text-sm mb-8 leading-relaxed">
              Switching frameworks will clear your current generated component. This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={cancelSwitch}
                className="flex-1 px-4 py-3 rounded-full border border-zinc-200 text-zinc-600 font-bold text-xs tracking-wide hover:bg-zinc-50 transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={confirmSwitch}
                className="flex-1 px-4 py-3 rounded-full bg-black text-white font-bold text-xs tracking-wide hover:bg-zinc-800 transition-colors shadow-lg shadow-black/5"
              >
                CONTINUE
              </button>
            </div>
          </div>
        </div>
      )}
    </div >
  );
}
