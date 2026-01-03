import { Blocks, Gauge, Lock, Palette, Rocket, Zap } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Zero Setup",
    description: "No build tools, no config files, no dependencies. Just an API call and you're done.",
  },
  {
    icon: Gauge,
    title: "Live Compilation",
    description: "Real-time feedback as your component compiles. See every step from generation to deployment.",
  },
  {
    icon: Rocket,
    title: "Instant Deployment",
    description: "Components deploy to GitHub CDN in seconds. Globally cached and ready to use immediately.",
  },
  {
    icon: Blocks,
    title: "Reusable Components",
    description: "Use the same component across multiple projects via CDN URL. Update once, apply everywhere.",
  },
  {
    icon: Palette,
    title: "Style Flexibility",
    description: "Add or modify CSS utility classes on the fly. Customize without touching the source.",
  },
  {
    icon: Lock,
    title: "GitHub-Powered",
    description: "Built on GitHub infrastructure. Version control and reliability baked in by default.",
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 lg:py-32 border-t border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight mb-4">
            Built for speed and developer experience
          </h2>
          <p className="text-lg text-muted-foreground text-balance">
            Everything you need to generate, compile, and deploy components without the overhead.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative bg-card border border-border rounded-lg p-6 hover:border-foreground/20 transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4 group-hover:bg-foreground group-hover:text-background transition-colors">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto mt-20 pt-20 border-t border-border">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">2.3s</div>
            <div className="text-sm text-muted-foreground">Average compile time</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">100%</div>
            <div className="text-sm text-muted-foreground">GitHub uptime</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">0</div>
            <div className="text-sm text-muted-foreground">Configuration needed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">∞</div>
            <div className="text-sm text-muted-foreground">Projects supported</div>
          </div>
        </div>
      </div>
    </section>
  )
}
