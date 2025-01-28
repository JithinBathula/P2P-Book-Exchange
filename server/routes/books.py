from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.book import Book
from models.user import User
from extensions import db

book_routes = Blueprint('books', __name__)

@book_routes.route('/books', methods=['POST'])
@jwt_required()
def add_book():
    current_user = User.query.filter_by(username=get_jwt_identity()).first()
    data = request.json
    
    new_book = Book(
        title=data['title'],
        author=data['author'],
        owner_id=current_user.id
    )
    db.session.add(new_book)
    db.session.commit()
    return jsonify({"msg": "Book added"}), 201

@book_routes.route('/books', methods=['GET'])
def get_books():
    books = Book.query.filter_by(status='available').all()
    return jsonify([{
        'id': book.id,
        'title': book.title,
        'author': book.author,
        'owner': book.owner.username
    } for book in books])