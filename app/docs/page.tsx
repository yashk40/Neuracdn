import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-black text-white font-poppins pt-20" style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <Navbar />
            <main className="container mx-auto px-4 py-24 max-w-4xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 mb-8 text-sm text-zinc-400">
                    <span>v1.0.0</span>
                    <span className="w-1 h-1 bg-zinc-600 rounded-full"></span>
                    <span>Beta</span>
                </div>

                <h1 className="text-5xl font-bold mb-6">Documentation</h1>
                <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
                    Learn how to generate, compile, and deploy components using the Neura CDN API.
                </p>

                <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16">
                    <Link href="#" className="group block bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all text-left">
                        <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors flex items-center gap-2">
                            Quick Start <ArrowRight className="h-4 w-4" />
                        </h3>
                        <p className="text-zinc-500">
                            Get up and running with your first API request in minutes.
                        </p>
                    </Link>
                    <Link href="#" className="group block bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all text-left">
                        <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors flex items-center gap-2">
                            API Reference <ArrowRight className="h-4 w-4" />
                        </h3>
                        <p className="text-zinc-500">
                            Detailed endpoints, parameters, and response formats.
                        </p>
                    </Link>
                </div>
            </main>
            <Footer />
        </div>
    );
}
