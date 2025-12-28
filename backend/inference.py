import json
import numpy as np
import cv2
from tensorflow import keras


class LungCancerPredictor:
    def __init__(self, model_path: str, classes_path: str, img_size: int = 256):
        self.model = keras.models.load_model(model_path)
        with open(classes_path, "r", encoding="utf-8") as f:
            self.classes = json.load(f)
        self.img_size = img_size

    def preprocess_bytes(self, image_bytes: bytes) -> np.ndarray:
        arr = np.frombuffer(image_bytes, dtype=np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)  # BGR
        if img is None:
            raise ValueError("Could not decode image. Please upload a valid JPG/PNG.")

        img = cv2.resize(img, (self.img_size, self.img_size))
        img = img.astype("float32") / 255.0
        img = np.expand_dims(img, axis=0)  # (1, H, W, 3)
        return img

    def predict_proba(self, image_bytes: bytes) -> dict:
        x = self.preprocess_bytes(image_bytes)
        prob = self.model.predict(x, verbose=0)[0]  # (3,)
        out = {self.classes[i]: float(prob[i]) for i in range(len(self.classes))}
        out["predicted_class"] = self.classes[int(np.argmax(prob))]
        return out
