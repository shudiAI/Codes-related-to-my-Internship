"""Load the saved preprocessing/model pipeline and predict one saved case."""

import json
import sys
from pathlib import Path

import joblib
import pandas as pd


MODEL_FILE = Path(__file__).resolve().parent / "linear_case_processing_model.joblib"
FEATURES = [
    "Region",
    "City",
    "Government_Entity",
    "Project_Type",
    "Work_Method",
]


def main():
    payload = json.load(sys.stdin)
    missing = [feature for feature in FEATURES if not payload.get(feature)]
    if missing:
        raise ValueError("Missing prediction fields: " + ", ".join(missing))

    model_bundle = joblib.load(MODEL_FILE)
    pipeline = model_bundle["pipeline"]
    model_input = pd.DataFrame([{feature: str(payload[feature]) for feature in FEATURES}])
    prediction = float(pipeline.predict(model_input)[0])

    print(json.dumps({"estimated_processing_days": max(1, round(prediction))}))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
