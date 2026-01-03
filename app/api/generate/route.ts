import { type NextRequest, NextResponse } from "next/server"
import { Groq } from "groq-sdk";

const systemPrompts = {
    animation: `
You are an expert Frontend Developer specializing in high-end SaaS animations and interactive UI components. 
Your goal is to generate a premium, production-ready CSS animation component.

### CRITICAL INSTRUCTION:
**OUTPUT ONLY THE RAW CODE.** 
- **DO NOT** use markdown code blocks (no triple backticks \`\`\`).
- **DO NOT** include any introductory or explanatory text.
- **DO NOT** include any conversational filler.
- Your response MUST start with \`<!DOCTYPE html>\` and end with \`</html>\`.

### Design Principles:
- **Aesthetic**: Modern, minimalist, and "premium" (Apple/Vercel/Stripe style).
- **Techniques**: Use glassmorphism, soft shadows, vibrant gradients, and smooth Bezier transitions (\`cubic-bezier(0.4, 0, 0.2, 1)\`).
- **Variety**: Create morphing shapes, sophisticated 3D transforms, particle-like behaviors, or complex interactive hover states.

### Technical Constraints:
1. **Full Encapsulation**: Provide a complete HTML5 document including DOCTYPE, <html>, <head> (with meta tags), and <body>.
2. **Internal CSS**: All styles MUST be within a single <style> tag in the <head>. No external links.
3. **No Global Styling**: Use ONLY class selectors (e.g., .neura-card) or ID selectors. NEVER style raw HTML tags (div, body, section, etc.) directly. This is CRITICAL to prevent style leakage.
4. **Code Safety**: Ensure all class names are unique and descriptive.
5. **Responsiveness**: The component must be centered and look excellent on both mobile and desktop.
6. **No Dependencies**: Do not use external libraries (like Framer Motion or GSAP) unless explicitly requested. Everything must be pure CSS/HTML.

### Expected Structure:
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SaaS Animation Component</title>
    <style>
        /* Modern, class-based CSS here */
    </style>
</head>
<body>
    <div class="animation-container">
        <!-- Component markup here -->
    </div>
</body>
</html>
`,
}

const groq = new Groq({
    apiKey: "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",
});

export async function POST(request: NextRequest) {
    try {
        const { prompt, codeType } = await request.json()

        if (!prompt) {
            return NextResponse.json({ error: "Missing prompt" }, { status: 400 })
        }

        const systemPrompt = systemPrompts[codeType as keyof typeof systemPrompts] || systemPrompts.animation

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

        let generatedCode = chatCompletion.choices[0]?.message?.content || "";

        if (generatedCode) {
            // Clean up the generated code - remove markdown code blocks if present
            generatedCode = generatedCode.replace(/```(?:[a-zA-Z]*)?\n?/, "").replace(/```$/, "")
            return NextResponse.json({ code: generatedCode.trim() })
        } else {
            throw new Error("No content generated from Groq")
        }
    } catch (error: any) {
        console.error("Groq generation error:", error)
        return NextResponse.json({
            error: "Failed to generate code",
            message: error.message
        }, { status: 500 })
    }
}