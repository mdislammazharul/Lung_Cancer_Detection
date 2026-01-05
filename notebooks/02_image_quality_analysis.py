# %% [markdown]
# # 02 — Image Quality Analysis (EDA)
# Goal:
# - Check image sizes
# - Brightness/contrast distribution
# - Detect corrupt files
#
# Inputs:
# - artifacts/reports/dataset_index.csv
#
# Outputs:
# - figures/eda_02_height_distribution.png
# - figures/eda_02_width_distribution.png
# - figures/eda_02_mean_intensity.png
# - figures/eda_02_std_intensity.png
# - artifacts/reports/dataset_index_enriched.csv

# %%
from pathlib import Path
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import cv2
from tqdm import tqdm

# %%
PROJECT_ROOT = Path(__file__).resolve().parents[1]
FIG_DIR = PROJECT_ROOT / "figures"
REPORT_DIR = PROJECT_ROOT / "artifacts" / "reports"
FIG_DIR.mkdir(parents=True, exist_ok=True)

df = pd.read_csv(REPORT_DIR / "dataset_index.csv")
print("Loaded index:", df.shape)
print(df.head())

# %% [markdown]
# ## Compute basic image statistics

# %%
heights, widths, channels = [], [], []
mean_intensity, std_intensity = [], []
corrupt_paths = []

for p in tqdm(df["path"].tolist()):
    img = cv2.imread(p)
    if img is None:
        corrupt_paths.append(p)
        heights.append(np.nan); widths.append(np.nan); channels.append(np.nan)
        mean_intensity.append(np.nan); std_intensity.append(np.nan)
        continue

    h, w, c = img.shape
    heights.append(h); widths.append(w); channels.append(c)
    mean_intensity.append(float(img.mean()))
    std_intensity.append(float(img.std()))

df["height"] = heights
df["width"] = widths
df["channels"] = channels
df["mean_intensity"] = mean_intensity
df["std_intensity"] = std_intensity

print("Corrupt images:", len(corrupt_paths))
if corrupt_paths[:3]:
    print("Example corrupt:", corrupt_paths[0])

# %% [markdown]
# ## Plot size distributions

# %%
plt.figure(figsize=(7, 4))
plt.hist(df["height"].dropna(), bins=30)
plt.title("Image Height Distribution")
plt.xlabel("Height (px)")
plt.ylabel("Count")
plt.tight_layout()
out_path = FIG_DIR / "eda_02_height_distribution.png"
plt.savefig(out_path, dpi=200)
plt.show()
print("Saved:", out_path)

plt.figure(figsize=(7, 4))
plt.hist(df["width"].dropna(), bins=30)
plt.title("Image Width Distribution")
plt.xlabel("Width (px)")
plt.ylabel("Count")
plt.tight_layout()
out_path = FIG_DIR / "eda_02_width_distribution.png"
plt.savefig(out_path, dpi=200)
plt.show()
print("Saved:", out_path)

# %% [markdown]
# ## Plot brightness & contrast distributions

# %%
plt.figure(figsize=(7, 4))
plt.hist(df["mean_intensity"].dropna(), bins=40)
plt.title("Mean Intensity (Brightness) Distribution")
plt.xlabel("Mean Pixel Intensity")
plt.ylabel("Count")
plt.tight_layout()
out_path = FIG_DIR / "eda_02_mean_intensity.png"
plt.savefig(out_path, dpi=200)
plt.show()
print("Saved:", out_path)

plt.figure(figsize=(7, 4))
plt.hist(df["std_intensity"].dropna(), bins=40)
plt.title("Std Intensity (Contrast) Distribution")
plt.xlabel("Std Pixel Intensity")
plt.ylabel("Count")
plt.tight_layout()
out_path = FIG_DIR / "eda_02_std_intensity.png"
plt.savefig(out_path, dpi=200)
plt.show()
print("Saved:", out_path)

# %% [markdown]
# ## Save enriched dataset index

# %%
enriched_path = REPORT_DIR / "dataset_index_enriched.csv"
df.to_csv(enriched_path, index=False)
print("Saved enriched index:", enriched_path)
