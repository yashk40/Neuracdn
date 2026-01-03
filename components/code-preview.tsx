"use client"

import { useState, useEffect } from "react"

const codeSteps = [
  {
    title: "API Request",
    code: `fetch('https://api.neura-cdn.com/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    component: 'Button',
    variant: 'primary',
    framework: 'react'
  })
})`,
  },
  {
    title: "Live Compilation",
    code: `● Generating component...
● Running TypeScript checks...
✓ Type checking complete
● Bundling with esbuild...
✓ Bundle optimized (2.1kb)
● Deploying to GitHub CDN...
✓ Deployed successfully`,
  },
  {
    title: "Use in Your Project",
    code: `import Button from 'https://cdn.neura.io/button'

export default function App() {
  return (
    <Button className="px-6 py-3 rounded-lg">
      Click me
    </Button>
  )
}`,
  },
]

export function CodePreview() {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % codeSteps.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Description */}
            <div>
              <h2 className="text-3xl lg:text-5xl font-bold tracking-tight mb-6">See it compile in real-time</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Full transparency into the build process. Watch your component go from API request to deployed CDN URL
                with live compilation feedback.
              </p>

              <div className="space-y-4">
                {codeSteps.map((step, index) => (
                  <button
                    key={step.title}
                    onClick={() => setActiveStep(index)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      activeStep === index
                        ? "border-foreground bg-card"
                        : "border-border bg-transparent hover:border-foreground/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm font-mono transition-colors ${
                          activeStep === index ? "border-foreground bg-foreground text-background" : "border-border"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className="font-semibold">{step.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Code window */}
            <div className="relative">
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                {/* Window header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-border" />
                    <div className="w-3 h-3 rounded-full bg-border" />
                    <div className="w-3 h-3 rounded-full bg-border" />
                  </div>
                  <span className="text-xs ml-2 font-mono text-muted-foreground">
                    {codeSteps[activeStep].title.toLowerCase().replace(/\s+/g, "-")}.ts
                  </span>
                </div>

                {/* Code content */}
                <div className="p-6 font-mono text-sm min-h-[300px] overflow-x-auto">
                  <pre className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {codeSteps[activeStep].code}
                  </pre>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-foreground/5 rounded-full blur-3xl" />
              <div className="absolute -top-4 -left-4 w-32 h-32 bg-foreground/5 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
