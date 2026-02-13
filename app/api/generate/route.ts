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
- Your response MUST start with \`<!DOCTYPE html>\` and end with \`</html>\`.

### Design Guidelines:
- **Animations**: Use standard Bootstrap transitions or simple CSS where needed.
- **NO BODY STYLING**: **CRITICAL**: Do NOT apply styles to the \`<body>\` tag. Use a \`.container-fluid\` or wrapper div for backgrounds and global typography.
- **WHITE BACKGROUND CONTEXT**: Assume the component will be placed on a **WHITE background**. Ensure all text, icons, and elements have sufficient contrast against white (#ffffff).

### Technical Constraints:
1. **CDNs**: Include Bootstrap 5, AOS (CSS/JS), Vanta, Three.js, and Lenis.
2. **Initialization**: AOS and Lenis must be initialized.
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