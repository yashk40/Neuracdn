import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    try {
        const externalUrl = `http://srv1358945.hstgr.cloud:4000/response?id=${id}`;
        const res = await fetch(externalUrl);

        if (!res.ok) {
            return NextResponse.json({ error: "Failed to communicate with Neura AI" }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Neura AI Response Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
