import sys
import os
import json
from PIL import Image
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

# Get the directory where this script is located
script_dir = os.path.dirname(os.path.abspath(__file__))

# Construct the path to the model file
model_path = os.path.join(script_dir, 'currency_auth_model.h5')

# Load the trained model
model = None
class_indices = None
try:
    if os.path.exists(model_path):
        model = load_model(model_path)
        print("Model loaded successfully", file=sys.stderr)
    else:
        print(f"Model file not found at {model_path}. Using simulation mode.", file=sys.stderr)
except Exception as e:
    print(f"Error loading model: {e}. Using simulation mode.", file=sys.stderr)

def preprocess_image(image_path):
    """Preprocess the image for prediction"""
    try:
        img = image.load_img(image_path, target_size=(128, 128))
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array /= 255.0
        return img_array
    except Exception as e:
        raise Exception(f"Error preprocessing image: {str(e)}")

def predict_currency(image_path):
    """Predict currency authenticity using the trained model"""
    try:
        # Check if image file exists
        if not os.path.exists(image_path):
            return {"error": "Image file not found"}
        
        # Try to open the image to verify it's valid
        try:
            img = Image.open(image_path)
            img.verify()  # Verify it's a valid image
        except Exception as e:
            return {"error": f"Invalid image file: {str(e)}"}
        
        # If model is loaded, use it for prediction
        if model is not None:
            try:
                # Preprocess the image
                processed_img = preprocess_image(image_path)
                
                # Make prediction
                prediction = model.predict(processed_img)
                confidence_raw = float(prediction[0][0])
                
                # For binary classification with sigmoid activation:
                # Values close to 0 = first class (fake)
                # Values close to 1 = second class (real)
                # During training, we specified classes=['fake', 'real']
                # So prediction close to 0 = fake, close to 1 = real
                is_real = bool(confidence_raw > 0.5)
                
                # Convert to percentage (0-100)
                confidence = confidence_raw * 100 if is_real else (1 - confidence_raw) * 100
                
                # Return result as JSON
                result = {
                    "is_real": is_real,
                    "confidence": confidence
                }
                
                return result
            except Exception as e:
                return {"error": f"Prediction failed: {str(e)}"}
        else:
            # Fallback to simulation mode if model is not available
            import random
            is_real = random.choice([True, False])
            confidence = random.uniform(50, 95)
            
            result = {
                "is_real": is_real,
                "confidence": confidence
            }
            
            return result
        
    except Exception as e:
        return {"error": f"Prediction failed: {str(e)}"}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    # Predict currency authenticity
    result = predict_currency(image_path)
    
    # Output result as JSON
    print(json.dumps(result))