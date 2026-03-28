import fetch from 'node-fetch';

async function testApi() {
    console.log("Testing API with updated prompts (Groq Llama)...");
    try {
        const resOpenAI = await fetch("http://localhost:3000/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt: "Create a premium hero section with a vanta net background and AOS animations. Use a unique color palette like deep emerald and gold.",
                framework: "tailwind",
                model: "llama-3.3-70b-versatile"
            }),
        });
        const data = await resOpenAI.json();
        console.log("Groq Response:", data.code ? "Success (Code received)" : "Error: " + JSON.stringify(data));
        if (data.code) {
            console.log("Checking for CDNs in response...");
            const hasVanta = data.code.includes("vanta");
            const hasAOS = data.code.includes("aos");
            const hasLenis = data.code.includes("lenis");
            console.log(`Vanta: ${hasVanta}, AOS: ${hasAOS}, Lenis: ${hasLenis}`);
        }
    } catch (e) {
        console.log("Request failed:", e.message);
    }
}

testApi();
