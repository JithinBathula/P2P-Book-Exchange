# models/exchange.py
from extensions import db
from datetime import datetime

class Exchange(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey('book.id'), nullable=False)
    requester_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    offered_book_id = db.Column(db.Integer, db.ForeignKey('book.id'))
    status = db.Column(db.String(20), default='pending')  # pending, accepted, rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    book = db.relationship('Book', foreign_keys=[book_id])
    offered_book = db.relationship('Book', foreign_keys=[offered_book_id])
    requester = db.relationship('User', foreign_keys=[requester_id])