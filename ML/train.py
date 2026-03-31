import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, normalize
from sklearn.svm import SVC
from sklearn.metrics import classification_report, accuracy_score

#load the embeddings and labels
X = np.load("embeddings.npy")
labels=np.load("labels.npy")


# NORMALIZATION
X=normalize(X)

# ENCODE LABELS
le = LabelEncoder()
y = le.fit_transform(labels)

# =========================
# TRAIN TEST SPLIT
# =========================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# TRAIN SVM MODEL
svm = SVC(kernel='rbf', probability=True)  
svm.fit(X_train, y_train)

# EVALUATION
y_pred = svm.predict(X_test)

print("Accuracy:", accuracy_score(y_test, y_pred))
print(classification_report(y_test, y_pred, target_names=le.classes_))

# SAVE EVERYTHING
joblib.dump(svm, "svm_model1.pkl")
joblib.dump(le, "label_encoder1.pkl")

print("Model saved.")