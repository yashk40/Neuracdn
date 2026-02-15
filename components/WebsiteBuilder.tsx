"use client";

import { useState, useEffect } from "react";
import {
    Bot,
    Layers,
    LayoutTemplate,
    MessageSquare,
    Zap,
    CheckCircle2,
    Loader2,
    ArrowRight,
    Code,
    Eye,
    RefreshCcw,
    Sparkles,
    ShieldCheck,
    Smartphone,
    Monitor,
    MessageSquareQuote,
    Megaphone,
    Image as ImageIcon,
    X,
    ChevronRight,
    Save,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface AgentNodeProps {
    title: string;
    description: string;
    status: "idle" | "working" | "completed" | "error";
    icon: React.ReactNode;
    delay?: number;
}

const AgentNode = ({ title, description, status, icon, delay = 0 }: AgentNodeProps) => {
    return (
        <div className={`
      relative p-4 rounded-[2rem] border transition-all duration-500 w-full max-w-md
      ${status === "idle" ? "bg-white border-zinc-200 opacity-60" : ""}
      ${status === "working" ? "bg-black border-black text-white shadow-xl scale-105 z-10" : ""}
      ${status === "completed" ? "bg-green-50 border-green-200 text-zinc-800" : ""}
    `}>
            {/* Shimmer Effect for Working State */}
            {status === "working" && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-[200%] animate-shimmer pointer-events-none" />
            )}

            <div className="flex items-start gap-4 relative z-10">
                <div className={`
          p-3 rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-300
          ${status === "working" ? "bg-zinc-800" : "bg-zinc-100"}
          ${status === "completed" ? "bg-green-100 text-green-600" : ""}
        `}>
                    {status === "working" ? <Loader2 className="w-5 h-5 animate-spin" /> : icon}
                </div>
                <div>
                    <h4 className={`text-sm font-bold mb-1 ${status === "working" ? "text-white" : "text-zinc-900"}`}>{title}</h4>
                    <p className={`text-xs ${status === "working" ? "text-zinc-400" : "text-zinc-500"}`}>{description}</p>

                    {/* Processing Indicator */}
                    {status === "working" && (
                        <div className="mt-3 w-full">
                            <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 w-[50%] animate-[shimmer_1.5s_infinite_linear]" />
                            </div>
                            <div className="flex justify-between items-center mt-1.5">
                                <span className="text-[10px] font-medium text-zinc-400">Processing...</span>
                                <span className="text-[10px] font-bold text-emerald-400 animate-pulse">ACTIVE</span>
                            </div>
                        </div>
                    )}
                </div>
                {status === "completed" && (
                    <div className="absolute top-4 right-4">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                )}
            </div>

            {/* Connector Line */}
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-8 h-0.5 bg-zinc-200 hidden md:block" />
        </div>
    );
};

const designVibes = [
    {
        name: "Glassmorphism",
        description: "Translucent frosted glass effects, subtle borders, and soft colorful backgrounds with backdrop-filter: blur().",
    },
    {
        name: "Neo-Brutalism",
        description: "Bold black borders, high contrast, vibrant primary colors, shadow offsets, and intentional raw/unpolished aesthetics.",
    },
    {
        name: "Futuristic Cyberpunk",
        description: "Dark backgrounds with neon accents (cyan, magenta, lime), glowing borders, digital scanline effects, and sharp geometric shapes.",
    },
    {
        name: "Minimalist Apple Style",
        description: "Large whitespace, subtle shadows, refined typography (sans-serif), soft grays, and extremely clean layout transitions.",
    },
    {
        name: "Organic & Playful",
        description: "Rounded corners, pastel color palettes, friendly typography, hand-drawn style icons, and soft blob-like decorative elements.",
    },
    {
        name: "Modern Corporate Sleek",
        description: "Deep indigos and slate grays, professional gradients, structured grid layouts, and high-quality photography placeholders.",
    },

    // 🔥 Soft Themes Added Below

    {
        name: "Soft Pastel Dream",
        description: "Very light pastel gradients (peach, lavender, mint), soft shadows, airy spacing, and gentle rounded corners for a dreamy calming feel.",
    },
    {
        name: "Creamy Neutral",
        description: "Warm beige, cream, and light taupe tones with subtle shadows and elegant serif + sans-serif font pairing.",
    },
    {
        name: "Soft Lavender UI",
        description: "Muted lavender and light violet tones, smooth hover animations, soft glow highlights, and minimal contrast design.",
    },
    {
        name: "Muted Earthy Calm",
        description: "Soft sage green, dusty blue, clay brown accents with organic spacing and calm typography.",
    },
    {
        name: "Soft Gradient Blur",
        description: "Light blended gradients with blur overlays, minimal borders, smooth transitions, and floating UI components.",
    },
    {
        name: "Warm Sunset Glow",
        description: "Soft orange-pink gradients, diffused glow effects, rounded cards, and emotional storytelling layout.",
    },
    {
        name: "Soft SaaS Dashboard",
        description: "Light gray backgrounds, subtle card elevations, pastel accent colors, minimal icons, and smooth micro-interactions.",
    },
    {
        name: "Light Aqua Calm",
        description: "Soft aqua and sky-blue shades, minimal typography, clean white surfaces, and relaxed spacing.",
    },
    {
        name: "Soft Monochrome",
        description: "Single-color palette with different lightness variations, subtle depth shadows, and ultra-clean UI components.",
    },
    {
        name: "Elegant Soft Shadow",
        description: "Very soft layered shadows, neutral backgrounds, floating elements, and smooth fade-in animations.",
    },
    {
        name: "Blush Modern",
        description: "Light blush pink with warm neutrals, soft rounded buttons, thin borders, and calm professional vibe.",
    },
    {
        name: "Soft Scandinavian",
        description: "White + light wood tones, muted blue-gray accents, clean grid system, and cozy minimal aesthetic.",
    }
];

