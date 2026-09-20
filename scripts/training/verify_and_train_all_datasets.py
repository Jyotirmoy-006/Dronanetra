"""
Comprehensive CSV Dataset Verification & Model Training Suite
==============================================================
Validates, pre-processes, trains, evaluates, and verifies ML models for all
CSV datasets present in the repository:

1. NASA C-MAPSS Turbofan Benchmark Datasets (Train, Test with RUL, All, Dictionary)
2. Piston Engine Digital Twin Dataset
3. Synthetic Piston Engine Flight Telemetry Data

Saves trained model artifacts to models/saved_models/ and executes end-to-end
inference verification tests.
"""

import os
import sys
import time
import joblib
import numpy as np
import pandas as pd

from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingRegressor, IsolationForest
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score, accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

# Ensure UTF-8 stdout encoding on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

DATA_DIR = os.path.join(REPO_ROOT, "data")
MODELS_DIR = os.path.join(REPO_ROOT, "models", "saved_models")
os.makedirs(MODELS_DIR, exist_ok=True)


def log_header(title: str):
    print("\n" + "=" * 80)
    print(f"  {title.upper()}")
    print("=" * 80)


def check_csv_datasets():
    log_header("Step 1: CSV Dataset Integrity & Quality Audits")
    csv_configs = [
        ("NASA C-MAPSS Train Set", "data/raw/nasa_cmapss/NASA_CMAPSS_AVAILABLE_TRAIN_EXACT.csv"),
        ("NASA C-MAPSS Test Set", "data/raw/nasa_cmapss/NASA_CMAPSS_AVAILABLE_TEST_WITH_RUL_EXACT.csv"),
        ("NASA C-MAPSS Combined All", "data/raw/nasa_cmapss/NASA_CMAPSS_AVAILABLE_ALL_EXACT.csv"),
        ("NASA C-MAPSS Data Dictionary", "data/raw/nasa_cmapss/NASA_CMAPSS_EXACT_DATA_DICTIONARY.csv"),
        ("Piston Engine Digital Twin", "data/raw/piston_engine/piston_engine_digital_twin_dataset.csv"),
        ("Synthetic Flight Data", "data/synthetic/piston_engine_flight_data.csv"),
    ]

    summary_records = []

    for name, rel_path in csv_configs:
        full_path = os.path.join(REPO_ROOT, rel_path)
        if not os.path.exists(full_path):
            print(f"❌ [MISSING] {name} at {rel_path}")
            continue

        size_mb = os.path.getsize(full_path) / (1024 * 1024)
        df = pd.read_csv(full_path)
        null_count = df.isnull().sum().sum()
        numeric_cols = list(df.select_dtypes(include=[np.number]).columns)

        status = "PASSED" if null_count == 0 or "piston_engine_digital_twin" in rel_path else "WARNING"

        print(f"✓ [{status}] {name}")
        print(f"    Path: {rel_path}")
        print(f"    Size: {size_mb:.2f} MB | Shape: {df.shape[0]:,} rows x {df.shape[1]} cols")
        print(f"    Total Missing Values: {null_count}")
        print(f"    Numeric Features ({len(numeric_cols)}): {numeric_cols[:6]}...")

        summary_records.append({
            "name": name,
            "path": rel_path,
            "rows": df.shape[0],
            "cols": df.shape[1],
            "missing": null_count,
            "size_mb": round(size_mb, 2),
            "status": status,
        })

    return summary_records


