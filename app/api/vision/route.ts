import { type NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const image = formData.get("image") as File;

        if (!image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        // Convert image to base64
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = buffer.toString("base64");

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Analyze this image and provide a highly detailed, technical prompt that would allow another AI model to recreate this exact UI component (e.g., a loader, button, card, etc.) using HTML and CSS. Focus on colors, animations, shapes, shadows, and positioning. Output ONLY the prompt text.",
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:${image.type};base64,${base64Image}`,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 1000,
        });

        const description = response.choices[0]?.message?.content;

        if (!description) {
            throw new Error("Failed to get description from OpenAI");
        }

        return NextResponse.json({ prompt: description });
    } catch (error: any) {
        console.error("Vision API error:", error);
        return NextResponse.json(
            { error: "Vision analysis failed", message: error.message },
            { status: 500 }
        );
    }
}
