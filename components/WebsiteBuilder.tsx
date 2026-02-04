"use client";

import { useState } from "react";
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
    Megaphone
} from "lucide-react";
import { toast } from "sonner";
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
            <div className="flex items-start gap-4">
                <div className={`
          p-3 rounded-2xl flex items-center justify-center shrink-0
          ${status === "working" ? "bg-zinc-800" : "bg-zinc-100"}
          ${status === "completed" ? "bg-green-100 text-green-600" : ""}
        `}>
                    {status === "working" ? <Loader2 className="w-5 h-5 animate-spin" /> : icon}
                </div>
                <div>
                    <h4 className={`text-sm font-bold mb-1 ${status === "working" ? "text-white" : "text-zinc-900"}`}>{title}</h4>
                    <p className={`text-xs ${status === "working" ? "text-zinc-400" : "text-zinc-500"}`}>{description}</p>
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

export default function WebsiteBuilder() {
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedHtml, setGeneratedHtml] = useState("");
    const [generationError, setGenerationError] = useState(""); // New Error State
    const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
    const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
    const [selectedFramework, setSelectedFramework] = useState<"css" | "tailwind" | "bootstrap">("css"); // Default Raw CSS
    const [showPreview, setShowPreview] = useState(false);
    const [mobileTab, setMobileTab] = useState<"builder" | "preview">("builder"); // New Mobile Tab State

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
            const bodyContent = doc.body.innerHTML;
            const styleContent = doc.querySelector('style')?.outerHTML || "";
            return { body: bodyContent, style: styleContent };
        } catch (e) {
            return { body: html, style: "" }; // Fallback
        }
    };

    const generateComponent = async (section: string, sectionPrompt: string) => {
        try {
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: `${sectionPrompt}. Context: The user wants a website described as: "${prompt}". Use ${selectedFramework === 'css' ? 'Vanilla CSS' : selectedFramework === 'tailwind' ? 'Tailwind CSS' : 'Bootstrap 5'}.`,
                    framework: selectedFramework
                }),
            });
            if (!res.ok) throw new Error(`Failed to generate ${section}`);
            const data = await res.json();
            return extractBodyContent(data.code);
        } catch (error) {
            console.error(error);
            return { body: `<div class="p-4 border border-red-200 bg-red-50 text-red-500 text-center">Failed to generate ${section}</div>`, style: "" };
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
            // Step 1: Header Agent
            setAgentStates(prev => ({ ...prev, header: "working" }));
            const headerData = await generateComponent("Header", "Create a premium, responsive navigation header with logo, navigation links, and a call-to-action button. Ensure it looks professional and modern.");
            setParts(prev => ({ ...prev, header: headerData.body }));
            setAgentStates(prev => ({ ...prev, header: "completed" }));

            // Step 2: Hero Agent
            setAgentStates(prev => ({ ...prev, hero: "working" }));
            const heroData = await generateComponent("Hero", "Create a high-converting hero section with a compelling headline, subheadline, and primary/secondary CTA buttons. Use a modern layout with plenty of whitespace.");
            setParts(prev => ({ ...prev, hero: heroData.body }));
            setAgentStates(prev => ({ ...prev, hero: "completed" }));

            // Step 3: Features Agent
            setAgentStates(prev => ({ ...prev, features: "working" }));
            const featuresData = await generateComponent("Features", "Create a robust 'Features' section with a section title, subtitle, and a responsive grid of 3-6 feature cards. Each card must have a unique icon/emoji, bold title, and descriptive text. Use hover effects and proper spacing.");
            setParts(prev => ({ ...prev, features: featuresData.body }));
            setAgentStates(prev => ({ ...prev, features: "completed" }));

            // Step 4: Testimonials Agent (New)
            setAgentStates(prev => ({ ...prev, testimonials: "working" }));
            const testimonialsData = await generateComponent("Testimonials", "Create a 'Testimonials' section (Social Proof). Include a section header and a grid/flex layout of 3 client review cards. Each card shows a quote, user avatar/emoji, name, and role. Make it trust-inspiring.");
            setParts(prev => ({ ...prev, testimonials: testimonialsData.body }));
            setAgentStates(prev => ({ ...prev, testimonials: "completed" }));

            // Step 5: CTA Agent (New)
            setAgentStates(prev => ({ ...prev, cta: "working" }));
            const ctaData = await generateComponent("CallToAction", "Create a high-impact 'Call to Action' (CTA) section. It should have a bold background color, a compelling headline asking the user to start now, and a large button. Ensure high contrast and center alignment.");
            setParts(prev => ({ ...prev, cta: ctaData.body }));
            setAgentStates(prev => ({ ...prev, cta: "completed" }));

            // Step 6: Footer Agent
            setAgentStates(prev => ({ ...prev, footer: "working" }));
            const footerData = await generateComponent("Footer", "Create a comprehensive website footer. Include multiple columns: Brand info (logo + text), Quick Links, Resources, and a Newsletter subscription form. Add copyright and social links at the bottom.");
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
                    ${headerData.style}
                    ${heroData.style}
                    ${featuresData.style}
                    ${testimonialsData.style}
                    ${ctaData.style}
                    ${footerData.style}
                `;
            }

            const finalHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
    ::-webkit-scrollbar { display: none; }
    html { -ms-overflow-style: none; scrollbar-width: none; }
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
</body>
</html>`;

            // Step 6: QA Agent (New)
            setAgentStates(prev => ({ ...prev, merge: "completed", qa: "working" }));

            // Call AI to validate and fix code
            const qaRes = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: `Review the following HTML code checks for valid ${selectedFramework === 'css' ? 'CSS' : selectedFramework === 'tailwind' ? 'Tailwind classes' : 'Bootstrap classes'} and responsive design. Fix issues, ensure no duplicate tags, and return valid HTML. Context: ${prompt}. \n\n CODE: ${finalHtml}`,
                    framework: selectedFramework
                }),
            });

            if (qaRes.ok) {
                const qaData = await qaRes.json();
                // For QA result, we use the full code returned, assuming the QA agent respects structure
                setGeneratedHtml(qaData.code); // Use the QA's full output
            } else {
                console.error("QA Step failed, using merged code");
                setGeneratedHtml(finalHtml); // Fallback
            }

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
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-black rounded-lg">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-bold text-lg">Orchestrator</h3>
                        </div>
                        <select
                            value={selectedFramework}
                            onChange={(e) => setSelectedFramework(e.target.value as any)}
                            disabled={isGenerating}
                            className="bg-zinc-100 border border-zinc-200 text-xs font-bold px-3 py-1.5 rounded-lg outline-none cursor-pointer hover:bg-zinc-200 transition-colors"
                        >
                            <option value="css">Raw CSS</option>
                            <option value="tailwind">Tailwind</option>
                            <option value="bootstrap">Bootstrap</option>
                        </select>
                    </div>
                    <div className="relative">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe your dream website (e.g., 'A modern gym landing page with dark theme...')"
                            className="w-full h-32 bg-zinc-50 border border-zinc-200 rounded-[2rem] p-5 text-sm font-medium focus:ring-2 focus:ring-black outline-none transition-all resize-none"
                        />
                        <button
                            onClick={startGeneration}
                            disabled={isGenerating || !prompt}
                            className="absolute bottom-4 right-4 bg-black text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-zinc-800 disabled:opacity-50 transition-all"
                        >
                            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            {isGenerating ? "BUILDING..." : "GENERATE"}
                        </button>
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
            <div className={`w-full lg:w-2/3 bg-zinc-100 rounded-[2.5rem] border border-zinc-200 overflow-hidden flex-col shadow-inner min-h-[80vh] lg:min-h-0 ${mobileTab === 'preview' ? 'flex' : 'hidden lg:flex'}`}>
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
                    <div className="flex bg-zinc-100 p-1 rounded-lg">
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
                    <div className="w-20" /> {/* Spacer for balance */}
                </div>

                {/* Content Area */}
                <div className="flex-1 relative">
                    {activeTab === "preview" ? (
                        <div className="w-full h-full bg-white relative">
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
                                <div className={`w-full h-full text-center transition-all duration-1000 ease-out flex justify-center ${showPreview ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                                    <iframe
                                        title="Website Preview"
                                        srcDoc={generatedHtml}
                                        className={`h-full border-0 bg-white shadow-lg transition-all duration-500 ${viewMode === "mobile" ? "w-[375px] rounded-3xl border-8 border-zinc-900 my-4" : "w-full"}`}
                                        sandbox="allow-scripts allow-same-origin"
                                    />
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
