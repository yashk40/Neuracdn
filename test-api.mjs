import fetch from 'node-fetch';

async function testApi() {
    console.log("Testing API with Groq (Llama 3.3)...");
    try {
        const resGroq = await fetch("http://localhost:3000/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: "Hello", framework: "css", model: "llama-3.3-70b-versatile" }),
        });
        const dataGroq = await resGroq.json();
        console.log("Groq Response:", dataGroq.code ? "Success (Code received)" : "Error: " + JSON.stringify(dataGroq));
    } catch (e) {
        console.log("Groq Request failed (is server running?):", e.message);
    }

    console.log("\nTesting API with OpenAI (GPT-4o-mini)...");
    try {
        const resOpenAI = await fetch("http://localhost:3000/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: "Hello", framework: "css", model: "gpt-4o-mini" }),
        });
        const dataOpenAI = await resOpenAI.json();
        console.log("OpenAI Response:", dataOpenAI.code ? "Success (Code received)" : "Error: " + JSON.stringify(dataOpenAI));
    } catch (e) {
        console.log("OpenAI Request failed:", e.message);
    }
}

testApi();
