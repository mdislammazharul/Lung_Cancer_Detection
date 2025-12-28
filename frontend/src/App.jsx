import { useState } from "react";

export default function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setResult(null);

    if (!file) {
      setErr("Please choose an image first.");
      return;
    }

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t);
      }
      const data = await res.json();
      setResult(data);
    } catch (e2) {
      setErr(String(e2.message || e2));
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 12, fontFamily: "Arial" }}>
      <h1>Lung Cancer Detection (CNN)</h1>
      <p>Upload a histopathology image (JPG/PNG) and get class probabilities.</p>

      <form onSubmit={onSubmit} style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button type="submit">Predict</button>
      </form>

      {err && <p style={{ color: "crimson" }}>{err}</p>}

      {result && (
        <div style={{ marginTop: 18, padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
          <h3>Prediction</h3>
          <p><b>Predicted class:</b> {result.predicted_class}</p>
          <pre style={{ background: "#f7f7f7", padding: 10, borderRadius: 8 }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
