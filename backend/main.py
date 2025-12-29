import os
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.model_loader import ensure_model_files
from backend.inference import LungCancerPredictor

app = FastAPI(title="Lung Cancer CNN API", version="1.0")

# CORS (keep yours)
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS if o.strip()] or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

predictor: LungCancerPredictor | None = None

@app.on_event("startup")
def _load_model_on_startup():
    global predictor
    if os.getenv("SKIP_MODEL_LOAD", "0") == "1":
        return

    model_path, classes_path = ensure_model_files()
    img_size = int(os.getenv("IMG_SIZE", "256"))
    predictor = LungCancerPredictor(model_path, classes_path, img_size)

@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": predictor is not None}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if predictor is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    image_bytes = await file.read()
    return predictor.predict_proba(image_bytes)
