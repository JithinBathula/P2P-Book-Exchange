from flask import Flask
from extensions import db, jwt
import os
from flask_cors import CORS


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET', 'super-secret')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db.init_app(app)
jwt.init_app(app)

# Import routes after initializing extensions
from routes.auth import auth_routes
from routes.books import book_routes
from routes.exchanges import exchange_routes

app.register_blueprint(auth_routes)
app.register_blueprint(book_routes)
app.register_blueprint(exchange_routes)

CORS(app, resources={r"/*": {"origins": "*"}})  # NEW: Add this line

# Create database tables
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)