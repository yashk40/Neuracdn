import { type NextRequest, NextResponse } from "next/server"
import { Groq } from "groq-sdk";

const systemPrompts = {
    animation: `
  Create a modern, clean CSS animation component with the following requirements:

1. **Complete HTML Structure**: Provide a full HTML document with proper DOCTYPE, head, and body sections
2. **Embedded CSS**: Include all CSS styles within <style> tags in the head section - no external stylesheets
3. **Class/ID Selectors Only**: Use only class selectors (.class-name) or ID selectors (#id-name) - never style HTML tags directly (no div, p, span, etc.)
4. **Modern Animations**: Create smooth, modern CSS animations using keyframes, transforms, and transitions
5. **Responsive Design**: Ensure the animation works well on different screen sizes
6. **Clean Code**: Use descriptive class names and well-commented CSS
7. **Ready to Use**: The output should be a complete, self-contained HTML file that can be saved and opened in any browser
8. **Animation Focus**: The component should showcase impressive visual effects like hover animations, loading spinners, morphing shapes, or interactive elements

Structure the output as:
- Complete HTML5 document
- All CSS embedded in <style> tags within <head>
- HTML body containing the animated component using only classes/IDs
- Include meta tags for viewport and charset
- Add a descriptive title
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