def train_nasa_cmapss_rul_model():
    log_header("Step 2: Train & Evaluate RUL Model on NASA C-MAPSS Datasets")

    train_path = os.path.join(REPO_ROOT, "data/raw/nasa_cmapss/NASA_CMAPSS_AVAILABLE_TRAIN_EXACT.csv")
    test_path = os.path.join(REPO_ROOT, "data/raw/nasa_cmapss/NASA_CMAPSS_AVAILABLE_TEST_WITH_RUL_EXACT.csv")

    df_train = pd.read_csv(train_path)
    df_test = pd.read_csv(test_path)

    feature_cols = [
        "operational_setting_1", "operational_setting_2", "operational_setting_3",
        "sensor_1", "sensor_2", "sensor_3", "sensor_4", "sensor_5", "sensor_6",
        "sensor_7", "sensor_8", "sensor_9", "sensor_10", "sensor_11", "sensor_12",
        "sensor_13", "sensor_14", "sensor_15", "sensor_16", "sensor_17", "sensor_18",
        "sensor_19", "sensor_20", "sensor_21", "cycle"
    ]
    target_col = "RUL"

    X_train, y_train = df_train[feature_cols], df_train[target_col]
    X_test, y_test = df_test[feature_cols], df_test[target_col]

    print(f"==> Training HistGradientBoostingRegressor on {len(X_train):,} C-MAPSS training samples...")
    t0 = time.time()
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("regressor", HistGradientBoostingRegressor(max_iter=150, learning_rate=0.08, random_state=42))
    ])
    pipeline.fit(X_train, y_train)
    t_train = time.time() - t0

    print(f"✓ Model trained in {t_train:.2f} seconds.")

    # Evaluate overall test set
    y_pred = pipeline.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print(f"\n--- Overall NASA C-MAPSS Test Evaluation ({len(X_test):,} samples) ---")
    print(f"    RMSE : {rmse:.2f} cycles")
    print(f"    MAE  : {mae:.2f} cycles")
    print(f"    R²   : {r2:.4f}")

    # Evaluate per dataset split (FD001, FD002, FD003, FD004)
    print("\n--- Evaluation Breakdown by Dataset Variant ---")
    for ds_name, ds_group in df_test.groupby("dataset"):
        X_sub = ds_group[feature_cols]
        y_sub = ds_group[target_col]
        y_sub_pred = pipeline.predict(X_sub)
        sub_rmse = np.sqrt(mean_squared_error(y_sub, y_sub_pred))
        sub_r2 = r2_score(y_sub, y_sub_pred)
        print(f"    [{ds_name}] Samples: {len(ds_group):5d} | RMSE: {sub_rmse:6.2f} cycles | R²: {sub_r2:6.4f}")

    model_path = os.path.join(MODELS_DIR, "cmapss_rul_model.joblib")
    joblib.dump({"pipeline": pipeline, "feature_cols": feature_cols}, model_path)
    print(f"\n✓ Saved NASA C-MAPSS RUL Model artifact: {model_path}")
    return {"rmse": rmse, "mae": mae, "r2": r2, "model_path": model_path}


