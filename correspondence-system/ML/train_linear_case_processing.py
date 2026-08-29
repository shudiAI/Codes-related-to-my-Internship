"""
AI-Based Case Processing Time Prediction
Final Model: Linear Regression
Feature Set: Structured Data Only

Inputs:
- Region
- City
- Government_Entity
- Project_Type
- Work_Method

Target:
- Processing_Days

Evaluation:
- 5-Fold Cross Validation
- R²
- MAE
- RMSE
- Train vs Validation R² Gap

Important:
This prototype is trained on synthetic/sample data.
The saved .joblib file is used later by the application for prediction.
The application should NOT retrain the model for every case.
"""

# ============================================================
# 1. IMPORT LIBRARIES
# ============================================================

from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from sklearn.base import clone
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LinearRegression
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)
from sklearn.model_selection import KFold
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


# ============================================================
# 2. FILE SETTINGS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

DATA_FILE = BASE_DIR / "Case_Processing_Dataset_250.xlsx"
SHEET_NAME = "Synthetic Cases"

MODEL_FILE = BASE_DIR / "linear_case_processing_model.joblib"
SUMMARY_FILE = BASE_DIR / "linear_regression_cv_results.csv"
FOLD_RESULTS_FILE = BASE_DIR / "linear_regression_fold_results.csv"


# ============================================================
# 3. LOAD DATASET
# ============================================================

if not DATA_FILE.exists():
    raise FileNotFoundError(
        f"Dataset not found: {DATA_FILE}\n"
        "Keep Case_Processing_Dataset_250.xlsx in the same folder "
        "as this Python file."
    )


df = pd.read_excel(
    DATA_FILE,
    sheet_name=SHEET_NAME,
)

print("=" * 75)
print("LINEAR REGRESSION - CASE PROCESSING TIME PREDICTION")
print("=" * 75)
print(f"Number of cases: {len(df)}")


# ============================================================
# 4. DEFINE FEATURES AND TARGET
# ============================================================

FEATURES = [
    "Region",
    "City",
    "Government_Entity",
    "Project_Type",
    "Work_Method",
]

TARGET = "Processing_Days"


# Check that all required columns exist.
required_columns = FEATURES + [TARGET]
missing_columns = [
    column for column in required_columns
    if column not in df.columns
]

if missing_columns:
    raise ValueError(
        "Missing required columns: "
        + ", ".join(missing_columns)
    )


# ============================================================
# 5. CLEAN DATA
# ============================================================

# Work Method does not apply to every project type.
# Missing values are stored as N/A.
df["Work_Method"] = (
    df["Work_Method"]
    .fillna("N/A")
    .astype(str)
)


# Make sure all categorical inputs are strings.
for column in FEATURES:
    df[column] = (
        df[column]
        .fillna("Unknown")
        .astype(str)
    )


# Make sure the target is numeric.
df[TARGET] = pd.to_numeric(
    df[TARGET],
    errors="coerce",
)


# Remove rows with a missing target, if any.
df = df.dropna(subset=[TARGET]).reset_index(drop=True)


X = df[FEATURES]
y = df[TARGET].astype(float)


# ============================================================
# 6. CREATE THE LINEAR REGRESSION PIPELINE
# ============================================================

# Linear Regression cannot directly use text categories such as:
# MOT, Eastern Region, Pipeline, HDD, etc.
#
# OneHotEncoder converts each category into numerical features.
# handle_unknown="ignore" allows the saved model to handle a
# category that was not seen during training without crashing.

preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(
                handle_unknown="ignore"
            ),
            FEATURES,
        )
    ],
    remainder="drop",
)


# The pipeline keeps preprocessing and the model together.
# This is useful later because the application can send the
# original case values directly to the saved pipeline.

linear_pipeline = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("model", LinearRegression()),
    ]
)


# ============================================================
# 7. 5-FOLD CROSS VALIDATION
# ============================================================

# 250 cases are divided into 5 folds.
# In each round:
# - about 200 cases are used for training
# - about 50 cases are used for validation
#
# Every case is used for validation once.

kf = KFold(
    n_splits=5,
    shuffle=True,
    random_state=42,
)

fold_results = []


for fold_number, (train_index, validation_index) in enumerate(
    kf.split(X),
    start=1,
):

    X_train = X.iloc[train_index]
    X_validation = X.iloc[validation_index]

    y_train = y.iloc[train_index]
    y_validation = y.iloc[validation_index]


    # Use a fresh copy for every fold.
    model = clone(linear_pipeline)


    # --------------------------------------------------------
    # TRAIN
    # --------------------------------------------------------

    model.fit(
        X_train,
        y_train,
    )


    # --------------------------------------------------------
    # PREDICT TRAINING DATA
    # --------------------------------------------------------

    train_predictions = model.predict(
        X_train
    )


    # --------------------------------------------------------
    # PREDICT VALIDATION DATA
    # --------------------------------------------------------

    validation_predictions = model.predict(
        X_validation
    )


    # ========================================================
    # TRAINING METRICS
    # ========================================================

    train_r2 = r2_score(
        y_train,
        train_predictions,
    )

    train_mae = mean_absolute_error(
        y_train,
        train_predictions,
    )

    train_rmse = np.sqrt(
        mean_squared_error(
            y_train,
            train_predictions,
        )
    )


    # ========================================================
    # VALIDATION METRICS
    # ========================================================

    validation_r2 = r2_score(
        y_validation,
        validation_predictions,
    )

    validation_mae = mean_absolute_error(
        y_validation,
        validation_predictions,
    )

    validation_rmse = np.sqrt(
        mean_squared_error(
            y_validation,
            validation_predictions,
        )
    )


    # ========================================================
    # OVERFITTING INDICATOR
    # ========================================================

    r2_gap = train_r2 - validation_r2


    fold_results.append(
        {
            "Fold": fold_number,
            "Train_R2": train_r2,
            "Validation_R2": validation_r2,
            "R2_Gap": r2_gap,
            "Train_MAE": train_mae,
            "Validation_MAE": validation_mae,
            "Train_RMSE": train_rmse,
            "Validation_RMSE": validation_rmse,
        }
    )

    print(f"Fold {fold_number}/5 completed.")


