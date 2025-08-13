from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os

app = Flask(__name__)
CORS(app)

# Load model
MODEL_PATH = 'model/model.h5'
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model not found at {MODEL_PATH}")
model = tf.keras.models.load_model(MODEL_PATH)

# Preprocess function
def preprocess_image(image_bytes, target_size=(128, 128)):
    img = Image.open(io.BytesIO(image_bytes)).resize(target_size)
    img_array = np.array(img) / 255.0
    return np.expand_dims(img_array, axis=0)

@app.route("/predict", methods=["POST"])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    img_file = request.files['image']
    img_bytes = img_file.read()
    
    if not img_bytes:
        return jsonify({"error": "Empty file"}), 400

    # Preprocess and predict
    img_array = preprocess_image(img_bytes)
    prediction = model.predict(img_array)[0][0]
    
    label = "Good" if prediction > 0.5 else "Defective"
    probability = float(prediction if prediction > 0.5 else 1 - prediction)
    
    return jsonify({
        "prediction": label,
        "probability": probability,
        "raw_value": float(prediction)
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
