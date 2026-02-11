import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const prompt = searchParams.get("prompt");

    if (!prompt) {
        return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    try {
        const externalUrl = `http://srv1358945.hstgr.cloud:4000/prompt?prompt=${encodeURIComponent(prompt)}`;
        const res = await fetch(externalUrl);

        if (!res.ok) {
            return NextResponse.json({ error: "Failed to communicate with Neura AI" }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Neura AI Prompt Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