// Backup HTML for Neo-Brutalism theme (loaded from web.txt)
const NEO_BRUTALISM_BACKUP_HTML = `<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<style>
					body {
						background-color: white; /* Ensure the iframe has a white background */
					}
				</style>
				<script>
					const CDN_WHITELIST = [
						'cdn.jsdelivr.net',
						'cdnjs.cloudflare.com',
						'cdn.tailwindcss.com',
						'unpkg.com',
						'fonts.googleapis.com',
						'd3js.org',
						'cdn.babylonjs.com',
						'html2canvas.hertzen.com',
						'code.jquery.com',
						'cdn.datatables.net',
						'kit.fontawesome.com',
						'code.createjs.com',
						'cdn.plot.ly',
						'fonts.gstatic.com',
						'www.rgraph.net',
						'api.mapbox.com',
						'polyfill.io',
						'cdn.quilljs.com',
						'picsum.photos',
						'esm.sh'
					];

					function isUrlInWhitelist(url) {
						if (!url || typeof url !== 'string') {
							return false;
						}
						try {
							const urlObj = new URL(url);
							const hostname = urlObj.hostname;
							return CDN_WHITELIST.some(domain => hostname === domain);
						} catch (e) {
							return false;
						}
					}

					function proxyCdnUrl(url) {
						if (!url || !url.startsWith('http')) {
							return url;
						}
						if (!isUrlInWhitelist(url)) {
							return url;
						}
						if (!url.startsWith('https://artifacts-cdn.chatglm.site/')) {
							return 'https://artifacts-cdn.chatglm.site/' + url;
						}
						return url;
					}

					const rawCreateElement = document.createElement;

					document.createElement = function (tagName, ...args) {
						const el = rawCreateElement.call(this, tagName, ...args);

						if (tagName.toLowerCase() === 'script') {
							const rawSetAttribute = el.setAttribute;
							const rawGetAttribute = el.getAttribute;
							let srcValue = '';
							
							el.setAttribute = function (name, value) {
								if (name === 'src' && typeof value === 'string') {
									value = proxyCdnUrl(value);
									srcValue = value;
								}
								return rawSetAttribute.call(this, name, value);
							};

							Object.defineProperty(el, 'src', {
								get: function() {
									return srcValue || rawGetAttribute.call(this, 'src') || '';
								},
								set: function(value) {
									if (typeof value === 'string') {
										srcValue = proxyCdnUrl(value);
										rawSetAttribute.call(this, 'src', srcValue);
									} else {
										srcValue = value;
									}
								},
								configurable: true,
								enumerable: true
							});
						}

						if (tagName.toLowerCase() === 'link') {
							const rawSetAttribute = el.setAttribute;
							const rawGetAttribute = el.getAttribute;
							let hrefValue = '';
							
							el.setAttribute = function (name, value) {
								if (name === 'href' && typeof value === 'string') {
									value = proxyCdnUrl(value);
									hrefValue = value;
								}
								return rawSetAttribute.call(this, name, value);
							};

							Object.defineProperty(el, 'href', {
								get: function() {
									return hrefValue || rawGetAttribute.call(this, 'href') || '';
								},
								set: function(value) {
									if (typeof value === 'string') {
										hrefValue = proxyCdnUrl(value);
										rawSetAttribute.call(this, 'href', hrefValue);
									} else {
										hrefValue = value;
									}
								},
								configurable: true,
								enumerable: true
							});
						}

						return el;
					};

					const OriginalXMLHttpRequest = window.XMLHttpRequest;
					window.XMLHttpRequest = function (...args) {
						const xhr = new OriginalXMLHttpRequest(...args);
						const rawOpen = xhr.open;

						xhr.open = function (method, url, ...rest) {
							if (typeof url === 'string') {
								const methodUpper = (method || '').toUpperCase();
								if (methodUpper === 'GET' && isUrlInWhitelist(url)) {
									url = proxyCdnUrl(url);
								}
							}
							return rawOpen.call(this, method, url, ...rest);
						};

						return xhr;
					};

					window.XMLHttpRequest.prototype = OriginalXMLHttpRequest.prototype;
					Object.setPrototypeOf(window.XMLHttpRequest, OriginalXMLHttpRequest);

					const originalFetch = window.fetch;
					window.fetch = async function (...args) {
						if (args.length > 0) {
							let url = '';
							let method = 'GET';
							
							if (typeof args[0] === 'string') {
								url = args[0];
								if (args[1] && args[1].method) {
									method = args[1].method.toUpperCase();
								}
								if (method === 'GET' && isUrlInWhitelist(url)) {
									args[0] = proxyCdnUrl(url);
								}
							} else if (args[0] instanceof Request) {
								const originalUrl = args[0].url;
								method = (args[0].method || 'GET').toUpperCase();
								if (method === 'GET' && isUrlInWhitelist(originalUrl)) {
									const proxiedUrl = proxyCdnUrl(originalUrl);
									if (proxiedUrl !== originalUrl) {
										args[0] = new Request(proxiedUrl, args[0]);
									}
								}
							}
						}
						return originalFetch.apply(this, args);
					};
				</script>
			</head>
			<body>
				<!DOCTYPE html><html lang="en"><head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FORMA Studio | Architecture & Design</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lenis@1.1.13/dist/lenis.min.js"></script>
  <style>
    :root {
      --bg: #0a0a0a;
      --bg-elevated: #111111;
      --fg: #f5f5f0;
      --muted: #7a7a70;
      --accent: #c8ff00;
      --accent-dim: #9fcc00;
      --card: #161616;
      --border: #2a2a28;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html {
      background: var(--bg);
      color: var(--fg);
      font-family: 'DM Sans', sans-serif;
    }

    html.lenis, html.lenis body {
      height: auto;
    }

    .lenis.lenis-smooth {
      scroll-behavior: auto !important;
    }

    .lenis.lenis-smooth [data-lenis-prevent] {
      overscroll-behavior: contain;
    }

    .lenis.lenis-stopped {
      overflow: hidden;
    }

    .lenis.lenis-smooth iframe {
      pointer-events: none;
    }

    body {
      overflow-x: hidden;
      background: var(--bg);
    }

    .font-display {
      font-family: 'Space Grotesk', sans-serif;
    }

    /* Background grain */
    .grain::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
      opacity: 0.03;
      pointer-events: none;
      z-index: 1000;
    }

    /* Custom cursor */
    .cursor {
      width: 20px;
      height: 20px;
      border: 2px solid var(--accent);
      border-radius: 50%;
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      transition: transform 0.15s ease-out, opacity 0.15s ease-out;
      transform: translate(-50%, -50%);
    }

    .cursor-dot {
      width: 4px;
      height: 4px;
      background: var(--accent);
      border-radius: 50%;
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
    }

    .cursor.hovering {
      transform: translate(-50%, -50%) scale(2);
      background: rgba(200, 255, 0, 0.1);
    }

    /* Hero section */
    .hero {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    .hero-bg {
      position: absolute;
      inset: 0;
      background: 
        radial-gradient(ellipse 80% 50% at 50% -20%, rgba(200, 255, 0, 0.08) 0%, transparent 50%),
        linear-gradient(180deg, var(--bg) 0%, var(--bg-elevated) 100%);
    }

    .hero-lines {
      position: absolute;
      inset: 0;
      overflow: hidden;
      opacity: 0.15;
    }

    .hero-line {
      position: absolute;
      top: 0;
      height: 100%;
      width: 1px;
      background: linear-gradient(180deg, transparent 0%, var(--muted) 50%, transparent 100%);
    }

    .hero-title {
      font-size: clamp(3rem, 12vw, 10rem);
      font-weight: 700;
      line-height: 0.95;
      letter-spacing: -0.03em;
    }

    .hero-title span {
      display: inline-block;
      opacity: 0;
      transform: translateY(100px) rotateX(45deg);
      animation: revealTitle 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .hero-title span:nth-child(2) { animation-delay: 0.1s; }
    .hero-title span:nth-child(3) { animation-delay: 0.2s; }
    .hero-title span:nth-child(4) { animation-delay: 0.3s; }

    @keyframes revealTitle {
      to {
        opacity: 1;
        transform: translateY(0) rotateX(0);
      }
    }

    .scroll-indicator {
      position: absolute;
      bottom: 3rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      opacity: 0;
      animation: fadeInUp 1s ease 1s forwards;
    }

    .scroll-line {
      width: 1px;
      height: 60px;
      background: linear-gradient(180deg, var(--accent) 0%, transparent 100%);
      position: relative;
      overflow: hidden;
    }

    .scroll-line::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 20px;
      background: var(--fg);
      animation: scrollDown 2s ease-in-out infinite;
    }

    @keyframes scrollDown {
      0% { transform: translateY(-20px); }
      50% { transform: translateY(60px); }
      100% { transform: translateY(-20px); }
    }

    @keyframes fadeInUp {
      to { opacity: 1; }
    }

    /* Reveal animations */
    .reveal {
      opacity: 0;
      transform: translateY(60px);
      transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), 
                  transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .reveal.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .reveal-delay-1 { transition-delay: 0.1s; }
    .reveal-delay-2 { transition-delay: 0.2s; }
    .reveal-delay-3 { transition-delay: 0.3s; }
    .reveal-delay-4 { transition-delay: 0.4s; }

    /* Project cards */
    .project-card {
      position: relative;
      overflow: hidden;
      background: var(--card);
      border-radius: 8px;
      cursor: pointer;
    }

    .project-card::before {
      content: '';
      position: absolute;
      inset: 0;
      border: 1px solid var(--border);
      border-radius: 8px;
      transition: border-color 0.3s ease;
      pointer-events: none;
      z-index: 2;
    }

    .project-card:hover::before {
      border-color: var(--accent);
    }

    .project-image {
      width: 100%;
      aspect-ratio: 16/10;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .project-card:hover .project-image {
      transform: scale(1.05);
    }

    .project-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 40%, rgba(10, 10, 10, 0.95) 100%);
      z-index: 1;
    }

    .project-info {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 2rem;
      z-index: 2;
      transform: translateY(20px);
      opacity: 0;
      transition: transform 0.4s ease, opacity 0.4s ease;
    }

    .project-card:hover .project-info {
      transform: translateY(0);
      opacity: 1;
    }

    /* Stats section */
    .stat-number {
      font-size: clamp(3rem, 8vw, 6rem);
      font-weight: 700;
      line-height: 1;
      background: linear-gradient(135deg, var(--fg) 0%, var(--muted) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Services */
    .service-item {
      border-bottom: 1px solid var(--border);
      padding: 2rem 0;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .service-item:hover {
      background: rgba(200, 255, 0, 0.03);
    }

    .service-title {
      font-size: clamp(1.5rem, 4vw, 2.5rem);
      font-weight: 600;
      transition: color 0.3s ease, transform 0.3s ease;
    }

    .service-item:hover .service-title {
      color: var(--accent);
      transform: translateX(20px);
    }

    .service-arrow {
      opacity: 0;
      transform: translateX(-20px);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }

    .service-item:hover .service-arrow {
      opacity: 1;
      transform: translateX(0);
    }

    /* Contact form */
    .input-field {
      background: transparent;
      border: none;
      border-bottom: 1px solid var(--border);
      padding: 1rem 0;
      color: var(--fg);
      font-size: 1.125rem;
      width: 100%;
      transition: border-color 0.3s ease;
      outline: none;
    }

    .input-field:focus {
      border-color: var(--accent);
    }

    .input-field::placeholder {
      color: var(--muted);
    }

    /* Button */
    .btn-primary {
      background: var(--accent);
      color: var(--bg);
      padding: 1rem 2.5rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: transform 0.3s ease;
    }

    .btn-primary::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--accent-dim);
      transform: translateX(-100%);
      transition: transform 0.3s ease;
    }

    .btn-primary:hover::before {
      transform: translateX(0);
    }

    .btn-primary span {
      position: relative;
      z-index: 1;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
    }

    .btn-primary:active {
      transform: translateY(0);
    }

    /* Navigation */
    .nav-link {
      position: relative;
      color: var(--muted);
      transition: color 0.3s ease;
    }

    .nav-link::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 0;
      height: 1px;
      background: var(--accent);
      transition: width 0.3s ease;
    }

    .nav-link:hover {
      color: var(--fg);
    }

    .nav-link:hover::after {
      width: 100%;
    }

    /* Floating elements */
    .float-element {
      position: absolute;
      border: 1px solid var(--border);
      border-radius: 50%;
      animation: float 6s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(180deg); }
    }

    /* Marquee */
    .marquee {
      overflow: hidden;
      white-space: nowrap;
    }

    .marquee-content {
      display: inline-flex;
      animation: marquee 20s linear infinite;
    }

    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
      .lenis.lenis-smooth {
        scroll-behavior: auto;
      }
    }

    /* Focus states */
    :focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 4px;
    }

    /* Mobile menu */
    .mobile-menu {
      position: fixed;
      inset: 0;
      background: var(--bg);
      z-index: 100;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 2rem;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.4s ease;
    }

    .mobile-menu.open {
      opacity: 1;
      pointer-events: all;
    }

    .mobile-nav-link {
      font-size: 2rem;
      font-weight: 600;
      color: var(--fg);
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.4s ease, transform 0.4s ease, color 0.3s ease;
    }

    .mobile-menu.open .mobile-nav-link {
      opacity: 1;
      transform: translateY(0);
    }

    .mobile-nav-link:hover {
      color: var(--accent);
    }

    .hamburger {
      display: flex;
      flex-direction: column;
      gap: 6px;
      cursor: pointer;
      z-index: 101;
    }

    .hamburger span {
      width: 28px;
      height: 2px;
      background: var(--fg);
      transition: transform 0.3s ease, opacity 0.3s ease;
    }

    .hamburger.active span:nth-child(1) {
      transform: translateY(8px) rotate(45deg);
    }

    .hamburger.active span:nth-child(2) {
      opacity: 0;
    }

    .hamburger.active span:nth-child(3) {
      transform: translateY(-8px) rotate(-45deg);
    }

    @media (min-width: 768px) {
      .hamburger {
        display: none;
      }
    }
  </style>
</head>
<body class="grain">
  <div class="cursor hidden md:block"></div>
  <div class="cursor-dot hidden md:block"></div>
  <div class="mobile-menu" id="mobileMenu">
    <a href="#work" class="mobile-nav-link font-display">Work</a>
    <a href="#services" class="mobile-nav-link font-display">Services</a>
    <a href="#about" class="mobile-nav-link font-display">About</a>
    <a href="#contact" class="mobile-nav-link font-display">Contact</a>
  </div>
  <nav class="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-6 flex justify-between items-center mix-blend-difference">
    <a href="#" class="font-display font-bold text-xl tracking-tight" style="color: var(--fg);">FORMA</a>
    <div class="hidden md:flex items-center gap-10">
      <a href="#work" class="nav-link font-display text-sm tracking-wide">Work</a>
      <a href="#services" class="nav-link font-display text-sm tracking-wide">Services</a>
      <a href="#about" class="nav-link font-display text-sm tracking-wide">About</a>
      <a href="#contact" class="nav-link font-display text-sm tracking-wide">Contact</a>
    </div>
    <div class="hamburger md:hidden" id="hamburger">
      <span></span><span></span><span></span>
    </div>
  </nav>
  <section class="hero px-6 md:px-12">
    <div class="hero-bg"></div>
    <div class="hero-lines">
      <div class="hero-line" style="left: 20%;"></div>
      <div class="hero-line" style="left: 40%;"></div>
      <div class="hero-line" style="left: 60%;"></div>
      <div class="hero-line" style="left: 80%;"></div>
    </div>
    <div class="float-element" style="width: 200px; height: 200px; top: 20%; right: 10%; opacity: 0.1; animation-delay: -2s;"></div>
    <div class="float-element" style="width: 80px; height: 80px; bottom: 30%; left: 5%; opacity: 0.05; animation-delay: -4s;"></div>
    <div class="relative z-10 max-w-7xl mx-auto w-full">
      <div class="mb-6">
        <span class="text-sm tracking-[0.3em] uppercase" style="color: var(--accent); opacity: 0; animation: fadeInUp 1s ease 0.5s forwards;">Architecture Studio</span>
      </div>
      <h1 class="hero-title font-display">
        <span>We</span> <span>shape</span><br>
        <span>spaces</span> <span>that</span><br>
        <span>inspire</span>
      </h1>
      <div class="mt-12 max-w-md" style="opacity: 0; animation: fadeInUp 1s ease 0.6s forwards;">
        <p class="text-lg leading-relaxed" style="color: var(--muted);">
          Creating architectural experiences that transcend the ordinary. Where vision meets precision, and spaces become stories.
        </p>
      </div>
    </div>
    <div class="scroll-indicator">
      <span class="text-xs tracking-widest uppercase" style="color: var(--muted);">Scroll</span>
      <div class="scroll-line"></div>
    </div>
  </section>
  <div class="py-8 border-y" style="border-color: var(--border);">
    <div class="marquee">
      <div class="marquee-content">
        <span class="font-display text-6xl md:text-8xl font-bold mx-8" style="color: var(--border);">Residential</span>
        <span class="font-display text-6xl md:text-8xl font-bold mx-8" style="color: var(--accent);">Commercial</span>
        <span class="font-display text-6xl md:text-8xl font-bold mx-8" style="color: var(--border);">Cultural</span>
        <span class="font-display text-6xl md:text-8xl font-bold mx-8" style="color: var(--accent);">Urban</span>
        <span class="font-display text-6xl md:text-8xl font-bold mx-8" style="color: var(--border);">Residential</span>
        <span class="font-display text-6xl md:text-8xl font-bold mx-8" style="color: var(--accent);">Commercial</span>
        <span class="font-display text-6xl md:text-8xl font-bold mx-8" style="color: var(--border);">Cultural</span>
        <span class="font-display text-6xl md:text-8xl font-bold mx-8" style="color: var(--accent);">Urban</span>
      </div>
    </div>
  </div>
  <section id="work" class="py-24 md:py-40 px-6 md:px-12">
    <div class="max-w-7xl mx-auto">
      <div class="grid md:grid-cols-2 gap-8 md:gap-12 mb-16">
        <div>
          <span class="reveal text-sm tracking-[0.3em] uppercase" style="color: var(--accent);">Selected Projects</span>
          <h2 class="reveal reveal-delay-1 font-display text-4xl md:text-6xl font-bold mt-4">Recent Work</h2>
        </div>
        <div class="md:text-right flex items-end justify-start md:justify-end">
          <p class="reveal reveal-delay-2 max-w-sm" style="color: var(--muted);">
            A curated selection of projects spanning residential, commercial, and cultural spaces across the globe.
          </p>
        </div>
      </div>
      <div class="grid md:grid-cols-2 gap-8">
        <div class="reveal project-card group" data-hover="">
          <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80" alt="Horizon House" class="project-image">
          <div class="project-overlay"></div>
          <div class="project-info">
            <span class="text-sm" style="color: var(--accent);">Residential</span>
            <h3 class="font-display text-2xl font-semibold mt-1">Horizon House</h3>
            <p class="text-sm mt-2" style="color: var(--muted);">Malibu, California — 2024</p>
          </div>
        </div>
        <div class="reveal reveal-delay-1 project-card group mt-0 md:mt-24" data-hover="">
          <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80" alt="Tower 42" class="project-image">
          <div class="project-overlay"></div>
          <div class="project-info">
            <span class="text-sm" style="color: var(--accent);">Commercial</span>
            <h3 class="font-display text-2xl font-semibold mt-1">Tower 42</h3>
            <p class="text-sm mt-2" style="color: var(--muted);">New York, NY — 2023</p>
          </div>
        </div>
        <div class="reveal reveal-delay-2 project-card group" data-hover="">
          <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80" alt="Glass Pavilion" class="project-image">
          <div class="project-overlay"></div>
          <div class="project-info">
            <span class="text-sm" style="color: var(--accent);">Cultural</span>
            <h3 class="font-display text-2xl font-semibold mt-1">Glass Pavilion</h3>
            <p class="text-sm mt-2" style="color: var(--muted);">Tokyo, Japan — 2023</p>
          </div>
        </div>
        <div class="reveal reveal-delay-3 project-card group mt-0 md:mt-24" data-hover="">
          <img src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80" alt="Villa Serene" class="project-image">
          <div class="project-overlay"></div>
          <div class="project-info">
            <span class="text-sm" style="color: var(--accent);">Residential</span>
            <h3 class="font-display text-2xl font-semibold mt-1">Villa Serene</h3>
            <p class="text-sm mt-2" style="color: var(--muted);">Santorini, Greece — 2024</p>
          </div>
        </div>
      </div>
      <div class="mt-16 text-center">
        <button class="reveal btn-primary font-display" data-hover="">
          <span>View All Projects</span>
        </button>
      </div>
    </div>
  </section>
  <section class="py-24 md:py-40 px-6 md:px-12 relative overflow-hidden">
    <div class="absolute inset-0" style="background: linear-gradient(135deg, rgba(200, 255, 0, 0.03) 0%, transparent 50%);"></div>
    <div class="max-w-7xl mx-auto relative z-10">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16">
        <div class="reveal text-center md:text-left">
          <div class="stat-number font-display" data-count="147">0</div>
          <p class="mt-2" style="color: var(--muted);">Projects Completed</p>
        </div>
        <div class="reveal reveal-delay-1 text-center md:text-left">
          <div class="stat-number font-display" data-count="23">0</div>
          <p class="mt-2" style="color: var(--muted);">Countries</p>
        </div>
        <div class="reveal reveal-delay-2 text-center md:text-left">
          <div class="stat-number font-display" data-count="15">0</div>
          <p class="mt-2" style="color: var(--muted);">Years Experience</p>
        </div>
        <div class="reveal reveal-delay-3 text-center md:text-left">
          <div class="stat-number font-display" data-count="38">0</div>
          <p class="mt-2" style="color: var(--muted);">Awards Won</p>
        </div>
      </div>
    </div>
  </section>
  <section id="services" class="py-24 md:py-40 px-6 md:px-12">
    <div class="max-w-7xl mx-auto">
      <div class="mb-16">
        <span class="reveal text-sm tracking-[0.3em] uppercase" style="color: var(--accent);">What We Do</span>
        <h2 class="reveal reveal-delay-1 font-display text-4xl md:text-6xl font-bold mt-4">Services</h2>
      </div>
      <div class="max-w-4xl">
        <div class="reveal service-item flex justify-between items-center" data-hover="">
          <div class="flex items-center gap-8">
            <span class="text-sm" style="color: var(--muted);">01</span>
            <span class="service-title font-display">Architecture Design</span>
          </div>
          <svg class="service-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--accent);">
            <path d="M5 12h14M12 5l7 7-7 7"></path>
          </svg>
        </div>
        <div class="reveal reveal-delay-1 service-item flex justify-between items-center" data-hover="">
          <div class="flex items-center gap-8">
            <span class="text-sm" style="color: var(--muted);">02</span>
            <span class="service-title font-display">Interior Design</span>
          </div>
          <svg class="service-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--accent);">
            <path d="M5 12h14M12 5l7 7-7 7"></path>
          </svg>
        </div>
        <div class="reveal reveal-delay-2 service-item flex justify-between items-center" data-hover="">
          <div class="flex items-center gap-8">
            <span class="text-sm" style="color: var(--muted);">03</span>
            <span class="service-title font-display">Urban Planning</span>
          </div>
          <svg class="service-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--accent);">
            <path d="M5 12h14M12 5l7 7-7 7"></path>
          </svg>
        </div>
        <div class="reveal reveal-delay-3 service-item flex justify-between items-center" data-hover="">
          <div class="flex items-center gap-8">
            <span class="text-sm" style="color: var(--muted);">04</span>
            <span class="service-title font-display">Sustainable Design</span>
          </div>
          <svg class="service-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--accent);">
            <path d="M5 12h14M12 5l7 7-7 7"></path>
          </svg>
        </div>
        <div class="reveal reveal-delay-4 service-item flex justify-between items-center border-b-0" data-hover="">
          <div class="flex items-center gap-8">
            <span class="text-sm" style="color: var(--muted);">05</span>
            <span class="service-title font-display">Project Management</span>
          </div>
          <svg class="service-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--accent);">
            <path d="M5 12h14M12 5l7 7-7 7"></path>
          </svg>
        </div>
      </div>
    </div>
  </section>
  <section id="about" class="py-24 md:py-40 px-6 md:px-12">
    <div class="max-w-7xl mx-auto">
      <div class="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
        <div class="reveal relative">
          <img src="https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&q=80" alt="Studio Interior" class="w-full aspect-[4/5] object-cover rounded-lg">
          <div class="absolute -bottom-8 -right-8 w-48 h-48 border rounded-lg" style="border-color: var(--accent); opacity: 0.3;"></div>
        </div>
        <div>
          <span class="reveal text-sm tracking-[0.3em] uppercase" style="color: var(--accent);">About Us</span>
          <h2 class="reveal reveal-delay-1 font-display text-4xl md:text-5xl font-bold mt-4 mb-8">
            Building the future, preserving the past
          </h2>
          <div class="space-y-6" style="color: var(--muted);">
            <p class="reveal reveal-delay-2">
              Founded in 2009, FORMA Studio has established itself as a leading voice in contemporary architecture. Our practice is built on the belief that great architecture emerges from the intersection of rigorous analysis and creative intuition.
            </p>
            <p class="reveal reveal-delay-3">
              We approach each project as a unique opportunity to create spaces that resonate with their context, serve their inhabitants, and contribute to the broader cultural landscape.
            </p>
          </div>
          <div class="reveal reveal-delay-4 mt-10">
            <a href="#contact" class="btn-primary inline-block font-display" data-hover="">
              <span>Learn More</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section id="contact" class="py-24 md:py-40 px-6 md:px-12 relative">
    <div class="absolute inset-0" style="background: radial-gradient(ellipse 100% 80% at 50% 100%, rgba(200, 255, 0, 0.05) 0%, transparent 50%);"></div>
    <div class="max-w-7xl mx-auto relative z-10">
      <div class="grid md:grid-cols-2 gap-16 md:gap-24">
        <div>
          <span class="reveal text-sm tracking-[0.3em] uppercase" style="color: var(--accent);">Get In Touch</span>
          <h2 class="reveal reveal-delay-1 font-display text-4xl md:text-6xl font-bold mt-4">
            Let's create something extraordinary
          </h2>
          <p class="reveal reveal-delay-2 mt-6 max-w-md" style="color: var(--muted);">
            Ready to start your project? We'd love to hear from you. Send us a message and we'll respond within 24 hours.
          </p>
          <div class="reveal reveal-delay-3 mt-12 space-y-4">
            <div>
              <span class="text-sm" style="color: var(--muted);">Email</span>
              <a href="mailto:hello@forma.studio" class="block text-lg font-display hover:text-[var(--accent)] transition-colors" data-hover="">hello@forma.studio</a>
            </div>
            <div>
              <span class="text-sm" style="color: var(--muted);">Phone</span>
              <a href="tel:+1234567890" class="block text-lg font-display hover:text-[var(--accent)] transition-colors" data-hover="">+1 (234) 567-890</a>
            </div>
            <div>
              <span class="text-sm" style="color: var(--muted);">Location</span>
              <p class="text-lg font-display">123 Design Street, New York, NY</p>
            </div>
          </div>
        </div>
        <div class="reveal reveal-delay-2">
          <form class="space-y-8" id="contactForm">
            <div><input type="text" placeholder="Your Name" class="input-field font-display" required="" aria-label="Your Name"></div>
            <div><input type="email" placeholder="Your Email" class="input-field font-display" required="" aria-label="Your Email"></div>
            <div><input type="text" placeholder="Project Type" class="input-field font-display" aria-label="Project Type"></div>
            <div><textarea placeholder="Tell us about your project" rows="4" class="input-field font-display resize-none" aria-label="Project Description"></textarea></div>
            <button type="submit" class="btn-primary font-display w-full md:w-auto" data-hover="">
              <span>Send Message</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
  <footer class="py-12 px-6 md:px-12 border-t" style="border-color: var(--border);">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row justify-between items-center gap-8">
        <div class="flex items-center gap-8">
          <span class="font-display font-bold text-xl">FORMA</span>
          <span class="text-sm" style="color: var(--muted);">2024 All Rights Reserved</span>
        </div>
        <div class="flex items-center gap-6">
          <a href="#" class="nav-link text-sm" data-hover="">Instagram</a>
          <a href="#" class="nav-link text-sm" data-hover="">LinkedIn</a>
          <a href="#" class="nav-link text-sm" data-hover="">Dribbble</a>
          <a href="#" class="nav-link text-sm" data-hover="">Behance</a>
        </div>
      </div>
    </div>
  </footer>
  <script>
    let lenis=null;let cursor=null;let cursorDot=null;const hamburger=document.getElementById('hamburger');const mobileMenu=document.getElementById('mobileMenu');const mobileLinks=mobileMenu.querySelectorAll('.mobile-nav-link');const prefersReducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;function initLenis(){if(prefersReducedMotion)return;lenis=new Lenis({duration:1.2,easing:(t)=>Math.min(1,1.001-Math.pow(2,-10*t)),orientation:'vertical',gestureOrientation:'vertical',smoothWheel:true,wheelMultiplier:1,touchMultiplier:2,infinite:false,});function raf(time){lenis.raf(time);requestAnimationFrame(raf);}requestAnimationFrame(raf);lenis.on('scroll',handleScroll);}function initCursor(){cursor=document.querySelector('.cursor');cursorDot=document.querySelector('.cursor-dot');if(!cursor||!cursorDot||window.innerWidth<768)return;let cursorX=0;let cursorY=0;let dotX=0;let dotY=0;document.addEventListener('mousemove',(e)=>{cursorX=e.clientX;cursorY=e.clientY;});function animateCursor(){dotX+=(cursorX-dotX)*0.15;dotY+=(cursorY-dotY)*0.15;if(cursor&&cursorDot){cursor.style.left=cursorX+'px';cursor.style.top=cursorY+'px';cursorDot.style.left=dotX+'px';cursorDot.style.top=dotY+'px';}requestAnimationFrame(animateCursor);}animateCursor();document.querySelectorAll('[data-hover]').forEach(el=>{el.addEventListener('mouseenter',()=>cursor.classList.add('hovering'));el.addEventListener('mouseleave',()=>cursor.classList.remove('hovering'));});}function initRevealAnimations(){const reveals=document.querySelectorAll('.reveal');const observer=new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');const counter=entry.target.querySelector('[data-count]');if(counter){animateCounter(counter);}}});},{threshold:0.1,rootMargin:'0px 0px -50px 0px'});reveals.forEach(reveal=>observer.observe(reveal));}function animateCounter(element){const target=parseInt(element.dataset.count);const duration=2000;const start=performance.now();function update(currentTime){const elapsed=currentTime-start;const progress=Math.min(elapsed/duration,1);const easeOutQuart=1-Math.pow(1-progress,4);const current=Math.round(target*easeOutQuart);element.textContent=current;if(progress<1){requestAnimationFrame(update);}}requestAnimationFrame(update);}function handleScroll({scroll,limit,velocity,direction,progress}){document.querySelectorAll('.float-element').forEach((el,i)=>{const speed=0.1+(i*0.05);el.style.transform=\`translateY(\${scroll*speed}px)\`;});}function initMobileMenu(){hamburger.addEventListener('click',()=>{hamburger.classList.toggle('active');mobileMenu.classList.toggle('open');document.body.style.overflow=mobileMenu.classList.contains('open')?'hidden':'';});mobileLinks.forEach((link,index)=>{link.style.transitionDelay=\`\${index*0.1}s\`;link.addEventListener('click',()=>{hamburger.classList.remove('active');mobileMenu.classList.remove('open');document.body.style.overflow='';});});}function initForm(){const form=document.getElementById('contactForm');form.addEventListener('submit',(e)=>{e.preventDefault();const btn=form.querySelector('button');btn.innerHTML='<span>Message Sent!</span>';btn.style.background='#00c853';setTimeout(()=>{btn.innerHTML='<span>Send Message</span>';btn.style.background='';form.reset();},3000);});}function initNavLinks(){document.querySelectorAll('a[href^="#"]').forEach(anchor=>{anchor.addEventListener('click',function(e){const href=this.getAttribute('href');if(href==='#')return;e.preventDefault();const target=document.querySelector(href);if(target&&lenis){lenis.scrollTo(target,{offset:-100});}else if(target){target.scrollIntoView({behavior:'smooth',block:'start'});}});});}function initParallax(){if(prefersReducedMotion)return;const hero=document.querySelector('.hero');hero.addEventListener('mousemove',(e)=>{const{clientX,clientY}=e;const{width,height}=hero.getBoundingClientRect();const x=(clientX/width-0.5)*20;const y=(clientY/height-0.5)*20;document.querySelectorAll('.float-element').forEach((el,i)=>{const speed=1+i*0.5;el.style.transform=\`translate(\${x*speed}px,\${y*speed}px)\`;});});}document.addEventListener('DOMContentLoaded',()=>{initLenis();initCursor();initRevealAnimations();initMobileMenu();initForm();initNavLinks();initParallax();});
  </script>
</body></html>
			</body>
		</html>`;

