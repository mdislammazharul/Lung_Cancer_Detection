import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Boxes,
  Cpu,
  Database,
  FlaskConical,
  Github,
  Globe,
  Image as ImageIcon,
  Layers,
  PlayCircle,
  Rocket,
  ShieldCheck,
  Terminal,
  Upload,
} from "lucide-react";

import { predictViaFastAPI } from "./lungSpaceApi";

const LINKS = {
  live: "https://mdislammazharul.github.io/Lung_Cancer_Detection/",
  repo: "https://github.com/mdislammazharul/Lung_Cancer_Detection",
  docker: "https://hub.docker.com/r/mdislammazharul/lung-cancer-api",
};

const Section = ({ id, title, subtitle, icon: Icon, children }) => (
  <motion.section
    id={id}
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.45, ease: "easeOut" }}
    className="mt-12"
  >
    <div className="flex items-start gap-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <Icon className="h-5 w-5 text-emerald-600" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
      </div>
    </div>
    <div className="mt-4">{children}</div>
  </motion.section>
);

const Card = ({ title, icon: Icon, children, accent = false }) => (
  <div
    className={[
      "rounded-2xl border bg-white p-5 shadow-sm",
      accent ? "border-emerald-200/70 ring-1 ring-emerald-100" : "border-slate-200",
    ].join(" ")}
  >
    <div className="mb-3 flex items-center gap-2">
      {Icon ? <Icon className="h-4 w-4 text-indigo-600" /> : null}
      <div className="text-sm font-semibold text-slate-800">{title}</div>
    </div>
    {children}
  </div>
);

const Metric = ({ label, value, icon: Icon }) => (
  <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4">
    <div className="flex items-center justify-between">
      <div className="text-xs font-medium text-slate-600">{label}</div>
      {Icon ? <Icon className="h-4 w-4 text-emerald-600" /> : null}
    </div>
    <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
  </div>
);

