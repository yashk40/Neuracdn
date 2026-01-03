import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { fileName, content } = await req.json();

  if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO) {
    return new Response("Missing GitHub credentials", { status: 500 });
  }

  const [owner, repo] = process.env.GITHUB_REPO.split("/");

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${fileName}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
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

  return new Response(JSON.stringify({ cdnUrl, githubUrl }), { status: 200 });
}