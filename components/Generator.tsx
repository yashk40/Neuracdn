'use client';

import { useState, useEffect } from "react";
import {
  Brain,
  Copy,
  Zap,
  Code,
  FileText,
  Rocket,
  CheckCircle,
  ArrowLeft,
  Play,
  Stars,
} from "lucide-react";

// =============================================
// FLIP CARD STYLES (Pure CSS)
// =============================================
const flipCardStyles = `
  .flip-card {
    background-color: transparent;
    perspective: 1000px;
    height: 100%;
    min-height: 560px;
  }
  .flip-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    transition: transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1);
    transform-style: preserve-3d;
  }
  .flip-card.flipped .flip-card-inner {
    transform: rotateY(180deg);
  }
  .flip-card-front, .flip-card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    border-radius: 1.5rem;
    display: flex;
    flex-direction: column;
    background: #1a1a1a;
    border: 4px solid white;
    box-shadow: 0 20px 40px rgba(0,0,0,0.6);
  }
  .flip-card-back {
    transform: rotateY(180deg);
  }
  @keyframes shimmer {
    0% { transform: translateX(-100%) skewX(-12deg); }
    100% { transform: translateX(200%) skewX(-12deg); }
  }
  .animate-shimmer { animation: shimmer 2s infinite; }
  @media (max-width: 640px) { .flip-card { min-height: 650px; } }
`;

// =============================================
// SUGGESTIONS
// =============================================
const suggestions = [
  "Create a glowing neon button with hover pulse",
  "Make a futuristic card with glassmorphism and hover tilt",
  "Generate a smooth particle wave background animation",
];

