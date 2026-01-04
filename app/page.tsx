"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Workflow } from "@/components/workflow"
import { Features } from "@/components/features"
import { CodePreview } from "@/components/code-preview"
import { CTA } from "@/components/cta"
import { Footer } from "@/components/footer"
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // useEffect(() => {
  //   if (!loading && user) {
  //     router.push("/dashboard");
  //   }
  // }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Workflow />
        <CodePreview />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
