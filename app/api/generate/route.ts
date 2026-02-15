import { type NextRequest, NextResponse } from "next/server"
import { Groq } from "groq-sdk";
import { OpenAI } from "openai";

const systemPrompts = {
    // ... (previous content not shown)
    css: `
You are an expert Frontend Developer specializing in high-end SaaS animations and interactive UI components. 
Your goal is to generate a premium, production-ready CSS animation component using **Vanilla CSS**.

### CRITICAL INSTRUCTION:
**OUTPUT ONLY THE RAW CODE.** 
- **DO NOT** use markdown code blocks (no triple backticks \`\`\`).
- **DO NOT** include any introductory or explanatory text.
- **DO NOT** include any conversational filler.
- Your response MUST start with \`<!DOCTYPE html>\` and end with \`</html>\`.

### Design Principles:
- **Aesthetic**: Follow user instructions for style. If unspecified, use a clean, modern, and neutral design.
- **ANIMATIONS & INTERACTIVITY**: use simple CSS animations/transitions if appropriate for the component type (e.g. hover states).
- **Rules**:
### Library Integration (Optional but Recommended):
- **Vanta.js (Net)**: For high-end animated 3D backgrounds in Hero sections.
- **AOS (Animate On Scroll)**: For smooth entry animations.
- **Lenis**: For professional smooth scrolling.

### Technical Constraints:
1. **Full Encapsulation**: Provide a complete HTML5 document including DOCTYPE, <html>, <head>, and <body>.
2. **Internal CSS**: Primary styles in <style> tag.
3. **External Libraries**: You MAY use the following CDNs:
    - Three.js: \`https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js\`
    - Vanta Net: \`https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js\`
    - AOS CSS: \`https://unpkg.com/aos@next/dist/aos.css\`
    - AOS JS: \`https://unpkg.com/aos@next/dist/aos.js\`
    - Lenis: \`https://cdn.jsdelivr.net/npm/@studio-freight/lenis@latest/dist/lenis.min.js\`
4. **Initialization**: Initialize AOS with \`AOS.init()\` and Lenis if used.
5. **No Global Styling**: Use unique class selectors.
`,
    tailwind: `
You are an expert Frontend Developer specializing in **Tailwind CSS**. 
Your goal is to generate a premium, production-ready UI component using **Tailwind CSS**.

### CRITICAL INSTRUCTION:
**OUTPUT ONLY THE RAW CODE.** 
- **DO NOT** use markdown code blocks.
- Your response MUST start with \`<!DOCTYPE html>\` and end with \`</html>\`.

### Design Guidelines:
- **SPOILER**: Do not include \`<script src="...">\` tags in your output. Only raw \`<script>CODE</script>\`.
- **ANIMATION CLASSES**: Use standard Tailwind transition/animation classes (\`transition-all\`, \`duration-200\`) where appropriate for interactivity.
- **Responsive**: Ensure the design works on all screens.
- **NO BODY STYLING**: **CRITICAL**: Do NOT apply styles to the \`<body>\` tag. Use a \`.container-fluid\` or wrapper div for backgrounds and global typography.
- **WHITE BACKGROUND CONTEXT**: Assume the component will be placed on a **WHITE background**. Ensure all text, icons, and elements have sufficient contrast against white (#ffffff).

### Technical Constraints:
1. **CDNs**: Include Tailwind (\`https://cdn.tailwindcss.com\`), plus AOS, Vanta, Three.js, and Lenis if needed.
2. **Setup**: Initialize AOS (\`AOS.init()\`) and Lenis in a script tag at the bottom.
`,
    bootstrap: `
You are an expert Frontend Developer specializing in **Bootstrap 5**. 
Your goal is to generate a premium, production-ready UI component using **Bootstrap 5 Classes**.

### CRITICAL INSTRUCTION:
**OUTPUT ONLY THE RAW CODE.** 
- **DO NOT** use markdown code blocks.
- Your response MUST start with \`<!DOCTYPE html>\` and end with \`</html>\`.

### Design Guidelines:
- **BOOTSTRAP FIRST**: Use Bootstrap 5 utility classes (e.g., \`mt-5\`, \`p-4\`, \`d-flex\`, \`justify-content-center\`, \`text-primary\`) for layout and styling.
- **MINIMIZE CUSTOM CSS**: Only include custom CSS in a \`<style>\` tag if the desired effect (like complex animations) cannot be achieved with Bootstrap classes.
- **Animations**: Use standard Bootstrap transitions or simple CSS/AOS where needed.
- **NO BODY STYLING**: **CRITICAL**: Do NOT apply styles to the \`<body>\` tag. Use a \`.container\` or \`.container-fluid\` wrapper.
- **WHITE BACKGROUND CONTEXT**: Assume the component will be placed on a **WHITE background**. Ensure all text, icons, and elements have sufficient contrast against white (#ffffff).

### Technical Constraints:
1. **CDNs**: Include Bootstrap 5 (\`https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css\`), plus AOS, Vanta, Three.js, and Lenis if needed.
2. **Setup**: Initialize AOS (\`AOS.init()\`) and Lenis in a script tag at the bottom.
`
};

