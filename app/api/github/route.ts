import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { fileName, content } = await req.json();

        // Use environment variables for sensitive GitHub credentials if possible, 
        // but ensuring functionality if they are missing by returning error.
        const GITHUB_TOKEN = "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";
        const GITHUB_REPO = "yashk40/NeuraCDN";

        if (!GITHUB_TOKEN || !GITHUB_REPO) {
            return new Response("Missing GitHub credentials in .env", { status: 500 });
        }

        const [owner, repo] = GITHUB_REPO.split("/");

        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${fileName}`;

        const res = await fetch(url, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${GITHUB_TOKEN}`,
                "Accept": "application/vnd.github.v3+json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: "Upload CSS animation via Neura CDN",
                content: Buffer.from(content).toString("base64"),
                branch: "main",
            }),
        });

        if (!res.ok) {
            const error = await res.text();
            return new Response(error, { status: 500 });
        }

        const data = await res.json();

        const cdnUrl = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@main/${fileName}`;
        const githubUrl = data.content.html_url;

        return NextResponse.json({ cdnUrl, githubUrl });
    } catch (error: any) {
        return new Response(error.message, { status: 500 });
    }
}
