import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const model = process.argv[2] ?? process.env.GEMINI_MODEL ?? "gemini-3.6-flash";

if (!process.env.API_KEY) {
    console.error("API_KEY is missing. Set it in backend/.env, then rerun this script from backend/.");
    process.exitCode = 1;
} else {
    const client = new GoogleGenAI({
        apiKey: process.env.API_KEY,
        httpOptions: { timeout: 60_000 },
    });

    try {
        const response = await client.models.generateContent({
            model,
            contents: "Reply with: WORKING",
            config: { temperature: 0 },
        });
        const answer = response.text?.trim() ?? "";

        if (answer.toUpperCase().includes("WORKING")) {
            console.log(`Gemini verification passed (${model}): ${answer}`);
        } else {
            console.error(`Gemini returned no expected text (${model}): ${answer || "<empty response>"}`);
            process.exitCode = 1;
        }
    } catch (error) {
        const status = typeof error === "object" && error !== null && "status" in error
            ? ` (HTTP ${String(error.status)})`
            : "";
        console.error(`Gemini verification failed (${model})${status}. Check model access and backend logs.`);
        process.exitCode = 1;
    }
}
