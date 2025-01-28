# routes/user.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from extensions import db

user_routes = Blueprint('user', __name__)

@user_routes.route('/user/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user = User.query.filter_by(username=get_jwt_identity()).first()
    return jsonify({
        'username': current_user.username,
        'email': current_user.email,
        'location': current_user.location
    }), 200

@user_routes.route('/user/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user = User.query.filter_by(username=get_jwt_identity()).first()
    data = request.json
    
    # Update email if provided and not already taken
    if 'email' in data and data['email'] != current_user.email:
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"msg": "Email already taken"}), 400
        current_user.email = data['email']
    
    # Update location if provided
    if 'location' in data:
        current_user.location = data['location']
    
    # Update password if provided
    if 'password' in data:
        current_user.set_password(data['password'])
    
    db.session.commit()
    
    return jsonify({"msg": "Profile updated successfully"}), 200