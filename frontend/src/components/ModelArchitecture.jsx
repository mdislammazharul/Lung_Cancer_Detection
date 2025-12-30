// frontend/src/components/ModelArchitecture.jsx
import { useMemo } from "react";
import {
  BrainCircuit,
  Layers,
  Grid3X3,
  Maximize2,
  Boxes,
  SplitSquareVertical,
  Timer,
  Gauge,
  Zap,
  Target,
  ScrollText,
  ShieldCheck,
  TrendingDown,
  SlidersHorizontal,
  Activity,
  Info,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Stethoscope
} from "lucide-react";

function Pill({ icon: Icon, label, value, tone = "indigo" }) {
  const toneMap = {
    indigo: { bg: "bg-indigo-50", ring: "ring-indigo-100", text: "text-indigo-700" },
    emerald: { bg: "bg-emerald-50", ring: "ring-emerald-100", text: "text-emerald-700" },
    amber: { bg: "bg-amber-50", ring: "ring-amber-100", text: "text-amber-800" },
    teal: { bg: "bg-teal-50", ring: "ring-teal-100", text: "text-teal-700" },
    slate: { bg: "bg-slate-100", ring: "ring-slate-200", text: "text-slate-700" },
    rose: { bg: "bg-rose-50", ring: "ring-rose-100", text: "text-rose-700" },
  };
  const t = toneMap[tone] ?? toneMap.indigo;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className={`grid h-10 w-10 place-items-center rounded-full ${t.bg} ring-1 ${t.ring}`}>
        <Icon className={`h-5 w-5 ${t.text}`} />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</div>
        <div className="truncate text-sm font-bold text-slate-900">{value}</div>
      </div>
    </div>
  );
}

