# models/book.py
from extensions import db
from datetime import datetime

class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    author = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    # Status can be: 'available', 'pending', 'exchanged'
    status = db.Column(db.String(20), default='available')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Define the relationship
    owner = db.relationship('User', backref='books_owned')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'author': self.author,
            'description': self.description or '',
            'owner': self.owner.username if self.owner else None,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }