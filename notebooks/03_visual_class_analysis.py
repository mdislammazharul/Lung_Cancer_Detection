# %% [markdown]
# # 03 — Visual Class Analysis (EDA)
# Goal:
# - Visual grids per class (human inspection)
# - Mean/average image per class
#
# Inputs:
# - artifacts/reports/dataset_index_enriched.csv
#
# Outputs:
# - figures/eda_03_samples_<class>.png
# - figures/eda_03_mean_image_<class>.png

# %%
from pathlib import Path
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import cv2

# %%
PROJECT_ROOT = Path(__file__).resolve().parents[1]
FIG_DIR = PROJECT_ROOT / "figures"
REPORT_DIR = PROJECT_ROOT / "artifacts" / "reports"
FIG_DIR.mkdir(parents=True, exist_ok=True)

df = pd.read_csv(REPORT_DIR / "dataset_index_enriched.csv")
print("Loaded enriched index:", df.shape)
print("Classes:", sorted(df["class"].unique()))

# %% [markdown]
# ## Sample grids per class

# %%
def show_grid(class_name: str, n: int = 9, seed: int = 42):
    sample = df[df["class"] == class_name].sample(n, random_state=seed)["path"].tolist()
    fig, axes = plt.subplots(3, 3, figsize=(7, 7))
    for ax, p in zip(axes.flatten(), sample):
        img = cv2.imread(p)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        ax.imshow(img)
        ax.axis("off")
    fig.suptitle(f"Samples: {class_name}", fontsize=16)
    plt.tight_layout()
    out_path = FIG_DIR / f"eda_03_samples_{class_name}.png"
    plt.savefig(out_path, dpi=200)
    plt.show()
    print("Saved:", out_path)

for c in sorted(df["class"].unique()):
    show_grid(c, n=9)

# %% [markdown]
# ## Mean image per class (average pixel map)
# This helps visualize the "typical" color/texture pattern per class.

# %%
def mean_image(class_name: str, max_images: int = 300, img_size: int = 128, seed: int = 42):
    subset = df[df["class"] == class_name]
    n = min(max_images, len(subset))
    paths = subset.sample(n, random_state=seed)["path"].tolist()

    acc = np.zeros((img_size, img_size, 3), dtype=np.float64)
    for p in paths:
        img = cv2.imread(p)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = cv2.resize(img, (img_size, img_size))
        acc += img / 255.0
    acc /= len(paths)
    return acc

for c in sorted(df["class"].unique()):
    avg = mean_image(c)
    plt.figure(figsize=(4, 4))
    plt.imshow(avg)
    plt.title(f"Mean Image: {c}")
    plt.axis("off")
    out_path = FIG_DIR / f"eda_03_mean_image_{c}.png"
    plt.savefig(out_path, dpi=200)
    plt.show()
    print("Saved:", out_path)
