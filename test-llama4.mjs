import fetch from 'node-fetch';

async function testLlama4() {
    console.log("Testing API with Llama 4...");
    try {
        const response = await fetch("http://localhost:3000/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt: "Create a simple button",
                framework: "css",
                model: "meta/llama-4-scout-17b-16e-instruct"
            }),
        });
        const data = await response.json();
        console.log("Llama 4 Response Status:", response.status);
        if (data.error) {
            console.log("Llama 4 Error:", data.message || data.error);
        } else {
            console.log("Llama 4 Success: Code received");
            // console.log("Code snippet:", data.code.substring(0, 100) + "...");
        }
    } catch (e) {
        console.log("Llama 4 Request failed:", e.message);
    }
}

testLlama4();
