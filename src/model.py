from flask import Flask, request, jsonify
import tensorflow as tf
from keras.preprocessing import image
import numpy as np
from PIL import Image
import io
from flask_cors import CORS
import werkzeug.utils
import traceback
import logging
import os

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Configure CORS properly - allow requests from Express server
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://localhost:5173"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept"],
        "supports_credentials": True
    }
})

# Load the model
MODEL_PATH = os.environ.get('MODEL_PATH', '/Users/hrushireddy/Documents/project/tyre-detection-model/model.h5')
try:
    logger.info(f"Loading model from {MODEL_PATH}")
    model = tf.keras.models.load_model(MODEL_PATH)
    logger.info("Model loaded successfully")
except Exception as e:
    logger.error(f"Error loading model: {str(e)}")
    model = None

def preprocess_image(img_bytes, img_size=(128, 128)):
    try:
        # Log the received image size
        logger.info(f"Received image size: {len(img_bytes)} bytes")
        
        # Convert bytes to PIL Image
        img = Image.open(io.BytesIO(img_bytes))
        logger.info(f"Original image size: {img.size}")
        
        # Resize image
        img = img.resize(img_size)
        logger.info(f"Resized to: {img_size}")
        
        # Convert to array and preprocess
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array / 255.0
        
        return img_array
    except Exception as e:
        logger.error(f"Error preprocessing image: {str(e)}")
        logger.error(traceback.format_exc())
        raise

@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == 'OPTIONS':
        # Handle preflight request
        return '', 204
    
    logger.info("Received prediction request")
    
    if model is None:
        logger.error("Model not loaded")
        return jsonify({'error': 'Model not loaded'}), 500
    
    if 'image' not in request.files:
        logger.error("No image provided in request")
        return jsonify({'error': 'No image provided'}), 400
    
    try:
        # Get image from request
        file = request.files['image']
        filename = werkzeug.utils.secure_filename(file.filename)
        logger.info(f"Processing file: {filename}")
        
        # Read the file
        img_bytes = file.read()
        
        if not img_bytes:
            logger.error("Empty file received")
            return jsonify({'error': 'Empty file'}), 400
        
        # Preprocess image
        img_array = preprocess_image(img_bytes)
        
        # Make prediction
        prediction = model.predict(img_array)[0][0]
        logger.info(f"Prediction result: {prediction}")
        
        # Determine if the tyre is good or defective
        is_good = prediction > 0.5
        prediction_label = 'Good' if is_good else 'Defective'
        
        # Create response
        response = {
            'prediction': prediction_label,
            'probability': float(prediction if is_good else 1 - prediction),
            'raw_value': float(prediction)
        }
        
        logger.info(f"Sending response: {response}")
        return jsonify(response)
    
    except Exception as e:
        error_details = traceback.format_exc()
        logger.error(f"Error processing request: {error_details}")
        return jsonify({'error': str(e), 'details': error_details}), 500

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy', 
        'model_loaded': model is not None,
        'model_path': MODEL_PATH
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    debug = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    
    logger.info(f"Starting Flask server on {host}:{port} (debug={debug})")
    app.run(host=host, port=port, debug=debug)