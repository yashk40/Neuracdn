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

}

testApi();
