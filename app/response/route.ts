import { type NextRequest, NextResponse } from "next/server";
import { getBotState } from "@/lib/bot-state";

export async function GET(request: NextRequest) {
    const state = getBotState();

    // Return the state in the format requested by the user
    return NextResponse.json({
        status: state.status,
        prompt: state.prompt,
        response: state.response,
        error: state.error,
        lastUpdated: state.lastUpdated
    });
}
