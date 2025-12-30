import { useMemo } from "react";
import { Target, BarChart2, CheckCircle, BrainCircuit, SlidersHorizontal } from "lucide-react";

function MetricTile({ icon: Icon, value, label, tone = "indigo" }) {
  const toneMap = {
    indigo: { ring: "ring-indigo-100", bg: "bg-indigo-50", text: "text-indigo-600" },
    emerald: { ring: "ring-emerald-100", bg: "bg-emerald-50", text: "text-emerald-600" },
    teal: { ring: "ring-teal-100", bg: "bg-teal-50", text: "text-teal-600" },
  };
  const t = toneMap[tone] ?? toneMap.indigo;

  return (
    <div className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center transition-all hover:bg-white hover:shadow-md">
      <div className={`mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full ${t.bg} ring-1 ${t.ring} transition-transform group-hover:scale-110`}>
        <Icon className={`h-5 w-5 ${t.text}`} />
      </div>

      <div className="text-3xl font-extrabold tracking-tight text-slate-900">{value}</div>
      <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</div>
    </div>
  );
}

function ParamChip({ k, v }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-mono text-slate-700">
      <span className="text-slate-500">{k}:</span> <span className="font-semibold">{String(v)}</span>
    </div>
  );
}

export default function ModelPerformance() {
  // You can later load these from a JSON file if you want.
  const data = useMemo(
    () => ({
      title: "Model Performance",
      subtitle: "Architecture: CNN (TensorFlow/Keras)",
      badge: "Best Model Selected",
      metrics: [
        { label: "Accuracy", value: "90.0%", icon: Target, tone: "indigo" },
        { label: "Macro FNR", value: "9.7%", icon: BarChart2, tone: "emerald" },
        { label: "Error Rate", value: "10%", icon: CheckCircle, tone: "teal" },
      ],
      // Fill these with your real hyperparams. If you don’t have them, keep reasonable defaults.
      bestParams: {
        img_size: "256x256",
        batch_size: 64,
        epochs: 10,
        optimizer: "Adam",
        learning_rate: 0.0001,
      },
      takeawayTitle: "Key takeaway",
      takeaway:
        "Normal tissue is classified extremely well (F1 0.98). Adenocarcinoma has lower recall (0.76), while squamous cell carcinoma has very high recall (0.98) with more false positives.",
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
            <div className="text-base font-bold text-slate-900">{data.title}</div>
            <div className="text-xs text-slate-500">{data.subtitle}</div>
          </div>
        </div>

        <span className="rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
          {data.badge}
        </span>
      </div>

      {/* Metric Tiles */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {data.metrics.map((m) => (
          <MetricTile key={m.label} icon={m.icon} value={m.value} label={m.label} tone={m.tone} />
        ))}
      </div>

      {/* Hyperparameters */}
      <div className="mt-6 border-t border-slate-100 pt-5">
        <div className="mb-3 flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-400" />
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Optimal Hyperparameters</div>
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.entries(data.bestParams).map(([k, v]) => (
            <ParamChip key={k} k={k} v={v} />
          ))}
        </div>
      </div>

      {/* Takeaway */}
      <div className="mt-5 rounded-2xl border border-emerald-200/60 bg-emerald-50 p-4">
        <div className="text-xs font-bold uppercase tracking-wider text-emerald-900">{data.takeawayTitle}</div>
        <p className="mt-1 text-sm text-emerald-900/80">{data.takeaway}</p>
      </div>   
    </div>
  );
}
