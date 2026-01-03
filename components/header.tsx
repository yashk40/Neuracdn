import { Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="h-6 w-6" />
            <span className="text-xl font-bold tracking-tight">Neura CDN</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#workflow" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How it Works
            </a>
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/auth">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                Sign In
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
