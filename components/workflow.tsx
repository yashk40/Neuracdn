"use client"

import { Code2, Eye, Upload, Zap, ArrowRight } from "lucide-react"
import { useEffect, useRef } from "react"
import { gsap } from "gsap"

const steps = [
  {
    icon: Code2,
    title: "Generate Component",
    description: "Call the API with your component specs. Describe what you need, get production-ready code.",
    color: "from-white to-white",
  },
  {
    icon: Eye,
    title: "Watch Compile",
    description: "See real-time compilation feedback. Watch your component build with live status updates.",
    color: "from-white to-white",
  },
  {
    icon: Upload,
    title: "Deploy to CDN",
    description: "Instant deployment to GitHub-powered CDN. Your component is live and cached globally.",
    color: "from-white to-white",
  },
  {
    icon: Zap,
    title: "Use Anywhere",
    description: "Import via CDN URL in any project. Style with utility classes. No build step needed.",
    color: "from-white to-white",
  },
]

export function Workflow() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const cards = containerRef.current.querySelectorAll(".workflow-card")
    const lines = containerRef.current.querySelectorAll(".connection-line")

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          gsap.fromTo(cards,
            { opacity: 0, y: 30, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.15, ease: "power4.out" }
          )
          gsap.fromTo(lines,
            { scaleX: 0 },
            { scaleX: 1, duration: 1, delay: 0.5, stagger: 0.2, ease: "power2.inOut" }
          )
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.2 })

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="workflow" className="relative py-24 lg:py-40 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium uppercase tracking-wider mb-6">
            <Sparkles className="w-3 h-3" />
            <span>Process</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
            How it works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From idea to production in four simple steps. No configuration, no build tools, no hassle.
          </p>
        </div>

        <div ref={containerRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 max-w-7xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.title} className="relative group workflow-card opacity-0">
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-[4.5rem] left-[80%] w-[calc(100%-20%)] h-[2px] z-0 overflow-hidden">
                  <div className="connection-line w-full h-full bg-gradient-to-r from-primary/30 to-transparent origin-left" />
                </div>
              )}

              <div className="relative z-10 h-full p-8 rounded-2xl bg-card/40 backdrop-blur-xl border border-white/5 hover:border-primary/30 hover:bg-card/60 transition-all duration-500 group">
                {/* Step Number */}
                {/* <div className="absolute -top-4 -right-2 text-6xl font-black text-foreground/5 pointer-events-none group-hover:text-primary/10 transition-colors">
                  0{index + 1}
                </div> */}

                {/* Icon Container with Glow */}
                <div className="relative w-14 h-14 mb-8">
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-20 blur-lg rounded-xl group-hover:opacity-40 transition-opacity`} />
                  <div className={`relative w-full h-full rounded-xl bg-gradient-to-br ${step.color} p-[1px]`}>
                    <div className="w-full h-full rounded-[11px] bg-background flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-foreground group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm lg:text-base">
                    {step.description}
                  </p>
                </div>

                {/* Bottom Decor */}
                <div className="absolute bottom-4 right-8 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-500">
                  <ArrowRight className="w-5 h-5 text-primary" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Sparkles({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  )
}
