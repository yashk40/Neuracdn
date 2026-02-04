"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Copy, Check, Terminal, Zap, Shield, Globe, Box, Github, ChevronRight, Command } from "lucide-react"

export default function LibraryPage() {
    const [copied, setCopied] = useState(false)
    const [activeTab, setActiveTab] = useState("react")

    const copyCommand = () => {
        navigator.clipboard.writeText("npm install @neuracdn/react")
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
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
                    <Link href="/" className="font-bold text-xl tracking-tighter flex items-center gap-2">
                        <div className="w-5 h-5 bg-white rounded-sm"></div>
                        NEURA<span className="font-light opacity-50">LIB</span>
                    </Link>
                    <div className="flex items-center gap-8 text-sm font-medium text-white/60">
                        <Link href="/docs" className="hover:text-white transition-colors">Documentation</Link>
                        <Link href="/components" className="hover:text-white transition-colors">Components</Link>
                        <Link href="https://github.com" target="_blank" className="text-white hover:opacity-80 transition-opacity">
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

                            <div className="flex flex-col sm:flex-row gap-6 items-center w-full max-w-md mx-auto">
                                <button
                                    onClick={copyCommand}
                                    className="group relative w-full flex items-center justify-between bg-[#111] border border-white/10 rounded-lg px-4 py-4 hover:border-white/20 transition-all text-left font-mono text-sm"
                                >
                                    <div className="flex items-center gap-3 text-white/70">
                                        <ChevronRight className="w-4 h-4 text-white/30" />
                                        <span>npm i @neuracdn/react</span>
                                    </div>
                                    <div className="text-white/30 group-hover:text-white transition-colors">
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
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
                                { label: "Lookups/Day", value: "1.2B" },
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
                                        <button
                                            onClick={() => setActiveTab("react")}
                                            className={`hover:text-white transition-colors ${activeTab === "react" ? "text-white" : ""}`}
                                        >
                                            App.tsx
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("config")}
                                            className={`hover:text-white transition-colors ${activeTab === "config" ? "text-white" : ""}`}
                                        >
                                            neura.config.js
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto">
                                    {activeTab === "react" ? (
                                        <pre>
                                            <span className="text-purple-400">import</span> {"{"} CDNComponent {"}"} <span className="text-purple-400">from</span> <span className="text-emerald-400">'@neuracdn/react'</span>{'\n\n'}
                                            <span className="text-purple-400">export default</span> <span className="text-blue-400">function</span> <span className="text-yellow-200">App</span>() {'{'}{'\n'}
                                            {'  '}<span className="text-purple-400">return</span> ({'\n'}
                                            {'    '}&lt;<span className="text-blue-400">div</span> <span className="text-purple-400">className</span>=<span className="text-emerald-400">"grid gap-4"</span>&gt;{'\n'}
                                            {'      '}&lt;<span className="text-yellow-200">CDNComponent</span>{'\n'}
                                            {'        '}src=<span className="text-emerald-400">"marketing/hero-slider"</span>{'\n'}
                                            {'        '}version=<span className="text-emerald-400">"latest"</span>{'\n'}
                                            {'        '}fallback={'<'}<span className="text-yellow-200">Skeleton</span> /&gt;{'\n'}
                                            {'      '}/&gt;{'\n'}
                                            {'    '}&lt;/<span className="text-blue-400">div</span>&gt;{'\n'}
                                            {'  '}){'\n'}
                                            {'}'}
                                        </pre>
                                    ) : (
                                        <pre>
                                            <span className="text-purple-400">module</span>.<span className="text-blue-400">exports</span> = {'{'}{'\n'}
                                            {'  '}apiKey: <span className="text-emerald-400">process.env.NEURA_KEY</span>,{'\n'}
                                            {'  '}regions: [<span className="text-emerald-400">'us-east'</span>, <span className="text-emerald-400">'eu-west'</span>, <span className="text-emerald-400">'asia-south'</span>],{'\n'}
                                            {'  '}caching: {'{'}{'\n'}
                                            {'    '}strategy: <span className="text-emerald-400">'stale-while-revalidate'</span>,{'\n'}
                                            {'    '}ttl: <span className="text-blue-400">3600</span>{'\n'}
                                            {'  '}{'}'}{'\n'}
                                            {'}'}
                                        </pre>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-white/10 py-16 px-6">
                    <div className="container mx-auto max-w-6xl">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                            <div>
                                <h4 className="font-bold text-2xl tracking-tight mb-2">NEURALIB</h4>
                                <p className="text-white/40 max-w-xs">
                                    The open standard for component delivery.
                                    <br />Built for the future of frontend.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 text-sm text-white/60">
                                <div className="flex flex-col gap-4">
                                    <span className="font-bold text-white">Product</span>
                                    <Link href="#" className="hover:text-white transition-colors">Features</Link>
                                    <Link href="#" className="hover:text-white transition-colors">Enterprise</Link>
                                    <Link href="#" className="hover:text-white transition-colors">Pricing</Link>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <span className="font-bold text-white">Resources</span>
                                    <Link href="#" className="hover:text-white transition-colors">Documentation</Link>
                                    <Link href="#" className="hover:text-white transition-colors">API Reference</Link>
                                    <Link href="#" className="hover:text-white transition-colors">Status</Link>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <span className="font-bold text-white">Legal</span>
                                    <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                                    <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    )
}
