import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from backend.inference import LungCancerPredictor
from src.lung_cancer.utils import setup_logging
from backend.model_loader import ensure_model_files

logger = setup_logging("api")
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

MODEL_PATH, CLASSES_PATH = ensure_model_files()
IMG_SIZE = int(os.getenv("IMG_SIZE", "256"))

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")

app = FastAPI(title="Lung Cancer CNN API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

predictor = LungCancerPredictor(
    model_path=MODEL_PATH,
    classes_path=CLASSES_PATH,
    img_size=IMG_SIZE,
)

@app.get("/")
def root():
    return {"message": "Use POST /predict or GET /health"}

@app.get("/health")
def health():
    return {"status": "ok", "model_version": MODEL_VERSION}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image_bytes = await file.read()
    result = predictor.predict_proba(image_bytes)
    return result
