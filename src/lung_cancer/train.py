import os
import pandas as pd
import matplotlib.pyplot as plt
import json
from datetime import datetime
from dotenv import load_dotenv

import tensorflow as tf
from keras.callbacks import EarlyStopping, ReduceLROnPlateau

from .config import TrainConfig
from .dataset import extract_zip_if_needed, load_lung_images, split_data, save_classes
from .model import build_cnn
from .utils import setup_logging

load_dotenv()
logger = setup_logging("train")

class StopAtAcc(tf.keras.callbacks.Callback):
    def __init__(self, target_val_acc: float = 0.90):
        super().__init__()
        self.target = target_val_acc

    def on_epoch_end(self, epoch, logs=None):
        logs = logs or {}
        if logs.get("val_accuracy", 0) >= self.target:
            print(f"\nval_accuracy reached {self.target:.2f}. Stopping.")
            self.model.stop_training = True


def plot_history(history, out_path: str) -> None:
    df = pd.DataFrame(history.history)
    ax = df.loc[:, ["accuracy", "val_accuracy"]].plot()
    ax.set_xlabel("epoch")
    ax.set_ylabel("accuracy")
    plt.tight_layout()
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    plt.savefig(out_path, dpi=200)
    plt.close()


def main():
    cfg = TrainConfig()

    # classes from the Kaggle dataset folder naming
    classes = ["lung_n", "lung_aca", "lung_scc"]

    extract_zip_if_needed(cfg)
    save_classes(classes, cfg)

    X, y = load_lung_images(cfg, classes)
    X_train, X_val, y_train, y_val = split_data(X, y, cfg)

    # Normalize to float32 [0,1]
    X_train = X_train.astype("float32") / 255.0
    X_val = X_val.astype("float32") / 255.0

    model = build_cnn(cfg.img_size, num_classes=len(classes))
    model.summary()

    es = EarlyStopping(patience=3, monitor="val_accuracy", restore_best_weights=True)
    lr = ReduceLROnPlateau(monitor="val_loss", patience=2, factor=0.5, verbose=1)

    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        batch_size=cfg.batch_size,
        epochs=cfg.epochs,
        callbacks=[es, lr, StopAtAcc(0.90)],
        verbose=1
    )

    os.makedirs(os.path.dirname(cfg.model_path), exist_ok=True)
    model.save(cfg.model_path)
    print(f"Saved model to: {cfg.model_path}")

    plot_history(history, "figures/training_curves.png")
    print("Saved figures/training_curves.png")

    os.makedirs(os.path.dirname(cfg.metadata_path), exist_ok=True)
    metadata = {
        "model_version": cfg.model_version,
        "img_size": cfg.img_size,
        "epochs": cfg.epochs,
        "batch_size": cfg.batch_size,
        "split": cfg.split,
        "seed": cfg.seed,
        "saved_at_utc": datetime.utcnow().isoformat() + "Z",
    }
    with open(cfg.metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"Saved metadata to: {cfg.metadata_path}")
    logger.info("Starting training...")
    logger.info("Saving model to %s", cfg.model_path)


if __name__ == "__main__":
    main()
