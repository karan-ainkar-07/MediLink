from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware


# predict function
from test import predict_topK


# ----------------------------
# APP INIT
# ----------------------------
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# REQUEST SCHEMA
# ----------------------------
class SymptomItem(BaseModel):
    symptom: str
    weight: float   # expected 0–1


class InputData(BaseModel):
    data: List[SymptomItem]
    k: int = 3   # default top-k


# ----------------------------
# HEALTH CHECK
# ----------------------------
@app.get("/")
def health():
    return {"status": "ok"}


# ----------------------------
# PREDICT ENDPOINT
# ----------------------------
@app.post("/predict")
def predict(input: InputData):
    try:
        symptoms = [
            {"symptom": item.symptom, "weight": item.weight}
            for item in input.data
        ]

        result = predict_topK(symptoms, input.k)

        return {
            "prediction": result
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )