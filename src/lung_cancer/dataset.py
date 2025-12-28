import os
import json
from glob import glob
from zipfile import ZipFile

import cv2
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

from .config import TrainConfig


def extract_zip_if_needed(cfg: TrainConfig) -> None:
    if os.path.isdir(cfg.extract_dir):
        return
    os.makedirs(os.path.dirname(cfg.extract_dir), exist_ok=True)
    with ZipFile(cfg.raw_zip_path, "r") as zf:
        zf.extractall("data/raw")
    print(f"Extracted dataset to: {cfg.extract_dir}")


def load_lung_images(cfg: TrainConfig, classes: list[str]) -> tuple[np.ndarray, np.ndarray]:
    X, y = [], []

    for i, cat in enumerate(classes):
        images = glob(os.path.join(cfg.lung_path, cat, "*.jpeg"))
        for p in images:
            img = cv2.imread(p)  # BGR
            if img is None:
                continue
            img = cv2.resize(img, (cfg.img_size, cfg.img_size))
            X.append(img)
            y.append(i)

    X = np.asarray(X, dtype=np.uint8)
    y_onehot = pd.get_dummies(y).values.astype(np.float32)
    return X, y_onehot


def split_data(
    X: np.ndarray, y_onehot: np.ndarray, cfg: TrainConfig
) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    return train_test_split(
        X, y_onehot,
        test_size=cfg.split,
        random_state=cfg.seed,
        shuffle=True,
    )


def save_classes(classes: list[str], cfg: TrainConfig) -> None:
    os.makedirs(os.path.dirname(cfg.classes_path), exist_ok=True)
    with open(cfg.classes_path, "w", encoding="utf-8") as f:
        json.dump(classes, f, indent=2)
