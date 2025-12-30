const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, "") || ""; // e.g. http://localhost:8000

async function fileToFormData(file) {
  const fd = new FormData();
  fd.append("file", file);
  return fd;
}

// Preferred: your FastAPI endpoint (recommended)
export async function predictViaFastAPI(file) {
  if (!API_BASE) {
    throw new Error(
      "VITE_API_BASE is not set. Add VITE_API_BASE=http://localhost:8000 in frontend/.env (for local) or set to your hosted API."
    );
  }
  if (!file) throw new Error("No file selected.");

  const fd = await fileToFormData(file);
  const res = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    body: fd,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`API error ${res.status}: ${txt}`);
  }
  return res.json();
}

// Fallback: keep your older Space call if you still use it
// If you don't need HF Space anymore, you can delete this function.
export async function predictFromSpace(file) {
  throw new Error("predictFromSpace is not configured in this template.");
}
