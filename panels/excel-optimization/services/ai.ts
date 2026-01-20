export async function callAI(prompt: string): Promise<string> {
  try {
    const response = await fetch("/api/ai", {
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

    return data.response;
  } catch (err: any) {
    console.error("callAI error:", err);
    throw new Error("AI request failed");
  }
}
