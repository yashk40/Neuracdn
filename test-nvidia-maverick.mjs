async function testNvidiaMaverick() {
    const NVIDIA_CHAT_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
    const apiKey = "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";
    
    console.log("Testing NVIDIA API with Llama 4 Maverick...");
    try {
        const res = await fetch(NVIDIA_CHAT_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                model: "meta/llama-4-maverick-17b-128e-instruct",
                messages: [{ role: "user", content: "Hello" }],
                max_tokens: 1024,
                temperature: 0.7,
                top_p: 1,
                stream: false
            }),
        });
        const text = await res.text();
        console.log("Status:", res.status);
        console.log("Response:", text);
    } catch (e) {
        console.log("Fetch failed:", e.message);
    }
}

testNvidiaMaverick();
