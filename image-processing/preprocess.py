"""Utilities for loading and preprocessing waste image data."""

import os
import cv2
import numpy as np

IMAGE_SIZE = (224, 224)


def load_image(path, target_size=IMAGE_SIZE):
    """Load an image from disk and resize it to the target size."""
    image = cv2.imread(path)
    if image is None:
        raise FileNotFoundError(f"Could not read image at {path}")
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image = cv2.resize(image, target_size)
    return image


def normalize(image):
    """Scale pixel values to the [0, 1] range."""
    return image.astype(np.float32) / 255.0


def load_dataset(data_dir):
    """Load all images and labels from a directory of class subfolders."""
    images, labels = [], []
    for label in sorted(os.listdir(data_dir)):
        class_dir = os.path.join(data_dir, label)
        if not os.path.isdir(class_dir):
            continue
        for fname in os.listdir(class_dir):
            img = load_image(os.path.join(class_dir, fname))
            images.append(normalize(img))
            labels.append(label)
    return np.array(images), np.array(labels)
