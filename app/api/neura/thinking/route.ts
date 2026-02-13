import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode");

    if (!mode || (mode !== "on" && mode !== "off")) {
        return NextResponse.json({ error: "Mode must be 'on' or 'off'" }, { status: 400 });
    }

    try {
        const externalUrl = `http://srv1358945.hstgr.cloud:4000/thinking?mode=${mode}`;
        const res = await fetch(externalUrl);

        if (!res.ok) {
            return NextResponse.json({ error: "Failed to communicate with Neura AI" }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Neura AI Thinking Mode Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
