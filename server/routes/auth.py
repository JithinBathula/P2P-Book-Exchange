from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token
from models.user import User
from extensions import db

auth_routes = Blueprint('auth', __name__)

@auth_routes.route('/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"msg": "Username exists"}), 400
        
    new_user = User(
        username=data['username'],
        password=data['password'],  # In real app, hash this!
        email=data['email'],
        location=data.get('location')
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"msg": "User created"}), 201

@auth_routes.route('/login', methods=['POST'])
def login():
    username = request.json.get('username')
    password = request.json.get('password')
    user = User.query.filter_by(username=username).first()
    
    if user and user.password == password:  # In real app, use proper password checking
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token)
    return jsonify({"msg": "Invalid credentials"}), 401