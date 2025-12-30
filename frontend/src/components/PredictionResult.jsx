import { CheckCircle, BarChart2 } from "lucide-react";

const CLASS_LABELS = {
  lung_n: "Normal Lung Tissue",
  lung_aca: "Lung Adenocarcinoma",
  lung_scc: "Lung Squamous Cell Carcinoma",
};

export default function PredictionResult({ result }) {
  if (!result?.primary) return null;

  const probs = result.primary;
  const predicted = probs.predicted_class;
  const confidence = probs[predicted] ?? 0;

  const entries = Object.entries(probs)
    .filter(([k]) => k !== "predicted_class")
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-emerald-600" />
        <div className="text-sm font-semibold text-emerald-900">
          Prediction Result
        </div>
      </div>

      {/* Main prediction */}
      <div className="mt-3 rounded-xl bg-white p-4 shadow-sm">
        <div className="text-xs uppercase tracking-wide text-slate-500">
          Predicted Class
        </div>
        <div className="mt-1 text-lg font-bold text-slate-900">
          {CLASS_LABELS[predicted] ?? predicted}
        </div>
        <div className="mt-1 text-sm text-slate-600">
          Confidence:{" "}
          <span className="font-semibold text-slate-900">
            {(confidence * 100).toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Probability bars */}
      <div className="mt-4">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase">
          <BarChart2 className="h-4 w-4" />
          Class Probabilities
        </div>

        <div className="space-y-2">
          {entries.map(([cls, value]) => (
            <div key={cls}>
              <div className="mb-1 flex justify-between text-xs text-slate-600">
                <span>{CLASS_LABELS[cls] ?? cls}</span>
                <span>{(value * 100).toFixed(2)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full ${
                    cls === predicted ? "bg-emerald-500" : "bg-slate-400"
                  }`}
                  style={{ width: `${value * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