// =============================================
// MAIN COMPONENT (NO FRAMER MOTION)
// =============================================
export default function HomePage() {
  const [aiPrompt, setAiPrompt] = useState("");
  const [htmlCode, setHtmlCode] = useState("");
  const [cssCode, setCssCode] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ cdnUrl: string; githubUrl: string } | null>(null);

  const generateUniqueFileName = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `animation-${timestamp}-${random}.css`;
  };
  const [fileName] = useState(generateUniqueFileName());

  // Split AI code into HTML and CSS
  const processCode = (code: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(code, "text/html");

    // Extract CSS from style tags
    let css = "";
    doc.querySelectorAll("style").forEach((s) => {
      css += s.innerHTML + "\n\n";
      s.remove();
    });

    // If no style tags, check if it's raw CSS
    if (!css.trim() && /{\s*[\w-]+\s*:/.test(code) && /@keyframes|animation/.test(code)) {
      css = code;
      setHtmlCode(""); // No HTML if it's pure CSS
    } else {
      // Remove scripts
      doc.querySelectorAll("script").forEach((s) => s.remove());
      setHtmlCode(doc.body.innerHTML);
    }

    setCssCode(css.trim());
  };

  // Iframe preview boilerplate
  const htmlBoilerplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          margin: 0; 
          padding: 3rem; 
          background: #111; 
          color: white; 
          font-family: system-ui, sans-serif; 
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        ${cssCode}
      </style>
    </head>
    <body>
      <div class="demo-area">
        ${htmlCode || '<p class="text-center text-2xl text-gray-500">Your animation preview will appear here ✨</p>'}
      </div>
    </body>
    </html>
  `;

  // AI Generation
  const generateCode = async () => {
    if (!aiPrompt.trim()) {
      alert("Please describe what CSS animation you want!");
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      processCode(data.code);
    } catch (err) {
      alert("Error generating code. Check console or API key.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // GitHub Upload
  const uploadToGitHub = async () => {
    if (!cssCode.trim()) {
      alert("No valid CSS found to upload!");
      return;
    }

    setIsUploading(true);
    try {
      const res = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName,
          content: cssCode,
        }),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Upload failed");
      }

      const data = await res.json();
      setUploadResult(data);
      setTimeout(() => setIsFlipped(true), 1000);
    } catch (err: any) {
      alert("Upload failed: " + err.message);
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <>
      <style jsx global>{flipCardStyles}</style>

      <div className="min-h-screen bg-[#121212] relative overflow-hidden text-white">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-pulse"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-10 max-w-7xl">
          {/* Header */}
          <div className="flex items-center gap-5 mb-12">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent rounded-3xl blur-lg opacity-70"></div>
              <div className="relative p-5 bg-gradient-to-r from-[#121212] to-white rounded-3xl">
                <Brain className="w-12 h-12 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Neura CDN
              </h1>
              <p className="text-gray-400 text-lg">AI-Powered CSS Animation Platform</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Left Column */}
            <div className="space-y-10">
              {/* Prompt Section */}
              <div className="bg-[#1a1a1a] border-4 border-white rounded-3xl p-10 shadow-2xl">
                <h2 className="text-4xl font-bold mb-4 flex items-center gap-4">
                  <Zap className="w-10 h-10" /> Neura V.01
                </h2>
                <p className="text-gray-300 mb-8 text-lg">Describe your animation vision</p>

                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Example: Create a glowing neon button with hover pulse effect"
                  rows={5}
                  className="w-full px-6 py-5 bg-white/5 border-2 border-white/30 rounded-2xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none text-lg"
                />

                <div className="flex flex-wrap gap-4 mt-8">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setAiPrompt(s);
                        generateCode();
                      }}
                      disabled={isGenerating}
                      className="px-6 py-3 bg-white text-black rounded-xl font-semibold hover:scale-105 transition disabled:opacity-60"
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <button
                  onClick={generateCode}
                  disabled={isGenerating}
                  className="w-full mt-10 py-6 text-2xl font-bold bg-white text-black rounded-3xl hover:scale-105 transition shadow-2xl flex items-center justify-center gap-4"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                      AI Crafting...
                    </>
                  ) : (
                    <>
                      <Stars className="w-8 h-8" />
                      Generate with AI Magic
                    </>
                  )}
                </button>
              </div>

              {/* CSS Editor */}
              <div className="bg-[#1a1a1a] border-4 border-white rounded-3xl p-10 shadow-2xl">
                <h3 className="text-3xl font-bold mb-8 flex items-center gap-4">
                  <Code className="w-9 h-9" /> CSS Code Editor
                </h3>
                <textarea
                  value={cssCode}
                  onChange={(e) => setCssCode(e.target.value)}
                  placeholder="AI-generated CSS appears here..."
                  rows={20}
                  className="w-full font-mono text-sm bg-gray-900/70 border border-white/20 rounded-xl px-6 py-5 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none resize-none"
                />

                <button
                  onClick={uploadToGitHub}
                  disabled={isUploading || !cssCode}
                  className="w-full mt-8 py-6 text-2xl font-bold bg-white text-black rounded-3xl hover:scale-105 transition shadow-2xl relative overflow-hidden flex items-center justify-center gap-4"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shimmer"></div>
                  {isUploading ? (
                    <>
                      <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-9 h-9" />
                      Deploy to GitHub CDN
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column - Flip Card */}
            <div className="relative">
              <div className={`flip-card ${isFlipped ? "flipped" : ""}`}>
                <div className="flip-card-inner">
                  {/* Front: Usage */}
                  <div className="flip-card-front">
                    <div className="p-10 h-full flex flex-col">
                      <h3 className="text-3xl font-bold mb-8 flex items-center gap-4">
                        <FileText className="w-9 h-9" /> How to use it?
                      </h3>
                      <textarea
                        value={htmlCode}
                        readOnly
                        rows={18}
                        className="flex-1 font-mono text-sm bg-gray-900/70 border border-white/20 rounded-xl px-6 py-5 text-white resize-none"
                        placeholder="HTML usage appears here..."
                      />
                      <button
                        onClick={() => setIsFlipped(true)}
                        disabled={!htmlCode && !cssCode}
                        className="mt-8 py-6 text-2xl font-bold bg-white text-black rounded-3xl hover:scale-105 transition shadow-2xl flex items-center justify-center gap-4"
                      >
                        <Play className="w-8 h-8" />
                        Try it Live
                      </button>
                    </div>
                  </div>

                  {/* Back: Live Preview */}
                  <div className="flip-card-back">
                    <div className="p-10 h-full flex flex-col">
                      <h3 className="text-3xl font-bold mb-8 flex items-center gap-4">
                        <Zap className="w-9 h-9" /> Live Preview
                      </h3>
                      <div className="flex-1 bg-white rounded-2xl overflow-hidden shadow-2xl">
                        {(htmlCode || cssCode) ? (
                          <iframe
                            title="Live Preview"
                            srcDoc={htmlBoilerplate}
                            sandbox="allow-scripts"
                            className="w-full h-full"
                          />
                        ) : (
                          <div className="h-full flex items-center justify-center bg-gray-100 text-gray-600">
                            <div className="text-center">
                              <Zap className="w-20 h-20 mx-auto mb-6 opacity-40" />
                              <p className="text-2xl">Generate CSS to preview ✨</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setIsFlipped(false)}
                        className="mt-8 py-6 text-2xl font-bold bg-white text-black rounded-3xl hover:scale-105 transition shadow-2xl flex items-center justify-center gap-4"
                      >
                        <ArrowLeft className="w-8 h-8" />
                        Back to Usage
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Success Banner - Simple show/hide (no animation) */}
          {uploadResult && (
            <div className="mt-12 bg-[#1a1a1a] border-4 border-green-500/60 rounded-3xl p-10 shadow-2xl shadow-green-500/30">
              <h3 className="text-4xl font-bold mb-8 flex items-center gap-5 text-green-400">
                <CheckCircle className="w-12 h-12" /> Deployment Successful!
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-xl mb-3">CDN URL (ready to use):</label>
                  <div className="flex gap-4">
                    <input
                      value={uploadResult.cdnUrl}
                      readOnly
                      className="flex-1 px-6 py-4 bg-white/10 border border-green-500/50 rounded-xl text-green-300 font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(uploadResult.cdnUrl)}
                      className="px-8 py-4 bg-green-500/20 border border-green-500 text-green-400 rounded-xl hover:bg-green-500/40 transition flex items-center gap-3"
                    >
                      <Copy className="w-6 h-6" /> Copy
                    </button>
                  </div>
                </div>
                <div className="text-center">
                  <button
                    onClick={() => setIsFlipped(true)}
                    className="px-10 py-5 bg-green-500 hover:bg-green-600 text-white text-xl font-bold rounded-xl flex items-center gap-4 mx-auto"
                  >
                    <Play className="w-8 h-8" /> View Live Demo
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}