import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# LOAD DATA
df = pd.read_csv("Symptom2Disease.csv")

# Basic cleaning
df = df.dropna()
df["text"] = df["text"].str.lower().str.strip()

# LOAD MODEL
model = SentenceTransformer("all-MiniLM-L6-v2")

# ENCODE DATASET
texts = df["text"].tolist()
labels = df["label"].tolist()

#save embeddings
print("Encoding dataset...")
embeddings = model.encode(texts, convert_to_numpy=True)
np.save("embeddings.npy", embeddings)
np.save("labels.npy", labels)  
np.save("texts.npy", texts)