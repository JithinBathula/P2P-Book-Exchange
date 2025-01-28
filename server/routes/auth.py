# routes/auth.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models.user import User
from extensions import db

auth_routes = Blueprint('auth', __name__)

@auth_routes.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        if not data or 'username' not in data or 'password' not in data:
            return jsonify({"msg": "Missing username or password"}), 400

        if User.query.filter_by(username=data['username']).first():
            return jsonify({"msg": "Username already exists"}), 400

        new_user = User(
            username=data['username'],
            email=data.get('email', ''),
            location=data.get('location', '')
        )
        new_user.set_password(data['password'])
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({"msg": "User created successfully"}), 201
        
    except Exception as e:
        print(f"Registration error: {str(e)}")  # For debugging
        return jsonify({"msg": "Error during registration"}), 500

@auth_routes.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or 'username' not in data or 'password' not in data:
            return jsonify({"msg": "Missing username or password"}), 400

        user = User.query.filter_by(username=data['username']).first()

        if user and user.check_password(data['password']):
            access_token = create_access_token(identity=user.username)
            return jsonify({
                "access_token": access_token,
                "username": user.username
            }), 200
            
        return jsonify({"msg": "Invalid credentials"}), 401
        
    except Exception as e:
        print(f"Login error: {str(e)}")  # For debugging
        return jsonify({"msg": "Error during login"}), 500