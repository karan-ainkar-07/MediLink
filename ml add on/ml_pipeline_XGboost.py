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
# 4. TRAIN-TEST SPLIT
# =========================
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)
# =========================
# 5. TRAIN MODEL (XGBOOST)
# =========================
from xgboost import XGBClassifier
from sklearn.preprocessing import LabelEncoder

# XGBoost requires numeric labels
le = LabelEncoder()
y_train_encoded = le.fit_transform(y_train)
y_test_encoded = le.transform(y_test)

model = XGBClassifier(
    n_estimators=200,
    random_state=42,
    n_jobs=-1,
    scale_pos_weight=1,  
    use_label_encoder=False,
    eval_metric='mlogloss'
)

model.fit(X_train, y_train_encoded)

# =========================
# 6. EVALUATE
# =========================
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

y_pred_encoded = model.predict(X_test)
y_pred = le.inverse_transform(y_pred_encoded)

print("\nAccuracy:", accuracy_score(y_test, y_pred))

print("\nClassification Report:\n")
print(classification_report(y_test, y_pred))

print("\nConfusion Matrix:\n")
print(confusion_matrix(y_test, y_pred))

# =========================
# 7. CROSS VALIDATION
# =========================
from sklearn.model_selection import cross_val_score

# use encoded labels for CV
y_encoded = le.fit_transform(y)

cv_scores = cross_val_score(model, X, y_encoded, cv=5)

print("\nCross Validation Accuracy:", cv_scores.mean())

# =========================
# 8. SAVE MODEL + FEATURES
# =========================
import joblib

feature_list = X.columns.tolist()

joblib.dump(model, "prediction_model.pkl")     
joblib.dump(feature_list, "feature_list.pkl")
joblib.dump(le, "label_encoder.pkl")         

print("\nModel saved.")