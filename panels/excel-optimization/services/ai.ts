export async function callAI(prompt: string): Promise<string> {
  try {
    const API = process.env.NEXT_PUBLIC_API_URL;

    const response = await fetch(`${API}/ai`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data || typeof data.response !== "string") {
      throw new Error("Invalid AI response format");
    }

    const cleaned = data.response
      .replace(/```json/i, "")
      .replace(/```/g, "")
      .trim();

    return cleaned;
  } catch (err: any) {
    console.error("callAI error:", err);
    throw new Error("AI request failed");
  }
}
