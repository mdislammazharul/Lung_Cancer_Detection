# %% [markdown]
# # 04 — Model Behavior Analysis (Optional but Strong)
# Goal:
# - Recreate validation split
# - Run predictions
# - Save classification report
# - Plot labeled confusion matrix
# - Visualize misclassified examples
#
# Inputs:
# - artifacts/reports/dataset_index.csv
# - artifacts/models/v1/lung_cnn.keras  (or .h5)
# - artifacts/models/v1/classes.json
#
# Outputs:
# - artifacts/reports/eda_04_classification_report.txt
# - figures/eda_04_confusion_matrix.png
# - figures/eda_04_misclassified_examples.png

# %%
from pathlib import Path
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import cv2

from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix

import tensorflow as tf
from tensorflow import keras
from tqdm import tqdm

# %%
PROJECT_ROOT = Path(__file__).resolve().parents[1]
FIG_DIR = PROJECT_ROOT / "figures"
REPORT_DIR = PROJECT_ROOT / "artifacts" / "reports"
MODEL_DIR = PROJECT_ROOT / "artifacts" / "models" / "v1"

FIG_DIR.mkdir(parents=True, exist_ok=True)
REPORT_DIR.mkdir(parents=True, exist_ok=True)

df = pd.read_csv(REPORT_DIR / "dataset_index.csv")
print("Loaded dataset index:", df.shape)

# %%
model_path_keras = MODEL_DIR / "lung_cnn.keras"
model_path_h5 = MODEL_DIR / "lung_cnn.h5"
classes_path = MODEL_DIR / "classes.json"

assert classes_path.exists(), f"Missing {classes_path}"

with open(classes_path, "r", encoding="utf-8") as f:
    classes = json.load(f)

# choose model file
if model_path_keras.exists():
    model_path = model_path_keras
elif model_path_h5.exists():
    model_path = model_path_h5
else:
    raise FileNotFoundError("No model file found in artifacts/models/v1 (expected lung_cnn.keras or lung_cnn.h5)")

print("Using model:", model_path)
print("Classes:", classes)

# %%
model = keras.models.load_model(model_path, compile=False)
print("Model loaded ✅")

# %% [markdown]
# ## Rebuild dataset arrays
# This is expensive (loads all images). If it is too slow, sample fewer images per class.

# %%
IMG_SIZE = 256

X = []
y = []

for i, cls in enumerate(classes):
    paths = df[df["class"] == cls]["path"].tolist()
    for p in tqdm(paths, desc=f"Loading {cls}"):
        img = cv2.imread(p)
        if img is None:
            continue
        img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
        X.append(img)
        y.append(i)

X = np.asarray(X, dtype=np.float32) / 255.0
y = np.asarray(y, dtype=np.int64)

y_onehot = tf.keras.utils.to_categorical(y, num_classes=len(classes))

# stratify based on y (not onehot)
X_train, X_val, y_train, y_val = train_test_split(
    X, y_onehot, test_size=0.2, random_state=2022, stratify=y
)

print("Train:", X_train.shape, y_train.shape)
print("Val:", X_val.shape, y_val.shape)

# %% [markdown]
# ## Predict and compute metrics

# %%
y_prob = model.predict(X_val, verbose=0)
y_true = np.argmax(y_val, axis=1)
y_pred = np.argmax(y_prob, axis=1)

report = classification_report(y_true, y_pred, target_names=classes)
print(report)

report_path = REPORT_DIR / "eda_04_classification_report.txt"
report_path.write_text(report, encoding="utf-8")
print("Saved:", report_path)

# %% [markdown]
# ## Confusion matrix (labeled)

# %%
cm = confusion_matrix(y_true, y_pred)

plt.figure(figsize=(6, 5))
plt.imshow(cm)
plt.title("Confusion Matrix")
plt.xlabel("Predicted")
plt.ylabel("True")
plt.xticks(range(len(classes)), classes, rotation=45, ha="right")
plt.yticks(range(len(classes)), classes)

for i in range(len(classes)):
    for j in range(len(classes)):
        plt.text(j, i, cm[i, j], ha="center", va="center")

plt.tight_layout()
out_path = FIG_DIR / "eda_04_confusion_matrix.png"
plt.savefig(out_path, dpi=200)
plt.show()
print("Saved:", out_path)

# %% [markdown]
# ## Misclassified examples (visual inspection)

# %%
mis_idx = np.where(y_pred != y_true)[0]
print(f"Misclassified: {len(mis_idx)} / {len(y_true)}")

if len(mis_idx) > 0:
    sample = np.random.choice(mis_idx, size=min(9, len(mis_idx)), replace=False)

    fig, axes = plt.subplots(3, 3, figsize=(8, 8))
    for ax, idx in zip(axes.flatten(), sample):
        ax.imshow(X_val[idx])
        t = classes[y_true[idx]]
        p = classes[y_pred[idx]]
        ax.set_title(f"T:{t}\nP:{p}", fontsize=10)
        ax.axis("off")

    plt.tight_layout()
    out_path = FIG_DIR / "eda_04_misclassified_examples.png"
    plt.savefig(out_path, dpi=200)
    plt.show()
    print("Saved:", out_path)
else:
    print("No misclassifications found (unexpected).")
