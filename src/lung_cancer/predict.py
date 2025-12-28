from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import cv2
from tensorflow import keras


def _load_classes(classes_path: Path) -> list[str]:
    with classes_path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _preprocess_image(image_path: Path, img_size: int) -> np.ndarray:
    img = cv2.imread(str(image_path), cv2.IMREAD_COLOR)  # BGR
    if img is None:
        raise ValueError(f"Could not read image: {image_path}")

    img = cv2.resize(img, (img_size, img_size))
    img = img.astype("float32") / 255.0
    img = np.expand_dims(img, axis=0)  # (1, H, W, 3)
    return img


def main() -> None:
    parser = argparse.ArgumentParser(description="Lung cancer CNN image predictor (CLI)")
    parser.add_argument("--image", required=True, help="Path to JPG/PNG image")
    parser.add_argument("--model", default="artifacts/models/v1/lung_cnn.keras", help="Path to .keras model")
    parser.add_argument("--classes", default="artifacts/models/v1/classes.json", help="Path to classes.json")
    parser.add_argument("--img-size", type=int, default=256, help="Input image size")
    args = parser.parse_args()

    image_path = Path(args.image)
    model_path = Path(args.model)
    classes_path = Path(args.classes)

    if not image_path.exists():
        raise SystemExit(f"Image not found: {image_path}")
    if not model_path.exists():
        raise SystemExit(f"Model not found: {model_path}")
    if not classes_path.exists():
        raise SystemExit(f"Classes file not found: {classes_path}")

    classes = _load_classes(classes_path)
    model = keras.models.load_model(model_path)

    x = _preprocess_image(image_path, args.img_size)
    prob = model.predict(x, verbose=0)[0]

    pred_idx = int(np.argmax(prob))
    pred_class = classes[pred_idx]

    out = {
        "image": str(image_path),
        "predicted_class": pred_class,
        "probabilities": {classes[i]: float(prob[i]) for i in range(len(classes))},
    }
    print(json.dumps(out, indent=2))


if __name__ == "__main__":
    main()
