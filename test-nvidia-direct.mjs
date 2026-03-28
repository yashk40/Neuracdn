async function testNvidiaDirect() {
    const NVIDIA_CHAT_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
    const apiKey = "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";
    
    console.log("Testing NVIDIA API with hardcoded key...");
    try {
        const res = await fetch(NVIDIA_CHAT_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                model: "meta/llama-4-scout-17b-16e-instruct",
                messages: [{ role: "user", content: "Hello" }],
                max_tokens: 1024,
                temperature: 0.7,
                top_p: 1,
                stream: false
            }),
        });
        const text = await res.text();
        console.log("Status:", res.status);
        console.log("Response Text:", text);
        try {
            const json = JSON.parse(text);
            console.log("Parsed JSON:", JSON.stringify(json, null, 2));
        } catch (e) {
            console.log("Response is not JSON");
        }
    } catch (e) {
        console.log("Fetch failed:", e.message);
    }
}

testNvidiaDirect();
