import os
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np

# Load the trained model
model = load_model('currency_auth_model.h5')
print("Model loaded successfully")
print(f"Model input shape: {model.input_shape}")
print(f"Model output shape: {model.output_shape}")

# Test with a known fake image
fake_img_path = 'test.jpg'
real_img_path = 'dataset/test/real/100_jpg.rf.2edef2522c4db8d75e4c9bd8863d154d.jpg'

def preprocess_image(image_path):
    """Preprocess the image for prediction"""
    img = image.load_img(image_path, target_size=(128, 128))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array /= 255.0
    return img_array

# Test fake image
if os.path.exists(fake_img_path):
    fake_img = preprocess_image(fake_img_path)
    fake_pred = model.predict(fake_img)
    print(f"\nFake image prediction: {fake_pred[0][0]}")
    print(f"Fake image - Raw: {fake_pred[0][0]:.4f}, Classified as: {'REAL' if fake_pred[0][0] > 0.5 else 'FAKE'}")

# Test real image
if os.path.exists(real_img_path):
    real_img = preprocess_image(real_img_path)
    real_pred = model.predict(real_img)
    print(f"\nReal image prediction: {real_pred[0][0]}")
    print(f"Real image - Raw: {real_pred[0][0]:.4f}, Classified as: {'REAL' if real_pred[0][0] > 0.5 else 'FAKE'}")

print("\nInterpretation:")
print("- Values close to 0 = first class (FAKE)")
print("- Values close to 1 = second class (REAL)")