# Image Processing

Waste image classification pipeline. Preprocesses images of waste samples and trains a CNN model to classify material type (organic, plastic, metal, paper, glass) prior to carbon-conversion estimation.

## Structure

- `train_model.ipynb` – notebook for training the image classification model
- `preprocess.py` – image loading, resizing and augmentation utilities
- `model.py` – CNN model architecture definition
- `requirements.txt` – Python dependencies
- `data/` – training/validation image dataset (not tracked)
- `models/` – saved model checkpoints (not tracked)
