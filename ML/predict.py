import sys
import numpy as np
import joblib
from sentence_transformers import SentenceTransformer
from sklearn.preprocessing import normalize

# LOAD SAVED COMPONENTS
try:
    svm = joblib.load("svm_model1.pkl")
    le = joblib.load("label_encoder1.pkl")
except Exception as e:
    print("Error loading model files:", e)
    sys.exit(1)

# Load embedding model once
model = SentenceTransformer("all-MiniLM-L6-v2")

# PREDICTION FUNCTION
def predict_disease(text, top_k=3):
    # preprocess
    text = text.lower().strip()

    # convert to embedding
    emb = model.encode([text], convert_to_numpy=True)

    # normalize (must match training)
    emb = normalize(emb)

    # predict probabilities
    probs = svm.predict_proba(emb)[0]

    # get top-k indices
    top_indices = np.argsort(probs)[::-1][:top_k]

    results = []
    for idx in top_indices:
        disease = le.inverse_transform([idx])[0]
        score = float(probs[idx])
        results.append((disease, score))

    return results

print(predict_disease("I feel unusually thirsty all the time and need to urinate frequently. I also feel tired even after resting.",5))
