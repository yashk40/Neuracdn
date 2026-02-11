import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { fileName, content } = await req.json();

        const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
        const GITHUB_REPO = "neuracdn/CDN";

        if (!GITHUB_TOKEN) {
            return new Response("Missing GitHub credentials", { status: 500 });
        }

        const [owner, repo] = GITHUB_REPO.split("/");

        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${fileName}`;

        // Check if file exists to get SHA
        let sha: string | undefined;
        try {
            const getRes = await fetch(url, {
                headers: {
                    "Authorization": `Bearer ${GITHUB_TOKEN}`,
                    "Accept": "application/vnd.github.v3+json",
                },
            });
            if (getRes.ok) {
                const getData = await getRes.json();
                sha = getData.sha;
            }
        } catch (e) {
            console.error("Error fetching file SHA:", e);
        }

        const res = await fetch(url, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${GITHUB_TOKEN}`,
                "Accept": "application/vnd.github.v3+json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: sha ? "Update CSS animation via Neura CDN" : "Upload CSS animation via Neura CDN",
                content: Buffer.from(content).toString("base64"),
                branch: "main",
                sha: sha, // Include SHA if updating
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
