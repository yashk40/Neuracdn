import fetch from 'node-fetch';

async function testApi() {
    console.log("Testing API with updated prompts (OpenAI)...");
    try {
        const resOpenAI = await fetch("http://localhost:3000/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt: "Create a premium hero section with a vanta net background and AOS animations. Use a unique color palette like deep emerald and gold.",
                framework: "tailwind",
                model: "gpt-4o-mini"
            }),
        });
        const dataOpenAI = await resOpenAI.json();
        console.log("OpenAI Response:", dataOpenAI.code ? "Success (Code received)" : "Error: " + JSON.stringify(dataOpenAI));
        if (dataOpenAI.code) {
            console.log("Checking for CDNs in response...");
            const hasVanta = dataOpenAI.code.includes("vanta");
            const hasAOS = dataOpenAI.code.includes("aos");
            const hasLenis = dataOpenAI.code.includes("lenis");
            console.log(`Vanta: ${hasVanta}, AOS: ${hasAOS}, Lenis: ${hasLenis}`);
        }
    } catch (e) {
        console.log("OpenAI Request failed:", e.message);
    }
}

testApi();
