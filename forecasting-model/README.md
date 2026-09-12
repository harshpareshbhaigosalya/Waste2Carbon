# Forecasting Model

Time-series forecasting of waste generation and carbon-conversion output. Uses historical waste volume data to predict future trends, feeding downstream capacity planning.

## Structure

- `train_forecast.ipynb` – notebook for training the forecasting model
- `data_loader.py` – loads and prepares time-series data
- `model.py` – LSTM forecasting model architecture
- `requirements.txt` – Python dependencies
- `data/` – historical waste volume dataset (not tracked)
- `models/` – saved model checkpoints (not tracked)
