import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const prompt = searchParams.get("prompt");

    if (!prompt) {
        return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    try {
        const externalUrl = `http://srv1358945.hstgr.cloud:4000/response?prompt=${encodeURIComponent(prompt)}`;
        const res = await fetch(externalUrl);

        if (!res.ok) {
            return NextResponse.json({ error: "Failed to fetch response from server" }, { status: res.status });
        }

        // The external server returns the raw HTML code or a JSON object containing it.
        // Based on user's "same code mileaga", it likely returns the same structure as Neura AI or raw string.
        // If it returns { response: "<html>..." }, we handle it.
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Server2 Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
