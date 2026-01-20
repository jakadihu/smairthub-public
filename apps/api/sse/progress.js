// sse/progress.js
export const sseClients = new Set();

export function progressStreamHandler(req, res) {
  // Kötelező SSE headerek
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Azonnali flush
  res.flushHeaders?.();

  // Keep-alive ping 25 másodpercenként
  const keepAlive = setInterval(() => {
    res.write(`data: ${JSON.stringify({ ping: true })}\n\n`);
  }, 25000);

  // Regisztráljuk a klienst
  sseClients.add(res);

  // Kapcsolat bontása
  req.on("close", () => {
    clearInterval(keepAlive);
    sseClients.delete(res);
  });
}

// Külső modulok innen küldhetnek progress eseményeket
export function sendProgress(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    client.write(payload);
  }
}
