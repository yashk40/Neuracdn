import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="container mx-auto px-4 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 mb-8 animate-slide-up">
            <Sparkles className="h-3 w-3" />
            <span className="text-xs font-mono">Generate → Compile → Deploy → Use</span>
          </div>

          {/* Main headline */}
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 text-balance">
            Components from API to CDN in{" "}
            <span className="inline-block bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
              seconds
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg lg:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto text-balance leading-relaxed">
            Generate UI components via API, watch them compile in real-time, and deploy instantly to GitHub CDN. Zero
            setup. Zero config. Just ready-to-use components.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="group">
                Generate Your First Component
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              View Documentation
            </Button>
          </div>

          {/* Code snippet */}
          <div className="mt-16 max-w-2xl mx-auto">
            <div className="rounded-lg border border-border bg-card p-6 text-left font-mono text-sm overflow-x-auto">
              <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-border" />
                  <div className="w-3 h-3 rounded-full bg-border" />
                  <div className="w-3 h-3 rounded-full bg-border" />
                </div>
                <span className="text-xs ml-2">terminal</span>
              </div>
              <div className="space-y-2">
                <div className="text-muted-foreground">
                  <span className="text-foreground">$</span> curl -X POST https://api.neura-cdn.com/generate
                </div>
                <div className="text-muted-foreground pl-4">-d {`'{"component": "LoginForm", "style": "modern"}'`}</div>
                <div className="pt-2 text-foreground/80">
                  <span className="animate-pulse-subtle">●</span> Compiling... Done in 2.3s
                </div>
                <div className="text-foreground/80">✓ Deployed: https://cdn.neura.io/components/login-form</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
