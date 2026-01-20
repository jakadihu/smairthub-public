export function sendProgressEvent(data: { current: number; total: number }) {
  fetch("/progress-stream/push", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
}
