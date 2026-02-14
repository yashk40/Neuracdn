"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Copy, Check, Terminal, Zap, Shield, Globe, Box, Github, ChevronRight, Command, Brain } from "lucide-react"

export default function LibraryPage() {
    const [copiedCommand, setCopiedCommand] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("react") // Removing this variable usage later


    const copyCommand = (command: string) => {
        navigator.clipboard.writeText(command)
        setCopiedCommand(command)
        setTimeout(() => setCopiedCommand(null), 2000)
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black overflow-x-hidden">
            {/* Grid Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 w-full border-b border-white/5 bg-black/80 backdrop-blur-xl z-50">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="group flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors border border-white/10">
                            <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-lg leading-none tracking-tight text-white">Neura</span>
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Library</span>
                        </div>
                    </Link>
                    <div className="flex items-center gap-8 text-sm font-medium text-white/60">
                        <Link href="/library/components" className="hover:text-white transition-colors">Components</Link>
                        <Link href="https://github.com/yashk40/Neuracdn.git" target="_blank" className="text-white hover:opacity-80 transition-opacity">
                            <Github className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 pt-32">
                {/* Hero Section */}
                <section className="px-6 pb-32 pt-10">
                    <div className="container mx-auto max-w-6xl">
                        <div className="flex flex-col items-center text-center">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono mb-8 text-white/60 hover:bg-white/10 transition-colors cursor-default">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                v2.0.4 Latest Stable
                            </div>

                            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-8 leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                                The Global<br />
                                Edge CDN.
                            </h1>

                            <p className="text-xl md:text-2xl text-white/50 max-w-2xl mb-12 leading-relaxed font-light">
                                Distributed UI components. Versioned, cached, and delivered from the edge in <span className="text-white font-medium">milliseconds</span>.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 items-center w-full max-w-2xl mx-auto">
                                <button
                                    onClick={() => copyCommand("npm i neura-packages")}
                                    className="group relative w-full flex items-center justify-between bg-[#111] border border-white/10 rounded-lg px-4 py-4 hover:border-white/20 transition-all text-left font-mono text-sm"
                                >
                                    <div className="flex items-center gap-3 text-white/70">
                                        <ChevronRight className="w-4 h-4 text-white/30" />
                                        <span>npm i neura-packages</span>
                                    </div>
                                    <div className="text-white/30 group-hover:text-white transition-colors">
                                        {copiedCommand === "npm i neura-packages" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                    </div>
                                </button>
                                <button
                                    onClick={() => copyCommand("npx neura init")}
                                    className="group relative w-full flex items-center justify-between bg-[#111] border border-white/10 rounded-lg px-4 py-4 hover:border-white/20 transition-all text-left font-mono text-sm"
                                >
                                    <div className="flex items-center gap-3 text-white/70">
                                        <ChevronRight className="w-4 h-4 text-white/30" />
                                        <span>npx neura init</span>
                                    </div>
                                    <div className="text-white/30 group-hover:text-white transition-colors">
                                        {copiedCommand === "npx neura init" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="border-y border-white/5 bg-white/[0.02] py-12">
                    <div className="container mx-auto max-w-6xl px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                { label: "Edge Locations", value: "240+" },
                                { label: "Global Latency", value: "<50ms" },
                                { label: "Uptime", value: "99.99%" },
                            ].map((stat, i) => (
                                <div key={i} className="flex flex-col items-center md:items-start">
                                    <span className="text-3xl md:text-4xl font-bold tracking-tight mb-1">{stat.value}</span>
                                    <span className="text-sm font-mono text-white/40 uppercase tracking-widest">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Integration Preview */}
                <section className="py-32 px-6">
                    <div className="container mx-auto max-w-6xl">
                        <div className="grid lg:grid-cols-2 gap-16 items-start">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                                    Designed for<br />
                                    <span className="text-white/50">Modern Stacks.</span>
                                </h2>
                                <p className="text-lg text-white/60 mb-12 leading-relaxed">
                                    Consume components as easily as importing a library. We handle the versioning, caching, and delivery strategy automatically.
                                </p>

                                <div className="space-y-8">
                                    <div className="flex gap-4 group">
                                        <div className="w-12 h-12 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-black transition-all duration-500">
                                            <Zap className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl mb-1 group-hover:text-white/90 transition-colors">Instant Updates</h3>
                                            <p className="text-white/40 text-sm">Push changes to the edge in seconds, not hours.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 group">
                                        <div className="w-12 h-12 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-black transition-all duration-500">
                                            <Shield className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl mb-1 group-hover:text-white/90 transition-colors">Enterprise Security</h3>
                                            <p className="text-white/40 text-sm">Signed packages, SRI support, and access control.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 group">
                                        <div className="w-12 h-12 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-black transition-all duration-500">
                                            <Box className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl mb-1 group-hover:text-white/90 transition-colors">Zero Config</h3>
                                            <p className="text-white/40 text-sm">No complex build steps or webpack fiddling required.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Code Panel */}
                            <div className="rounded-xl border border-white/10 bg-[#050505] overflow-hidden shadow-2xl shadow-white/5">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-white/20"></div>
                                        <div className="w-3 h-3 rounded-full bg-white/10"></div>
                                        <div className="w-3 h-3 rounded-full bg-white/10"></div>
                                    </div>
                                    <div className="flex gap-4 text-xs font-mono text-white/40">
                                        <div className="text-white">
                                            App.tsx
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto">
                                    <pre>
                                        <span className="text-purple-400">import</span> Image <span className="text-purple-400">from</span> <span className="text-emerald-400">"next/image"</span>;{'\n'}
                                        <span className="text-purple-400">import</span> BasicForm <span className="text-purple-400">from</span> <span className="text-emerald-400">"./UI/Basic-form"</span>;{'\n\n'}
                                        <span className="text-purple-400">export default</span> <span className="text-blue-400">function</span> <span className="text-yellow-200">Home</span>() {'{'}{'\n'}
                                        {'  '}<span className="text-purple-400">return</span> ({'\n'}
                                        {'    '}&lt;&gt;{'\n'}
                                        {'      '}&lt;<span className="text-yellow-200">BasicForm</span>/&gt;{'\n'}
                                        {'    '}&lt;/&gt;{'\n'}
                                        {'  '});{'\n'}
                                        {'}'}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-white/5 py-8 px-6 bg-black">
                    <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-white/40 text-sm font-mono">
                            <Brain className="w-4 h-4 text-white/40" />
                            <span>© 2026 Neura Inc.</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <Link href="https://github.com/yashk40/Neuracdn.git" target="_blank" className="text-white/40 hover:text-white transition-colors text-xs font-mono">GitHub</Link>
                            <Link href="/privacy" className="text-white/40 hover:text-white transition-colors text-xs font-mono">Privacy</Link>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    )
}
