import { Code2, Eye, Upload, Zap } from "lucide-react"

const steps = [
  {
    icon: Code2,
    title: "Generate Component",
    description: "Call the API with your component specs. Describe what you need, get production-ready code.",
  },
  {
    icon: Eye,
    title: "Watch Compile",
    description: "See real-time compilation feedback. Watch your component build with live status updates.",
  },
  {
    icon: Upload,
    title: "Deploy to CDN",
    description: "Instant deployment to GitHub-powered CDN. Your component is live and cached globally.",
  },
  {
    icon: Zap,
    title: "Use Anywhere",
    description: "Import via CDN URL in any project. Style with utility classes. No build step needed.",
  },
]

export function Workflow() {
  return (
    <section id="workflow" className="py-20 lg:py-32 border-t border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight mb-4">How it works</h2>
          <p className="text-lg text-muted-foreground text-balance">
            From idea to production in four simple steps. No configuration, no build tools, no hassle.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.title} className="relative group">
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-px bg-border" />
              )}

              <div className="relative bg-card border border-border rounded-lg p-6 hover:border-foreground/20 transition-colors">
                {/* Step number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-sm font-mono font-bold">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4 group-hover:bg-foreground group-hover:text-background transition-colors">
                  <step.icon className="h-6 w-6" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
