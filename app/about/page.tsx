import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-black text-white font-poppins pt-20" style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <Navbar />
            <main className="container mx-auto px-4 py-24 max-w-4xl">
                <h1 className="text-5xl font-bold mb-8">About Neura CDN</h1>
                <div className="prose prose-invert mx-auto max-w-3xl">
                    <p className="text-xl text-zinc-400 mb-12 leading-relaxed">
                        We are building the future of component delivery. Neura CDN bridges the gap between AI generation and production deployment.
                    </p>

                    <div className="grid md:grid-cols-2 gap-12 text-left">
                        <div className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800">
                            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                            <p className="text-zinc-500">
                                To empower developers to ship UI faster by automating the component infrastructure layer.
                            </p>
                        </div>
                        <div className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800">
                            <h3 className="text-2xl font-bold mb-4">The Vision</h3>
                            <p className="text-zinc-500">
                                A world where every AI-generated idea can be instantly used in production without configuration.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
