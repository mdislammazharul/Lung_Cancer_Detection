import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Image as ImageIcon, Upload, Terminal, ArrowLeft } from "lucide-react";
import { predictFromSpace } from "../lungSpaceApi";
import PredictionResult from "../components/PredictionResult";

export default function PredictPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onPredict = async () => {
    try {
      setLoading(true);
      setErr("");
      setResult(null);
      const out = await predictFromSpace(file);
      setResult(out);
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(1000px_600px_at_20%_0%,rgba(16,185,129,0.12),transparent_60%),radial-gradient(900px_500px_at_80%_10%,rgba(99,102,241,0.12),transparent_55%)]">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Overview
        </Link>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-2xl font-extrabold text-slate-900">Live Prediction</div>
              <div className="mt-1 text-sm text-slate-600">
                Upload an image and get class probabilities from the Hugging Face Space.
              </div>
            </div>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
              Hugging Face Space
            </span>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <label className="text-xs font-medium text-slate-600">Upload histopathology image</label>

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">
                  <Upload className="h-4 w-4" />
                  Choose File
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </label>

                <button
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                  onClick={onPredict}
                  disabled={!file || loading}
                >
                  <Terminal className="h-4 w-4" />
                  {loading ? "Predicting..." : "Predict"}
                </button>
              </div>

              <div className="mt-3 text-xs text-slate-600">
                {file ? (
                  <span className="flex min-w-0 items-center gap-2">
                    <ImageIcon className="h-4 w-4 flex-shrink-0 text-indigo-600" />
                    <span className="min-w-0 truncate">{file.name}</span>
                  </span>
                ) : (
                  "No file selected."
                )}
              </div>

              {err ? (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  {err}
                </div>
              ) : null}

              <div className="mt-4 aspect-[16/10] overflow-hidden rounded-xl border border-slate-200 bg-white">
                {preview ? (
                  <img src={preview} alt="preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-slate-500">
                    Preview will appear here.
                  </div>
                )}
              </div>
            </div>

            <div>
              {result ? (
                <PredictionResult result={result} />
              ) : (
                <div className="flex h-full min-h-[280px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
                  No prediction yet.
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 text-xs text-slate-500">
            Disclaimer: This demo is for educational purposes only and is not medical advice.
          </div>
        </div>
      </div>
    </div>
  );
}
