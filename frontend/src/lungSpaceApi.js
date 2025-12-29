const SPACE_URL = import.meta.env.VITE_SPACE_URL;
const FN_INDEX = Number(import.meta.env.VITE_GRADIO_FN_INDEX ?? 2);

// 1) Upload
export async function uploadToSpace(file) {
  const form = new FormData();
  form.append("files", file);

  const res = await fetch(`${SPACE_URL}/gradio_api/upload`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) throw new Error(`Upload failed (${res.status}): ${await res.text()}`);

  const json = await res.json();
  // Your Space returns: ["/tmp/gradio/.../image.png"]
  const path = Array.isArray(json) && typeof json[0] === "string" ? json[0] : null;
  if (!path) throw new Error(`Upload returned no path: ${JSON.stringify(json)}`);

  return {
    path,
    url: `${SPACE_URL}/gradio_api/file=${path}`,
    orig_name: file.name,
    size: file.size,
    mime_type: file.type || "application/octet-stream",
    meta: { _type: "gradio.FileData" },
  };
}

// 2) Start queued prediction -> returns event_id
export async function startPredict(fileData) {
  const res = await fetch(`${SPACE_URL}/gradio_api/call/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: [fileData], fn_index: FN_INDEX }),
  });

  if (!res.ok) throw new Error(`Predict start failed (${res.status}): ${await res.text()}`);

  const json = await res.json();
  if (!json?.event_id) throw new Error(`No event_id returned: ${JSON.stringify(json)}`);
  return json.event_id;
}

// 3) Listen to SSE for that event_id and return final output
export async function waitForResult(eventId) {
  const res = await fetch(`${SPACE_URL}/gradio_api/call/predict/${eventId}`, {
    method: "GET",
    headers: { Accept: "text/event-stream" },
  });

  if (!res.ok) throw new Error(`Predict stream failed (${res.status}): ${await res.text()}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buf = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buf += decoder.decode(value, { stream: true });

    const chunks = buf.split("\n\n");
    buf = chunks.pop() || "";

    for (const chunk of chunks) {
      const lines = chunk.split("\n").map((l) => l.trim());
      const eventLine = lines.find((l) => l.startsWith("event:"));
      const dataLine = lines.find((l) => l.startsWith("data:"));

      if (!dataLine) continue;

      const event = eventLine ? eventLine.replace("event:", "").trim() : "";
      const dataStr = dataLine.replace("data:", "").trim();

      if (!dataStr) continue;
      const payload = JSON.parse(dataStr);

      // When complete, payload will contain your JSON output in payload.data
      if (event === "complete") {
        return payload?.data?.[0] ?? payload?.data ?? payload;
      }

      // Some spaces emit "error"
      if (event === "error") {
        throw new Error(payload?.message ?? JSON.stringify(payload));
      }
    }
  }

  throw new Error("Stream ended without complete result.");
}

// 4) One function to call from UI
export async function predictFromSpace(file) {
  const fileData = await uploadToSpace(file);
  const eventId = await startPredict(fileData);
  return await waitForResult(eventId);
}
