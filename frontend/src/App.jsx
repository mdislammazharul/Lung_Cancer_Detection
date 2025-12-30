import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Boxes,
  Database,
  Image as ImageIcon,
  PlayCircle,
  Rocket,
  Terminal,
  Upload,
  Globe,
  Container, 
  Code2,
  Github
} from "lucide-react";

import ModelPerformance from "./components/ModelPerformance";
import ModelArchitecture from "./components/ModelArchitecture";
import { predictFromSpace } from "./lungSpaceApi";
import { Link } from "react-router-dom";

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

const DATASET_CLASS_INFO = {
    lung_n: {
      title: "Normal Lung Tissue",
      description:
        "Normal lung histopathology shows well-organized alveolar structures with thin septa and uniform cell morphology. There is no abnormal glandular growth, keratinization, or nuclear atypia.",
    },
    lung_aca: {
      title: "Lung Adenocarcinoma",
      description:
        "Lung adenocarcinoma is characterized by malignant gland-forming epithelial cells, often showing irregular nuclei, increased mitotic activity, and disrupted alveolar architecture.",
    },
    lung_scc: {
      title: "Lung Squamous Cell Carcinoma",
      description:
        "Squamous cell carcinoma typically presents with sheets of atypical squamous cells, keratin pearl formation, and intercellular bridges, reflecting abnormal squamous differentiation.",
    },
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

function CodeBlock({ title = "BASH", code }) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-lg bg-white/10 px-2 py-1 text-xs font-semibold text-slate-200">
            {title}
          </span>
        </div>
        <div className="max-w-full overflow-x-auto rounded-xl bg-black/30 p-3">
          <pre className="min-w-max whitespace-pre text-xs leading-relaxed text-slate-100">
            {code}
          </pre>
        </div>
      </div>
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
      { cls: "Normal Lung Tissue", precision: 1.0, recall: 0.97, f1: 0.98, support: 987 },
      { cls: "Lung Adenocarcinoma", precision: 0.93, recall: 0.76, f1: 0.84, support: 977 },
      { cls: "Lung Squamous Cell Carcinoma", precision: 0.81, recall: 0.98, f1: 0.89, support: 1036 },
    ],
    []
  );

  const inferredClass = useMemo(() => {
    if (!sampleSelected) return null;
    const name = sampleSelected.toLowerCase();
    if (name.includes("lung_n") || name.includes("normal")) return "lung_n";
    if (name.includes("aca")) return "lung_aca";
    if (name.includes("scc")) return "lung_scc";
    return null;
  }, [sampleSelected]);

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
                <Terminal className="h-4 w-4" /> GRADIO + DOCKER
              </Badge>
              <Badge className="border-amber-200 bg-amber-50 text-amber-800">
                <HFLogo className="h-4 w-4" /> HUGGING FACE SPACE
              </Badge>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Lung Cancer Detection
              <span className="block bg-gradient-to-r from-emerald-600 to-indigo-600 bg-clip-text text-transparent pb-2">
                CNN + Full-Stack Deployment
              </span>
            </h1>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/predict"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                >
                <Rocket className="h-4 w-4" /> Live Prediction
              </Link>
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
              <div className="mt-6 max-w-3xl text-sm leading-relaxed text-slate-600">
                A complete, production-style <span className="font-semibold text-slate-800">end-to-end machine learning</span>{" "}
                project that trains a <span className="font-semibold text-slate-800">Convolutional Neural Network (CNN)</span>{" "}
                to classify lung histopathology images into three categories and ships it as a fully working web application:
                <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-600">
                    <li>
                    <span className="font-medium text-slate-800">Model training</span> (TensorFlow / Keras)
                    </li>
                    <li>
                    <span className="font-medium text-slate-800">Reproducible artifacts</span> (versioned model + metadata)
                    </li>
                    <li>
                    <span className="font-medium text-slate-800">Public inference backend</span> (Hugging Face Space)
                    </li>
                    <li>
                    <span className="font-medium text-slate-800">Public frontend</span> (React + Vite on GitHub Pages)
                    </li>
                    <li>
                    <span className="font-medium text-slate-800">CI/CD</span> (GitHub Actions for automated Pages deployment)
                    </li>
                    <li>
                    <span className="font-medium text-slate-800">Large model handling</span> (&gt;100MB) using Git LFS and Hugging Face Hub
                    </li>
                </ul>
              </div>
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
          subtitle="Lung and Colon Cancer Histopathological Images (LC25000) sample images."
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
                    The dataset examples shown below represent:
                    <br />
                    <span className="font-medium">(a)</span> lung adenocarcinoma,&nbsp;
                    <span className="font-medium">(b)</span> lung squamous cell carcinoma,&nbsp;
                    <span className="font-medium">(c)</span> normal lung tissue.
                </p>

                <p className="mt-3 text-sm text-slate-600">
                    This concept is explored in depth by{" "}
                    <span className="font-medium">
                    Tian, L., Wu, J., Song, W. et al.
                    </span>{" "}
                    <em>
                    Precise and automated lung cancer cell classification using deep neural
                    network with multiscale features and model distillation
                    </em>
                    , Scientific Reports 14, 10471 (2024).
                </p>

                <a
                    href="https://doi.org/10.1038/s41598-024-61101-7"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-xs font-medium text-indigo-600 hover:underline"
                >
                    DOI: https://doi.org/10.1038/s41598-024-61101-7
                </a>

                {/* Dynamic class description */}
                {inferredClass && DATASET_CLASS_INFO[inferredClass] && (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Selected sample
                    </div>
                    <div className="mt-1 text-sm font-bold text-slate-800">
                        {DATASET_CLASS_INFO[inferredClass].title}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                        {DATASET_CLASS_INFO[inferredClass].description}
                    </p>
                    </div>
                )}

                <div className="mt-4 text-xs text-slate-500">
                    The model is trained on a Kaggle histopathology dataset and deployed as a
                    user-facing web application:
                    <ul className="mt-2 list-disc pl-4">
                    <li>User uploads an image</li>
                    <li>Frontend calls a public inference API hosted on Hugging Face Spaces</li>
                    <li>Predicted class probabilities and final label are displayed</li>
                    </ul>
                </div>

                <div className="mt-3 text-xs text-slate-500">
                    Local path:{" "}
                    <span className="font-mono">
                    data/raw/lung_colon_image_set/lung_image_sets/
                    </span>
                </div>
            </div>
          </div>
        </Section>

        {/* Model Architecture */}
        <Section
          id="architecture"
          title="Model Architecture"
          subtitle="Convolutional Neural Network (CNN) with data augmentation and training callbacks."
          icon={PlayCircle}
        >
            <div className="lg:col-span-5">
                <ModelArchitecture />
            </div>
        </Section>

        {/* MODEL EVALUATION TABLE */}
        <Section
          id="evaluation"
          title="Model Evaluation"
          subtitle="Classification report on the held-out test set (support totals 3000)."
          icon={Activity}
        >
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                <tr>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3">Precision</th>
                    <th className="px-4 py-3">Recall (Sensitivity)</th>
                    <th className="px-4 py-3">F1</th>
                    <th className="px-4 py-3">FNR</th>
                    <th className="px-4 py-3">Support</th>
                    <th className="px-4 py-3">Support %</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
                {report.map((r) => {
                    const fnr = 1 - r.recall;
                    const supportPct = (r.support / 3000) * 100;

                    return (
                    <tr key={r.cls} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium">{r.cls}</td>
                        <td className="px-4 py-3">{r.precision.toFixed(2)}</td>
                        <td className="px-4 py-3">{r.recall.toFixed(2)}</td>
                        <td className="px-4 py-3">{r.f1.toFixed(2)}</td>
                        <td className="px-4 py-3">{fnr.toFixed(2)}</td>
                        <td className="px-4 py-3">{r.support}</td>
                        <td className="px-4 py-3">{supportPct.toFixed(1)}%</td>
                    </tr>
                    );
                })}
                <tr className="bg-slate-50">
                    <td className="px-4 py-3 font-semibold">Overall Accuracy</td>
                    <td className="px-4 py-3 font-semibold" colSpan={4}>
                        0.90
                    </td>
                    <td className="px-4 py-3 font-semibold">3000</td>
                    <td className="px-4 py-3 font-semibold">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* Reproduction / DevOps Section (same style as your example) */}
        <section className="mt-16 bg-slate-900 rounded-3xl p-8 md:p-12 text-slate-300 overflow-hidden relative shadow-2xl">
        <div className="absolute right-0 top-0 p-12 opacity-5">
            <Github size={200} />
        </div>

        <div className="relative z-10">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
                <Terminal className="text-teal-400" /> How to Reproduce
            </h2>

            <a
                href={LINKS.repo}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300 hover:underline"
            >
                <Github size={16} />
                View Source on GitHub →
            </a>
            </div>

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            {/* Using Docker Hub (fastest) */}
            <div>
                <h3 className="mb-2 flex items-center gap-2 font-semibold text-white">
                <Container size={16} /> Using Docker Hub (fastest)
                </h3>
                <p className="mb-3 text-sm text-slate-400">
                Pull the published image and run the container exposing port 8000.
                </p>

                <CodeBlock
                title="BASH"
                code={`# Pull Docker image 
    docker pull mdislammazharul/lung-cancer-api:latest
    docker run --rm -p 8000:8000 mdislammazharul/lung-cancer-api:latest`}
                />
            </div>

            {/* Local Development (frontend + optional backend) */}
            <div>
                <h3 className="mb-2 flex items-center gap-2 font-semibold text-white">
                <Code2 size={16} /> Local Development
                </h3>
                <p className="mb-3 text-sm text-slate-400">
                Start the backend (optional) and run the Vite frontend locally.
                </p>

                <CodeBlock
                title="BASH"
                code={`# (Optional) Backend API
    cd backend
    pip install -r requirements-backend.txt
    uvicorn main:app --reload --port 8000

# Frontend
    cd ../frontend
    npm install
    npm run dev`}
                />
            </div>
            </div>
        </div>
        </section>

        <div className="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} <a href="https://mdislammazharul.github.io/">Md Mazharul Islam.</a>All rights reserved.
        </div>
      </div>
    </div>
  );
}
