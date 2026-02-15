import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const externalUrl = `http://srv1358945.hstgr.cloud:4000/component`;
        const res = await fetch(externalUrl);
        console.log(`Component Fetch Status: ${res.status}`);

        if (!res.ok) {
            return NextResponse.json({ error: `Server returned ${res.status}` }, { status: res.status });
        }

        const text = await res.text();
        console.log(`Component received ${text.length} characters`);

        try {
            // Try to parse as JSON first
            const data = JSON.parse(text);
            return NextResponse.json(data);
        } catch (e) {
            // Check for the specific "html: `...`, css: `...`" format
            const htmlMatch = text.match(/html:\s*`([\s\S]*?)`/);
            const cssMatch = text.match(/css:\s*`([\s\S]*?)`/);

            if (htmlMatch || cssMatch) {
                return NextResponse.json({
                    html: htmlMatch ? htmlMatch[1] : "",
                    css: cssMatch ? cssMatch[1] : ""
                });
            }

            // If not JSON and not the specific format, return as raw response
            return NextResponse.json({ response: text });
        }
    } catch (error: any) {
        console.error("Component Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
