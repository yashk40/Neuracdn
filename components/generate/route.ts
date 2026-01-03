import { type NextRequest, NextResponse } from "next/server"

const systemPrompts = {
  // component: `Create a React-like component that can be used via CDN. Include all necessary HTML, CSS, and JavaScript in a single file. Make it self-contained and ready to use. Export the component properly for CDN usage.`,
  // widget: `Create an HTML widget with inline CSS and JavaScript. Make it completely self-contained and ready to embed anywhere. Include all styling and functionality in a single HTML file.`,
  // utility: `Create a JavaScript utility function. Provide clean, well-documented JavaScript code that can be used via CDN.`,
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

Example structure:

  `,
  // chart: `Create a chart/graph component using vanilla JavaScript. Make it self-contained and CDN-ready.`,
  // form: `Create a form component with HTML, CSS, and JavaScript. Include validation and modern styling. `,
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, codeType } = await request.json()

    if (!prompt || !codeType) {
      return NextResponse.json({ error: "Missing prompt or codeType" }, { status: 400 })
    }

    const systemPrompt = systemPrompts[codeType as keyof typeof systemPrompts] || systemPrompts.animation

    const fullPrompt = `${systemPrompt}

User Request: ${prompt}

Important requirements:
1. Make the code CDN-ready (can be loaded via script/link tag)
2. Include proper comments and documentation
3. Make it responsive and modern-looking
4. Include error handling where appropriate
5. Provide a clean, professional implementation
6. If it's JavaScript, include proper module exports
7. If it's HTML/CSS, make it self-contained

Generate only the code, no explanations outside of code comments.`

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen/qwen-2.5-coder-32b-instruct",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: fullPrompt,
          },
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OpenRouter API Error:", errorText)
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()

    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      let generatedCode = data.choices[0].message.content
      // Clean up the generated code - remove markdown code blocks if present
      generatedCode = generatedCode.replace(/```(?:[a-zA-Z]*)?\n?/, "").replace(/```$/, "")

      return NextResponse.json({ code: generatedCode.trim() })
    } else {
      throw new Error("No content generated from API")
    }
  } catch (error) {
    console.error("Code generation error:", error)
    return NextResponse.json({ error: "Failed to generate code" }, { status: 500 })
  }
}
