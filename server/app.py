# app.py
from flask import Flask, send_from_directory
from flask_cors import CORS
from config import Config
from extensions import db, jwt
import os
from routes.chatbot import chatbot_routes

# Register blueprints
from routes.auth import auth_routes
from routes.books import book_routes
from routes.exchanges import exchange_routes
from routes.user import user_routes

# Create the Flask application
app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
db.init_app(app)
jwt.init_app(app)

# Enable CORS
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)


app.register_blueprint(auth_routes)
app.register_blueprint(book_routes)
app.register_blueprint(exchange_routes)
app.register_blueprint(user_routes)
app.register_blueprint(chatbot_routes)

# Create database tables
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)