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
  Bot,
  FileCode,
  Image as ImageIcon,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Terminal,
  Eye,
  Columns,
  Globe,
  Lock,
} from "lucide-react";
import WebsiteBuilder from "@/components/WebsiteBuilder";
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
  Timestamp,
  doc,
  updateDoc
} from "firebase/firestore";

interface HistoryItem {
  id: string;
  prompt: string;
  html: string;
  css: string;
  createdAt: any;
  cdnUrl?: string; // Optional for NPM items
  fileName?: string;
  deployType?: 'cdn' | 'npm';
  packageName?: string;
  isPublic?: boolean;
}

const suggestions = [
  "Create a contact form with validation",
  "Make a responsive pricing table",
  "Generate a navigation bar with dropdowns",
  "Design a dashboard statistic card",
  "Create a newsletter subscription section",
  "Build a customer testimonial slider",
];



export default function HomePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [aiPrompt, setAiPrompt] = useState("");
  const [htmlCode, setHtmlCode] = useState("");
  const [cssCode, setCssCode] = useState("");
  const [scriptCode, setScriptCode] = useState("");
  const [framework, setFramework] = useState<"css" | "tailwind" | "bootstrap">("css");
  const [selectedModel, setSelectedModel] = useState<"llama-3.3-70b-versatile" | "gpt-4o-mini">("gpt-4o-mini");
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ cdnUrl: string; filename: string } | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [websiteHistory, setWebsiteHistory] = useState<any[]>([]); // Websites from Neura Website Builder
  const [activeLibraryTab, setActiveLibraryTab] = useState<"components" | "websites">("components");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [pendingFramework, setPendingFramework] = useState<"css" | "tailwind" | "bootstrap" | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"generator" | "showcase" | "website-beta">("generator");
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [selectedWebsite, setSelectedWebsite] = useState<any | null>(null);
  const [viewingWebsite, setViewingWebsite] = useState<any | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isVisualEdit, setIsVisualEdit] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [deployedFileName, setDeployedFileName] = useState<string | null>(null);
  // Live edit panel: "split" = side-by-side, "editor" = full editor, "preview" = full preview
  const [liveEditLayout, setLiveEditLayout] = useState<"split" | "editor" | "preview">("split");
  const [deployMode, setDeployMode] = useState<"cdn" | "npm">("cdn");

  const [packageName, setPackageName] = useState("");
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);

  // Resizable Split State
  const [editorWidth, setEditorWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      setEditorWidth(Math.min(Math.max(newWidth, 20), 80)); // Clamp between 20% and 80%
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
  }, [isDragging]);

  const generateUniqueFileName = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `animation-${timestamp}-${random}.css`;
  };
  const [fileName, setFileName] = useState(generateUniqueFileName());

  const cancelSwitch = () => { setShowWarning(false); setPendingFramework(null); };
  const confirmSwitch = () => {
    if (pendingFramework) {
      setFramework(pendingFramework);
      setHtmlCode(""); setCssCode(""); setScriptCode("");
      setActiveTab("preview");
      setShowWarning(false); setPendingFramework(null);
    }
  };

  const handleFrameworkChange = (newFramework: "css" | "tailwind" | "bootstrap") => {
    if (newFramework === framework) return;
    if (htmlCode || cssCode) { setPendingFramework(newFramework); setShowWarning(true); }
    else { setFramework(newFramework); }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const fetchHistory = async () => {
    if (!user) return;
    setIsLoadingHistory(true);
    try {
      const q = query(collection(db, "users_database"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const items: HistoryItem[] = [];
      querySnapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() } as HistoryItem));
      items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setHistory(items);
    } catch (err) { console.error("Error fetching history:", err); }
    finally { setIsLoadingHistory(false); }
  };

  // FIX: Use ref to track the last HTML content from the iframe to prevent re-renders in Strict Mode
  const [iframeSrc, setIframeSrc] = useState("");
  const ignoreHtmlUpdate = useRef<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Add key for refreshing iframe

  useEffect(() => {
    if (user) {
      fetchHistory();
      fetchWebsiteHistory();
    }
  }, [user]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'HTML_UPDATE') {
        // Mark that this specific HTML content came from the iframe
        ignoreHtmlUpdate.current = event.data.html;
        setHtmlCode(event.data.html);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const saveToFirebase = async (cdnUrl?: string, customFileName?: string, deployType: 'cdn' | 'npm' = 'cdn', pkgName: string = "") => {
    if (!user || !cssCode) return;
    try {
      if (currentDocId) {
        const updatePayload: any = {
          prompt: aiPrompt, html: htmlCode, css: cssCode,
          deployType, isPublic
        };
        if (cdnUrl) {
          updatePayload.cdnUrl = cdnUrl;
          updatePayload.fileName = customFileName || fileName;
        }
        if (pkgName) {
          updatePayload.packageName = pkgName;
        }
        await updateDoc(doc(db, "users_database", currentDocId), updatePayload);
      } else {
        const docRef = await addDoc(collection(db, "users_database"), {
          userId: user.uid, userName: user.displayName || user.email,
          prompt: aiPrompt, html: htmlCode, css: cssCode,
          cdnUrl: cdnUrl || "", fileName: customFileName || fileName,
          deployType, packageName: pkgName, isPublic,
          createdAt: serverTimestamp(),
        });
        setCurrentDocId(docRef.id);
      }
      fetchHistory();
    } catch (err) { console.error("Error saving:", err); toast.error("Failed to sync"); }
  };

  const fetchWebsiteHistory = async () => {
    if (!user) return;
    setIsLoadingHistory(true);
    try {
      const q = query(
        collection(db, "websites"),
        where("userId", "==", user.uid)
        // orderBy("createdAt", "desc") // Removed to avoid index requirement
      );
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort in memory to avoid index requirement
      items.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setWebsiteHistory(items);
    } catch (err) {
      console.error("Error fetching websites:", err);
      toast.error("Failed to load websites");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const getIframeContent = (html: string, css: string, js: string, fw: string, visualEdit: boolean) => {
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">${fw === "tailwind" ? '<script src="https://cdn.tailwindcss.com"></script>' : ""}${fw === "bootstrap" ? '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"><script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>' : ""}<style>body{margin:0;padding:2rem;background:white;color:black;font-family:system-ui,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;overflow-x:hidden;}#preview-root{position:relative;width:100%;min-height:100vh;display:flex;justify-content:center;align-items:center;}.vanta-canvas{position:absolute;top:0;left:0;z-index:-1;width:100%;height:100%;}${css}${visualEdit ? ' * { cursor: text !important; user-select: text !important; -webkit-user-select: text !important; } ' : ''}</style></head><body><div id="preview-root">${html || '<div style="color:#999;font-size:1rem;font-weight:500;text-align:center;opacity:0.5;">✦ Preview renders here</div>'}</div><script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"></script><script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js"></script><script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script><script>if(typeof AOS!=='undefined')AOS.init({duration:1000,once:true});${js}
      window.addEventListener('message', (event) => {
        if (event.data.type === 'TOGGLE_VISUAL_EDIT') {
          const isEditable = event.data.isEditable;
          document.body.contentEditable = isEditable;
          if (isEditable) {
            document.body.addEventListener('input', () => {
              const root = document.getElementById('preview-root');
              if (root) window.parent.postMessage({ type: 'HTML_UPDATE', html: root.innerHTML }, '*');
            });
            document.body.addEventListener('click', (e) => {
              if (e.target.tagName === 'IMG') {
                e.preventDefault();
                const newUrl = prompt('Enter new image URL:', e.target.src);
                if (newUrl) {
                  e.target.src = newUrl;
                  const root = document.getElementById('preview-root');
                  if (root) window.parent.postMessage({ type: 'HTML_UPDATE', html: root.innerHTML }, '*');
                }
              }
               if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
                  e.preventDefault();
               }
            });
          }
        }
      });
      if (${visualEdit}) {
         window.postMessage({ type: 'TOGGLE_VISUAL_EDIT', isEditable: true }, '*');
      }
      </script></body></html>`;
  };

  const processCode = (code: string) => {
    let cleanCode = code;
    cleanCode = cleanCode.replace(/```(?:html|css)?/gi, "").replace(/```/g, "").trim();
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanCode, "text/html");
    let css = "";
    doc.querySelectorAll("style").forEach((s) => { css += s.innerHTML + "\n\n"; s.remove(); });
    let scripts = "";
    doc.querySelectorAll("script").forEach((s) => { scripts += s.innerHTML + "\n\n"; s.remove(); });

    let htmlContent = "";
    if (!css.trim() && /{\s*[\w-]+\s*:/.test(cleanCode) && /@keyframes|animation/.test(cleanCode)) {
      css = cleanCode;
      htmlContent = "";
    } else {
      htmlContent = doc.body.innerHTML;
    }

    // Update States
    setHtmlCode(htmlContent);
    setCssCode(css.trim());
    setScriptCode(scripts.trim());

    // IMMEDIATE UPDATE: Generate iframe content now so it's ready for render
    const newIframeSrc = getIframeContent(htmlContent, css.trim(), scripts.trim(), framework, isVisualEdit);
    setIframeSrc(newIframeSrc);

    setActiveTab("preview");
    // Removed refreshKey as we are forcing data update immediately
  };

  // Memoize the boilerplate generation to update iframeSrc only when needed
  useEffect(() => {
    // If the HTML content matches what we just received from the iframe, do NOT update the srcDoc.
    if (htmlCode && htmlCode === ignoreHtmlUpdate.current) {
      return;
    }
    ignoreHtmlUpdate.current = null;

    // Only update if we didn't just do it in processCode (simple equality check might fail due to refs/timing, 
    // but React state updates are cheap if value is same).
    const newDoc = getIframeContent(htmlCode, cssCode, scriptCode, framework, isVisualEdit);
    setIframeSrc(newDoc);
  }, [htmlCode, cssCode, scriptCode, framework, isVisualEdit]);

  const generateCode = async () => {
    if (!aiPrompt.trim()) return;
    setUploadResult(null); setDeployedFileName(null); setCurrentDocId(null);
    setIsGenerating(true); setLoadingMessage("Analyzing prompt...");
    let finalPrompt = aiPrompt;
    if (selectedImage) {
      setLoadingMessage("Analyzing image...");
      try {
        const visionFormData = new FormData();
        visionFormData.append("image", selectedImage);
        const visionRes = await fetch("/api/vision", { method: "POST", body: visionFormData });
        if (!visionRes.ok) throw new Error("Vision analysis failed");
        const visionData = await visionRes.json();
        finalPrompt = visionData.prompt;
        setAiPrompt(finalPrompt);
        toast.success("Image analyzed!");
      } catch (err) { toast.error("Image analysis failed. Using text prompt."); }
    }
    try {
      setTimeout(() => setLoadingMessage("Generating logic..."), 1500);
      setTimeout(() => setLoadingMessage("Styling component..."), 3000);
      setTimeout(() => setLoadingMessage("Polishing code..."), 4500);

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt, framework, model: selectedModel }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      processCode(data.code);
      toast.success(`Generated successfully!`);
    } catch (err) { toast.error("Generation failed. Please try again."); }
    finally { setIsGenerating(false); setLoadingMessage(""); }
  };

  const uploadToGitHub = async () => {
    const isTailwind = framework === "tailwind";
    const isBootstrap = framework === "bootstrap";

    // Only block if it's vanilla CSS and empty
    if (!isTailwind && !isBootstrap && !cssCode.trim()) return;

    setIsUploading(true);
    try {
      let uploadFileName = deployedFileName || fileName;
      let content = cssCode;

      if (isTailwind) {
        if (!deployedFileName || !deployedFileName.startsWith('script-')) {
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(2, 8);
          uploadFileName = `script-${timestamp}-${random}.js`;
        }
        content = `(function () {
          ${cssCode.trim() ? `var s=document.createElement('style');s.innerHTML=${JSON.stringify(cssCode)};document.head.appendChild(s);` : ''}
          function loadTailwind() {
            if (!document.querySelector('script[src="https://cdn.tailwindcss.com"]')) {
              var script = document.createElement("script");
              script.src = "https://cdn.tailwindcss.com";
              document.head.appendChild(script);
            }
          }

          if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", loadTailwind);
          } else {
            loadTailwind();
          }
        })();`;
      } else if (isBootstrap) {
        if (!deployedFileName || !deployedFileName.startsWith('bs-script-')) {
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(2, 8);
          uploadFileName = `bs-script-${timestamp}-${random}.js`;
        }
        // Inject Bootstrap CSS Link + Custom CSS
        content = `(function(){
            ${cssCode.trim() ? `var s=document.createElement('style');s.innerHTML=${JSON.stringify(cssCode)};document.head.appendChild(s);` : ''}
            if(!document.querySelector('link[href*="bootstrap.min.css"]')){
                const l=document.createElement("link");
                l.rel="stylesheet";
                l.href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";
                l.onload=function(){console.log("Bootstrap Loaded ✅");};
                document.head.appendChild(l);
                  // Also inject JS for components
                const s=document.createElement("script");
                s.src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js";
                s.onload=function(){console.log("Bootstrap JS Loaded ✅");};
                document.head.appendChild(s);
            }
        })();`;
      }

      const res = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: uploadFileName, content }),
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setUploadResult(data); setDeployedFileName(uploadFileName);
      toast.success(deployedFileName ? "CDN updated!" : "Deployed to GitHub CDN!");
      await saveToFirebase(data.cdnUrl, uploadFileName, "cdn", packageName);
    } catch (err) {
      console.error("Deployment Error:", err);
      toast.error("Cloud deployment failed");
    } finally { setIsUploading(false); }
  };

  const toggleVisibility = async (e: React.MouseEvent, item: HistoryItem) => {
    e.stopPropagation(); // Prevent opening the modal
    if (!user) return;

    // Optimistic UI update
    const newStatus = !item.isPublic;
    setHistory(prev => prev.map(h => h.id === item.id ? { ...h, isPublic: newStatus } : h));

    try {
      const docRef = doc(db, "users_database", item.id);
      await updateDoc(docRef, { isPublic: newStatus });
      toast.success(newStatus ? "Component is now Public 🌎" : "Component is now Private 🔒");
    } catch (err) {
      console.error("Error updating visibility:", err);
      toast.error("Failed to update status");
      // Revert on error
      setHistory(prev => prev.map(h => h.id === item.id ? { ...h, isPublic: !newStatus } : h));
    }
  };

  const publishToNpm = async () => {
    if (!htmlCode) return;
    setIsUploading(true);
    try {
      // DEBUGGING: Check what the package name actually is
      alert(`Debug: Package Name is "${packageName}"`);

      if (deployMode === "npm" && !packageName.trim()) {
        toast.error("Please enter a package name (Debug: Name is empty)");
        // setIsUploading(false);
        // return; 
      }
      const res = await fetch("/api/publish-npm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: htmlCode, css: cssCode, packageName, framework }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish");

      toast.custom((t) => (
        <div className="flex flex-col gap-3 w-full bg-white/90 backdrop-blur-md border border-zinc-200 shadow-2xl rounded-2xl p-5 animate-in slide-in-from-top-5 duration-300">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 text-sm">Published to NPM Registry</h3>
                <p className="text-xs text-zinc-500 mt-1">Package <span className="font-mono font-bold text-zinc-800">@{packageName}</span> is live.</p>
              </div>
            </div>
            <button onClick={() => toast.dismiss(t)} className="p-1 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-zinc-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 flex items-center justify-between group cursor-pointer hover:border-zinc-300 transition-colors"
            onClick={() => {
              navigator.clipboard.writeText(`npx neura add ${packageName}`);
              toast.success("Command copied!", { id: "copy-cmd" });
            }}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Terminal className="w-4 h-4 text-zinc-400 shrink-0" />
              <code className="text-xs font-mono text-zinc-700 truncate">npx neura add {packageName}</code>
            </div>
            <div className="p-1.5 bg-white border border-zinc-200 rounded-lg shadow-sm group-hover:scale-105 transition-transform">
              <Copy className="w-3.5 h-3.5 text-zinc-500" />
            </div>
          </div>
        </div>
      ), { duration: 8000 });
      await saveToFirebase(uploadResult?.cdnUrl || "", deployedFileName || "", "npm", packageName);
    } catch (err: any) {
      toast.error(err.message || "Failed to publish to NPM");
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (text: string, label: string = "Content") => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  return (
    <div className="flex min-h-screen bg-[#f4f3f0] font-sans text-black">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        code, textarea, .mono { font-family: 'DM Mono', monospace; }
        
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d4d0c8; border-radius: 8px; }
        
        .glass-card {
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.9);
          box-shadow: 0 2px 32px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.8) inset;
        }
        
        .nav-pill {
          background: rgba(255,255,255,0.5);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.8);
          box-shadow: 0 2px 16px rgba(0,0,0,0.07);
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
          box-shadow: 0 4px 20px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.08) inset;
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .btn-primary:hover { transform: translateY(-1px) scale(1.02); box-shadow: 0 8px 28px rgba(0,0,0,0.3); }
        .btn-primary:active { transform: scale(0.98); }
        
        .editor-panel {
          background: #111111;
          border-radius: 20px;
        }
        
        .split-divider {
          width: 6px;
          background: linear-gradient(180deg, transparent, rgba(0,0,0,0.06), transparent);
          cursor: col-resize;
          position: relative;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .split-divider::after {
          content: '';
          width: 2px;
          height: 40px;
          background: rgba(0,0,0,0.12);
          border-radius: 4px;
        }
        
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        .shimmer {
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }

        .tag-pill {
          font-size: 9px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 700;
        }
      `}</style>

      {/* ─── LEFT SIDEBAR ─── */}
      <aside className="hidden md:flex fixed left-5 top-1/2 -translate-y-1/2 z-50">
        <div className="nav-pill rounded-[28px] py-5 px-3 flex flex-col items-center gap-5">
          {/* Logo */}
          <div className="w-11 h-11 bg-black rounded-full flex items-center justify-center shadow-lg cursor-default">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="w-6 h-px bg-zinc-200" />
          {/* Nav Items */}
          {[
            { id: "generator", icon: Zap, label: "Generator" },
            { id: "showcase", icon: LayoutGrid, label: "Showcase" },
            { id: "website-beta", icon: Bot, label: "Website Builder", badge: true },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as any)}
              title={item.label}
              className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${currentView === item.id
                ? "bg-black text-white shadow-lg shadow-black/20"
                : "text-zinc-400 hover:bg-white hover:text-zinc-700 hover:shadow-md"
                }`}
            >
              <item.icon className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
              {item.badge && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-[#f4f3f0] pulse-dot" />
              )}
            </button>
          ))}
          <div className="w-6 h-px bg-zinc-200" />
          {/* Logout */}
          {user && (
            <button
              onClick={async () => { await logout(); router.push("/auth"); }}
              title="Logout"
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-zinc-400 hover:bg-red-50 hover:text-red-400 transition-all"
            >
              <LogOut style={{ width: '16px', height: '16px' }} />
            </button>
          )}
        </div>
      </aside>

      {/* ─── MOBILE BOTTOM NAV ─── */}
      <nav className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 h-16 px-3 nav-pill rounded-full flex items-center gap-2 z-50">
        {[
          { id: "generator", icon: Zap },
          { id: "showcase", icon: LayoutGrid },
          { id: "website-beta", icon: Bot },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id as any)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${currentView === item.id ? "bg-black text-white shadow-lg" : "text-zinc-400"
              }`}
          >
            <item.icon style={{ width: '18px', height: '18px' }} />
          </button>
        ))}
        <div className="w-px h-8 bg-zinc-200 mx-1" />
        <button
          onClick={async () => { await logout(); router.push("/auth"); }}
          className="w-11 h-11 rounded-full text-zinc-400 hover:text-red-400 flex items-center justify-center"
        >
          <LogOut style={{ width: '16px', height: '16px' }} />
        </button>
      </nav>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 flex flex-col min-h-screen md:pl-24">

        {/* TOP HEADER */}
        <header className="h-20 flex items-center px-5 md:px-8 shrink-0 z-40 sticky top-0 bg-[#f4f3f0]/90 backdrop-blur-sm">
          <div className="w-full nav-pill rounded-[20px] h-14 flex items-center justify-between px-4 md:px-5">
            {/* User pill */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center">
                <User style={{ width: '15px', height: '15px', color: 'white' }} />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-zinc-800 leading-tight">
                  {user?.displayName || user?.email?.split('@')[0] || "Guest"}
                </p>
                <p className="text-[10px] text-zinc-400 font-medium">Neura Workspace</p>
              </div>
            </div>

            {/* Center title */}
            <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2 pointer-events-none">
              <span className="text-lg font-bold text-zinc-900 tracking-tight">Neura</span>
              <span className="text-lg font-light text-zinc-400">Studio</span>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/library/components')}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-full text-[10px] font-bold hover:bg-zinc-800 transition-colors shadow-sm"
              >
                <LayoutGrid style={{ width: '12px', height: '12px' }} />
                Open Source Components
              </button>
              <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 pulse-dot" />
                <span className="text-[10px] font-bold text-green-600 tracking-wide hidden sm:block">LIVE</span>
              </div>
              <div className="text-[10px] font-semibold text-zinc-400 bg-white/60 px-3 py-1.5 rounded-full border border-zinc-100 hidden md:block">
                {history.length} components
              </div>
            </div>
          </div>
        </header>

        {/* SCROLL AREA */}
        <div className="flex-1 px-5 md:px-8 pb-28 md:pb-10 space-y-5">

          {/* ── WEBSITE BETA VIEW ── */}
          {currentView === "website-beta" && (
            <div className="slide-up h-[calc(100vh-140px)] min-h-[600px]">
              <WebsiteBuilder />
            </div>
          )}

          {/* ── GENERATOR VIEW ── */}
          {currentView === "generator" && (
            <div className="max-w-6xl mx-auto w-full slide-up space-y-5">

              {/* PROMPT CARD */}
              <div className="glass-card rounded-[28px] p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center shadow-md">
                      <Stars style={{ width: '18px', height: '18px', color: 'white' }} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-zinc-900">AI Component Generator</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">Describe it. We build it.</p>
                    </div>
                  </div>
                  <span className="tag-pill bg-zinc-100 text-zinc-500 px-3 py-1.5 rounded-full border border-zinc-200">v2.0</span>
                </div>

                {/* Textarea */}
                <div className="relative mb-4">
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generateCode(); }}
                    placeholder="Describe your UI component... (Cmd+Enter to generate)"
                    className="w-full h-28 md:h-36 bg-zinc-50 border border-zinc-100 rounded-[20px] p-5 text-sm text-zinc-700 placeholder:text-zinc-300 focus:ring-2 focus:ring-black/8 focus:border-zinc-200 outline-none resize-none transition-all mono"
                  />
                  {imagePreview && (
                    <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-white rounded-2xl p-1.5 pr-3 shadow-md border border-zinc-100">
                      <div className="w-10 h-10 rounded-xl overflow-hidden relative">
                        <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                      </div>
                      <span className="text-xs text-zinc-500 font-medium">Image attached</span>
                      <button
                        onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                        className="p-1 hover:bg-red-50 text-zinc-300 hover:text-red-400 rounded-lg transition-colors ml-1"
                      >
                        <X style={{ width: '12px', height: '12px' }} />
                      </button>
                    </div>
                  )}
                  <label className="absolute bottom-4 right-4 z-10 w-9 h-9 rounded-full bg-white border border-zinc-100 flex items-center justify-center cursor-pointer hover:border-zinc-300 hover:shadow-sm transition-all">
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    <ImageIcon style={{ width: '14px', height: '14px', color: selectedImage ? '#000' : '#9ca3af' }} />
                  </label>
                </div>

                {/* Controls Row */}
                <div className="flex flex-col xl:flex-row gap-3 items-stretch xl:items-center">
                  {/* Model Select */}
                  {/* Model Select Custom Dropdown */}
                  <div className="relative xl:w-52">
                    <button
                      onClick={() => !isGenerating && setIsModelDropdownOpen(!isModelDropdownOpen)}
                      className={`w-full pl-9 pr-8 py-3 bg-white border rounded-[14px] text-xs font-semibold text-zinc-700 outline-none flex items-center justify-between transition-all shadow-sm ${isModelDropdownOpen ? "border-zinc-300 ring-2 ring-zinc-100" : "border-zinc-100 hover:border-zinc-200"}`}
                    >
                      <Bot className="absolute left-3.5 text-zinc-400 pointer-events-none" style={{ width: '14px', height: '14px' }} />
                      <span className="truncate">
                        {selectedModel === "gpt-4o-mini" ? "GPT-4o-mini" : "Llama 3.3 (Groq)"}
                      </span>
                      <ChevronRight
                        className={`absolute right-3 text-zinc-300 pointer-events-none transition-transform duration-200 ${isModelDropdownOpen ? "-rotate-90" : "rotate-90"}`}
                        style={{ width: '12px', height: '12px' }}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {isModelDropdownOpen && (
                      <div className="absolute top-full mt-2 left-0 w-full bg-white border border-zinc-100 rounded-[14px] shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                        <div className="p-1">
                          {[
                            { id: "gpt-4o-mini", label: "GPT-4o-mini", desc: "Fast & Smart" },
                            { id: "llama-3.3-70b-versatile", label: "Llama 3.3", desc: "Open Source" }
                          ].map((model) => (
                            <button
                              key={model.id}
                              onClick={() => { setSelectedModel(model.id as any); setIsModelDropdownOpen(false); }}
                              className={`w-full text-left px-3 py-2.5 rounded-[10px] text-xs transition-colors flex items-center justify-between group ${selectedModel === model.id ? "bg-zinc-50 text-zinc-900 font-bold" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"}`}
                            >
                              <span>{model.label}</span>
                              {selectedModel === model.id && <CheckCircle style={{ width: '12px', height: '12px', color: '#10b981' }} />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Framework Toggle */}
                  <div className="flex bg-zinc-50 border border-zinc-100 rounded-[14px] p-1 shadow-inner gap-1">
                    {[
                      { id: "css", label: "CSS" },
                      { id: "tailwind", label: "Tailwind" },
                      { id: "bootstrap", label: "Bootstrap" }
                    ].map((fw) => (
                      <button
                        key={fw.id}
                        onClick={() => handleFrameworkChange(fw.id as any)}
                        className={`flex-1 xl:flex-none px-4 py-2 rounded-[10px] text-[11px] font-bold uppercase tracking-wider transition-all duration-200 border ${framework === fw.id
                          ? "bg-white text-zinc-900 shadow-sm border-zinc-100"
                          : "border-transparent text-zinc-400 hover:text-zinc-600"
                          }`}
                      >
                        {fw.label}
                      </button>
                    ))}
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={generateCode}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="btn-primary flex-1 xl:flex-none flex items-center justify-center gap-2.5 px-6 py-3 rounded-[14px] text-white text-xs font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating
                      ? <><Loader2 className="animate-spin" style={{ width: '14px', height: '14px' }} /><span>{loadingMessage || "Crafting..."}</span></>
                      : <><Zap style={{ width: '14px', height: '14px', color: '#fbbf24' }} /><span>Generate</span></>
                    }
                  </button>
                </div>

                {/* Suggestions */}
                <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
                  <span className="tag-pill text-zinc-400 whitespace-nowrap">Try:</span>
                  {suggestions.slice(0, 4).map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setAiPrompt(s)}
                      className="text-[11px] text-zinc-500 bg-white border border-zinc-100 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-zinc-900 hover:text-white hover:border-transparent transition-all duration-200 shadow-sm font-medium"
                    >
                      {s.length > 30 ? s.slice(0, 30) + "…" : s}
                    </button>
                  ))}
                </div>
              </div>

              {/* ─── VISUALIZER / LIVE EDIT ─── */}
              <div className="glass-card rounded-[28px] overflow-hidden" style={{ minHeight: '560px' }}>
                {/* Toolbar */}
                <div className="h-14 border-b border-zinc-100/80 flex items-center justify-between px-5 bg-white/50">
                  {/* Left: Mode tabs */}
                  <div className="flex items-center gap-1 p-1 bg-zinc-50 rounded-[12px] border border-zinc-100">
                    <button
                      onClick={() => { setActiveTab("preview"); setIsEditMode(false); setIsVisualEdit(false); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] text-[11px] font-bold uppercase tracking-wider transition-all ${activeTab === "preview" && !isEditMode && !isVisualEdit
                        ? "bg-white text-zinc-900 shadow-sm border border-zinc-100"
                        : "text-zinc-400 hover:text-zinc-600"
                        }`}
                    >
                      <Eye style={{ width: '12px', height: '12px' }} /> Preview
                    </button>
                    <button
                      onClick={() => { setActiveTab("code"); setIsEditMode(false); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] text-[11px] font-bold uppercase tracking-wider transition-all ${activeTab === "code" && !isEditMode
                        ? "bg-white text-zinc-900 shadow-sm border border-zinc-100"
                        : "text-zinc-400 hover:text-zinc-600"
                        }`}
                    >
                      <Code style={{ width: '12px', height: '12px' }} /> Code
                    </button>
                    <button
                      onClick={() => { setIsEditMode(!isEditMode); if (!isEditMode) setActiveTab("preview"); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] text-[11px] font-bold uppercase tracking-wider transition-all ${isEditMode
                        ? "bg-black text-white shadow-md"
                        : "text-zinc-400 hover:text-zinc-600"
                        }`}
                    >
                      <Columns style={{ width: '12px', height: '12px' }} /> Live Edit
                    </button>
                    {/* <button
                      onClick={() => {
                        const newState = !isVisualEdit;
                        setIsVisualEdit(newState);
                        if (newState) { setActiveTab("preview"); setIsEditMode(false); }
                        // We need to send message to iframe
                        const iframe = document.querySelector('iframe[title="Live Preview"]') as HTMLIFrameElement;
                        // For main preview
                        const mainIframe = document.querySelector('iframe[title="Main Preview"]') as HTMLIFrameElement;

                        if (iframe && iframe.contentWindow) {
                          iframe.contentWindow.postMessage({ type: 'TOGGLE_VISUAL_EDIT', isEditable: newState }, '*');
                        }
                        if (mainIframe && mainIframe.contentWindow) {
                          mainIframe.contentWindow.postMessage({ type: 'TOGGLE_VISUAL_EDIT', isEditable: newState }, '*');
                        }
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] text-[11px] font-bold uppercase tracking-wider transition-all ${isVisualEdit
                        ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                        : "text-zinc-400 hover:text-zinc-600"
                        }`}
                    >
                      <Sparkles style={{ width: '12px', height: '12px' }} /> Visual Edit
                    </button> */}
                  </div>

                  {/* Right: Layout options (only in live edit mode) */}
                  <div className="flex items-center gap-2">
                    {isEditMode && (
                      <div className="flex items-center gap-1 p-1 bg-zinc-50 rounded-[12px] border border-zinc-100">
                        {[
                          { id: "split", icon: Columns, label: "Split" },
                          { id: "editor", icon: Terminal, label: "Editor only" },
                          { id: "preview", icon: Eye, label: "Preview only" },
                        ].map((layout) => (
                          <button
                            key={layout.id}
                            onClick={() => setLiveEditLayout(layout.id as any)}
                            title={layout.label}
                            className={`w-8 h-8 rounded-[8px] flex items-center justify-center transition-all ${liveEditLayout === layout.id
                              ? "bg-white text-zinc-900 shadow-sm border border-zinc-100"
                              : "text-zinc-400 hover:text-zinc-600"
                              }`}
                          >
                            <layout.icon style={{ width: '13px', height: '13px' }} />
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-1.5 opacity-40">
                      {['#ff6058', '#ffbd2e', '#28ca41'].map(c => (
                        <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* ─── CONTENT AREA ─── */}
                <div className="flex" style={{ height: '500px' }}>

                  {/* LIVE EDIT MODE: Side-by-side editor + preview */}
                  {isEditMode ? (
                    <div className="flex w-full h-full" ref={containerRef}>
                      {/* EDITOR PANEL */}
                      {(liveEditLayout === "split" || liveEditLayout === "editor") && (
                        <div
                          className="flex flex-col h-full overflow-hidden"
                          style={{ width: liveEditLayout === "split" ? `${editorWidth}%` : "100%" }}
                        >
                          <div className="editor-panel h-full flex flex-col">
                            {/* Editor Tabs */}
                            <div className="flex items-center gap-1 px-4 pt-3 pb-2 border-b border-white/5">
                              <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
                                <div className="px-3 py-1.5 rounded-md bg-white/10 text-[10px] font-bold text-zinc-300 uppercase tracking-wider">
                                  LIVE EDITOR
                                </div>
                              </div>
                              <div className="ml-auto flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot" />
                                <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">Auto-sync</span>
                              </div>
                            </div>

                            {/* Editors */}
                            <div className="flex-1 overflow-y-auto flex flex-col gap-0">
                              {/* HTML Editor */}
                              <div className="flex-1 flex flex-col min-h-0 border-b border-white/5">
                                <div className="flex items-center justify-between px-4 py-2">
                                  <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Structure · HTML</span>
                                  <button
                                    onClick={() => copyToClipboard(htmlCode, "HTML")}
                                    className="text-[9px] text-zinc-600 hover:text-zinc-300 flex items-center gap-1 transition-colors"
                                  >
                                    <Copy style={{ width: '10px', height: '10px' }} /> Copy
                                  </button>
                                </div>
                                <textarea
                                  value={htmlCode}
                                  onChange={(e) => setHtmlCode(e.target.value)}
                                  className="flex-1 w-full bg-transparent text-zinc-300 mono text-[11px] p-4 pt-0 resize-none outline-none leading-relaxed overflow-y-auto"
                                  style={{ minHeight: '200px' }}
                                  spellCheck={false}
                                  placeholder="<!-- HTML will appear here -->"
                                />
                              </div>

                              {/* CSS Editor */}
                              <div className="flex-1 flex flex-col min-h-0">
                                <div className="flex items-center justify-between px-4 py-2">
                                  <span className="text-[9px] font-bold text-pink-400 uppercase tracking-widest">Styles · CSS</span>
                                  <button
                                    onClick={() => copyToClipboard(cssCode, "CSS")}
                                    className="text-[9px] text-zinc-600 hover:text-zinc-300 flex items-center gap-1 transition-colors"
                                  >
                                    <Copy style={{ width: '10px', height: '10px' }} /> Copy
                                  </button>
                                </div>
                                <textarea
                                  value={cssCode}
                                  onChange={(e) => setCssCode(e.target.value)}
                                  className="flex-1 w-full bg-transparent text-zinc-300 mono text-[11px] p-4 pt-0 resize-none outline-none leading-relaxed overflow-y-auto"
                                  style={{ minHeight: '200px' }}
                                  spellCheck={false}
                                  placeholder="/* CSS will appear here */"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* DIVIDER (split mode only) */}
                      {liveEditLayout === "split" && (
                        <div
                          className="w-1.5 hover:bg-zinc-300 bg-zinc-200/60 flex-shrink-0 relative flex items-center justify-center cursor-col-resize hover:w-2 transition-all z-50 active:bg-zinc-400"
                          onMouseDown={handleMouseDown}
                        >
                          <div className="absolute flex flex-col gap-1 py-2 px-1 bg-white rounded-full border border-zinc-200 shadow-sm pointer-events-none">
                            {[...Array(4)].map((_, i) => (
                              <div key={i} className="w-1 h-1 rounded-full bg-zinc-300" />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* LIVE PREVIEW PANEL */}
                      {(liveEditLayout === "split" || liveEditLayout === "preview") && (
                        <div
                          className="flex flex-col h-full bg-white overflow-hidden"
                          style={{ width: liveEditLayout === "split" ? `${100 - editorWidth}%` : "100%" }}
                        >
                          {/* Preview toolbar */}
                          <div className="h-10 border-b border-zinc-100 flex items-center justify-between px-4 bg-zinc-50/80 flex-shrink-0">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-400 pulse-dot" />
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Live Preview</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setRefreshKey(prev => prev + 1)}
                                className="p-1.5 hover:bg-zinc-200 rounded-md transition-colors group"
                                title="Refresh Preview"
                              >
                                <RefreshCw className="transition-transform group-active:rotate-180" style={{ width: '13px', height: '13px', color: '#71717a' }} />
                              </button>
                            </div>
                          </div>
                          <div className="flex-1 relative overflow-hidden overflow-y-auto custom-scrollbar">
                            <iframe
                              key={`live-preview-iframe-${refreshKey}`}
                              title="Live Preview"
                              srcDoc={iframeSrc}
                              className="w-full h-full border-none"
                              style={liveEditLayout === "split" ? { width: "100%", height: "100%" } : { width: "100%", height: "100%" }}
                              sandbox="allow-scripts allow-modals"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : activeTab === "preview" ? (
                    /* STANDARD PREVIEW */
                    <div className="w-full h-full flex items-center justify-center p-6 bg-[#fafaf9]">
                      {cssCode || htmlCode ? (
                        <iframe
                          key={refreshKey}
                          title="Main Preview"
                          srcDoc={iframeSrc}
                          className="w-full h-full rounded-[20px] border border-zinc-100 shadow-xl bg-white"
                          sandbox="allow-scripts allow-modals"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-5 opacity-40">
                          <div className="w-16 h-16 rounded-3xl bg-zinc-100 flex items-center justify-center">
                            <Zap style={{ width: '28px', height: '28px', color: '#d4d4d8' }} />
                          </div>
                          <p className="text-sm text-zinc-400 font-medium">Your component will appear here</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* CODE VIEW */
                    <div className="w-full h-full editor-panel p-0 overflow-hidden flex flex-col">
                      <div className="flex items-center justify-between px-6 py-3 border-b border-white/5">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Generated Code</span>
                        <button
                          onClick={() => copyToClipboard(`<style>${cssCode}</style>\n${htmlCode}`, "Full Code")}
                          className="flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-white transition-colors"
                        >
                          <Copy style={{ width: '11px', height: '11px' }} /> Copy all
                        </button>
                      </div>
                      <textarea
                        readOnly
                        value={cssCode ? `/* CSS */\n${cssCode}\n\n/* HTML */\n${htmlCode}` : "// Generate a component to see code here"}
                        className="flex-1 w-full bg-transparent text-zinc-400 mono text-[11px] p-6 resize-none outline-none leading-relaxed overflow-y-auto"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* BOTTOM UTILITY ROW */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Cloud Deploy */}
                <div className="glass-card rounded-[24px] p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-black rounded-[12px] flex items-center justify-center">
                        <Rocket style={{ width: '16px', height: '16px', color: 'white' }} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900">Cloud Deploy</h4>
                        <p className="text-[10px] text-zinc-400">Push to global CDN</p>
                      </div>
                    </div>
                    {/* Toggle Switch */}
                    <div className="flex bg-zinc-100 p-1 rounded-lg">
                      <button
                        onClick={() => setDeployMode("cdn")}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${deployMode === "cdn" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}
                      >
                        CDN
                      </button>
                      <button
                        onClick={() => setDeployMode("npm")}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${deployMode === "npm" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}
                      >
                        NPM
                      </button>
                    </div>
                  </div>

                  {/* Public/Private Toggle */}
                  <div className="flex items-center justify-between bg-zinc-50 rounded-[16px] p-2 mb-4 border border-zinc-100">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider pl-2">Visibility</span>
                    <div className="flex bg-zinc-200/50 p-0.5 rounded-lg">
                      <button
                        onClick={() => setIsPublic(false)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${!isPublic ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}
                      >
                        <Lock style={{ width: '10px', height: '10px' }} /> Private
                      </button>
                      <button
                        onClick={() => setIsPublic(true)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${isPublic ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}
                      >
                        <Globe style={{ width: '10px', height: '10px' }} /> Public
                      </button>
                    </div>
                  </div>

                  {deployMode === "cdn" ? (
                    (framework === 'tailwind' || framework === 'bootstrap') ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 bg-blue-50 rounded-[14px] p-3 border border-blue-100">
                          <Globe style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
                          <div>
                            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">Official CDN</p>
                            <p className="text-[10px] text-blue-600">Use the official {framework} links</p>
                          </div>
                        </div>

                        {framework === 'tailwind' && (
                          <div className="relative">
                            <input readOnly value='<script src="https://cdn.tailwindcss.com"></script>' className="w-full bg-zinc-50 border border-zinc-100 rounded-[12px] px-3 py-2.5 text-[10px] mono text-zinc-600 pr-10" />
                            <button
                              onClick={() => copyToClipboard('<script src="https://cdn.tailwindcss.com"></script>', "Tailwind CDN")}
                              className="absolute right-1 top-1 w-8 h-8 hover:bg-zinc-200 rounded-lg flex items-center justify-center transition-colors"
                            >
                              <Copy style={{ width: '12px', height: '12px', color: '#71717a' }} />
                            </button>
                          </div>
                        )}

                        {framework === 'bootstrap' && (
                          <div className="space-y-2">
                            <div className="relative">
                              <p className="text-[9px] font-bold text-zinc-400 uppercase mb-1 ml-1">CSS</p>
                              <input readOnly value='<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">' className="w-full bg-zinc-50 border border-zinc-100 rounded-[12px] px-3 py-2.5 text-[10px] mono text-zinc-600 pr-10" />
                              <button
                                onClick={() => copyToClipboard('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">', "Bootstrap CSS")}
                                className="absolute right-1 top-[18px] w-8 h-8 hover:bg-zinc-200 rounded-lg flex items-center justify-center transition-colors"
                              >
                                <Copy style={{ width: '12px', height: '12px', color: '#71717a' }} />
                              </button>
                            </div>
                            <div className="relative">
                              <p className="text-[9px] font-bold text-zinc-400 uppercase mb-1 ml-1">JS</p>
                              <input readOnly value='<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>' className="w-full bg-zinc-50 border border-zinc-100 rounded-[12px] px-3 py-2.5 text-[10px] mono text-zinc-600 pr-10" />
                              <button
                                onClick={() => copyToClipboard('<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>', "Bootstrap JS")}
                                className="absolute right-1 top-[18px] w-8 h-8 hover:bg-zinc-200 rounded-lg flex items-center justify-center transition-colors"
                              >
                                <Copy style={{ width: '12px', height: '12px', color: '#71717a' }} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      !uploadResult && !deployedFileName ? (
                        <button
                          onClick={uploadToGitHub}
                          disabled={isUploading || (!cssCode && framework === "css")}
                          className="w-full py-3 btn-primary text-white rounded-[14px] text-xs font-bold uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {isUploading ? "Deploying…" : "Push to Production →"}
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 bg-green-50 rounded-[14px] p-3 border border-green-100">
                            <CheckCircle style={{ width: '16px', height: '16px', color: '#22c55e' }} />
                            <div>
                              <p className="text-[10px] font-bold text-green-700 uppercase tracking-wide">Active · CDN Ready</p>
                              <p className="text-[10px] text-green-600 mono truncate max-w-[180px]">{deployedFileName}</p>
                            </div>
                          </div>
                          {uploadResult?.cdnUrl && (
                            <div className="flex gap-2">
                              <input
                                readOnly
                                value={framework === "tailwind" ? `<script src="${uploadResult.cdnUrl}"></script>` : `<link rel="stylesheet" href="${uploadResult.cdnUrl}">`}
                                className="flex-1 bg-zinc-50 border border-zinc-100 rounded-[12px] px-3 text-[10px] mono text-zinc-500 h-10"
                              />
                              <button
                                onClick={() => copyToClipboard(framework === "tailwind" ? `<script src="${uploadResult.cdnUrl}"></script>` : `<link rel="stylesheet" href="${uploadResult.cdnUrl}">`, "CDN Link")}
                                className="w-10 h-10 bg-zinc-100 hover:bg-zinc-200 rounded-[12px] flex items-center justify-center transition-colors"
                              >
                                <Copy style={{ width: '14px', height: '14px', color: '#71717a' }} />
                              </button>
                            </div>
                          )}
                          <button
                            onClick={uploadToGitHub}
                            className="w-full py-2.5 bg-zinc-50 border border-zinc-200 text-zinc-600 rounded-[14px] text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors"
                          >
                            {isUploading ? "Updating…" : "Update Deploy"}
                          </button>
                        </div>
                      )
                    )
                  ) : (
                    /* NPM MODE UI */
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Package Name</label>
                        <div className="flex items-center gap-2">

                          <input
                            type="text"
                            placeholder="my-component"
                            value={packageName}
                            onChange={(e) => setPackageName(e.target.value)}
                            className="flex-1 bg-zinc-50 border border-zinc-100 rounded-[12px] px-3 py-2 text-xs font-mono text-zinc-700 outline-none focus:border-zinc-300 transition-colors"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Version</label>
                        <input
                          type="text"
                          defaultValue="0.0.1"
                          className="w-full bg-zinc-50 border border-zinc-100 rounded-[12px] px-3 py-2 text-xs font-mono text-zinc-700 outline-none focus:border-zinc-300 transition-colors"
                        />
                      </div>
                      <button
                        onClick={publishToNpm}
                        disabled={isUploading}
                        className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-[14px] text-xs font-bold uppercase tracking-widest transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isUploading ? "Converting..." : "Publish to NPM"}
                      </button>
                      <div className="pt-2 border-t border-zinc-100">
                        <p className="text-[10px] text-zinc-400 mb-2">Installation</p>

                        {/* Step 1 */}
                        <div className="bg-zinc-900 rounded-[12px] p-3 flex items-center justify-between mb-2">
                          <code className="text-[10px] text-zinc-300 mono">npm i neura-packages</code>
                          <Copy
                            onClick={() => {
                              navigator.clipboard.writeText(`npm i neura-packages`);
                              toast.success("Copied!");
                            }}
                            className="w-3 h-3 text-zinc-500 cursor-pointer hover:text-white transition-colors"
                          />
                        </div>

                        {/* Step 2 */}
                        <div className="bg-zinc-900 rounded-[12px] p-3 flex items-center justify-between">
                          <code className="text-[10px] text-zinc-300 mono">npx neura add {packageName || "my-component"}</code>
                          <Copy
                            onClick={() => {
                              navigator.clipboard.writeText(`npx neura add ${packageName || "my-component"}`);
                              toast.success("Copied!");
                            }}
                            className="w-3 h-3 text-zinc-500 cursor-pointer hover:text-white transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Source Export */}
                <div className="glass-card rounded-[24px] p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-zinc-100 rounded-[12px] flex items-center justify-center">
                        <Code style={{ width: '16px', height: '16px', color: '#52525b' }} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900">Source Markup</h4>
                        <p className="text-[10px] text-zinc-400">Export raw HTML</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const fullHtml = framework === 'tailwind'
                          ? `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Generated Component</title>\n  <script src="https://cdn.tailwindcss.com"></script>\n${cssCode ? `  <style>\n${cssCode}\n  </style>\n` : ''}</head>\n<body>\n${htmlCode}\n</body>\n</html>`
                          : framework === 'bootstrap'
                            ? `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Generated Component</title>\n  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">\n${cssCode ? `  <style>\n${cssCode}\n  </style>\n` : ''}</head>\n<body>\n${htmlCode}\n  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>\n</body>\n</html>`
                            : uploadResult?.cdnUrl
                              ? `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Generated Component</title>\n  <link rel="stylesheet" href="${uploadResult.cdnUrl}">\n</head>\n<body>\n${htmlCode}\n</body>\n</html>`
                              : `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Generated Component</title>\n${cssCode ? `  <style>\n${cssCode}\n  </style>\n` : ''}</head>\n<body>\n${htmlCode}\n</body>\n</html>`;
                        copyToClipboard(fullHtml, "Full HTML");
                      }}
                      className="text-[10px] font-bold text-zinc-400 hover:text-black transition-colors"
                    >
                      COPY RAW
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute top-3 right-3 tag-pill text-zinc-300 pointer-events-none">HTML</span>
                    <textarea
                      readOnly
                      value={
                        framework === 'tailwind'
                          ? `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Generated Component</title>\n  <script src="https://cdn.tailwindcss.com"></script>\n${cssCode ? `  <style>\n${cssCode}\n  </style>\n` : ''}</head>\n<body>\n${htmlCode}\n</body>\n</html>`
                          : framework === 'bootstrap'
                            ? `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Generated Component</title>\n  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">\n${cssCode ? `  <style>\n${cssCode}\n  </style>\n` : ''}</head>\n<body>\n${htmlCode}\n  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>\n</body>\n</html>`
                            : uploadResult?.cdnUrl
                              ? `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Generated Component</title>\n  <link rel="stylesheet" href="${uploadResult.cdnUrl}">\n</head>\n<body>\n${htmlCode}\n</body>\n</html>`
                              : `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Generated Component</title>\n${cssCode ? `  <style>\n${cssCode}\n  </style>\n` : ''}</head>\n<body>\n${htmlCode}\n</body>\n</html>`
                      }
                      className="w-full h-[108px] bg-zinc-50 border border-zinc-100 rounded-[16px] p-4 mono text-[10px] text-zinc-500 resize-none outline-none focus:bg-white transition-colors"
                      placeholder="Generated markup will appear here..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SHOWCASE VIEW ── */}
          {currentView === "showcase" && (
            <div className="max-w-7xl mx-auto w-full slide-up">
              <div className="glass-card rounded-[28px] p-6 md:p-10" style={{ minHeight: '80vh' }}>
                {/* Component Library Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-lg shadow-zinc-500/20">
                      <LayoutGrid style={{ width: '20px', height: '20px', color: 'white' }} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-zinc-900">Library</h2>
                      <div className="flex items-center gap-4 mt-1">
                        <button
                          onClick={() => setActiveLibraryTab("components")}
                          className={`text-sm font-medium transition-colors ${activeLibraryTab === "components" ? "text-black border-b-2 border-black pb-0.5" : "text-zinc-400 hover:text-zinc-600"}`}
                        >
                          Components
                        </button>
                        <button
                          onClick={() => setActiveLibraryTab("websites")}
                          className={`text-sm font-medium transition-colors ${activeLibraryTab === "websites" ? "text-black border-b-2 border-black pb-0.5" : "text-zinc-400 hover:text-zinc-600"}`}
                        >
                          Websites
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="tag-pill bg-zinc-100 text-zinc-500 px-3 py-2 rounded-full border border-zinc-200">
                      {activeLibraryTab === "components" ? history.length : websiteHistory.length} items
                    </span>
                    <button
                      onClick={() => { fetchHistory(); fetchWebsiteHistory(); }}
                      className="w-10 h-10 glass-card rounded-full flex items-center justify-center hover:bg-white transition-all active:scale-95"
                    >
                      <RefreshCw className={isLoadingHistory ? "animate-spin" : ""} style={{ width: '14px', height: '14px', color: '#71717a' }} />
                    </button>
                  </div>
                </div>

                {activeLibraryTab === "components" ? (
                  // COMPONENTS GRID
                  history.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {history.map((item, idx) => (
                        <div
                          key={item.id}
                          className="group bg-white/60 border border-white/80 rounded-[24px] overflow-hidden hover:border-white hover:shadow-xl hover:shadow-black/8 transition-all duration-500 flex flex-col"
                          style={{ height: '380px', animationDelay: `${idx * 60}ms` }}
                        >
                          {/* Preview */}
                          <div className="flex-1 relative overflow-hidden bg-zinc-50/80">
                            <iframe
                              title="Showcase"
                              srcDoc={`<!DOCTYPE html><html><head><style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;overflow:hidden;transform:scale(0.6);transform-origin:center;}${item.css}</style></head><body>${item.html}</body></html>`}
                              className="w-full h-full border-none pointer-events-none transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            {/* Overlay actions */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <button
                                onClick={() => setSelectedItem(item)}
                                className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-bold shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                              >
                                <Code style={{ width: '12px', height: '12px' }} /> Get Code
                              </button>
                            </div>
                          </div>

                          {/* Meta */}
                          <div className="p-4 border-t border-zinc-100/80 flex-shrink-0">
                            <p className="text-xs font-medium text-zinc-700 line-clamp-1 italic mb-2">"{item.prompt}"</p>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-zinc-400">
                                {item.createdAt instanceof Timestamp ? item.createdAt.toDate().toLocaleDateString() : 'Recent'}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => toggleVisibility(e, item)}
                                  className={`p-1.5 rounded-full transition-all duration-200 ${item.isPublic
                                    ? "bg-blue-50 text-blue-500 hover:bg-blue-100"
                                    : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200"
                                    }`}
                                  title={item.isPublic ? "Public (Click to make Private)" : "Private (Click to make Public)"}
                                >
                                  {item.isPublic ? (
                                    <Globe style={{ width: '12px', height: '12px' }} />
                                  ) : (
                                    <Lock style={{ width: '12px', height: '12px' }} />
                                  )}
                                </button>
                                {item.packageName && (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-mono text-zinc-500">{item.packageName}</span>
                                    <span className="tag-pill bg-red-50 text-red-600 px-2 py-1 rounded-full border border-red-100 text-[9px] font-bold">NPM</span>
                                  </div>
                                )}
                                {item.cdnUrl && (
                                  <span className="tag-pill bg-green-50 text-green-600 px-2 py-1 rounded-full border border-green-100 text-[9px] font-bold">CDN Live</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-50">
                      <div className="w-20 h-20 rounded-[24px] bg-zinc-100 flex items-center justify-center border border-dashed border-zinc-200">
                        <LayoutGrid style={{ width: '32px', height: '32px', color: '#d4d4d8' }} />
                      </div>
                      <div className="text-center">
                        <h3 className="text-lg font-bold text-zinc-700 mb-1">Library is empty</h3>
                        <p className="text-sm text-zinc-400">Generate components to build your showcase</p>
                      </div>
                    </div>
                  )
                ) : (
                  // WEBSITES GRID
                  websiteHistory.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {websiteHistory.map((site, idx) => (
                        <div
                          key={site.id}
                          className="group bg-white/60 border border-white/80 rounded-[24px] overflow-hidden hover:border-white hover:shadow-xl hover:shadow-black/8 transition-all duration-500 flex flex-col"
                          style={{ height: '380px', animationDelay: `${idx * 60}ms` }}
                        >
                          {/* Preview */}
                          <div className="flex-1 relative overflow-hidden bg-zinc-50/80">
                            <iframe
                              title="Website Showcase"
                              srcDoc={site.html ? site.html.replace('</head>', '<style>::-webkit-scrollbar { display: none !important; width: 0 !important; } body { margin: 0; padding: 0; -ms-overflow-style: none !important; scrollbar-width: none !important; transform: scale(0.25); transform-origin: top left; width: 400%; height: 400%; overflow: hidden; }</style></head>') : ''}
                              className="w-full h-full border-none pointer-events-none transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            {/* Overlay actions */}
                            <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <button
                                onClick={() => setSelectedWebsite(site)}
                                className="glass-card bg-white/90 hover:bg-white flex items-center gap-2 px-5 py-2.5 rounded-full text-zinc-800 text-xs font-bold shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                              >
                                <Code style={{ width: '12px', height: '12px' }} /> Code
                              </button>
                              <button
                                onClick={() => setViewingWebsite(site)}
                                className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-bold shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-75"
                              >
                                <ExternalLink style={{ width: '12px', height: '12px' }} /> Open
                              </button>
                            </div>
                          </div>
                          {/* Info */}
                          <div className="p-5 bg-white/50 backdrop-blur-sm border-t border-white/50">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="text-sm font-bold text-zinc-900 line-clamp-1">{site.prompt || "Generated Website"}</h3>
                                <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-2">
                                  {site.createdAt?.seconds ? new Date(site.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                                  <span>•</span>
                                  {site.theme || 'No Theme'}
                                </p>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                                <Monitor className="w-3.5 h-3.5 text-zinc-400" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                      <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-4">
                        <Monitor className="w-6 h-6 text-zinc-400" />
                      </div>
                      <h3 className="text-sm font-bold text-zinc-900">No websites yet</h3>
                      <p className="text-xs text-zinc-500 mt-1 max-w-[200px]">Websites generated in Neura Website Builder will appear here</p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ─── GET CODE MODAL ─── */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-2xl z-[100] flex items-center justify-center p-4 md:p-8">
          <div
            className="bg-white w-full max-w-4xl rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-zinc-100"
            style={{ maxHeight: '90vh' }}
          >
            {/* Left: Preview */}
            <div className="md:w-[45%] bg-zinc-50 flex flex-col p-8 border-b md:border-b-0 md:border-r border-zinc-100 flex-shrink-0">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 bg-black rounded-[12px] flex items-center justify-center">
                  <Monitor style={{ width: '15px', height: '15px', color: 'white' }} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-zinc-700">Live Preview</span>
              </div>
              <div className="flex-1 bg-white rounded-[20px] border border-zinc-200 shadow-lg overflow-hidden" style={{ minHeight: '280px' }}>
                <iframe
                  title="Modal Preview"
                  srcDoc={`<!DOCTYPE html><html><head><style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;overflow:hidden;}${selectedItem.css}</style></head><body>${selectedItem.html}</body></html>`}
                  className="w-full h-full border-none"
                />
              </div>
              <p className="mt-4 text-[11px] text-zinc-400 italic leading-relaxed line-clamp-2">"{selectedItem.prompt}"</p>
            </div>

            {/* Right: Code details */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-8 pb-5 border-b border-zinc-100 flex-shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">Integration Guide</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Copy & paste into your project</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setHtmlCode(selectedItem.html);
                      setCssCode(selectedItem.css);
                      setAiPrompt(selectedItem.prompt);
                      setDeployedFileName(selectedItem.fileName || null);
                      setCurrentView("generator");
                      if (selectedItem.cdnUrl) setUploadResult({ cdnUrl: selectedItem.cdnUrl, filename: selectedItem.fileName || "" });
                      setCurrentDocId(selectedItem.id);
                      setPackageName(selectedItem.packageName || "");
                      toast.success("Loaded in editor!");
                      setSelectedItem(null);
                    }}
                    className="btn-primary px-4 py-2 rounded-full text-white text-[11px] font-bold uppercase tracking-widest"
                  >
                    Open in Editor
                  </button>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="w-9 h-9 rounded-full hover:bg-zinc-100 flex items-center justify-center transition-colors"
                  >
                    <X style={{ width: '16px', height: '16px', color: '#71717a' }} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {/* Step 1: Install / CDN Link */}
                <div className="space-y-6">
                  {/* NPM SECTION */}
                  {selectedItem.deployType === 'npm' || selectedItem.packageName ? (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-700">Install via NPM</span>
                      </div>

                      {/* Step 1.1: Install Core */}
                      <div className="mb-3">
                        <p className="text-[10px] text-zinc-400 mb-1.5 font-bold uppercase tracking-wider ml-1">Core Dependency</p>
                        <div className="relative">
                          <input
                            readOnly
                            value="npm i neura-packages"
                            className="w-full bg-zinc-50 border border-zinc-100 rounded-[16px] px-5 py-3.5 text-[11px] mono text-zinc-600 pr-14"
                          />
                          <button
                            onClick={() => copyToClipboard("npm i neura-packages", "Install Command")}
                            className="absolute right-2 top-2 w-9 h-9 bg-zinc-200 hover:bg-zinc-300 rounded-full flex items-center justify-center transition-colors"
                          >
                            <Copy style={{ width: '13px', height: '13px', color: '#52525b' }} />
                          </button>
                        </div>
                      </div>

                      {/* Step 1.2: Add Component */}
                      <div>
                        <p className="text-[10px] text-zinc-400 mb-1.5 font-bold uppercase tracking-wider ml-1">Add Component</p>
                        <div className="relative">
                          <input
                            readOnly
                            value={`npx neura add ${selectedItem.packageName || "my-component"}`}
                            className="w-full bg-zinc-50 border border-zinc-100 rounded-[16px] px-5 py-3.5 text-[11px] mono text-zinc-600 pr-14"
                          />
                          <button
                            onClick={() => copyToClipboard(`npx neura add ${selectedItem.packageName || "my-component"}`, "Add Command")}
                            className="absolute right-2 top-2 w-9 h-9 btn-primary rounded-full flex items-center justify-center"
                          >
                            <Copy style={{ width: '13px', height: '13px', color: 'white' }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* CDN SECTION */}
                  {selectedItem.deployType === 'cdn' || selectedItem.cdnUrl ? (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center font-bold">{selectedItem.packageName ? '2' : '1'}</span>
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-700">Add via CDN</span>
                      </div>
                      <div className="relative">
                        <input
                          readOnly
                          value={selectedItem.cdnUrl
                            ? (selectedItem.cdnUrl.endsWith('.js')
                              ? `<script src="${selectedItem.cdnUrl}"></script>`
                              : `<link rel="stylesheet" href="${selectedItem.cdnUrl}">`)
                            : "Deploy component to get CDN link"
                          }
                          className="w-full bg-zinc-50 border border-zinc-100 rounded-[16px] px-5 py-3.5 text-[11px] mono text-zinc-600 pr-14"
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
                          className="absolute right-2 top-2 w-9 h-9 btn-primary rounded-full flex items-center justify-center"
                        >
                          <Copy style={{ width: '13px', height: '13px', color: 'white' }} />
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Step 2: HTML markup */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">{selectedItem.packageName && selectedItem.cdnUrl ? '3' : '2'}</span>
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-700">Paste HTML Markup</span>
                  </div>
                  <div className="relative">
                    <textarea
                      readOnly
                      value={selectedItem.html}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-[16px] p-5 text-[11px] mono text-zinc-600 h-28 resize-none pr-14"
                    />
                    <button
                      onClick={() => copyToClipboard(selectedItem.html, "HTML")}
                      className="absolute right-2 top-2 w-9 h-9 btn-primary rounded-full flex items-center justify-center"
                    >
                      <Copy style={{ width: '13px', height: '13px', color: 'white' }} />
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-2 font-medium">Paste inside your &lt;body&gt; where you want the component.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── WEBSITE CODE MODAL ─── */}
      {selectedWebsite && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-2xl z-[100] flex items-center justify-center p-4 md:p-8">
          <div
            className="bg-white w-full max-w-4xl rounded-[32px] overflow-hidden shadow-2xl flex flex-col border border-zinc-100"
            style={{ maxHeight: '90vh' }}
          >
            <div className="flex items-center justify-between p-6 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg shadow-zinc-500/20">
                  <Code style={{ width: '18px', height: '18px', color: 'white' }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">Website Code</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">{selectedWebsite.prompt || "Generated Website"}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedWebsite(null)}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors"
              >
                <X style={{ width: '14px', height: '14px', color: '#71717a' }} />
              </button>
            </div>
            <div className="p-8 overflow-y-auto bg-zinc-50">
              <div className="relative">
                <textarea
                  readOnly
                  value={selectedWebsite.html}
                  className="w-full bg-white border border-zinc-200 rounded-[20px] p-6 text-xs mono text-zinc-600 h-[60vh] resize-none outline-none focus:border-zinc-300 transition-colors shadow-sm"
                />
                <button
                  onClick={() => copyToClipboard(selectedWebsite.html, "Website HTML")}
                  className="absolute right-4 top-4 w-9 h-9 btn-primary rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                >
                  <Copy style={{ width: '13px', height: '13px', color: 'white' }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── FULLSCREEN WEBSITE PREVIEW ─── */}
      {viewingWebsite && (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="h-16 border-b border-zinc-100 flex items-center justify-between px-6 bg-white shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewingWebsite(null)}
                className="w-10 h-10 rounded-full bg-zinc-50 hover:bg-zinc-100 flex items-center justify-center transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 text-zinc-500 group-hover:text-zinc-900" />
              </button>
              <div className="w-px h-6 bg-zinc-200" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg shadow-black/20">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 line-clamp-1 max-w-[300px]">{viewingWebsite.prompt || "Website Preview"}</h3>
                  <p className="text-xs text-zinc-500 font-medium">{viewingWebsite.theme || "No Theme"} • {viewingWebsite.framework?.toUpperCase() || "CSS"}</p>
                </div>
              </div>
            </div>
            <div>
              <button
                onClick={() => window.open(`/site/${viewingWebsite.id}`, '_blank')}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 text-xs font-bold transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open in New Tab
              </button>
            </div>
          </div>
          {/* Iframe */}
          <div className="flex-1 w-full h-full bg-zinc-100 relative overflow-hidden">
            <iframe
              srcDoc={viewingWebsite.html}
              className="w-full h-full border-none bg-white"
              title="Fullscreen Preview"
            />
          </div>
        </div>
      )}

      {/* ─── FRAMEWORK SWITCH WARNING ─── */}
      {showWarning && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={cancelSwitch} />
          <div className="relative bg-white rounded-[28px] p-8 max-w-sm w-full shadow-2xl border border-zinc-100">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-5 mx-auto border border-amber-100">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center mb-2">Unsaved Work</h3>
            <p className="text-sm text-zinc-500 text-center mb-8 leading-relaxed">Switching frameworks will clear your current component. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={cancelSwitch} className="flex-1 py-3 rounded-full border border-zinc-200 text-zinc-600 text-xs font-bold uppercase tracking-wide hover:bg-zinc-50 transition-colors">
                Cancel
              </button>
              <button onClick={confirmSwitch} className="flex-1 py-3 btn-primary rounded-full text-white text-xs font-bold uppercase tracking-wide">
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}