async function listAllNvidiaModels() {
    const MODELS_URL = "https://integrate.api.nvidia.com/v1/models";
    const apiKey = "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";
    
    console.log("Listing ALL NVIDIA models...");
    try {
        const res = await fetch(MODELS_URL, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                Accept: "application/json",
            },
        });
        const data = await res.json();
        console.log("Status:", res.status);
        if (data.data) {
            const models = data.data.map(m => m.id);
            console.log("Found " + models.length + " models.");
            // Print them all or just prominent ones
            const interestingKeywords = ["llama", "mistral-nemo", "nemotron", "deepseek", "qwen", "phi", "gemma", "step", "glm"];
            const filtered = models.filter(id => interestingKeywords.some(k => id.toLowerCase().includes(k)));
            console.log("Interesting models:", JSON.stringify(filtered, null, 2));
        } else {
            console.log("Response:", JSON.stringify(data));
        }
    } catch (e) {
        console.log("Fetch failed:", e.message);
    }
}

listAllNvidiaModels();
