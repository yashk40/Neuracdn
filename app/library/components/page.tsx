'use client';

import { useState, useEffect } from "react";
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    LayoutGrid,
    Code,
    Copy,
    X,
    Monitor,
    Loader2,
    Globe,
    Lock,
    Search,
    Box,
    Terminal,
    ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface ComponentItem {
    id: string;
    prompt: string;
    html: string;
    css: string;
    createdAt: any;
    cdnUrl?: string;
    fileName?: string;
    deployType?: 'cdn' | 'npm';
    packageName?: string;
    userName?: string;
    isPublic?: boolean;
}

export default function PublicLibraryPage() {
    const [components, setComponents] = useState<ComponentItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<ComponentItem | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchComponents();
    }, []);

    const fetchComponents = async () => {
        try {
            setIsLoading(true);
            // Fetch all public components (Client-side sort to avoid index requirement)
            const q = query(
                collection(db, "users_database"),
                where("isPublic", "==", true)
            );

            const querySnapshot = await getDocs(q);
            const items: ComponentItem[] = [];
            querySnapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() } as ComponentItem);
            });

            // Sort in memory
            items.sort((a, b) => {
                const dateA = a.createdAt?.seconds || 0;
                const dateB = b.createdAt?.seconds || 0;
                return dateB - dateA;
            });

            setComponents(items);
        } catch (error) {
            console.error("Error fetching components:", error);
            toast.error("Failed to load library");
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text: string, label: string = "Content") => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied!`);
    };

    const filteredComponents = components.filter(item =>
        item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.packageName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.userName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-black font-sans text-white selection:bg-white selection:text-black">
            {/* HEADER */}
            <header className="fixed top-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-md z-40 border-b border-zinc-800">
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                            <span className="text-black font-black tracking-tighter text-xl">N</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white leading-none tracking-tight">Neura</h1>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Library</span>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-4 bg-zinc-900/50 px-4 py-2.5 rounded-full border border-zinc-800 w-96 focus-within:border-zinc-600 transition-colors">
                        <Search className="w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search components..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm text-zinc-300 w-full placeholder:text-zinc-600 font-medium"
                        />
                    </div>

                    <a
                        href="/dashboard"
                        className="group px-5 py-2.5 bg-white text-black text-xs font-bold rounded-full hover:bg-zinc-200 transition-all flex items-center gap-2"
                    >
                        Open Studio <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8 border-b border-zinc-800 pb-12">
                    <div>
                        <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                            Component <br />
                            <span className="text-zinc-500">Library.</span>
                        </h2>
                        <p className="text-zinc-400 max-w-lg text-lg leading-relaxed">
                            Curated collection of AI-generated UI elements. <br />
                            Open source. Copy paste. Ship.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-5 py-3 bg-zinc-900 rounded-full border border-zinc-800 flex items-center gap-2.5">
                            <Box className="w-4 h-4 text-zinc-400" />
                            <span className="text-xs font-bold text-zinc-300">{components.length} Items</span>
                        </div>
                        <div className="px-5 py-3 bg-zinc-900 rounded-full border border-zinc-800 flex items-center gap-2.5">
                            <Globe className="w-4 h-4 text-zinc-400" />
                            <span className="text-xs font-bold text-zinc-300">Public Access</span>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-zinc-700" />
                        <p className="text-zinc-800 text-xs font-mono uppercase tracking-widest">Loading Library...</p>
                    </div>
                ) : filteredComponents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredComponents.map((item, idx) => (
                            <div
                                key={item.id}
                                className="group bg-zinc-900 rounded-[32px] border border-zinc-800 overflow-hidden hover:border-zinc-600 transition-all duration-500 flex flex-col h-[460px] relative"
                            >
                                {/* PREVIEW AREA */}
                                <div className="flex-1 relative bg-[#0a0a0a] overflow-hidden">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <iframe
                                            title="Preview"
                                            srcDoc={`<!DOCTYPE html><html><head><style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;overflow:hidden;transform:scale(0.75);transform-origin:center;background:transparent;}${item.css}</style></head><body>${item.html}</body></html>`}
                                            className="w-full h-full border-none pointer-events-none select-none opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                                        />
                                    </div>

                                    {/* Badge */}
                                    <div className="absolute top-5 right-5 flex gap-2 z-10">
                                        {item.deployType === 'npm' ? (
                                            <span className="bg-black/50 backdrop-blur-md text-white text-[9px] font-bold px-3 py-1.5 rounded-full border border-zinc-700 flex items-center gap-1.5 hover:bg-zinc-800 transition-colors">
                                                <Terminal className="w-3 h-3" /> NPM
                                            </span>
                                        ) : (
                                            <span className="bg-black/50 backdrop-blur-md text-zinc-300 text-[9px] font-bold px-3 py-1.5 rounded-full border border-zinc-700 flex items-center gap-1.5">
                                                <Globe className="w-3 h-3" /> CDN
                                            </span>
                                        )}
                                    </div>

                                    {/* Overlay Button */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-[2px]">
                                        <button
                                            onClick={() => setSelectedItem(item)}
                                            className="px-8 py-4 bg-white text-black text-xs font-bold rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all hover:scale-105 active:scale-95"
                                        >
                                            View Source
                                        </button>
                                    </div>
                                </div>

                                {/* INFO AREA */}
                                <div className="p-6 border-t border-zinc-800 bg-zinc-900 z-10">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="text-sm font-bold text-white line-clamp-1 capitalize tracking-tight">
                                                {item.prompt.length > 50 ? item.prompt.substring(0, 50) + "..." : item.prompt}
                                            </p>
                                            <p className="text-[10px] text-zinc-500 font-mono mt-1 truncate">
                                                {item.id.substring(0, 8)}...
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[9px] text-white font-bold border border-zinc-700">
                                                {item.userName ? item.userName[0].toUpperCase() : 'U'}
                                            </div>
                                            <span className="text-[11px] text-zinc-400 font-medium truncate max-w-[100px]">
                                                {item.userName || "Anonymous"}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-zinc-500 font-medium">
                                            {item.createdAt instanceof Timestamp ? item.createdAt.toDate().toLocaleDateString() : 'Recent'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-40 opacity-40">
                        <div className="w-20 h-20 bg-zinc-900 rounded-3xl mx-auto flex items-center justify-center mb-6 border border-zinc-800">
                            <Box className="w-10 h-10 text-zinc-600" />
                        </div>
                        <p className="text-zinc-500 font-medium tracking-wide">NO COMPONENTS FOUND</p>
                    </div>
                )}
            </main>

            {/* CODE MODAL */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-8">
                    <div
                        className="bg-zinc-950 w-full max-w-6xl rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-zinc-800 animate-in fade-in zoom-in-95 duration-300"
                        style={{ maxHeight: '90vh' }}
                    >
                        {/* Left: Preview */}
                        <div className="md:w-[55%] bg-[#050505] flex flex-col p-8 border-b md:border-b-0 md:border-r border-zinc-800 relative group">
                            <div className="absolute top-8 left-8 z-20">
                                <span className="bg-black/50 backdrop-blur-sm border border-zinc-800 text-zinc-400 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                                    Live Preview
                                </span>
                            </div>

                            <div className="flex-1 flex items-center justify-center p-8">
                                <iframe
                                    title="Modal Preview"
                                    srcDoc={`<!DOCTYPE html><html><head><style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;overflow:hidden;background:transparent;}${selectedItem.css}</style></head><body>${selectedItem.html}</body></html>`}
                                    className="w-full h-full border-none"
                                />
                            </div>

                            <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-black/50 backdrop-blur-md p-2 pl-3 pr-4 rounded-full border border-zinc-800">
                                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-black shadow-sm">
                                    {selectedItem.userName ? selectedItem.userName[0].toUpperCase() : 'U'}
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-white">{selectedItem.userName || "Anonymous"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Code details */}
                        <div className="flex-1 flex flex-col overflow-hidden bg-zinc-900/50 backdrop-blur-3xl">
                            <div className="flex items-center justify-between p-8 border-b border-zinc-800">
                                <div>
                                    <h3 className="text-xl font-bold text-white tracking-tight">Installation</h3>
                                    <p className="text-xs text-zinc-500 mt-1 font-medium">Ready for deployment</p>
                                </div>
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors border border-zinc-700"
                                >
                                    <X className="w-5 h-5 text-zinc-400" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-10">
                                {/* Section 1: Integration */}
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="w-6 h-6 rounded bg-white text-black text-[10px] flex items-center justify-center font-bold shadow-sm">1</span>
                                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                                            {selectedItem.deployType === 'npm' ? "Terminal / NPM" : "CDN Resource"}
                                        </span>
                                    </div>

                                    <div className="group relative">
                                        <input
                                            readOnly
                                            value={selectedItem.deployType === 'npm'
                                                ? `npx neura add ${selectedItem.packageName || "component"}`
                                                : (selectedItem.cdnUrl || "CDN not available")
                                            }
                                            className="w-full bg-black text-zinc-300 rounded-2xl px-6 py-5 text-xs mono border border-zinc-800 focus:border-white/20 outline-none pr-16 transition-all"
                                        />
                                        <button
                                            onClick={() => copyToClipboard(
                                                selectedItem.deployType === 'npm'
                                                    ? `npx neura add ${selectedItem.packageName || "component"}`
                                                    : (selectedItem.cdnUrl || ""),
                                                "Command"
                                            )}
                                            className="absolute right-3 top-3 bottom-3 w-12 bg-zinc-900 hover:bg-zinc-800 rounded-xl flex items-center justify-center transition-colors border border-zinc-800 group-hover:border-zinc-700"
                                        >
                                            <Copy className="w-4 h-4 text-zinc-400" />
                                        </button>
                                    </div>
                                </div>

                                {/* Section 2: Source Code */}
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="w-6 h-6 rounded bg-white text-black text-[10px] flex items-center justify-center font-bold shadow-sm">2</span>
                                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Source Markup</span>
                                    </div>
                                    <div className="relative group">
                                        <textarea
                                            readOnly
                                            value={selectedItem.html}
                                            className="w-full bg-black border border-zinc-800 rounded-2xl p-6 text-[10px] mono text-zinc-500 h-48 resize-none outline-none focus:border-white/20 transition-all leading-normal"
                                        />
                                        <button
                                            onClick={() => copyToClipboard(selectedItem.html, "HTML")}
                                            className="absolute right-4 top-4 p-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Copy className="w-3.5 h-3.5 text-zinc-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
