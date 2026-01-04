import { Terminal, Github, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" width={18} height={18} className="bg-white p-0.5 rounded-full" />
            <span className="font-semibold">Neura CDN</span>
          </div>
          <span className="text-muted-foreground hidden md:inline">•</span>
          <p className="text-muted-foreground">© 2025 All rights reserved.</p>
        </div>

        <div className="flex items-center gap-6 text-muted-foreground">
          <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
          <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
          <div className="flex items-center gap-3 ml-2 border-l border-border pl-5">
            <a href="https://github.com/yashk40/Neuracdn" className="hover:text-foreground transition-colors" aria-label="GitHub">
              <Github className="h-4 w-4" />
            </a>
            <a href="#" className="hover:text-foreground transition-colors" aria-label="Twitter">
              <Twitter className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
