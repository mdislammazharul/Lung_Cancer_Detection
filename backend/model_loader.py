import os
from pathlib import Path

def ensure_model_files() -> tuple[str, str]:
    model_repo = os.getenv("HF_MODEL_REPO", "")
    model_file = os.getenv("HF_MODEL_FILE", "lung_cnn.h5")
    classes_file = os.getenv("HF_CLASSES_FILE", "classes.json")

    local_dir = Path(os.getenv("MODEL_DIR", "artifacts/models/v1"))
    local_dir.mkdir(parents=True, exist_ok=True)

    local_model = local_dir / model_file
    local_classes = local_dir / classes_file

    # If repo not set, require local files (no HF dependency needed)
    if not model_repo:
        if not local_model.exists() or not local_classes.exists():
            raise FileNotFoundError(
                "Model files not found and HF_MODEL_REPO is not set."
            )
        return str(local_model), str(local_classes)

    # ✅ Import only when we actually need HF download
    from huggingface_hub import hf_hub_download  # lazy import

    if not local_model.exists():
        p = hf_hub_download(repo_id=model_repo, filename=model_file, local_dir=str(local_dir))
        if not local_model.exists():
            Path(p).rename(local_model)

    if not local_classes.exists():
        p = hf_hub_download(repo_id=model_repo, filename=classes_file, local_dir=str(local_dir))
        if not local_classes.exists():
            Path(p).rename(local_classes)

    return str(local_model), str(local_classes)
