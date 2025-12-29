import { useState } from "react";
import { predictFromSpace } from "./lungSpaceApi";

export default function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onPredict = async () => {
    try {
      setLoading(true);
      setErr("");
      setResult(null);
      const out = await predictFromSpace(file);
      setResult(out);
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <button disabled={!file || loading} onClick={onPredict} style={{ marginLeft: 12 }}>
        {loading ? "Predicting..." : "Predict"}
      </button>

      {err && <pre style={{ color: "red" }}>{err}</pre>}
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
