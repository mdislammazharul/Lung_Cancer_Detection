import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Boxes,
  Database,
  Github,
  Image as ImageIcon,
  PlayCircle,
  Rocket,
  Terminal,
  Upload,
  Globe,
} from "lucide-react";

import ModelPerformance from "./components/ModelPerformance";
import PredictionResult from "./components/PredictionResult";
import { predictFromSpace } from "./lungSpaceApi";

function HFLogo({ className = "h-4 w-4" }) {
  // Put your logo at: frontend/public/logos/huggingface.svg (or .png)
  return (
    <img
      src={`${import.meta.env.BASE_URL}logos/huggingface.svg`}
      alt="Hugging Face"
      className={className}
    />
  );
}

const LINKS = {
  live: "https://mdislammazharul.github.io/Lung_Cancer_Detection/",
  repo: "https://github.com/mdislammazharul/Lung_Cancer_Detection",
  docker: "https://hub.docker.com/r/mdislammazharul/lung-cancer-api",
  hfSpace: "https://huggingface.co/spaces/mdislammazharul/Lung_Cancer_Detection_HF_Space",
};

function Badge({ children, className = "" }) {
  return (
    <span
      className={
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium " +
        className
      }
    >
      {children}
    </span>
  );
}

function Section({ id, title, subtitle, icon: Icon, children }) {
  return (
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
}

export default function App() {
  // ------- Dataset samples (served from frontend/public/sample_requests/) -------
  const [sampleList, setSampleList] = useState([]);
  const [sampleSelected, setSampleSelected] = useState("");
  const [sampleUrl, setSampleUrl] = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}sample_requests/index.json`)
      .then((r) => (r.ok ? r.json() : []))
      .then((arr) => {
        if (Array.isArray(arr)) {
          setSampleList(arr);
          if (arr.length > 0) setSampleSelected(arr[0]);
        }
      })
      .catch(() => setSampleList([]));
  }, []);

  useEffect(() => {
    if (!sampleSelected) return;
    setSampleUrl(`${import.meta.env.BASE_URL}sample_requests/${sampleSelected}`);
  }, [sampleSelected]);

  // ------- Try Prediction widget (Hugging Face Space) -------
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
      const out = await predictFromSpace(file); // <--- ALWAYS HF SPACE
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
      {/* Add more padding on large screens */}
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
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                <Boxes className="h-4 w-4" /> END-TO-END ML
              </Badge>
              <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">
                <Terminal className="h-4 w-4" /> FASTAPI + DOCKER
              </Badge>
              <Badge className="border-amber-200 bg-amber-50 text-amber-800">
                <HFLogo className="h-4 w-4" /> HUGGING FACE SPACE
              </Badge>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Lung Cancer Detection
              <span className="block bg-gradient-to-r from-emerald-600 to-indigo-600 bg-clip-text text-transparent">
                CNN + Full-Stack Deployment
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
              Train a CNN on histopathology images, export versioned artifacts, serve predictions via an inference API,
              containerize with Docker, and deploy a frontend to GitHub Pages.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                href={`${import.meta.env.BASE_URL}predict`}
              >
                <Rocket className="h-4 w-4" /> Live Prediction
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
                className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100"
                href={LINKS.hfSpace}
                target="_blank"
                rel="noreferrer"
              >
                <Globe className="h-4 w-4" /> Open HF Space
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
          </div>
          {/* PERFORMANCE (new nicer component) */}
          <div className="lg:col-span-5">
            <ModelPerformance />
          </div>
        </motion.div>

        {/* DATASET PREVIEW */}
        <Section
          id="dataset"
          title="Dataset Preview"
          subtitle="Optional: load real sample files from frontend/public/sample_requests/ to demo reproducibility."
          icon={Database}
        >
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800">
                Sample requests
              </div>
              <div className="p-4">
                {sampleList.length === 0 ? (
                  <div className="text-sm text-slate-600">
                    No samples found. To enable:
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

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-slate-800">Dataset notes</div>
              <p className="mt-2 text-sm text-slate-600">
                Kaggle histopathology dataset with 3 classes: lung_aca (adenocarcinoma), lung_scc (squamous cell),
                lung_n (normal).
              </p>
              <div className="mt-3 text-xs text-slate-500">
                Local path: <span className="font-mono">data/raw/lung_colon_image_set/lung_image_sets/</span>
              </div>
            </div>
          </div>
        </Section>

        {/* MODEL EVALUATION TABLE */}
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
