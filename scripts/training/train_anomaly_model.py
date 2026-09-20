"""
Trains the anomaly-detection model (FR-05) against synthetic and/or
benchmark data. See backend/app/ai_models/anomaly_detection/.
"""
import os
import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib


def train_isolation_forest():
    data_path = "data/synthetic/piston_engine_flight_data.csv"
    if not os.path.exists(data_path):
        print(f"Dataset {data_path} not found. Run generate_synthetic_data.py first.")
        return

    df = pd.read_csv(data_path)
    features = ["rpm", "egt", "cht", "vibration", "fuel_flow"]
    X = df[features]

    print("==> Training Isolation Forest anomaly detector on features:", features)
    clf = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
    clf.fit(X)

    model_dir = "models/saved_models"
    os.makedirs(model_dir, exist_ok=True)
    out_path = os.path.join(model_dir, "anomaly_isolation_forest.joblib")
    joblib.dump(clf, out_path)
    print(f" Saved anomaly detection model to: {out_path}")


if __name__ == "__main__":
    train_isolation_forest()
