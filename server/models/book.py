from extensions import db
from models.user import User #import User

class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    author = db.Column(db.String(120), nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    status = db.Column(db.String(20), default='available')

    # Define the relationship to the User model
    owner = db.relationship('User', backref=db.backref('books', lazy=True))