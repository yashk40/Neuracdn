import { type NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";
import { setBotState } from "@/lib/bot-state";

const groq = new Groq({
    apiKey: process.env.GROQ_APII_KEY,
});

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const prompt = searchParams.get("prompt");

        if (!prompt) {
            return NextResponse.json({
                status: "error",
                error: "Missing prompt"
            }, { status: 400 });
        }

        // Initialize state to loading
        setBotState({
            status: "loading",
            prompt,
            response: null,
            error: null
        });

        // Start generation in the background
        (async () => {
            try {
                const chatCompletion = await groq.chat.completions.create({
                    messages: [
                        {
                            role: "user",
                            content: prompt,
                        },
                    ],
                    model: "llama-3.3-70b-versatile",
                    temperature: 0.7,
                    max_tokens: 4000,
                });

                const generatedCode = chatCompletion.choices[0]?.message?.content || "";

                // Clean up markdown if AI includes it
                const cleanedCode = generatedCode.replace(/```(?:[a-zA-Z]*)?\n?/, "").replace(/```$/, "").trim();

                setBotState({
                    status: "completed",
                    response: cleanedCode
                });
            } catch (error: any) {
                console.error("Background generation error:", error);
                setBotState({
                    status: "failed",
                    error: error.message || "Failed to generate code"
                });
            }
        })();

        return NextResponse.json({
            status: "loading",
            message: "Generation started",
            prompt: prompt
        });

    } catch (error: any) {
        console.error("Bot API error:", error);
        return NextResponse.json({
            status: "failed",
            error: error.message || "Failed to initiate generation"
        }, { status: 500 });
    }
}