const groq = new Groq({
    apiKey: process.env.GROQ_APII_KEY,
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const { prompt, framework, model, image } = await request.json()

        if (!prompt) {
            return NextResponse.json({ error: "Missing prompt" }, { status: 400 })
        }

        const systemPrompt = systemPrompts[framework as keyof typeof systemPrompts] || systemPrompts.css

        let generatedCode = "";

        if (model === "gpt-4o-mini") {
            const messages: any[] = [
                { role: "system", content: systemPrompt }
            ];

            if (image) {
                messages.push({
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        { type: "image_url", image_url: { url: image } }
                    ]
                });
            } else {
                messages.push({ role: "user", content: prompt });
            }

            const completion = await openai.chat.completions.create({
                messages: messages,
                model: "gpt-4o-mini",
                temperature: 0.7,
                max_tokens: 4000,
            });
            generatedCode = completion.choices[0]?.message?.content || "";
        } else if (model === "openrouter/aurora-alpha") {
            // OpenRouter (Aurora Alpha with Reasoning)
            try {
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${process.env.OPEN_ROUTER}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "openrouter/aurora-alpha",
                        messages: [
                            {
                                role: "system",
                                content: systemPrompt
                            },
                            {
                                role: "user",
                                content: prompt
                            }
                        ],
                        reasoning: { enabled: true }
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`OpenRouter API Error: ${response.statusText} - ${errorText}`);
                }

                const data = await response.json();
                generatedCode = data.choices?.[0]?.message?.content || "";

            } catch (err: any) {
                console.error("OpenRouter Error:", err);
                throw new Error(err.message || "Failed to generate with Aurora Alpha");
            }
        } else if (model === "nvidia/glm-5") {
            // NVIDIA GLM-5
            try {
                const nvidia = new OpenAI({
                    apiKey: process.env.NVIDIA_API_KEY,
                    baseURL: 'https://integrate.api.nvidia.com/v1',
                });

                const completion = await nvidia.chat.completions.create({
                    model: "openai/gpt-oss-120b",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: prompt } // Using prompt directly as content based on standard OpenAI usage, user snippet had empty content but we need to pass the prompt
                    ],
                    temperature: 0.5,
                    top_p: 1,
                    max_tokens: 1024,
                    extra_body: {
                        chat_template_kwargs: { "enable_thinking": true, "clear_thinking": false }
                    },
                    stream: false
                } as any);

                generatedCode = completion.choices[0]?.message?.content || "";
            } catch (err: any) {
                console.error("NVIDIA API Error:", err);
                throw new Error(err.message || "Failed to generate with GLM-5");
            }
        } else {
            // Default to Groq (Llama)
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: systemPrompt,
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.7,
                max_tokens: 4000,
            });
            generatedCode = chatCompletion.choices[0]?.message?.content || "";
        }

        if (generatedCode) {
            // Clean up the generated code - remove markdown code blocks if present
            generatedCode = generatedCode.replace(/```(?:[a-zA-Z]*)?\n?/, "").replace(/```$/, "")
            return NextResponse.json({ code: generatedCode.trim() })
        } else {
            throw new Error("No content generated from AI")
        }
    } catch (error: any) {
        console.error("AI generation error:", error)
        return NextResponse.json({
            error: "Failed to generate code",
            message: error.message
        }, { status: 500 })
    }
}