from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
#predict function
from predict import predict_disease  

def format_predictions(predictions):
    result = {}

    for i, (disease, prob) in enumerate(predictions, start=1):
        result[f"prediction{i}"] = {
            "disease": str(disease),        
            "probability": float(prob)      
        }

    return result

app = FastAPI()

#format input data
class InputData(BaseModel):
    data: str

# HEALTH CHECK
@app.get("/")
def health():
    return {"status": "ok"}

# PREDICT ENDPOINT
@app.post("/predict")
def predict(input: InputData):
    try:
        result = predict_disease(input.data)
        formatted_result = format_predictions(result)
        return {
            "prediction": formatted_result
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )