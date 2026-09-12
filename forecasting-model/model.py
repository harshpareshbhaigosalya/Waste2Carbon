"""LSTM model architecture for waste volume forecasting."""

from tensorflow.keras import layers, models


def build_model(window_size=30, horizon=7):
    """Build and compile an LSTM model for multi-step time-series forecasting."""
    model = models.Sequential([
        layers.Input(shape=(window_size, 1)),
        layers.LSTM(64, return_sequences=True),
        layers.LSTM(32),
        layers.Dense(32, activation="relu"),
        layers.Dense(horizon),
    ])

    model.compile(optimizer="adam", loss="mse", metrics=["mae"])
    return model
