import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from backend.inference import LungCancerPredictor
from src.lung_cancer.utils import setup_logging

logger = setup_logging("api")
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

MODEL_VERSION = os.getenv("MODEL_VERSION", "v1")
IMG_SIZE = int(os.getenv("IMG_SIZE", "256"))

MODEL_PATH = os.getenv("MODEL_PATH", f"artifacts/models/{MODEL_VERSION}/lung_cnn.keras")
CLASSES_PATH = os.getenv("CLASSES_PATH", f"artifacts/models/{MODEL_VERSION}/classes.json")

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