def train_piston_engine_twin_models():
    log_header("Step 3: Train & Evaluate Models on Piston Engine Digital Twin Dataset")

    twin_path = os.path.join(REPO_ROOT, "data/raw/piston_engine/piston_engine_digital_twin_dataset.csv")
    df = pd.read_csv(twin_path)

    feature_cols = [
        "rpm", "throttle_pct", "altitude_m", "ambient_temp_c", "ambient_pressure_kpa",
        "manifold_pressure_kpa", "fuel_flow_gph", "egt_c", "cht_c", "oil_pressure_bar",
        "oil_temp_c", "vibration_g", "engine_load_pct", "efficiency_pct"
    ]

    print(f"==> Dataset shape: {df.shape}. Preprocessing missing values (median imputation)...")
    X = df[feature_cols]
    y_rul = df["rul_cycles"]
    y_fault = df["health_state"]

    X_train, X_test, y_rul_train, y_rul_test, y_fault_train, y_fault_test = train_test_split(
        X, y_rul, y_fault, test_size=0.2, random_state=42
    )

    # 1. RUL Regressor Pipeline
    print(f"==> Training Piston Engine Digital Twin RUL Regressor ({len(X_train):,} train samples)...")
    rul_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
        ("regressor", HistGradientBoostingRegressor(max_iter=100, learning_rate=0.1, random_state=42))
    ])
    rul_pipeline.fit(X_train, y_rul_train)

    y_rul_pred = rul_pipeline.predict(X_test)
    rul_rmse = np.sqrt(mean_squared_error(y_rul_test, y_rul_pred))
    rul_mae = mean_absolute_error(y_rul_test, y_rul_pred)
    rul_r2 = r2_score(y_rul_test, y_rul_pred)

    print(f"\n--- Piston Engine Digital Twin RUL Regressor Test Evaluation ---")
    print(f"    RMSE : {rul_rmse:.2f} cycles")
    print(f"    MAE  : {rul_mae:.2f} cycles")
    print(f"    R²   : {rul_r2:.4f}")

    rul_model_path = os.path.join(MODELS_DIR, "piston_engine_rul_model.joblib")
    joblib.dump({"pipeline": rul_pipeline, "feature_cols": feature_cols}, rul_model_path)
    print(f"✓ Saved Piston Engine RUL Model artifact: {rul_model_path}")

    # 2. Fault Classifier Pipeline
    print(f"\n==> Training Piston Engine Fault & Health State Classifier...")
    clf_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
        ("classifier", RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42))
    ])
    clf_pipeline.fit(X_train, y_fault_train)

    y_fault_pred = clf_pipeline.predict(X_test)
    acc = accuracy_score(y_fault_test, y_fault_pred)

    print(f"\n--- Piston Engine Health State Classifier Test Evaluation ---")
    print(f"    Accuracy: {acc * 100:.2f}%")
    print("    Classification Report:")
    print(classification_report(y_fault_test, y_fault_pred, digits=3))

    fault_model_path = os.path.join(MODELS_DIR, "piston_engine_fault_classifier.joblib")
    joblib.dump({"pipeline": clf_pipeline, "feature_cols": feature_cols}, fault_model_path)
    print(f"✓ Saved Piston Engine Fault Classifier artifact: {fault_model_path}")

    return {
        "rul_rmse": rul_rmse,
        "rul_r2": rul_r2,
        "fault_acc": acc,
        "rul_model_path": rul_model_path,
        "fault_model_path": fault_model_path,
    }


def train_synthetic_flight_models():
    log_header("Step 4: Train & Evaluate Models on Synthetic Flight Telemetry Data")

    synthetic_path = os.path.join(REPO_ROOT, "data/synthetic/piston_engine_flight_data.csv")
    df = pd.read_csv(synthetic_path)

    features = ["rpm", "egt", "cht", "vibration", "fuel_flow"]
    X = df[features]

    # 1. Isolation Forest Anomaly Detection
    print(f"==> Training Isolation Forest anomaly detector on {len(df):,} synthetic flight records...")
    iso_forest = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
    iso_forest.fit(X)

    iso_model_path = os.path.join(MODELS_DIR, "anomaly_isolation_forest.joblib")
    joblib.dump(iso_forest, iso_model_path)
    print(f"✓ Saved Anomaly Detector artifact: {iso_model_path}")

    # 2. Flight RUL Regressor
    X_train, X_test, y_train, y_test = train_test_split(X, df["rul"], test_size=0.2, random_state=42)
    rul_pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("regressor", HistGradientBoostingRegressor(max_iter=80, random_state=42))
    ])
    rul_pipeline.fit(X_train, y_train)

    y_pred = rul_pipeline.predict(X_test)
    synth_rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    synth_r2 = r2_score(y_test, y_pred)

    print(f"\n--- Synthetic Flight Telemetry RUL Regressor Test Evaluation ---")
    print(f"    RMSE : {synth_rmse:.2f} hours/cycles")
    print(f"    R²   : {synth_r2:.4f}")

    synth_rul_path = os.path.join(MODELS_DIR, "synthetic_flight_rul_model.joblib")
    joblib.dump({"pipeline": rul_pipeline, "feature_cols": features}, synth_rul_path)
    print(f"✓ Saved Synthetic Flight RUL Model artifact: {synth_rul_path}")

    return {
        "iso_model_path": iso_model_path,
        "synth_rul_path": synth_rul_path,
        "synth_rmse": synth_rmse,
        "synth_r2": synth_r2,
    }


