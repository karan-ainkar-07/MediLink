import pandas as pd
import numpy as np

# -----------------------------
# 1. Load dataset
# -----------------------------
df = pd.read_csv("dataset.csv")

# -----------------------------
# 2. Normalize + Parse columns
# -----------------------------
def normalize_symptom(s):
    return s.strip().lower().replace(" ", "_")

df["symptoms"] = df["symptoms"].apply(
    lambda x: [normalize_symptom(i) for i in str(x).split("|")]
)

df["weights"] = df["weights"].apply(
    lambda x: [float(i) for i in str(x).split("|")]
)

# -----------------------------
# 3. Validate alignment
# -----------------------------
for idx, row in df.iterrows():
    if len(row["symptoms"]) != len(row["weights"]):
        raise ValueError(f"Mismatch at row {idx}")

# -----------------------------
# 4. Build unique symptom set
# -----------------------------
all_symptoms = set()
for sym_list in df["symptoms"]:
    all_symptoms.update(sym_list)

# FIXED order (critical)
all_symptoms = sorted(list(all_symptoms))

# Mapping for fast lookup
symptom_to_index = {sym: i for i, sym in enumerate(all_symptoms)}

# -----------------------------
# 5. Initialize feature matrix
# -----------------------------
X = np.zeros((len(df), len(all_symptoms)))

# -----------------------------
# 6. Fill matrix with weights
# -----------------------------
for row_idx, row in df.iterrows():
    symptoms = row["symptoms"]
    weights = row["weights"]
    
    for sym, w in zip(symptoms, weights):
        col_idx = symptom_to_index[sym]
        X[row_idx, col_idx] = w

# -----------------------------
# 7. Convert to DataFrame
# -----------------------------
X_df = pd.DataFrame(X, columns=all_symptoms)

# Add target column
X_df["disease"] = df["disease"]

# -----------------------------
# 8. Save processed dataset
# -----------------------------
X_df.to_csv("processed_dataset.csv", index=False)

# -----------------------------
# 9. Basic checks
# -----------------------------
print("Shape:", X_df.shape)
print("Total symptoms (features):", len(all_symptoms))
print("Sample data:\n", X_df.head())

# Sparsity check
sparsity = (X_df.drop("disease", axis=1) == 0).sum().sum() / (
    X_df.shape[0] * (X_df.shape[1] - 1)
)
print("Sparsity:", sparsity)