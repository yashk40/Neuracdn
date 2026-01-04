import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-black text-white font-poppins pt-20" style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <Navbar />
            <main className="container mx-auto px-4 py-32">
                <h1 className="text-4xl font-bold mb-4">Blog</h1>
                <p className="text-zinc-400">Coming soon.</p>
            </main>
            <Footer />
        </div>
    );
}
