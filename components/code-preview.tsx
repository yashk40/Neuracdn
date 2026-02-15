"use client"

import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Terminal, Code, Sparkles, Rocket, CheckCircle2, ChevronRight } from "lucide-react"

const codeSteps = [
  {
    title: "Import Component",
    subtitle: "Modular Integration",
    icon: Code,
    fileName: "Home.tsx",
    code: `import BasicForm from "./UI/Basic-form";

export default function Home() {
  return (
    <div className="p-8">
      <BasicForm />
    </div>  
   );
}`,
    language: "typescript"
  },
  {
    title: "Instant Live Build",
    subtitle: "Real-time Edge Compilation",
    icon: Terminal,
    fileName: "build.log",
    code: [
      { text: "● Parsing natural language...", status: "pending" },
      { text: "● Generating CSS modules...", status: "pending" },
      { text: "✓ CSS optimized (1.2kb)", status: "success" },
      { text: "● Generating HTML structure...", status: "pending" },
      { text: "✓ Structure validated", status: "success" },
      { text: "● Pushing to Edge CDN...", status: "pending" },
      { text: "✓ Deployed: https://cdn.neura.io/a/8f92a", status: "success" },
    ],
    language: "log"
  },
  {
    title: "Drop into Project",
    subtitle: "Production Ready",
    icon: Rocket,
    fileName: "index.html",
    code: `<!-- 1. Include the CDN link -->
<link rel="stylesheet" 
href=
"cdn.jsdelivr.net/gh/neuracdn/CDN@main/animation-1771189205835-u753ye.css">

<!-- 2. Use the markup -->
<button class="neura-btn-glow">
  <span>Launch Sequence</span>
</button>`,
    language: "html"
  },
]

export function CodePreview() {
  const [activeStep, setActiveStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const codeRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const stepInterval = 6000 // 6 seconds per step

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveStep((s) => (s + 1) % codeSteps.length)
          return 0
        }
        return prev + (100 / (stepInterval / 100))
      })
    }, 100)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (codeRef.current) {
      gsap.fromTo(codeRef.current,
        { opacity: 0, x: 20, filter: "blur(10px)" },
        { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.8, ease: "power4.out" }
      )
    }
  }, [activeStep])

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-40 bg-background overflow-hidden">
      {/* Abstract Background Element */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[150px] -z-10 rounded-full translate-x-1/2" />

      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">

            {/* Left: Interactive Controls */}
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  <span>Real-time Pipeline</span>
                </div>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                  See it compile in real-time
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                  Full transparency into our edge-computing pipeline. Watch as your request transforms into a globally distributed asset.
                </p>
              </div>

              <div className="grid gap-4">
                {codeSteps.map((step, index) => (
                  <button
                    key={step.title}
                    onClick={() => {
                      setActiveStep(index)
                      setProgress(0)
                    }}
                    className={`group relative w-full text-left p-4 sm:p-6 rounded-2xl border transition-all duration-500 overflow-hidden ${activeStep === index
                      ? "border-primary/30 bg-primary/[0.03] shadow-lg shadow-primary/5"
                      : "border-border/50 bg-transparent hover:border-primary/20"
                      }`}
                  >
                    {/* Progress Bar Background */}
                    {activeStep === index && (
                      <div
                        className="absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                      />
                    )}

                    <div className="flex items-start gap-5">
                      <div className={`mt-1 p-2.5 rounded-xl border transition-all duration-500 ${activeStep === index
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 text-muted-foreground border-border group-hover:border-primary/30"
                        }`}>
                        <step.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-bold text-lg transition-colors ${activeStep === index ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                            }`}>
                            {step.title}
                          </h3>
                          {activeStep === index && <ChevronRight className="w-4 h-4 text-primary animate-pulse" />}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 group-hover:text-muted-foreground/80 transition-colors">
                          {step.subtitle}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Glass Terminal */}
            <div className="relative">
              {/* Decorative Glows */}
              <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-[3rem] -z-10" />

              <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-2xl shadow-2xl overflow-hidden glass-terminal">
                {/* Terminal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-muted/20">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${activeStep === 1 ? 'bg-yellow-500' : 'bg-green-500'}`} />
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                      {codeSteps[activeStep].fileName}
                    </span>
                  </div>
                  <div className="w-12" /> {/* Spacer */}
                </div>

                {/* Code Body */}
                <div className="p-4 sm:p-8 font-mono text-xs sm:text-sm h-[320px] sm:h-[450px] overflow-y-auto scrollbar-hide" ref={codeRef}>
                  {activeStep === 1 ? (
                    <div className="space-y-3">
                      {(codeSteps[1].code as any[]).map((line, i) => (
                        <div key={i} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                          <span className={line.status === 'success' ? 'text-green-400' : 'text-primary/60 animate-pulse'}>
                            {line.status === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : '⎊'}
                          </span>
                          <span className={line.status === 'success' ? 'text-foreground/90' : 'text-muted-foreground italic'}>
                            {line.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <pre className="text-foreground/80 leading-[1.8] whitespace-pre-wrap">
                      <code className={`language-${codeSteps[activeStep].language}`}>
                        {codeSteps[activeStep].code as string}
                      </code>
                    </pre>
                  )}
                </div>

                {/* Terminal Footer */}
                <div className="px-6 py-3 border-t border-border/30 bg-muted/10 flex items-center justify-between">
                  <span className="text-[9px] font-mono text-muted-foreground/60">
                    UTF-8 • {codeSteps[activeStep].language.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-[9px] font-mono text-primary/60">Ready</span>
                    <div className="h-1 w-20 bg-muted/30 rounded-full overflow-hidden">
                      <div className="h-full bg-primary/40 w-2/3" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Float Decorations */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/10 rounded-full blur-2xl animate-pulse" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
