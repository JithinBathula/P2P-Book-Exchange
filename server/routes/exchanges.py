# routes/exchanges.py
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.exchange import Exchange
from models.book import Book
from models.user import User
from extensions import db
from datetime import datetime
import logging

exchange_routes = Blueprint('exchanges', __name__)

@exchange_routes.route('/request', methods=['POST'])
@jwt_required()
def request_exchange():
    try:
        current_user = User.query.filter_by(username=get_jwt_identity()).first()
        data = request.json
        
        # Validate requested book
        requested_book = Book.query.get_or_404(data['book_id'])
        if requested_book.status != 'available':
            return jsonify({"msg": "Book is not available for exchange"}), 400

        # Handle existing book offer
        if 'offered_book_id' in data:
            offered_book = Book.query.get_or_404(data['offered_book_id'])
            if offered_book.owner_id != current_user.id:
                return jsonify({"msg": "You don't own this book"}), 403
            if offered_book.status != 'available':
                return jsonify({"msg": "Your offered book is not available for exchange"}), 400
            
            # Mark the offered book as pending
            offered_book.status = 'pending'
            
        else:
            # Handle new book offer
            new_book = Book(
                title=data['offered_book_title'],
                author=data['offered_book_author'],
                description=data.get('offered_book_description', ''),
                owner_id=current_user.id,
                status='pending'  # New book starts as pending
            )
            db.session.add(new_book)
            db.session.flush()  # Get ID for new book
            offered_book = new_book

        # Create the exchange request
        new_exchange = Exchange(
            book_id=requested_book.id,
            requester_id=current_user.id,
            offered_book_id=offered_book.id
        )
        
        db.session.add(new_exchange)
        db.session.commit()
        
        return jsonify({
            "msg": "Exchange requested successfully",
            "exchange_id": new_exchange.id
        }), 201

    except Exception as e:
        logging.error(f"Error creating exchange request: {str(e)}")
        db.session.rollback()
        return jsonify({"msg": "Error creating exchange request"}), 500

@exchange_routes.route('/exchanges', methods=['GET'])
@jwt_required()
def get_exchanges():
    current_user = User.query.filter_by(username=get_jwt_identity()).first()
    
    # Get exchanges where user is either requester or book owner
    exchanges = Exchange.query.join(
        Book, Exchange.book_id == Book.id
    ).filter(
        (Exchange.requester_id == current_user.id) | 
        (Book.owner_id == current_user.id)
    ).all()
    
    exchange_list = []
    for exchange in exchanges:
        exchange_data = {
            'id': exchange.id,
            'book_title': exchange.book.title,
            'book_author': exchange.book.author,
            'requester_username': exchange.requester.username,
            'owner': exchange.book.owner.username,
            'offered_book_title': exchange.offered_book.title if exchange.offered_book else None,
            'offered_book_author': exchange.offered_book.author if exchange.offered_book else None,
            'status': exchange.status,
            'created_at': exchange.created_at.isoformat(),
            'is_owner': exchange.book.owner_id == current_user.id
        }
        exchange_list.append(exchange_data)
    
    return jsonify(exchange_list), 200

@exchange_routes.route('/exchanges/<int:exchange_id>', methods=['PUT'])
@jwt_required()
def update_exchange_status(exchange_id):
    try:
        current_user = User.query.filter_by(username=get_jwt_identity()).first()
        exchange = Exchange.query.get_or_404(exchange_id)
        
        if exchange.book.owner_id != current_user.id:
            return jsonify({"msg": "Unauthorized"}), 403
        
        new_status = request.json.get('status')
        if new_status not in ['accepted', 'rejected']:
            return jsonify({"msg": "Invalid status"}), 400
        
        exchange.status = new_status
        
        if new_status == 'accepted':
            # Mark both books as exchanged
            exchange.book.status = 'exchanged'
            exchange.offered_book.status = 'exchanged'
            
            # Reject all other pending exchanges for these books
            other_exchanges = Exchange.query.filter(
                Exchange.status == 'pending',
                (Exchange.book_id.in_([exchange.book_id, exchange.offered_book_id]) |
                 Exchange.offered_book_id.in_([exchange.book_id, exchange.offered_book_id]))
            ).all()
            
            for other_exchange in other_exchanges:
                if other_exchange.id != exchange.id:
                    other_exchange.status = 'rejected'
                    # Make the offered books in rejected exchanges available again
                    if other_exchange.offered_book_id != exchange.offered_book_id:
                        other_exchange.offered_book.status = 'available'
                    
        elif new_status == 'rejected':
            # Make the offered book available again
            exchange.offered_book.status = 'available'
        
        db.session.commit()
        return jsonify({"msg": f"Exchange {new_status} successfully"}), 200
        
    except Exception as e:
        logging.error(f"Error updating exchange: {str(e)}")
        db.session.rollback()
        return jsonify({"msg": "Error updating exchange"}), 500