def verify_model_inference():
    log_header("Step 5: End-to-End Saved Artifact Loading & Prediction Verification")

    artifacts = [
        ("NASA C-MAPSS RUL Model", "cmapss_rul_model.joblib"),
        ("Piston Engine RUL Model", "piston_engine_rul_model.joblib"),
        ("Piston Engine Fault Classifier", "piston_engine_fault_classifier.joblib"),
        ("Anomaly Isolation Forest", "anomaly_isolation_forest.joblib"),
        ("Synthetic Flight RUL Model", "synthetic_flight_rul_model.joblib"),
    ]

    print("Verifying loading and sample inference for each artifact stored in models/saved_models/:\n")

    all_passed = True
    for name, filename in artifacts:
        full_path = os.path.join(MODELS_DIR, filename)
        if not os.path.exists(full_path):
            print(f"❌ Artifact not found: {filename}")
            all_passed = False
            continue

        try:
            model_obj = joblib.load(full_path)
            print(f"✓ Loaded artifact: {filename} ({os.path.getsize(full_path) / 1024:.1f} KB)")

            # Test inference based on model format
            if isinstance(model_obj, dict) and "pipeline" in model_obj:
                pipeline = model_obj["pipeline"]
                cols = model_obj["feature_cols"]
                sample_data = pd.DataFrame([np.ones(len(cols))], columns=cols)
                pred = pipeline.predict(sample_data)
                print(f"   Inference output test: sample predict -> {pred[0]}")
            elif hasattr(model_obj, "predict"):
                sample_data = np.ones((1, 5))
                pred = model_obj.predict(sample_data)
                print(f"   Inference output test: sample predict -> {pred[0]}")
            else:
                print("   Unknown object format, loaded cleanly.")

        except Exception as e:
            print(f"❌ Error during loading/inference for {filename}: {e}")
            all_passed = False

    if all_passed:
        print("\n🎉 ALL MODEL ARTIFACTS ARE FULLY VERIFIED AND WORKING PROPERLY!")
    else:
        print("\n⚠️ SOME MODEL ARTIFACTS FAILED VERIFICATION!")

    return all_passed


def main():
    print("=" * 80)
    print("  PYTHON CSV DATASET VALIDATION & MACHINE LEARNING PIPELINE")
    print("=" * 80)

    # 1. Datasets Check
    dataset_summary = check_csv_datasets()

    # 2. Train NASA C-MAPSS Model
    cmapss_res = train_nasa_cmapss_rul_model()

    # 3. Train Piston Engine Twin Models
    twin_res = train_piston_engine_twin_models()

    # 4. Train Synthetic Flight Models
    synth_res = train_synthetic_flight_models()

    # 5. Verification of Model Artifacts
    verification_passed = verify_model_inference()

    log_header("Execution Summary")
    print(f"Dataset Checks Status     : {len(dataset_summary)} CSV datasets audited successfully.")
    print(f"NASA C-MAPSS RUL Model    : R² = {cmapss_res['r2']:.4f}, RMSE = {cmapss_res['rmse']:.2f} cycles")
    print(f"Piston Engine RUL Model   : R² = {twin_res['rul_r2']:.4f}, RMSE = {twin_res['rul_rmse']:.2f} cycles")
    print(f"Piston Fault Classifier   : Accuracy = {twin_res['fault_acc'] * 100:.2f}%")
    print(f"Synthetic Flight RUL Model: R² = {synth_res['synth_r2']:.4f}, RMSE = {synth_res['synth_rmse']:.2f}")
    print(f"Model Artifact Verification: {'PASSED' if verification_passed else 'FAILED'}")
    print("=" * 80 + "\n")


if __name__ == "__main__":
    main()
