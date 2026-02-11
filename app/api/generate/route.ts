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
- **Aesthetic**: Modern, minimalist, and "premium" (Apple/Vercel/Stripe style).
- **Techniques**: Use glassmorphism, soft shadows, vibrant gradients, and smooth Bezier transitions (\`cubic-bezier(0.4, 0, 0.2, 1)\`).
- **DIVERSITY & VARIETY**: **It is CRITICAL that every component looks unique.** Do not stick to a single layout. Use varied color palettes (deep neons, soft pastels, dark mode, glass layers), distinct typographic scales, and creative geometric shapes. **NEVER generate the same design twice.** If the user doesn't specify a style, pick a unique and bold design direction yourself.
- **ANIMATIONS & INTERACTIVITY**: Use CSS animations, transitions, and hover effects. **CRITICAL LIBRARY RULES**:
  1. **Vanta.js**: You MUST use \`window.THREE\`. **ALWAYS** check for the element \`#vanta-bg\` before initializing.
  2. **Lenis**: **NEVER** call \`lenis.init()\`. It initializes itself.
  3. **Script Tags**: Wrap all Javascript in \`<script>\` tags. Do not include external CDN links.
- **Hero Background ID**: When creating an animated background for the Hero section, the container div MUST have \`id="vanta-bg"\`.
- **Vanta Initialization Example**: Use this pattern: 
  \`\`\`javascript
  <script>
  (function() {
    const el = document.querySelector('#vanta-bg');
    if (el && typeof VANTA !== 'undefined' && window.THREE) {
      VANTA.NET({ el: el, mouseControls: true, touchControls: true, gyroControls: false, minHeight: 200.00, minWidth: 200.00, scale: 1.00, scaleMobile: 1.00, color: 0x3fb4ff, backgroundColor: 0x0 });
    }
  })();
  </script>
  \`\`\`
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
6. **NO BODY STYLING**: **CRITICAL**: Do NOT style the \`<body>\` tag with background-color or font-family. The component must be transparent or use a specific container div (e.g., \`.main-container\`) for any background styles. The body tag should remain clean.
7. **WHITE BACKGROUND CONTEXT**: Assume the component will be placed on a **WHITE background**. Ensure all text, icons, and elements have sufficient contrast against white (#ffffff). Use darker colors for text/lines unless it's a specific dark-mode component.
`,
    tailwind: `
You are an expert Frontend Developer specializing in **Tailwind CSS**. 
Your goal is to generate a premium, production-ready UI component using **Tailwind CSS**.

### CRITICAL INSTRUCTION:
**OUTPUT ONLY THE RAW CODE.** 
- **DO NOT** use markdown code blocks.
- Your response MUST start with \`<!DOCTYPE html>\` and end with \`</html>\`.

### Design Guidelines:
- **DIVERSITY IS KEY**: **NEVER** use the same layout twice. Mix up typography, spacing, and component arrangements. 
- **Layout Experimentation**: Use sidebar-based layouts, grid-heavy layouts, bento-box styles, or minimal centered layouts.
- **Typography and Color**: Experiment with bold typography vs minimal fine-line styles. Use modern color combinations (e.g., Indigo/Lime, Slate/Amber, Deep Purple/Cyan) beyond just gray/black/white.
- **PREMIUM EFFECTS**: For high-impact sections (like Hero), you can use Vanta.js. Create a container with \`id="vanta-bg"\`. **CRITICAL**: Always ensure \`window.THREE = THREE\` before calling \`VANTA.NET\`. 
- **LIBRARIES**: **NEVER** call \`lenis.init()\`. Just use the CSS or wait for auto-init.
- **SPOILER**: Do not include \`<script src="...">\` tags in your output. Only raw \`<script>CODE</script>\`.
- **ANIMATION CLASSES**: Use Tailwind's transition and animation utilities (\`animate-pulse\`, \`hover:scale-110\`) or custom CSS animations within a \`<style>\` tag.
- **Responsive**: Ensure the design works on all screens.
- **Premium Look**: High-quality shadows, subtle gradients, and large typography.
- **NO BODY STYLING**: **CRITICAL**: Do NOT apply \`bg-...\` or \`font-...\` classes to the \`<body>\` tag. Apply them to a main wrapper \`div\` inside the body instead.
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
- **Style**: Professional and modern. **Ensure design variety.** 
- **Component Variety**: Do NOT just use standard cards. Experiment with Carousels, Accordions, custom Masonry-style grids, and off-canvas elements to keep layouts fresh.
- **Vibe**: Even within Bootstrap, aim for a unique "vibe" (e.g., high-tech, organic, brutalist) for each generation.
- **Animations**: Use **AOS** for scroll animations and **Vanta.js** for background effects.
- **Smooth Scroll**: Implement **Lenis** for a premium feel.
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
        const { prompt, framework, model } = await request.json()

        if (!prompt) {
            return NextResponse.json({ error: "Missing prompt" }, { status: 400 })
        }

        const systemPrompt = systemPrompts[framework as keyof typeof systemPrompts] || systemPrompts.css

        let generatedCode = "";

        if (model === "gpt-4o-mini") {
            const completion = await openai.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: prompt },
                ],
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