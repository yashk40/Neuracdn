import fetch from 'node-fetch';

async function testModels() {
    const ports = [3000, 3001];
    const models = [
        "meta/llama-4-maverick-17b-128e-instruct",
        "meta/llama-3.3-70b-instruct",
        "qwen/qwen2.5-coder-32b-instruct",
        "google/gemma-3-27b-it"
    ];

    let workingPort = null;
    for (const port of ports) {
        try {
            const res = await fetch(`http://localhost:${port}`);
            if (res.ok || res.status === 404) {
                workingPort = port;
                console.log(`Found server on port ${port}`);
                break;
            }
        } catch (e) {}
    }

    if (!workingPort) {
        console.log("Could not find a running server on port 3000 or 3001.");
        return;
    }

    for (const model of models) {
        console.log(`Testing API with ${model} on port ${workingPort}...`);
        try {
            const response = await fetch(`http://localhost:${workingPort}/api/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: "Create a simple card with a title and description",
                    framework: "css",
                    model: model
                }),
            });
            const data = await response.json();
            console.log(`${model} Response Status:`, response.status);
            if (data.error) {
                console.log(`${model} Error:`, data.message || data.error);
            } else {
                console.log(`${model} Success: Code received`);
            }
        } catch (e) {
            console.log(`${model} Request failed:`, e.message);
        }
        console.log("---");
    }
}

testModels();
