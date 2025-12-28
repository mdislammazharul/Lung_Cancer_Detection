import json
import os

import numpy as np
from sklearn import metrics
import matplotlib.pyplot as plt

from tensorflow import keras

from .config import TrainConfig
from .dataset import extract_zip_if_needed, load_lung_images, split_data


def main():
    cfg = TrainConfig()
    extract_zip_if_needed(cfg)

    with open(cfg.classes_path, "r", encoding="utf-8") as f:
        classes = json.load(f)

    X, y_onehot = load_lung_images(cfg, classes)
    X_train, X_val, y_train, y_val = split_data(X, y_onehot, cfg)

    X_val = X_val.astype("float32") / 255.0
    y_true = np.argmax(y_val, axis=1)

    model = keras.models.load_model(cfg.model_path)
    y_prob = model.predict(X_val, verbose=0)
    y_pred = np.argmax(y_prob, axis=1)

    report = metrics.classification_report(y_true, y_pred, target_names=classes)
    os.makedirs("artifacts/reports", exist_ok=True)
    with open("artifacts/reports/classification_report.txt", "w", encoding="utf-8") as f:
        f.write(report)

    cm = metrics.confusion_matrix(y_true, y_pred)
    fig = plt.figure()
    plt.imshow(cm)
    plt.title("Confusion Matrix")
    plt.xlabel("Predicted")
    plt.ylabel("True")
    plt.tight_layout()
    plt.savefig("figures/confusion_matrix.png", dpi=200)
    plt.close(fig)

    print("Saved artifacts/reports/classification_report.txt and figures/confusion_matrix.png")


if __name__ == "__main__":
    main()
