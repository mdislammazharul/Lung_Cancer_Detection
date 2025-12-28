from dataclasses import dataclass
import os


def _env(name: str, default: str) -> str:
    return os.getenv(name, default)


@dataclass(frozen=True)
class TrainConfig:
    img_size: int = int(_env("IMG_SIZE", "256"))
    split: float = float(_env("SPLIT", "0.2"))
    batch_size: int = int(_env("BATCH_SIZE", "64"))
    epochs: int = int(_env("EPOCHS", "10"))
    seed: int = int(_env("SEED", "2022"))

    model_version: str = _env("MODEL_VERSION", "v1")

    raw_zip_path: str = _env("RAW_ZIP_PATH", "data/raw/lung-and-colon-cancer-histopathological-images.zip")
    extract_dir: str = _env("EXTRACT_DIR", "data/raw/lung_colon_image_set")
    lung_path: str = _env("LUNG_PATH", "data/raw/lung_colon_image_set/lung_image_sets")

    model_path: str = f"artifacts/models/{model_version}/lung_cnn.keras"
    classes_path: str = f"artifacts/models/{model_version}/classes.json"
    metadata_path: str = f"artifacts/models/{model_version}/metadata.json"
