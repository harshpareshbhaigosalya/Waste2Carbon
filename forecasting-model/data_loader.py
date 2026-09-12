"""Utilities for loading and windowing waste volume time-series data."""

import pandas as pd
import numpy as np


def load_series(csv_path, date_col="date", value_col="waste_volume"):
    """Load a time series CSV and return a sorted DataFrame."""
    df = pd.read_csv(csv_path, parse_dates=[date_col])
    df = df.sort_values(date_col).reset_index(drop=True)
    return df[[date_col, value_col]]


def create_windows(series, window_size=30, horizon=7):
    """Split a 1D series into (input_window, target_horizon) pairs."""
    X, y = [], []
    for i in range(len(series) - window_size - horizon + 1):
        X.append(series[i:i + window_size])
        y.append(series[i + window_size:i + window_size + horizon])
    return np.array(X), np.array(y)