function StepRow({ icon: Icon, title, subtitle, note }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mt-0.5 rounded-xl bg-white p-2 shadow-sm ring-1 ring-slate-200">
        <Icon className="h-4 w-4 text-slate-700" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        {subtitle ? <div className="mt-0.5 text-xs text-slate-600">{subtitle}</div> : null}
        {note ? (
          <div className="mt-2 inline-flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] leading-4 text-slate-700">
            <Info className="mt-0.5 h-3.5 w-3.5 text-slate-500" />
            <span className="min-w-0">{note}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Hint({ icon: Icon, tone = "indigo", title, children }) {
  const toneMap = {
    indigo: "border-indigo-200/60 bg-indigo-50 text-indigo-900",
    emerald: "border-emerald-200/60 bg-emerald-50 text-emerald-900",
    amber: "border-amber-200/60 bg-amber-50 text-amber-900",
    rose: "border-rose-200/60 bg-rose-50 text-rose-900",
    slate: "border-slate-200/60 bg-slate-50 text-slate-900",
  };

  return (
    <div className={`rounded-2xl border p-4 ${toneMap[tone] ?? toneMap.indigo}`}>
      <div className="flex items-start gap-2">
        <div className="mt-0.5 rounded-xl bg-white/70 p-2 ring-1 ring-black/5">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-wider">{title}</div>
          <div className="mt-1 text-sm opacity-90">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function ModelArchitecture() {
  const cfg = useMemo(
    () => ({
        title: "Model Architecture",
        subtitle: "Keras Sequential CNN for Multi-Class Lung Histopathology Classification",
        badge: "Reproducible & Production-Oriented Training Setup",
        architecture: [
            {
              icon: Grid3X3,
              title: "Conv2D(32, 5×5) + MaxPooling",
              subtitle: "Low-level feature extraction and spatial downsampling",
              note:
                "A wider 5×5 receptive field at the input stage captures coarse structural patterns such as edges, color gradients, and stain distributions commonly observed in histopathology images."
            },
            {
              icon: Grid3X3,
              title: "Conv2D(64, 3×3) + MaxPooling",
              subtitle: "Mid-level texture and cellular pattern learning",
              note:
                "This block refines local textures and spatial arrangements, enabling the network to model intermediate-scale tissue characteristics relevant to tumor subtypes."
            },
            {
              icon: Grid3X3,
              title: "Conv2D(128, 3×3) + MaxPooling",
              subtitle: "High-level morphological representation",
              note:
                "Increased channel depth allows the model to encode class-discriminative morphological cues, particularly those separating adenocarcinoma and squamous cell carcinoma."
            },
            {
              icon: Layers,
              title: "Flatten",
              subtitle: "Transformation of spatial feature maps into a feature vector",
              note:
                "Flatten bridges convolutional representations and the classifier head. While effective, it introduces a sharp increase in parameter count, which is monitored to mitigate overfitting."
            },
            {
              icon: Layers,
              title: "Dense(256) + Batch Normalization",
              subtitle: "Feature integration and training stabilization",
              note:
                "Batch normalization is applied to stabilize gradient flow and accelerate convergence, improving optimization behavior across batches and epochs."
            },
            {
              icon: Layers,
              title: "Dense(128) + Dropout + Batch Normalization",
              subtitle: "Regularized decision refinement",
              note:
                "Dropout reduces co-adaptation among neurons in the classifier head, improving robustness and generalization on limited medical imaging data."
            },
            {
              icon: Target,
              title: "Dense(3) + Softmax",
              subtitle: "Normalized class probability estimation",
              note:
                "The softmax layer outputs calibrated probabilities across the three tissue classes: normal lung, lung adenocarcinoma, and lung squamous cell carcinoma."
            }
          ],
        
          pills: [
            { icon: Maximize2, label: "Input resolution", value: "256 × 256 RGB", tone: "indigo" },
            { icon: SplitSquareVertical, label: "Data split", value: "80% training / 20% validation", tone: "emerald" },
            { icon: Boxes, label: "Batch size", value: "64", tone: "teal" },
            { icon: Timer, label: "Training epochs", value: "Up to 10 (early-stopped)", tone: "amber" },
            { icon: Zap, label: "Optimizer", value: "Adam", tone: "indigo" },
            { icon: ScrollText, label: "Loss function", value: "Categorical Cross-Entropy", tone: "slate" }
          ],
        
          callbacks: [
            {
              icon: ShieldCheck,
              title: "EarlyStopping",
              subtitle: "Monitored on validation accuracy",
              note:
                "An early-stopping criterion prevents overfitting by halting training once validation performance ceases to improve. Best-weight restoration ensures the final model reflects the strongest observed checkpoint."
            },
            {
              icon: TrendingDown,
              title: "ReduceLROnPlateau",
              subtitle: "Adaptive learning-rate scheduling based on validation loss",
              note:
                "Dynamic learning-rate decay enables finer optimization when validation loss plateaus, improving convergence stability and final generalization."
            },
            {
              icon: Gauge,
              title: "Custom accuracy threshold stop",
              subtitle: "Controlled termination based on target validation performance",
              note:
                "This mechanism accelerates experimental iteration while preserving rigorous evaluation, with all reported metrics computed on a held-out test set."
            }
          ],
        
          notes: {
            why: [
              "Progressive convolutional depth (32 → 64 → 128) enables hierarchical feature learning from low-level textures to class-specific morphology.",
              "Batch normalization stabilizes optimization dynamics, while dropout mitigates overfitting in the dense classifier head.",
              "The callback strategy balances training efficiency, performance stability, and reproducibility."
            ],
            risk: [
              "Class-specific performance disparities (e.g., adenocarcinoma recall) require per-class metric analysis beyond overall accuracy.",
              "Parameter growth introduced by Flatten is monitored to ensure generalization on limited medical datasets."
            ],
            metrics: [
              "Per-class recall (sensitivity) and false negative rate are emphasized due to clinical relevance.",
              "Confusion matrices and macro-averaged metrics are reported to ensure fair class-wise evaluation."
            ]
      },
    }),
    []
  );

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-purple-100 p-3">
            <BrainCircuit className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <div className="text-base font-bold text-slate-900">{cfg.title}</div>
            <div className="mt-0.5 text-xs text-slate-500">{cfg.subtitle}</div>
          </div>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
          <SlidersHorizontal className="h-4 w-4" />
          {cfg.badge}
        </span>
      </div>

      {/* Pills */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cfg.pills.map((p) => (
          <Pill key={p.label} icon={p.icon} label={p.label} value={p.value} tone={p.tone} />
        ))}
      </div>

      {/* Architecture + Callbacks */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Layers className="h-4 w-4 text-slate-500" />
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Network Blocks</div>
          </div>
          <div className="space-y-3">
            {cfg.architecture.map((s) => (
              <StepRow key={s.title} icon={s.icon} title={s.title} subtitle={s.subtitle} note={s.note} />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-slate-500" />
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Training Callbacks</div>
            </div>
            <div className="space-y-3">
              {cfg.callbacks.map((c) => (
                <StepRow key={c.title} icon={c.icon} title={c.title} subtitle={c.subtitle} note={c.note} />
              ))}
            </div>
          </div>

          {/* Why this setup works */}
          <Hint icon={CheckCircle2} tone="indigo" title="Architectural Rationale">
            <ul className="mt-1 list-disc pl-5 text-sm">
              {cfg.notes.why.map((t) => (
                <li key={t} className="mt-1">
                  {t}
                </li>
              ))}
            </ul>
          </Hint>

          {/* Practical notes */}
          <Hint icon={AlertTriangle} tone="amber" title="Engineering Considerations">
            <ul className="mt-1 list-disc pl-5 text-sm">
              {cfg.notes.risk.map((t) => (
                <li key={t} className="mt-1">
                  {t}
                </li>
              ))}
            </ul>
          </Hint>

          {/* What to report */}
          <Hint icon={BarChart3} tone="emerald" title="Evaluation & Reporting">
            <ul className="mt-1 list-disc pl-5 text-sm">
              {cfg.notes.metrics.map((t) => (
                <li key={t} className="mt-1">
                  {t}
                </li>
              ))}
            </ul>
          </Hint>

          {/* Clinical framing */}
          <Hint icon={Stethoscope} tone="rose" title="Clinical Interpretation">
            In medical classification, emphasize <span className="font-semibold">per-class sensitivity/recall</span> and{" "}
            <span className="font-semibold">false negative rate</span> (missed cases). This helps explain why a model with
            high overall accuracy can still underperform on a clinically important subtype (e.g., lung_aca).
          </Hint>
        </div>
      </div>
    </div>
  );
}
