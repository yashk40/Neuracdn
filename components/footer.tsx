import { Terminal, Github, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8 py-12 flex flex-col md:flex-row justify-between items-center gap-6">

        {/* Brand Section */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-brain-icon lucide-brain"><path d="M12 18V5"/><path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4"/><path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5"/><path d="M17.997 5.125a4 4 0 0 1 2.526 5.77"/><path d="M18 18a4 4 0 0 0 2-7.464"/><path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517"/><path d="M6 18a4 4 0 0 1-2-7.464"/><path d="M6.003 5.125a4 4 0 0 0-2.526 5.77"/></svg>
            <span className="font-bold text-lg">Neura CDN</span>
          </div>
          <p className="text-sm text-muted-foreground text-center md:text-left">
            Smart component delivery for modern developers.
          </p>
        </div>

        {/* Links & Socials */}
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <nav className="flex items-center gap-6 text-sm text-muted-foreground font-medium">
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
          </nav>

          <div className="flex items-center gap-3">
            <a href="#" className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:border-foreground hover:bg-background transition-all text-muted-foreground hover:text-foreground" aria-label="GitHub">
              <Github className="h-4 w-4" />
            </a>
            <a href="#" className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:border-foreground hover:bg-background transition-all text-muted-foreground hover:text-foreground" aria-label="Twitter">
              <Twitter className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-border/50 bg-muted/50">
        <div className="container mx-auto px-4 py-4 text-center text-xs text-muted-foreground">
          © 2025 Neura CDN. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
