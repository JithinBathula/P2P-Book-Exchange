# utils/image_handler.py
import os
from werkzeug.utils import secure_filename
from PIL import Image
import uuid

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_image(file, upload_folder):
    if file and allowed_file(file.filename):
        # Generate unique filename
        filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
        filepath = os.path.join(upload_folder, filename)
        
        # Save and optimize image
        image = Image.open(file)
        image = image.convert('RGB')
        image.thumbnail((800, 800))  # Resize if too large
        image.save(filepath, optimize=True, quality=85)
        
        return filename
    return None