# ============================================================
# 8. CALCULATE AVERAGE RESULTS
# ============================================================

fold_results_df = pd.DataFrame(
    fold_results
)


summary = {
    "Model": "Linear Regression",
    "Feature_Set": "Structured Only",
    "Number_of_Cases": len(df),
    "Train_R2_Mean": fold_results_df["Train_R2"].mean(),
    "Validation_R2_Mean": fold_results_df["Validation_R2"].mean(),
    "Validation_R2_Std": fold_results_df["Validation_R2"].std(),
    "R2_Gap_Mean": fold_results_df["R2_Gap"].mean(),
    "Train_MAE_Mean": fold_results_df["Train_MAE"].mean(),
    "Validation_MAE_Mean": fold_results_df["Validation_MAE"].mean(),
    "Validation_MAE_Std": fold_results_df["Validation_MAE"].std(),
    "Train_RMSE_Mean": fold_results_df["Train_RMSE"].mean(),
    "Validation_RMSE_Mean": fold_results_df["Validation_RMSE"].mean(),
    "Validation_RMSE_Std": fold_results_df["Validation_RMSE"].std(),
}

summary_df = pd.DataFrame(
    [summary]
)


# ============================================================
# 9. DISPLAY RESULTS
# ============================================================

print("\n" + "=" * 75)
print("5-FOLD CROSS-VALIDATION RESULTS")
print("=" * 75)

print(
    f"Train R² Mean       : {summary['Train_R2_Mean']:.3f}"
)

print(
    f"Validation R² Mean  : {summary['Validation_R2_Mean']:.3f}"
)

print(
    f"R² Gap Mean         : {summary['R2_Gap_Mean']:.3f}"
)

print(
    f"Validation MAE      : {summary['Validation_MAE_Mean']:.3f} days"
)

print(
    f"Validation RMSE     : {summary['Validation_RMSE_Mean']:.3f} days"
)


# Simple interpretation of Train vs Validation R² gap.
if summary["R2_Gap_Mean"] < 0.10:
    generalization_status = "Low gap / good generalization"
elif summary["R2_Gap_Mean"] < 0.20:
    generalization_status = "Moderate gap"
else:
    generalization_status = "High gap / possible overfitting"

print(
    f"Generalization      : {generalization_status}"
)


# ============================================================
# 10. TRAIN FINAL MODEL ON ALL 250 CASES
# ============================================================

# Cross-validation is used for evaluation.
# After evaluation, the final model is trained using all
# available sample cases before it is saved for integration.

final_pipeline = clone(
    linear_pipeline
)

final_pipeline.fit(
    X,
    y,
)


# ============================================================
# 11. SAVE FINAL MODEL
# ============================================================

# Save the trained pipeline together with useful metadata.
# The pipeline already contains both:
# 1. OneHotEncoder preprocessing
# 2. Linear Regression model

model_bundle = {
    "model_name": "Linear Regression",
    "feature_set": "Structured Only",
    "features": FEATURES,
    "target": TARGET,
    "pipeline": final_pipeline,
    "training_data_type": "Synthetic / sample prototype data",
    "cv_folds": 5,
}

joblib.dump(
    model_bundle,
    MODEL_FILE,
)


# ============================================================
# 12. SAVE EVALUATION RESULTS
# ============================================================

fold_results_df.to_csv(
    FOLD_RESULTS_FILE,
    index=False,
)

summary_df.to_csv(
    SUMMARY_FILE,
    index=False,
)


# ============================================================
# 13. QUICK PREDICTION TEST
# ============================================================

# Use the first case only as a technical test to make sure
# that the saved final pipeline can produce a prediction.

sample_case = X.iloc[[0]]

sample_prediction = final_pipeline.predict(
    sample_case
)[0]

print("\n" + "=" * 75)
print("QUICK MODEL CHECK")
print("=" * 75)

if "Case_ID" in df.columns:
    print(
        "Sample Case ID          :",
        df.iloc[0]["Case_ID"],
    )

print(
    "Actual Processing Days :",
    df.iloc[0][TARGET],
)

print(
    "Predicted Days         :",
    round(sample_prediction, 1),
)


# ============================================================
# 14. DISPLAY SAVED FILES
# ============================================================

print("\n" + "=" * 75)
print("FILES SAVED")
print("=" * 75)

print("1.", MODEL_FILE.name)
print("2.", SUMMARY_FILE.name)
print("3.", FOLD_RESULTS_FILE.name)

print("\nDone.")
