# routes/chatbot.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.book import Book
from models.user import User
from openai import OpenAI
import os

chatbot_routes = Blueprint('chatbot', __name__)

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def create_system_prompt(books):
    # Create a formatted list of available books
    books_list = "\n".join([
        f"- Title: {book.title}, Author: {book.author}"
        for book in books
    ])
    
    return f"""You are a helpful book exchange assistant. Here are the available books:

{books_list}

Your task is to:
1. Help users find books they might enjoy from this list
2. Only recommend books from the provided list
3. Keep responses concise and friendly
4. If asked about books not in the list, explain that you can only recommend from available books
5. Keep track of previous recommendations in the conversation"""

@chatbot_routes.route('/chatbot/recommend', methods=['POST'])
@jwt_required()
def get_recommendation():
    try:
        # Get current user
        current_user = User.query.filter_by(username=get_jwt_identity()).first()
        
        # Get request data
        data = request.get_json()
        user_message = data.get('message', '')
        conversation_history = data.get('conversation_history', [])

        # Get available books
        available_books = Book.query.filter(
            Book.status == 'available',
            Book.owner_id != current_user.id
        ).all()

        if not available_books:
            return jsonify({
                "message": "I apologize, but there are no books available for exchange at the moment."
            }), 200

        # Prepare messages for GPT
        messages = [
            {"role": "system", "content": create_system_prompt(available_books)}
        ]

        # Add conversation history
        for msg in conversation_history:
            role = "assistant" if msg['type'] == 'bot' else "user"
            messages.append({"role": role, "content": msg['content']})

        # Add current user message
        messages.append({"role": "user", "content": user_message})

        try:
            # Get response from GPT
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                temperature=0.7,
                max_tokens=200
            )

            gpt_response = response.choices[0].message.content

            # Try to identify recommended book
            recommended_book = None
            for book in available_books:
                if book.title.lower() in gpt_response.lower():
                    recommended_book = book
                    break

            return jsonify({
                "message": gpt_response,
                "recommendedBook": recommended_book.to_dict() if recommended_book else None
            }), 200

        except Exception as e:
            print(f"OpenAI API error: {str(e)}")
            return jsonify({
                "message": "I apologize, but I'm having trouble processing your request right now.",
                "error": str(e)
            }), 500

    except Exception as e:
        print(f"Server error: {str(e)}")
        return jsonify({
            "message": "An error occurred while processing your request.",
            "error": str(e)
        }), 500