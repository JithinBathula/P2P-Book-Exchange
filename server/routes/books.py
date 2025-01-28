# routes/books.py
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.book import Book
from models.user import User
from extensions import db
import os
book_routes = Blueprint('books', __name__)

@book_routes.route('/books', methods=['POST'])
@jwt_required()
def add_book():
    try:
        current_user = User.query.filter_by(username=get_jwt_identity()).first()
        
        data = request.json
        if not all([data.get('title'), data.get('author')]):
            return jsonify({"msg": "Missing required fields"}), 400

        new_book = Book(
            title=data['title'],
            author=data['author'],
            description=data.get('description', ''),
            owner_id=current_user.id
            
        )

        db.session.add(new_book)
        db.session.commit()

        return jsonify(new_book.to_dict()), 201

    except Exception as e:
        current_app.logger.error(f"Error adding book: {e}")
        db.session.rollback()
        return jsonify({"msg": "Error adding book"}), 500

@book_routes.route('/books', methods=['GET'])
@jwt_required(optional=True)
def get_books():
    current_user = get_jwt_identity()
    
    # Only show available books
    query = Book.query.filter_by(status='available')
    
    if current_user:
        user = User.query.filter_by(username=current_user).first()
        query = query.filter(Book.owner_id != user.id)
    
    books = query.order_by(Book.created_at.desc()).all()
    return jsonify([book.to_dict() for book in books]), 200

@book_routes.route('/books/user', methods=['GET'])
@jwt_required()
def get_user_books():
    current_user = User.query.filter_by(username=get_jwt_identity()).first()
    # Only show available books for exchange
    books = Book.query.filter_by(
        owner_id=current_user.id,
        status='available'
    ).order_by(Book.created_at.desc()).all()
    return jsonify([book.to_dict() for book in books]), 200

@book_routes.route('/books/<int:book_id>', methods=['DELETE'])
@jwt_required()
def delete_book(book_id):
    current_user = User.query.filter_by(username=get_jwt_identity()).first()
    book = Book.query.get_or_404(book_id)
    
    if book.owner_id != current_user.id:
        return jsonify({"msg": "Unauthorized"}), 403
    
    # Delete associated image if exists
    if book.image_url:
        try:
            image_path = os.path.join(current_app.root_path, book.image_url.lstrip('/'))
            if os.path.exists(image_path):
                os.remove(image_path)
        except Exception as e:
            current_app.logger.error(f"Error deleting image: {e}")
    
    db.session.delete(book)
    db.session.commit()
    
    return jsonify({"msg": "Book deleted successfully"}), 200