# %%
from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt

# %%
PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_ROOT = PROJECT_ROOT / "data" / "raw" / "lung_colon_image_set" / "lung_image_sets"
FIG_DIR = PROJECT_ROOT / "figures"
REPORT_DIR = PROJECT_ROOT / "artifacts" / "reports"

FIG_DIR.mkdir(parents=True, exist_ok=True)
REPORT_DIR.mkdir(parents=True, exist_ok=True)

print("PROJECT_ROOT:", PROJECT_ROOT)
print("DATA_ROOT:", DATA_ROOT)

assert DATA_ROOT.exists(), f"Dataset not found at {DATA_ROOT}. Put dataset under data/raw/..."

# %% [markdown]
# ## Build dataset file index

# %%
rows = []
for cls_dir in sorted(DATA_ROOT.iterdir()):
    if cls_dir.is_dir():
        for ext in ("*.jpeg", "*.jpg", "*.png"):
            for p in cls_dir.glob(ext):
                rows.append({"class": cls_dir.name, "path": str(p)})

df = pd.DataFrame(rows)
print("Total images:", len(df))
print(df.head())

# %% [markdown]
# ## Class distribution

# %%
class_counts = df["class"].value_counts().sort_index()
print(class_counts)

plt.figure(figsize=(7, 4))
class_counts.plot(kind="bar")
plt.title("Class Distribution (Lung Histopathology)")
plt.xlabel("Class")
plt.ylabel("Number of Images")
plt.tight_layout()
out_path = FIG_DIR / "eda_01_class_distribution.png"
plt.savefig(out_path, dpi=200)
plt.show()
print("Saved:", out_path)

# %% [markdown]
# ## Save dataset index for reuse (used by other notebooks)

# %%
index_path = REPORT_DIR / "dataset_index.csv"
df.to_csv(index_path, index=False)
print("Saved dataset index:", index_path)

# %% [markdown]
# ## Sanity checks

# %%
dup_count = df["path"].duplicated().sum()
print("Duplicate file paths:", dup_count)

missing = [p for p in df["path"] if not Path(p).exists()]
print("Missing files:", len(missing))
if missing[:5]:
    print("Example missing:", missing[0])