export default function App() {
  // ------- Dataset samples (served from frontend/public/sample_requests/) -------
  const [sampleList, setSampleList] = useState([]);
  const [sampleSelected, setSampleSelected] = useState("");
  const [sampleUrl, setSampleUrl] = useState("");

  useEffect(() => {
    // expects: frontend/public/sample_requests/index.json (array of filenames)
    fetch(`${import.meta.env.BASE_URL}sample_requests/index.json`)
      .then((r) => (r.ok ? r.json() : []))
      .then((arr) => {
        if (Array.isArray(arr)) {
          setSampleList(arr);
          if (arr.length > 0) setSampleSelected(arr[0]);
        }
      })
      .catch(() => {
        // Optional feature: if not present, silently ignore
        setSampleList([]);
      });
  }, []);

  useEffect(() => {
    if (!sampleSelected) return;
    setSampleUrl(`${import.meta.env.BASE_URL}sample_requests/${sampleSelected}`);
  }, [sampleSelected]);

  // ------- Try Prediction widget -------
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
      const out = await predictViaFastAPI(file);
      setResult(out);
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const report = useMemo(
    () => [
      { cls: "lung_n", precision: 1.0, recall: 0.97, f1: 0.98, support: 987 },
      { cls: "lung_aca", precision: 0.93, recall: 0.76, f1: 0.84, support: 977 },
      { cls: "lung_scc", precision: 0.81, recall: 0.98, f1: 0.89, support: 1036 },
    ],
    []
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(1000px_600px_at_20%_0%,rgba(16,185,129,0.12),transparent_60%),radial-gradient(900px_500px_at_80%_10%,rgba(99,102,241,0.12),transparent_55%)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-12 xl:px-20">
        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="grid gap-8 lg:grid-cols-12"
        >
          <div className="lg:col-span-7">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <Layers className="h-4 w-4" /> END-TO-END ML
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                <ShieldCheck className="h-4 w-4" /> FASTAPI + DOCKER
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-medium text-slate-700">
                <Globe className="h-4 w-4" /> REACT + GITHUB PAGES
              </span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Lung Cancer Detection
              <span className="block bg-gradient-to-r from-emerald-600 to-indigo-600 bg-clip-text text-transparent">
                CNN + Full-Stack Deployment
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
              Train a CNN on histopathology images, export versioned artifacts, serve predictions via FastAPI,
              containerize with Docker, and deploy a frontend to GitHub Pages.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                href={LINKS.live}
                target="_blank"
                rel="noreferrer"
              >
                <Rocket className="h-4 w-4" /> Open Live Site
              </a>
              <a
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                href={LINKS.repo}
                target="_blank"
                rel="noreferrer"
              >
                <Github className="h-4 w-4" /> View Source
              </a>
              <a
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
                href={LINKS.docker}
                target="_blank"
                rel="noreferrer"
              >
                <Boxes className="h-4 w-4" /> Docker Hub Image
              </a>
            </div>

            {/* Try Prediction (embedded) */}
            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-emerald-600" />
                  <div className="text-sm font-semibold text-slate-900">Try Prediction</div>
                </div>
                <div className="text-xs text-slate-500">FastAPI (VITE_API_BASE)</div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
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
                      <span className="inline-flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-indigo-600" />
                        {file.name}
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
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-xs font-medium text-slate-600">Preview / Result</div>

                  <div className="mt-2 grid gap-3">
                    <div className="aspect-[16/10] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      {preview ? (
                        <img src={preview} alt="preview" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-slate-500">
                          Upload an image to preview it here.
                        </div>
                      )}
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="text-xs font-semibold text-slate-700">API output</div>
                      <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-white p-2 text-xs text-slate-800">
                        {result ? JSON.stringify(result, null, 2) : "No prediction yet."}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-xs text-slate-500">
                Tip: run backend locally via Docker Hub image and keep VITE_API_BASE=http://localhost:8000
              </div>
            </div>
          </div>

          {/* PERFORMANCE */}
          <div className="lg:col-span-5">
            <Card title="Model Performance (Test Set)" icon={Activity} accent>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <Metric label="Accuracy" value="0.90" icon={ShieldCheck} />
                <Metric label="Macro F1" value="0.90" icon={Cpu} />
                <Metric label="Weighted F1" value="0.90" icon={FlaskConical} />
              </div>
              <div className="mt-4 rounded-xl border border-emerald-200/60 bg-emerald-50 p-4">
                <div className="text-xs font-semibold text-emerald-900">Key takeaway</div>
                <p className="mt-1 text-sm text-emerald-900/80">
                  Normal tissue is classified extremely well (F1 0.98). Adenocarcinoma has lower recall (0.76),
                  while squamous cell carcinoma has very high recall (0.98) with more false positives.
                </p>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* TECH ARCH */}
        <Section
          id="architecture"
          title="Technical Architecture"
          subtitle="Training produces versioned artifacts; backend serves inference; frontend consumes the API and is deployed to GitHub Pages."
          icon={Boxes}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card title="Training (Python)" icon={FlaskConical}>
              <div className="text-sm text-slate-600">
                Training pipeline in <span className="font-medium text-slate-900">src/lung_cancer</span> exports artifacts to{" "}
                <span className="font-medium text-slate-900">artifacts/models/v1</span>.
              </div>
            </Card>
            <Card title="Artifacts (Versioned)" icon={Database}>
              <div className="text-sm text-slate-600">
                Model + metadata: <span className="font-medium text-slate-900">lung_cnn.keras</span>,{" "}
                <span className="font-medium text-slate-900">classes.json</span>,{" "}
                <span className="font-medium text-slate-900">metadata.json</span>.
              </div>
            </Card>
            <Card title="FastAPI Backend" icon={Cpu}>
              <div className="text-sm text-slate-600">
                Inference API in <span className="font-medium text-slate-900">backend/</span>, served via Uvicorn on port{" "}
                <span className="font-medium text-slate-900">8000</span>.
              </div>
            </Card>
            <Card title="Docker + Deploy" icon={Rocket}>
              <div className="text-sm text-slate-600">
                Backend containerized (Dockerfile). Frontend deployed via GitHub Actions Pages workflow.
              </div>
            </Card>
          </div>
        </Section>

        {/* DATASET PREVIEW + REAL SAMPLE LOADER */}
        <Section
          id="dataset"
          title="Dataset Preview"
          subtitle="Optional: load real sample files from frontend/public/sample_requests/ to demo reproducibility."
          icon={Database}
        >
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800">
                  Sample requests (served statically)
                </div>
                <div className="p-4">
                  {sampleList.length === 0 ? (
                    <div className="text-sm text-slate-600">
                      No samples found. To enable this feature:
                      <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                        1) Copy data/sample_requests/* → frontend/public/sample_requests/<br />
                        2) Create frontend/public/sample_requests/index.json with filenames
                      </div>
                    </div>
                  ) : (
                    <>
                      <label className="text-xs font-medium text-slate-600">Choose a sample</label>
                      <select
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                        value={sampleSelected}
                        onChange={(e) => setSampleSelected(e.target.value)}
                      >
                        {sampleList.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>

                      <div className="mt-4 aspect-[16/10] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        {sampleUrl ? (
                          <img src={sampleUrl} alt="sample" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-slate-500">
                            Select a sample to preview.
                          </div>
                        )}
                      </div>

                      <div className="mt-3 text-xs text-slate-500">
                        Loaded from: <span className="font-mono">{`/sample_requests/${sampleSelected}`}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Card title="Dataset notes" icon={FlaskConical}>
              <div className="text-sm text-slate-600">
                Kaggle histopathology dataset with 3 classes:
                <div className="mt-3 grid gap-2">
                  <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-800">
                    lung_aca (adenocarcinoma)
                  </div>
                  <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-800">
                    lung_scc (squamous cell)
                  </div>
                  <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-800">
                    lung_n (normal)
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  Local path: <span className="font-mono">data/raw/lung_colon_image_set/lung_image_sets/</span>
                </div>
              </div>
            </Card>
          </div>
        </Section>

        {/* EVALUATION */}
        <Section
          id="evaluation"
          title="Model Evaluation"
          subtitle="Classification report on the held-out test set (support totals 3000)."
          icon={Activity}
        >
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Precision</th>
                  <th className="px-4 py-3">Recall</th>
                  <th className="px-4 py-3">F1</th>
                  <th className="px-4 py-3">Support</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {report.map((r) => (
                  <tr key={r.cls} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{r.cls}</td>
                    <td className="px-4 py-3">{r.precision.toFixed(2)}</td>
                    <td className="px-4 py-3">{r.recall.toFixed(2)}</td>
                    <td className="px-4 py-3">{r.f1.toFixed(2)}</td>
                    <td className="px-4 py-3">{r.support}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50">
                  <td className="px-4 py-3 font-semibold">Accuracy</td>
                  <td className="px-4 py-3" colSpan={3}>
                    0.90
                  </td>
                  <td className="px-4 py-3 font-semibold">3000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* REPRODUCE */}
        <Section
          id="reproduce"
          title="How to Reproduce"
          subtitle="Fastest path: pull Docker Hub image and run the API locally. Then run the frontend."
          icon={Terminal}
        >
          <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 p-6 text-white shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-emerald-300" />
                <div className="text-lg font-bold">Reproduction Commands</div>
              </div>
              <a className="text-sm text-slate-200 underline" href={LINKS.repo} target="_blank" rel="noreferrer">
                View Source on GitHub
              </a>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <div className="text-sm font-semibold">Using Docker Hub (fastest)</div>
                <pre className="mt-3 overflow-x-auto rounded-xl bg-black/30 p-3 text-xs text-slate-100">
{`docker pull mdislammazharul/lung-cancer-api:latest
docker run --rm -p 8000:8000 mdislammazharul/lung-cancer-api:latest`}
                </pre>
                <div className="mt-2 text-xs text-slate-200">API docs: http://localhost:8000/docs</div>
              </div>

              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <div className="text-sm font-semibold">Frontend (local dev)</div>
                <pre className="mt-3 overflow-x-auto rounded-xl bg-black/30 p-3 text-xs text-slate-100">
{`cd frontend
npm install
# set frontend/.env -> VITE_API_BASE=http://localhost:8000
npm run dev`}
                </pre>
                <div className="mt-2 text-xs text-slate-200">
                  If deploying to GitHub Pages, keep Vite base path configured.
                </div>
              </div>
            </div>
          </div>
        </Section>

        <div className="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Lung Cancer Detection — FastAPI, Docker, React, Tailwind, GitHub Pages.
        </div>
      </div>
    </div>
  );
}
