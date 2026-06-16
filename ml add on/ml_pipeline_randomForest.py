# =========================
# 1. LOAD DATA
# =========================
import pandas as pd

df = pd.read_csv("processed_dataset.csv")

# =========================
# 2. REMOVE DUPLICATES
# =========================
df = df.drop_duplicates()

print("Dataset size after removing duplicates:", len(df))

# =========================
# 3. SPLIT FEATURES & TARGET
# =========================
X = df.drop(columns=['disease'])
y = df['disease']

# =========================
# 4. LABEL ENCODING
# =========================
from sklearn.preprocessing import LabelEncoder

le = LabelEncoder()
y_encoded = le.fit_transform(y)

# =========================
# 5. TRAIN-TEST SPLIT
# =========================
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded,
    test_size=0.2,
    random_state=42,
    stratify=y_encoded
)

# =========================
# 6. TRAIN MODEL
# =========================
from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42,
    n_jobs=-1,
    class_weight='balanced'
)

model.fit(X_train, y_train)

# =========================
# 7. EVALUATE
# =========================
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

y_pred = model.predict(X_test)

print("\nAccuracy:", accuracy_score(y_test, y_pred))

print("\nClassification Report:\n")
print(classification_report(y_test, y_pred))

print("\nConfusion Matrix:\n")
print(confusion_matrix(y_test, y_pred))

# =========================
# 8. CROSS VALIDATION (STRATIFIED)
# =========================
from sklearn.model_selection import cross_val_score, StratifiedKFold

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

cv_scores = cross_val_score(model, X, y_encoded, cv=cv)

print("\nCross Validation Accuracy:", cv_scores.mean())

# =========================
# 9. SAVE MODEL + METADATA
# =========================
import joblib

feature_list = X.columns.tolist()

joblib.dump(model, "prediction_model.pkl")
joblib.dump(feature_list, "feature_list.pkl")
joblib.dump(le, "label_encoder.pkl")

print("\nModel saved.")