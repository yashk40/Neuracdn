import { type NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_APII_KEY,
});

// Helper function to commit file to GitHub
async function commitToGitHub(filePath: string, content: string, token: string) {
    const owner = "neuracdn";
    const repo = "Neura-packages";
    const branch = "main";
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

    // 1. Check if file exists to get SHA (for update)
    let sha: string | undefined;
    try {
        const getRes = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/vnd.github.v3+json",
            },
        });
        if (getRes.ok) {
            const getData = await getRes.json();
            sha = getData.sha;
        }
    } catch (e) {
        console.error(`Error checking file ${filePath}:`, e);
    }

    // 2. Create or Update file
    const res = await fetch(url, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/vnd.github.v3+json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            message: `chore: update ${filePath} via Neura AI`,
            content: Buffer.from(content).toString("base64"),
            branch: branch,
            sha: sha, // Include SHA if updating
        }),
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`GitHub Commit Failed for ${filePath}: ${errorText}`);
    }

    return await res.json();
}

export async function POST(request: NextRequest) {
    try {
        const { html, css, packageName, framework } = await request.json();
        const githubToken = process.env.GITHUB_TOKEN;

        if (!html) return NextResponse.json({ error: "Missing HTML content" }, { status: 400 });
        if (!githubToken) return NextResponse.json({ error: "Missing GITHUB_TOKEN" }, { status: 500 });
        if (!packageName) return NextResponse.json({ error: "Missing package name" }, { status: 400 });

        const componentName = packageName.trim();
        const isUtilityFramework = framework === "tailwind" || framework === "bootstrap";

        // 1. Generate Reusable Component Code
        const prompt = `
        You are an expert React Developer.
        Analyze the following HTML and CSS code. 
        Your task is to:
        1. Convert the HTML into a HIGHLY REUSABLE functional React JSX component named "Index".
           - **Props**: The component MUST accept \`className\`, \`children\`, and \`...props\`.
           - **Dynamic Content**: Identify static text or content and convert them into props (e.g., \`text\`, \`label\`, \`src\`). 
           - **Structure**:
             \`\`\`jsx
             import React from 'react';
             ${isUtilityFramework ? '' : "import './index.css';"}

             const Index = ({ children, className = "", ...props }) => {
               return (
                 <div className={\`original-class \${className}\`} {...props}>
                   {children || "Default Content"}
                 </div>
               );
             };

             export default Index;
             \`\`\`
           - **ClassNames**: Use standard 'className'. MERGE the provided \`className\` prop with the component's default classes.
           - **Spread Props**: Always spread \`...props\` to the root element.
           - **Exports**: The component must be a default export.
        2. ${isUtilityFramework ? "Ignore the CSS. Do NOT generate a CSS file or imports. The HTML classes are sufficient." : "Ensure the CSS is ready to be saved as a separate file. Remove any styles targeting `body`, `html`, or `*`."}

        Input HTML:
        ${html}

        Input CSS:
        ${css}

        RETURN JSON ONLY with this strict format:
        {
          "jsx": "code for index.jsx",
          "css": "${isUtilityFramework ? "" : "code for index.css"}"
        }
        `;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a code conversion assistant. Output strictly valid JSON." },
                { role: "user", content: prompt },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.2,
            max_tokens: 4000,
            response_format: { type: "json_object" },
        });

        const responseContent = completion.choices[0]?.message?.content;
        if (!responseContent) throw new Error("No content generated");

        const data = JSON.parse(responseContent);
        const { jsx, css: cleanCss } = data;

        // 2. Commit to GitHub: neuracdn/Neura-packages/UI/[packageName]/
        // File 1: index.jsx
        await commitToGitHub(`UI/${componentName}/index.jsx`, jsx, githubToken);

        // File 2: index.css (Only if NOT utility framework)
        if (!isUtilityFramework && cleanCss) {
            await commitToGitHub(`UI/${componentName}/index.css`, cleanCss, githubToken);
        }

        return NextResponse.json({
            success: true,
            componentName,
            path: `https://github.com/neuracdn/Neura-packages/tree/main/UI/${componentName}`
        });

    } catch (error: any) {
        console.error("NPM Publish to GitHub Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
