import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Zap, Code, Globe, Shield } from "lucide-react";

export default function FeaturesPage() {
    const features = [
        {
            icon: <Zap className="h-6 w-6 text-yellow-400" />,
            title: "Instant Generation",
            description: "Turn text prompts into production-ready React/HTML components in seconds."
        },
        {
            icon: <Code className="h-6 w-6 text-blue-400" />,
            title: "Live Compilation",
            description: "See your code compile and bundle in real-time within the browser."
        },
        {
            icon: <Globe className="h-6 w-6 text-green-400" />,
            title: "Global CDN",
            description: "Assets are deployed to a high-performance edge network immediately."
        },
        {
            icon: <Shield className="h-6 w-6 text-purple-400" />,
            title: "Version Control",
            description: "Every generation is versioned and backed by GitHub infrastructure."
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white font-poppins pt-20" style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <Navbar />
            <main className="container mx-auto px-4 py-24 max-w-6xl">
                <h1 className="text-5xl font-bold mb-6">Platform Features</h1>
                <p className="text-xl text-zinc-400 mb-16 max-w-2xl mx-auto">
                    Everything you need to automate your component workflow.
                </p>

                <div className="grid md:grid-cols-2 gap-8 text-left">
                    {features.map((f, i) => (
                        <div key={i} className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 hover:bg-zinc-900 transition-colors">
                            <div className="bg-zinc-800 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                                {f.icon}
                            </div>
                            <h3 className="text-2xl font-bold mb-3">{f.title}</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                {f.description}
                            </p>
                        </div>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
}
