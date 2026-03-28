import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CTA() {
  return (
    <section className="py-20 lg:py-32 relative">
      <div className="container mx-auto px-4 lg:px-8 relative">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-2xl p-12 lg:p-16 text-center relative">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-foreground text-background flex items-center justify-center mx-auto mb-6">
                <img
                  src="/brain.svg"
                  alt=""
                  width={40}
                  height={40}
                  loading="lazy"
                  decoding="async"
                  className="w-[60%] h-[60%]"
                />
              </div>

              <h2 className="text-3xl lg:text-5xl font-bold tracking-tight mb-6 text-balance">
                Deploy to CDN in one click
              </h2>

              <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto text-balance leading-relaxed">
                Join developers who are shipping faster with Neura CDN. Generate your first component and see it live in
                seconds.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/dashboard">
                  <Button size="lg" className="group">
                    Generate Your First Component
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}