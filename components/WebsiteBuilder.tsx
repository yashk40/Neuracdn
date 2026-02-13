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
                        <div className="mt-2 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                            <span className="text-[10px] font-bold text-emerald-500 ml-1 uppercase tracking-wider">Thinking</span>
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
    const [thinkingMode, setThinkingMode] = useState(false); // Thinking mode toggle

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

    const toggleThinkingMode = async () => {
        const newMode = !thinkingMode;
        setThinkingMode(newMode);

        try {
            const mode = newMode ? 'on' : 'off';
            await fetch(`/api/neura/thinking?mode=${mode}`);
            toast.success(`Thinking mode ${mode === 'on' ? 'enabled' : 'disabled'}`);
        } catch (error) {
            console.error('Failed to toggle thinking mode:', error);
            toast.error('Failed to toggle thinking mode');
            setThinkingMode(!newMode); // Revert on error
        }
    };

    // Auto-disable thinking mode on component mount
    useEffect(() => {
        const disableThinkingMode = async () => {
            try {
                await fetch('/api/neura/thinking?mode=off');
            } catch (error) {
                console.error('Failed to disable thinking mode on mount:', error);
            }
        };
        disableThinkingMode();
    }, []);

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
                const timeoutLimit = 1000000; // 15 minutes in milliseconds

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
                    const elapsed = Date.now() - startTime;

                    if (elapsed > timeoutLimit) {
                        clearInterval(pollInterval);
                        setIsGenerating(false);
                        setAgentStates(prev => {
                            const newState = { ...prev };
                            Object.keys(newState).forEach(k => { if (newState[k] === "working") newState[k] = "error"; });
                            return newState;
                        });
                        setGenerationError("Generation timed out after 15 minutes. No matching response found.");
                        toast.error("Timeout: No matching prompt found within 15 minutes.");
                        return;
                    }

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
                const timeoutLimit = 300000; // 5 minutes in milliseconds

                let frameworkInstruction = "";
                if (selectedFramework === "css") {
                    frameworkInstruction = "use only strictly html css and js in one file and use lenis smooth scroll";
                } else if (selectedFramework === "tailwind") {
                    frameworkInstruction = "use only strictly html and tailwind css with cdn in one file and use lenis smooth scroll";
                } else if (selectedFramework === "bootstrap") {
                    frameworkInstruction = "use only strictly html and bootstrap 5 with cdn in one file and use lenis smooth scroll and use vanta js for hero page animations";
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
                    const elapsed = Date.now() - startTime;

                    if (elapsed > timeoutLimit) {
                        clearInterval(pollInterval);
                        setIsGenerating(false);
                        setAgentStates(prev => {
                            const newState = { ...prev };
                            Object.keys(newState).forEach(k => { if (newState[k] === "working") newState[k] = "error"; });
                            return newState;
                        });
                        setGenerationError("Generation timed out after 10 minutes.");
                        toast.error("Timeout: Generation took too long.");
                        return;
                    }

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

                            {/* Thinking Mode Toggle */}
                            <button
                                onClick={toggleThinkingMode}
                                disabled={isGenerating}
                                className={`border px-2.5 py-1 rounded-md flex items-center gap-1.5 text-[9px] font-bold shadow-sm outline-none transition-all ${thinkingMode ? "bg-purple-500 border-purple-600 text-white" : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300"} disabled:opacity-50`}
                            >
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>Thinking</span>
                                <span className={`text-[7px] font-extrabold ${thinkingMode ? "text-purple-100" : "text-zinc-400"}`}>
                                    {thinkingMode ? "ON" : "OFF"}
                                </span>
                            </button>
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
                                                ? "w-[260px] h-[520px] rounded-3xl ring-8 ring-black scale-100 origin-center"
                                                : "w-full h-full rounded-xl ring-0 scale-100"}`}
                                    >
                                        {/* Screen Content */}
                                        <div className={`w-full h-full overflow-hidden bg-white transition-all duration-500 ${viewMode === "mobile" ? "rounded-3xl" : "rounded-xl"}`}>
                                            <iframe
                                                title="Website Preview"
                                                srcDoc={generatedHtml ? generatedHtml.replace('</head>', '<style>::-webkit-scrollbar { display: none !important; width: 0 !important; } body { -ms-overflow-style: none !important; scrollbar-width: none !important; }</style></head>') : ''}
                                                className="w-full h-full border-0"
                                                sandbox="allow-scripts allow-same-origin"
                                            />
                                        </div>

                                        {/* Phone Notch - Only visible in mobile */}
                                        <div
                                            className={`absolute left-1/2 -translate-x-1/2 bg-black z-20 transition-all duration-500 ease-in-out -top-1 pointer-events-none
                                            ${viewMode === "mobile"
                                                    ? "w-full max-w-[50%] h-6 rounded-b-xl opacity-100"
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
