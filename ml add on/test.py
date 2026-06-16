import joblib
import numpy as np
import pandas as pd

# ----------------------------
# 1. LOAD SAVED MODEL + ENCODER + FEATURES
# ----------------------------
model = joblib.load("prediction_model.pkl")
le = joblib.load("label_encoder.pkl")   # reverse encoder
features = joblib.load("feature_list.pkl")


# ----------------------------
# 2. PREDICT FUNCTION
# ----------------------------
def predict_topK(symptoms, k):

    # ----------------------------
    # INPUT NORMALIZATION
    # ----------------------------
    user_input = {}

    for item in symptoms:
        s = item.get("symptom")
        w = item.get("weight", 1)

        if s is not None:
            w = max(0, min(1, float(w)))
            user_input[s] = w

    # ----------------------------
    # CREATE FULL FEATURE VECTOR
    # ----------------------------
    data = {feature: 0.0 for feature in features}

    for s, val in user_input.items():
        if s in data:
            data[s] = val   # weighted assignment

    X_test = pd.DataFrame([data])

    # ----------------------------
    # PREDICT PROBABILITIES
    # ----------------------------
    probs = model.predict_proba(X_test)[0]
    classes = model.classes_

    # ----------------------------
    # TOP-K EXTRACTION
    # ----------------------------
    k = min(k, len(probs))
    topk_idx = np.argsort(probs)[::-1][:k]

    results = []

    for idx in topk_idx:
        encoded_label = classes[idx]
        disease = le.inverse_transform([encoded_label])[0]
        confidence = float(probs[idx] * 100)

        results.append({
            "disease": disease,
            "confidence": round(confidence, 2)
        })

    return results

# ----------------------------
# 3. EXAMPLE USAGE
# ----------------------------
if __name__ == "__main__":

    # weighted input
    user_symptoms = [
        {"symptom": "itching", "weight": 1},
        {"symptom": "skin_rash", "weight": 0.8},
        {"symptom": "fatigue", "weight": 0.5}
    ]

    predictions = predict_topK(user_symptoms, k=3)

    print("Top Predictions:\n")
    for i, pred in enumerate(predictions, start=1):
        print(f"{i}. {pred['disease']} --> {pred['confidence']}%")