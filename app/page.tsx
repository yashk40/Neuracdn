import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Workflow } from "@/components/workflow"
import { Features } from "@/components/features"
import { CodePreview } from "@/components/code-preview"
import { CTA } from "@/components/cta"
import { Footer } from "@/components/footer"

export default function Home() {
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
