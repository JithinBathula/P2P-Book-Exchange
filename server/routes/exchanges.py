from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.exchange import Exchange
from models.book import Book
from models.user import User
from extensions import db

exchange_routes = Blueprint('exchanges', __name__)

@exchange_routes.route('/request', methods=['POST'])
@jwt_required()
def request_book():
    current_user = User.query.filter_by(username=get_jwt_identity()).first()
    book_id = request.json.get('book_id')
    
    new_request = Exchange(
        book_id=book_id,
        requester_id=current_user.id
    )
    db.session.add(new_request)
    db.session.commit()
    return jsonify({"msg": "Exchange requested"}), 201