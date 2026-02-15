import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const externalUrl = `http://srv1358945.hstgr.cloud:4000/response`;
        const res = await fetch(externalUrl);
        console.log(`Server2 Fetch Status: ${res.status}`);

        if (!res.ok) {
            return NextResponse.json({ error: `Server returned ${res.status}` }, { status: res.status });
        }

        const text = await res.text();
        console.log(`Server2 received ${text.length} characters`);

        try {
            // Try to parse as JSON first in case it actually is JSON
            const data = JSON.parse(text);
            return NextResponse.json(data);
        } catch (e) {
            // If not JSON, return as a raw string in a response field
            return NextResponse.json({ response: text });
        }
    } catch (error: any) {
        console.error("Server2 Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