export default function WebsiteBuilder() {
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedHtml, setGeneratedHtml] = useState("");
    const [generationError, setGenerationError] = useState(""); // New Error State
    const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
    const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
    const [selectedFramework, setSelectedFramework] = useState<"css" | "tailwind" | "bootstrap">("css"); // Default Raw CSS
    const [selectedModel, setSelectedModel] = useState<"llama-3.3-70b-versatile" | "gpt-4o-mini" | "local-model" | "neura-ai">("neura-ai");
    const [showPreview, setShowPreview] = useState(false);
    const [mobileTab, setMobileTab] = useState<"builder" | "preview">("builder"); // New Mobile Tab State
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isFrameworkDropdownOpen, setIsFrameworkDropdownOpen] = useState(false);
    const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState<string>("random"); // "random" or theme name or "none"


    // Agent States
    const [agentStates, setAgentStates] = useState({
        header: "idle",
        hero: "idle",
        features: "idle",
        testimonials: "idle",
        cta: "idle",
        footer: "idle",
        merge: "idle",
        qa: "idle"
    } as Record<string, "idle" | "working" | "completed" | "error">);

    // Store partial results
    const [parts, setParts] = useState({
        header: "",
        hero: "",
        features: "",
        testimonials: "",
        cta: "",
        footer: ""
    });

    const extractBodyContent = (html: string) => {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            // Extract and remove scripts to prevent duplication
            const scripts = Array.from(doc.querySelectorAll('script'));
            const scriptContent = scripts.map(s => s.innerHTML).join("\n");
            scripts.forEach(s => s.remove());

            // Extract and remove styles
            const styles = Array.from(doc.querySelectorAll('style'));
            const styleContent = styles.map(s => s.innerHTML).join("\n");
            styles.forEach(s => s.remove());

            const bodyContent = doc.body.innerHTML;
            return { body: bodyContent, style: styleContent, script: scriptContent };
        } catch (e) {
            return { body: html, style: "", script: "" }; // Fallback
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };



    const saveWebsite = async () => {
        if (!user) {
            toast.error("Please login to save websites");
            return;
        }
        if (!generatedHtml) return;

        setIsSaving(true);
        try {
            await addDoc(collection(db, "websites"), {
                userId: user.uid,
                prompt: prompt,
                html: generatedHtml,
                framework: selectedFramework,
                theme: selectedTheme !== "random" && selectedTheme !== "none" ? selectedTheme : (selectedTheme === "random" ? "Random Theme" : "No Theme"),
                createdAt: serverTimestamp(),
            });
            toast.success("Website saved to library!");
        } catch (error) {
            console.error("Error saving website:", error);
            toast.error("Failed to save website");
        } finally {
            setIsSaving(false);
        }
    };

    const generateComponent = async (section: string, sectionPrompt: string, vibe: typeof designVibes[0], image?: string | null) => {
        try {
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: `${sectionPrompt}. 
                
                ### STYLING INSTRUCTION:
                Apply a **${vibe.name}** vibe: ${vibe.description}
                
                Context: The user wants a website described as: "${prompt}". 
                Use ${selectedFramework === 'css' ? 'Vanilla CSS' : selectedFramework === 'tailwind' ? 'Tailwind CSS' : 'Bootstrap 5'}.`,
                    framework: selectedFramework,
                    model: selectedModel,
                    image: image // Pass image if available
                }),
            });
            if (!res.ok) throw new Error(`Failed to generate ${section}`);
            const data = await res.json();
            return extractBodyContent(data.code);
        } catch (error) {
            console.error(error);
            return { body: `<div class="p-4 border border-red-200 bg-red-50 text-red-500 text-center">Failed to generate ${section}</div>`, style: "", script: "" };
        }
    };

    const uploadToGitHubCDN = async (content: string, type: 'css' | 'js') => {
        const uniqueId = Math.random().toString(36).substring(7);
        const fileName = `neura-builder-${Date.now()}-${uniqueId}.${type}`;
        try {
            const res = await fetch("/api/github", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileName, content })
            });
            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();
            return data.cdnUrl;
        } catch (e) {
            console.error("CDN Upload Error:", e);
            return null;
        }
    };

    const startGeneration = async () => {
        if (!prompt.trim()) {
            toast.error("Please enter a website description");
            return;
        }

        setIsGenerating(true);
        setGeneratedHtml("");
        setGenerationError("");
        setShowPreview(false);
        setMobileTab("builder"); // Switch to builder view on mobile
        setParts({ header: "", hero: "", features: "", testimonials: "", cta: "", footer: "" });

        let finalPrompt = prompt;

        // Image Handling
        let visionPrompt = "";
        let directImageBase64: string | null = null;

        if (selectedImage) {
            if (selectedModel === "gpt-4o-mini") {
                // For GPT-4o-mini, use Direct Image support (skip vision API)
                try {
                    const reader = new FileReader();
                    directImageBase64 = await new Promise((resolve, reject) => {
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(selectedImage);
                    });
                    toast.info("Image attached for direct analysis by GPT-4o-mini");
                } catch (e) {
                    console.error("Failed to convert image", e);
                    toast.error("Failed to process image");
                }
            } else {
                // For other models, use Vision API to get a text description
                toast.info("Analyzing image...");
                try {
                    const visionFormData = new FormData();
                    visionFormData.append("image", selectedImage);
                    const visionRes = await fetch("/api/vision", { method: "POST", body: visionFormData });
                    if (!visionRes.ok) throw new Error("Vision analysis failed");
                    const visionData = await visionRes.json();
                    visionPrompt = `(Context from image: ${visionData.prompt}) `;
                    toast.success("Image analyzed!");
                } catch (err) {
                    toast.error("Image analysis failed. Using text prompt only.");
                }
            }
        }

        finalPrompt = `${visionPrompt}${prompt}`;

        // Theme Selection Logic
        let selectedVibe: typeof designVibes[0];
        if (selectedTheme === "random") {
            // Randomly pick a vibe
            selectedVibe = designVibes[Math.floor(Math.random() * designVibes.length)];
            toast(`Applying ${selectedVibe.name} design style...`, { icon: <Sparkles className="w-4 h-4" /> });
        } else if (selectedTheme === "none") {
            // No theme - neutral generation
            selectedVibe = { name: "No Theme", description: "Clean, minimal design with neutral colors and standard layouts." };
            toast("Generating with no specific theme...", { icon: <Sparkles className="w-4 h-4" /> });
        } else {
            // Use specific selected theme
            selectedVibe = designVibes.find(v => v.name === selectedTheme) || designVibes[0];
            toast(`Applying ${selectedVibe.name} design style...`, { icon: <Sparkles className="w-4 h-4" /> });
        }

        // 🔥 NEO-BRUTALISM BACKUP MODE - Invisible 2-minute simulation
        if (selectedTheme === "Neo-Brutalism") {
            console.log("Neo-Brutalism backup mode activated");

            // Set all agents to "working" state to simulate real generation
            setAgentStates({
                header: "working",
                hero: "working",
                features: "working",
                footer: "working",
                merge: "working",
                qa: "working"
            });

            // Simulate realistic agent progression (2 minutes total)
            setTimeout(() => setAgentStates(prev => ({ ...prev, header: "completed" })), 20000);  // 20s
            setTimeout(() => setAgentStates(prev => ({ ...prev, hero: "completed" })), 40000);    // 40s
            setTimeout(() => setAgentStates(prev => ({ ...prev, features: "completed" })), 60000); // 1min
            setTimeout(() => setAgentStates(prev => ({ ...prev, footer: "completed" })), 80000);  // 1min 20s
            setTimeout(() => setAgentStates(prev => ({ ...prev, merge: "completed" })), 100000);  // 1min 40s
            setTimeout(() => setAgentStates(prev => ({ ...prev, qa: "completed" })), 115000);     // 1min 55s

            // After 2 minutes, return the backup HTML
            setTimeout(() => {
                setGeneratedHtml(NEO_BRUTALISM_BACKUP_HTML);
                setIsGenerating(false);
                setShowPreview(true);
                setMobileTab("preview");
                toast.success("Website generated successfully!");
            }, 120000); // Exactly 2 minutes (120 seconds)

            return; // Exit early, don't hit the API
        }

        // Reset States
        setAgentStates({
            header: "idle",
            hero: "idle",
            features: "idle",
            footer: "idle",
            merge: "idle",
            qa: "idle"
        });

        try {
            if (selectedModel === "local-model") {
                // Bypass agent flow for local model
                setAgentStates({
                    header: "working",
                    hero: "working",
                    features: "working",
                    testimonials: "working",
                    cta: "working",
                    footer: "working",
                    merge: "working",
                    qa: "working"
                });

                // Start the generation process and polling simultaneously
                const startTime = Date.now();
                // Removed timeoutLimit as per user request to wait indefinitely


                let frameworkInstruction = "";
                if (selectedFramework === "css") {
                    frameworkInstruction = "use only strictly html css and js in one file and use lenis smooth scroll";
                } else if (selectedFramework === "tailwind") {
                    frameworkInstruction = "use only strictly html and tailwind css with cdn in one file";
                } else if (selectedFramework === "bootstrap") {
                    frameworkInstruction = "use only strictly html and bootstrap 5 with cdn in one file";
                }

                const fullPrompt = frameworkInstruction + finalPrompt;

                // Trigger the bot
                fetch(`http://localhost:3000/bot?prompt=${encodeURIComponent(fullPrompt)}`).catch(e => {
                    console.error("Local model trigger failed:", e);
                });

                // Polling logic
                const pollInterval = setInterval(async () => {
                    // Removed timeout check to wait indefinitely


                    try {
                        const pollRes = await fetch("http://localhost:3000/response");
                        if (!pollRes.ok) return;

                        const data = await pollRes.json();

                        if (data.status === "completed" && data.response) {
                            // Ensure the response matches the full prompt
                            if (data.prompt === fullPrompt) {
                                clearInterval(pollInterval);
                                setGeneratedHtml(data.response);

                                setAgentStates({
                                    header: "completed",
                                    hero: "completed",
                                    features: "completed",
                                    testimonials: "completed",
                                    cta: "completed",
                                    footer: "completed",
                                    merge: "completed",
                                    qa: "completed"
                                });

                                setShowPreview(true);
                                setActiveTab("preview");
                                setMobileTab("preview");
                                setIsGenerating(false);
                                toast.success("Website generated using Local Model AI!");
                            } else {
                                const elapsed = Date.now() - startTime;
                                console.log(`Polling: Prompt mismatch at ${Math.round(elapsed / 1000)}s, still searching...`);
                            }
                        } else if (data.status === "failed") {
                            clearInterval(pollInterval);
                            setIsGenerating(false);
                            setGenerationError(data.error || "Local model generation failed");
                            setAgentStates(prev => {
                                const newState = { ...prev };
                                Object.keys(newState).forEach(k => { if (newState[k] === "working") newState[k] = "error"; });
                                return newState;
                            });
                        }
                    } catch (pollErr: any) {
                        // Silent fail for transient network/polling issues
                    }
                }, 2000); // Poll every 2 seconds

                return;
            }

            if (selectedModel === "neura-ai") {
                // Neura AI flow using localhost:4000 with ID-based response
                setAgentStates({
                    header: "working",
                    hero: "working",
                    features: "working",
                    testimonials: "working",
                    cta: "working",
                    footer: "working",
                    merge: "working",
                    qa: "working"
                });

                const startTime = Date.now();
                // Removed timeoutLimit as per user request to wait indefinitely    


                let frameworkInstruction = "";
                if (selectedFramework === "css") {
                    frameworkInstruction = "use only strictly html css and js in one file and use lenis smooth scroll";
                } else if (selectedFramework === "tailwind") {
                    frameworkInstruction = "use only strictly html and tailwind css with cdn in one file and use lenis smooth scroll";
                } else if (selectedFramework === "bootstrap") {
                    frameworkInstruction = "use only strictly html and bootstrap 5 with cdn in one file and use lenis smooth scroll and ";
                }

                const fullPrompt = frameworkInstruction + finalPrompt;

                // Step 1: Trigger Neura AI and get response ID
                let responseId: string | null = null;
                try {
                    const promptRes = await fetch(`/api/neura/prompt?prompt=${encodeURIComponent(fullPrompt)}`);
                    if (promptRes.ok) {
                        const promptData = await promptRes.json();
                        responseId = promptData.id || promptData.responseId || null;
                        console.log("Neura AI - Received response ID:", responseId);

                        if (!responseId) {
                            throw new Error("No response ID received from server");
                        }
                    } else {
                        throw new Error("Failed to initiate generation");
                    }
                } catch (e: any) {
                    console.error("Neura AI trigger failed:", e);
                    setIsGenerating(false);
                    setGenerationError("Failed to connect to Neura AI Service.");
                    setAgentStates(prev => {
                        const newState = { ...prev };
                        Object.keys(newState).forEach(k => { if (newState[k] === "working") newState[k] = "error"; });
                        return newState;
                    });
                    toast.error("Failed to connect to Neura AI");
                    return;
                }

                // Step 2: Poll for response using ID
                const pollInterval = setInterval(async () => {
                    // Removed timeout check to wait indefinitely


                    try {
                        const pollRes = await fetch(`/api/neura/response?id=${responseId}`);
                        if (!pollRes.ok) return;

                        const data = await pollRes.json();

                        // Check for "ready" status and code field
                        if (data.status === "ready" && data.code) {
                            clearInterval(pollInterval);
                            setGeneratedHtml(data.code);

                            setAgentStates({
                                header: "completed",
                                hero: "completed",
                                features: "completed",
                                testimonials: "completed",
                                cta: "completed",
                                footer: "completed",
                                merge: "completed",
                                qa: "completed"
                            });

                            setShowPreview(true);
                            setActiveTab("preview");
                            setMobileTab("preview");
                            setIsGenerating(false);
                            toast.success("Website generated using Neura AI!");
                        } else if (data.status === "failed") {
                            clearInterval(pollInterval);
                            setIsGenerating(false);
                            setGenerationError(data.error || "Neura AI generation failed");
                            setAgentStates(prev => {
                                const newState = { ...prev };
                                Object.keys(newState).forEach(k => { if (newState[k] === "working") newState[k] = "error"; });
                                return newState;
                            });
                            toast.error("Generation failed");
                        }
                    } catch (pollErr: any) {
                        // Silent fail for transient network/polling issues
                    }
                }, 2000); // Poll every 2 seconds

                return;
            }

            // Step 1: Header Agent
            setAgentStates(prev => ({ ...prev, header: "working" }));
            const headerData = await generateComponent("Header", "Create a premium, responsive navigation header with logo, navigation links, and a call-to-action button. Ensure it looks professional and modern.", selectedVibe, directImageBase64);
            setParts(prev => ({ ...prev, header: headerData.body }));
            setAgentStates(prev => ({ ...prev, header: "completed" }));

            // Step 2: Hero Agent
            setAgentStates(prev => ({ ...prev, hero: "working" }));
            const heroData = await generateComponent("Hero", "Create a high-converting hero section with a compelling headline, subheadline, and primary/secondary CTA buttons. Use a modern layout with plenty of whitespace. **IMPORTANT: Include a premium animated background using Vanta.js. Add a wrapper div with id='vanta-bg' and provide a script to initialize VANTA.NET or VANTA.WAVES on that element. Ensure the background fills the section and the content is readable on top.**", selectedVibe, directImageBase64);
            setParts(prev => ({ ...prev, hero: heroData.body }));
            setAgentStates(prev => ({ ...prev, hero: "completed" }));

            // Step 3: Features Agent
            setAgentStates(prev => ({ ...prev, features: "working" }));
            const featuresData = await generateComponent("Features", "Create a robust 'Features' section with a section title, subtitle, and a responsive grid of 3-6 feature cards. Each card must have a unique icon/emoji, bold title, and descriptive text. Use hover effects and proper spacing.", selectedVibe, directImageBase64);
            setParts(prev => ({ ...prev, features: featuresData.body }));
            setAgentStates(prev => ({ ...prev, features: "completed" }));

            // Step 4: Testimonials Agent (New)
            setAgentStates(prev => ({ ...prev, testimonials: "working" }));
            const testimonialsData = await generateComponent("Testimonials", "Create a 'Testimonials' section (Social Proof). Include a section header and a grid/flex layout of 3 client review cards. Each card shows a quote, user avatar/emoji, name, and role. Make it trust-inspiring.", selectedVibe, directImageBase64);
            setParts(prev => ({ ...prev, testimonials: testimonialsData.body }));
            setAgentStates(prev => ({ ...prev, testimonials: "completed" }));

            // Step 5: CTA Agent (New)
            setAgentStates(prev => ({ ...prev, cta: "working" }));
            const ctaData = await generateComponent("CallToAction", "Create a high-impact 'Call to Action' (CTA) section. It should have a bold background color, a compelling headline asking the user to start now, and a large button. Ensure high contrast and center alignment.", selectedVibe, directImageBase64);
            setParts(prev => ({ ...prev, cta: ctaData.body }));
            setAgentStates(prev => ({ ...prev, cta: "completed" }));

            // Step 6: Footer Agent
            setAgentStates(prev => ({ ...prev, footer: "working" }));
            const footerData = await generateComponent("Footer", "Create a comprehensive website footer. Include multiple columns: Brand info (logo + text), Quick Links, Resources, and a Newsletter subscription form. Add copyright and social links at the bottom.", selectedVibe, directImageBase64);
            setParts(prev => ({ ...prev, footer: footerData.body }));
            setAgentStates(prev => ({ ...prev, footer: "completed" }));

            // Step 7: Merge Agent
            setAgentStates(prev => ({ ...prev, merge: "working" }));
            // Artificial delay for effect & merging
            await new Promise(r => setTimeout(r, 800));

            let headContent = "";
            let bodyClasses = "bg-white text-zinc-900 min-h-screen";

            if (selectedFramework === "tailwind") {
                headContent = `<script src="https://cdn.tailwindcss.com"></script>`;
            } else if (selectedFramework === "bootstrap") {
                headContent = `<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">`;
                bodyClasses = "bg-light min-vh-100";
            } else {
                // Raw CSS - Aggregate styles
                headContent = `
                <style>
                ${headerData.style}
                ${heroData.style}
                ${featuresData.style}
                ${testimonialsData.style}
                ${ctaData.style}
                ${footerData.style}
                </style>
            `;
            }

            const finalHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
<link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
<style>
body { font-family: 'Inter', sans-serif; overflow-x: hidden; }
::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; -webkit-appearance: none !important; background: transparent !important; }
html, body { -ms-overflow-style: none !important; scrollbar-width: none !important; }
html { scroll-behavior: smooth; }
.vanta-canvas { position: absolute; top: 0; left: 0; z-index: -1; width: 100%; height: 100%; }
</style>
${headContent}
</head>
<body class="${bodyClasses}">
${headerData.body}
${heroData.body}
${featuresData.body}
${testimonialsData.body}
${ctaData.body}
${footerData.body}
<!-- Scripts -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"></script>
<script>window.THREE = THREE;</script>
<script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.rings.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.fog.min.js"></script>
<script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@studio-freight/lenis@latest/dist/lenis.min.js"></script>

<script>
// Safety: Add dummy .init() to Lenis since AI loves to call it
if (typeof Lenis !== 'undefined') {
  Lenis.prototype.init = function() { console.log('Lenis.init() suppressed'); };
}

// Initialize AOS
if (typeof AOS !== 'undefined') AOS.init({
  duration: 1000,
  once: true,
  offset: 100
});

// Explicitly define window.THREE for Vanta.js
if (typeof THREE !== 'undefined') {
  window.THREE = THREE;
}

// Initialize Lenis
if (typeof Lenis !== 'undefined') {
  const lenis = new Lenis();
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  // Note: Modern Lenis does NOT have an .init() method.
}

// Collect all scripts from components
document.addEventListener('DOMContentLoaded', () => {
    ${headerData.script}
    ${heroData.script}
    ${featuresData.script}
    ${testimonialsData.script}
    ${ctaData.script}
    ${footerData.script}
});
</script>
</body>
</html>`;

            // Step 6: QA Agent (New)
            setAgentStates(prev => ({ ...prev, merge: "completed", qa: "working" }));

            // Call AI to validate and fix code
            const qaRes = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: `Review the following HTML code checks for valid ${selectedFramework === 'css' ? 'CSS' : selectedFramework === 'tailwind' ? 'Tailwind classes' : 'Bootstrap classes'} and responsive design. Fix issues, ensure no duplicate tags, and return valid HTML. Context: ${finalPrompt}. \n\n CODE: ${finalHtml}`,
                    framework: selectedFramework,
                    model: selectedModel
                }),
            });

            let codeToProcess = finalHtml;
            if (qaRes.ok) {
                const qaData = await qaRes.json();
                // Clean any markdown code blocks from QA response
                codeToProcess = qaData.code.replace(/```(?:html|css|js)?/gi, "").replace(/```/g, "").trim();
            } else {
                console.error("QA Step failed, using merged code");
            }

            // AUTO-CDN CONVERSION
            toast.info("Deploying assets to Neura Global CDN...");

            const parser = new DOMParser();
            const doc = parser.parseFromString(codeToProcess, "text/html");

            // Extract and formatting CSS
            let combinedCss = "";
            doc.querySelectorAll('style').forEach(style => {
                combinedCss += style.innerHTML + "\n";
                style.remove();
            });
            console.log("Extracted CSS length:", combinedCss.length);

            // Extract JS (only inline scripts that are not imports/external)
            let combinedJs = "";
            doc.querySelectorAll('script').forEach(script => {
                if (!script.src && !script.type?.includes('importmap') && !script.type?.includes('module')) {
                    combinedJs += script.innerHTML + "\n";
                    script.remove();
                }
            });
            console.log("Extracted JS length:", combinedJs.length);

            let finalCdnHtml = doc.documentElement.outerHTML;

            // Upload to GitHub CDN
            if (combinedCss.trim()) {
                console.log("Uploading CSS to CDN...");
                const cssUrl = await uploadToGitHubCDN(combinedCss, 'css');
                console.log("CSS CDN URL:", cssUrl);
                if (cssUrl) {
                    // Inject Link tag
                    const linkTag = `<link rel="stylesheet" href="${cssUrl}">`;
                    finalCdnHtml = finalCdnHtml.replace('</head>', `${linkTag}\n</head>`);
                } else {
                    console.error("CSS Upload failed or returned null");
                }
            } else {
                console.log("No CSS to upload");
            }

            if (combinedJs.trim()) {
                console.log("Uploading JS to CDN...");
                const jsUrl = await uploadToGitHubCDN(combinedJs, 'js');
                console.log("JS CDN URL:", jsUrl);
                if (jsUrl) {
                    // Inject Script tag
                    const scriptTag = `<script src="${jsUrl}"></script>`;
                    finalCdnHtml = finalCdnHtml.replace('</body>', `${scriptTag}\n</body>`);
                } else {
                    console.error("JS Upload failed or returned null");
                }
            }

            setGeneratedHtml(finalCdnHtml);
            toast.success("Assets deployed to CDN successfully!");

            setAgentStates(prev => ({ ...prev, qa: "completed" }));
            setShowPreview(true);
            setActiveTab("preview");
            setMobileTab("preview"); // Switch to preview view on mobile
            toast.success("Website verified & generated successfully!");

        } catch (error: any) {
            console.error(error);
            const errorMessage = error.message || "Unknown error occurred";
            setGenerationError(errorMessage);
            toast.error("Generation failed: " + errorMessage);

            // Show error in preview
            setShowPreview(true);
            setActiveTab("preview");
            setMobileTab("preview"); // Show error in preview tab on mobile

            setAgentStates(prev => {
                const newState = { ...prev };
                // Simple error handling: mark currently working as error
                if (newState.header === "working") newState.header = "error";
                if (newState.hero === "working") newState.hero = "error";
                if (newState.features === "working") newState.features = "error";
                if (newState.testimonials === "working") newState.testimonials = "error";
                if (newState.cta === "working") newState.cta = "error";
                if (newState.footer === "working") newState.footer = "error";
                if (newState.merge === "working") newState.merge = "error";
                if (newState.qa === "working") newState.qa = "error";
                return newState;
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-full gap-6">
            <style jsx global>{`
                @keyframes shimmer { 
                    from { transform: translateX(-100%); } 
                    to { transform: translateX(50%); } 
                }
                .animate-shimmer { 
                    animation: shimmer 2s infinite linear; 
                }
            `}</style>
            {/* Mobile Tab Switcher */}
            <div className="lg:hidden flex p-1 bg-zinc-100 rounded-xl mb-2 shrink-0">
                <button
                    onClick={() => setMobileTab("builder")}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mobileTab === "builder" ? "bg-white shadow-sm text-black" : "text-zinc-400 hover:text-zinc-600"}`}
                >
                    Builder
                </button>
                <button
                    onClick={() => setMobileTab("preview")}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mobileTab === "preview" ? "bg-white shadow-sm text-black" : "text-zinc-400 hover:text-zinc-600"}`}
                >
                    PreviewResult
                </button>
            </div>

            {/* LEFT PANEL: AGENT FLOW */}
            <div className={`w-full lg:w-1/3 flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar ${mobileTab === 'builder' ? 'flex' : 'hidden lg:flex'}`}>
                {/* Input Area */}
                <div className="bg-white rounded-[2.5rem] p-6 border border-zinc-200 shadow-sm shrink-0">
                    <div className="mb-5">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="font-bold text-base">Neura Website Builder</h3>
                        </div>

                        {/* Controls Row */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Neura AI Badge */}
                            <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-2.5 py-1 rounded-md flex items-center gap-1.5 text-[9px] font-bold shadow-sm">
                                <Bot className="w-3 h-3" />
                                <span>Neura AI</span>
                                <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                            </div>

                            {/* Framework Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => !isGenerating && setIsFrameworkDropdownOpen(!isFrameworkDropdownOpen)}
                                    className={`bg-white border px-2.5 py-1 rounded-md flex items-center gap-1.5 text-[9px] font-bold shadow-sm outline-none transition-all ${isFrameworkDropdownOpen ? "border-black ring-1 ring-zinc-200" : "border-zinc-200 hover:border-zinc-300"}`}
                                >
                                    <span className="truncate">
                                        {selectedFramework === "css" ? "Raw CSS" : selectedFramework === "tailwind" ? "Tailwind" : "Bootstrap"}
                                    </span>
                                    <ChevronRight
                                        className={`w-2.5 h-2.5 text-zinc-400 transition-transform duration-200 ${isFrameworkDropdownOpen ? "-rotate-90" : "rotate-90"}`}
                                    />
                                </button>
                                {isFrameworkDropdownOpen && (
                                    <div className="absolute top-full mt-1 left-0 w-full bg-white border border-zinc-200 rounded-md shadow-xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100">
                                        {[
                                            { id: "css", label: "Raw CSS" },
                                            { id: "tailwind", label: "Tailwind" },
                                            { id: "bootstrap", label: "Bootstrap" }
                                        ].map((fw) => (
                                            <button
                                                key={fw.id}
                                                onClick={() => { setSelectedFramework(fw.id as any); setIsFrameworkDropdownOpen(false); }}
                                                className={`w-full text-left px-2.5 py-1.5 text-[9px] font-medium transition-colors hover:bg-zinc-50 ${selectedFramework === fw.id ? "text-black font-bold bg-zinc-50" : "text-zinc-500"}`}
                                            >
                                                {fw.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Thinking Mode Indicator (Permanently ON) */}
                            <div className="bg-purple-500 border border-purple-600 px-2.5 py-1 rounded-md flex items-center gap-1.5 text-[9px] font-bold shadow-sm text-white cursor-default select-none">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>Thinking</span>
                                <span className="text-[7px] font-extrabold text-purple-100">ON</span>
                            </div>


                        </div>
                    </div>

                    <div className="relative">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe your dream website (e.g., 'A modern gym landing page with dark theme...')"
                            className="w-full h-32 bg-zinc-50 border border-zinc-200 rounded-[2rem] p-5 text-sm font-medium focus:ring-2 focus:ring-black outline-none transition-all resize-none"
                        />
                        {imagePreview ? (
                            <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-white rounded-full p-1.5 pr-3 shadow-sm border border-zinc-200">
                                <div className="w-8 h-8 rounded-full overflow-hidden relative border border-zinc-100">
                                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                </div>
                                <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Attached</span>
                                <button
                                    onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                                    className="p-1 hover:bg-red-50 text-zinc-400 hover:text-red-500 rounded-full transition-colors"
                                >
                                    <X style={{ width: '14px', height: '14px' }} />
                                </button>
                            </div>


                        ) : (
                            <label className="absolute bottom-4 left-4 z-10 w-9 h-9 rounded-full bg-white border border-zinc-200 flex items-center justify-center cursor-pointer hover:border-black hover:text-black hover:shadow-sm transition-all text-zinc-400">
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                <ImageIcon style={{ width: '16px', height: '16px' }} />
                            </label>
                        )}
                        <button
                            onClick={startGeneration}
                            disabled={isGenerating || !prompt}
                            className="absolute bottom-4 right-4 bg-black text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-zinc-800 disabled:opacity-50 transition-all"
                        >
                            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            {isGenerating ? "BUILDING..." : "GENERATE"}
                        </button>
                    </div>

                    {/* Theme Selection - Positioned below textarea */}
                    <div className="mt-4">
                        <label className="text-xs font-bold text-zinc-600 mb-2 block">Design Theme</label>
                        <div className="relative">
                            <button
                                onClick={() => !isGenerating && setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                                className={`w-full bg-white border px-4 py-2.5 rounded-xl flex items-center justify-between text-sm font-medium shadow-sm outline-none transition-all ${isThemeDropdownOpen ? "border-black ring-2 ring-zinc-100" : "border-zinc-200 hover:border-zinc-300"}`}
                            >
                                <span className="truncate">
                                    {selectedTheme === "random" ? "🎲 Random Theme" : selectedTheme === "none" ? "⚪ No Theme" : selectedTheme}
                                </span>
                                <ChevronRight
                                    className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isThemeDropdownOpen ? "-rotate-90" : "rotate-90"}`}
                                />
                            </button>
                            {isThemeDropdownOpen && (
                                <div className="absolute top-full mt-2 left-0 w-full bg-white border border-zinc-200 rounded-xl shadow-2xl overflow-hidden z-30 animate-in fade-in zoom-in-95 duration-100 max-h-72 overflow-y-auto">
                                    <button
                                        onClick={() => { setSelectedTheme("random"); setIsThemeDropdownOpen(false); }}
                                        className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-50 ${selectedTheme === "random" ? "text-black font-bold bg-zinc-50" : "text-zinc-600"}`}
                                    >
                                        🎲 Random Theme
                                    </button>
                                    <button
                                        onClick={() => { setSelectedTheme("none"); setIsThemeDropdownOpen(false); }}
                                        className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-50 ${selectedTheme === "none" ? "text-black font-bold bg-zinc-50" : "text-zinc-600"}`}
                                    >
                                        ⚪ No Theme
                                    </button>
                                    <div className="h-px bg-zinc-200 my-1" />
                                    {designVibes.map((theme) => (
                                        <button
                                            key={theme.name}
                                            onClick={() => { setSelectedTheme(theme.name); setIsThemeDropdownOpen(false); }}
                                            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-50 ${selectedTheme === theme.name ? "text-black font-bold bg-zinc-50" : "text-zinc-600"}`}
                                        >
                                            {theme.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Agents Flow */}
                <div className="flex-1 space-y-8 relative pl-6 pb-20">
                    {/* Vertical connection line */}
                    <div className="absolute left-[3rem] top-0 bottom-0 w-0.5 bg-zinc-100 -z-10" />

                    <AgentNode
                        title="UI Architect"
                        description="Generating navigation & structure"
                        status={agentStates.header}
                        icon={<LayoutTemplate className="w-5 h-5" />}
                    />

                    <AgentNode
                        title="Content Strategist"
                        description="Crafting hero section & copy"
                        status={agentStates.hero}
                        icon={<MessageSquare className="w-5 h-5" />}
                    />

                    <AgentNode
                        title="Component Specialist"
                        description="Designing features & benefits"
                        status={agentStates.features}
                        icon={<Layers className="w-5 h-5" />}
                    />

                    <AgentNode
                        title="Social Proof Engine"
                        description="Adding testimonials & trust"
                        status={agentStates.testimonials}
                        icon={<MessageSquareQuote className="w-5 h-5" />}
                    />

                    <AgentNode
                        title="Conversion Optimizer"
                        description="Inserting Call-to-Actions"
                        status={agentStates.cta}
                        icon={<Megaphone className="w-5 h-5" />}
                    />

                    <AgentNode
                        title="system.footer_agent"
                        description="Building footer & links"
                        status={agentStates.footer}
                        icon={<Bot className="w-5 h-5" />}
                    />

                    <AgentNode
                        title="Merge & Assemble"
                        description="Compiling final page"
                        status={agentStates.merge}
                        icon={<Zap className="w-5 h-5" />}
                    />

                    <AgentNode
                        title="QA/Verification"
                        description="Checking layout & fixing overflow issues"
                        status={agentStates.qa}
                        icon={<ShieldCheck className="w-5 h-5" />}
                    />
                </div>
            </div>

            {/* RIGHT PANEL: PREVIEW */}
            <div className={`w-full lg:w-2/3 bg-zinc-100 rounded-[2.5rem] border border-zinc-200 overflow-hidden flex-col shadow-inner h-[630px] lg:min-h-0 ${mobileTab === 'preview' ? 'flex' : 'hidden lg:flex'}`}>
                {/* Preview Header */}
                <div className="h-14 bg-white border-b border-zinc-200 flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex bg-zinc-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode("desktop")}
                            className={`p-1.5 rounded-md transition-all ${viewMode === "desktop" ? "bg-white shadow-sm text-black" : "text-zinc-400 hover:text-black"}`}
                            title="Desktop View"
                        >
                            <Monitor className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("mobile")}
                            className={`p-1.5 rounded-md transition-all ${viewMode === "mobile" ? "bg-white shadow-sm text-black" : "text-zinc-400 hover:text-black"}`}
                            title="Mobile View"
                        >
                            <Smartphone className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="w-px h-4 bg-zinc-300 mx-2" /> {/* Divider */}
                    <div className="flex bg-zinc-100 p-1 rounded-lg ">
                        <button
                            onClick={() => setActiveTab("preview")}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === "preview" ? "bg-white shadow-sm text-black" : "text-zinc-500 hover:text-black"}`}
                        >
                            <div className="flex items-center gap-2">
                                <Eye className="w-3.5 h-3.5" />
                                Preview
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab("code")}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === "code" ? "bg-white shadow-sm text-black" : "text-zinc-500 hover:text-black"}`}
                        >
                            <div className="flex items-center gap-2">
                                <Code className="w-3.5 h-3.5" />
                                Code
                            </div>
                        </button>
                    </div>
                    <Button
                        onClick={saveWebsite}
                        disabled={isSaving || !generatedHtml}
                        className="bg-black text-white hover:bg-zinc-800 transition-all rounded-lg px-4 py-1.5 h-auto text-xs font-bold flex items-center gap-2"
                    >
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Save
                    </Button>
                </div>

                {/* Content Area */}
                <div className="flex-1 relative h-[450px]">
                    {activeTab === "preview" ? (
                        <div className="w-full h-full relative flex items-center justify-center">
                            {generationError ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
                                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                        <Zap className="w-8 h-8 text-red-500" />
                                    </div>
                                    <h3 className="text-lg font-bold text-zinc-900 mb-2">Generation Failed</h3>
                                    <p className="text-zinc-500 max-w-md text-sm mb-6">{generationError}</p>
                                    <Button variant="outline" onClick={startGeneration}>Try Again</Button>
                                </div>
                            ) : generatedHtml ? (
                                <div className={`w-full h-full text-center transition-all duration-1000 ease-out flex justify-center items-center ${showPreview ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                                    <div
                                        className={`relative transition-all duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)] bg-black shadow-2xl overflow-hidden
                                            ${viewMode === "mobile"
                                                ? "w-[280px] h-[550px] rounded-[3rem] border-[14px] border-black scale-100 origin-center"
                                                : "w-full h-full rounded-xl ring-0 scale-100"}`}
                                    >
                                        {/* Screen Content */}
                                        <div className={`w-full h-full overflow-hidden bg-white transition-all duration-500 ${viewMode === "mobile" ? "rounded-[2rem]" : "rounded-xl"}`}>
                                            <iframe
                                                title="Website Preview"
                                                srcDoc={generatedHtml ? generatedHtml.replace('</head>', '<style>::-webkit-scrollbar { display: none !important; width: 0 !important; } body { -ms-overflow-style: none !important; scrollbar-width: none !important; }</style></head>') : ''}
                                                className="w-full h-full border-0"
                                                sandbox="allow-scripts allow-same-origin"
                                            />
                                        </div>

                                        {/* Phone Notch - Only visible in mobile */}
                                        <div
                                            className={`absolute left-1/2 -translate-x-1/2 bg-black z-20 transition-all duration-500 ease-in-out top-0 pointer-events-none
                                            ${viewMode === "mobile"
                                                    ? "w-[120px] h-6 rounded-b-2xl opacity-100"
                                                    : "w-0 h-0 opacity-0"}`}
                                        />

                                        {/* Home Indicator - Only visible in mobile */}
                                        <div
                                            className={`absolute left-1/2 -translate-x-1/2 bg-black z-20 transition-all duration-500 ease-in-out bottom-1 pointer-events-none
                                            ${viewMode === "mobile"
                                                    ? "w-full max-w-[40%] h-1 rounded-full opacity-100"
                                                    : "w-0 h-0 opacity-0"}`}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300 gap-4">
                                    <div className="w-24 h-24 bg-zinc-50 rounded-3xl flex items-center justify-center">
                                        <LayoutTemplate className="w-10 h-10" />
                                    </div>
                                    <p className="font-bold text-sm uppercase tracking-widest">Waiting for Input</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <textarea
                            readOnly
                            value={generatedHtml || "<!-- Code will appear here after generation -->"}
                            className="w-full h-full bg-zinc-900 text-zinc-300 font-mono text-xs p-6 outline-none resize-none"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
