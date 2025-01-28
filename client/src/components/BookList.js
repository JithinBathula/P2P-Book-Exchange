import React, { useState, useEffect } from 'react';
import axios from 'axios';

function BookList({ accessToken, onBookUpdate }) {
    const [books, setBooks] = useState([]);
    const [error, setError] = useState(null);
    const [offeredBookId, setOfferedBookId] = useState(null);
    const [userBooks, setUserBooks] = useState([]);
    const [newBookTitle, setNewBookTitle] = useState('');
    const [newBookAuthor, setNewBookAuthor] = useState('');
    const [showNewBookForm, setShowNewBookForm] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchBooks = async () => {
        try {
            const config = accessToken ? {
                headers: { Authorization: `Bearer ${accessToken}` }
            } : {};
            const response = await axios.get('/books', config);
            setBooks(response.data);
        } catch (error) {
            setError(error.response?.data?.msg || "Failed to fetch books");
        } finally {
            setLoading(false);
        }
    };

    const fetchUserBooks = async () => {
        if (accessToken) {
            try {
                const response = await axios.get('/books/user', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                setUserBooks(response.data);
            } catch (error) {
                console.error("Error getting user books:", error);
            }
        }
    };

    useEffect(() => {
        fetchBooks();
        fetchUserBooks();
    }, [accessToken]);

    const handleRequest = async (bookId) => {
        if (!accessToken) {
            setError("Please log in to request books");
            return;
        }

        if (!offeredBookId && (!newBookTitle || !newBookAuthor)) {
            setError("Please select a book to offer or fill in new book details");
            return;
        }

        try {
            const data = offeredBookId 
                ? { book_id: bookId, offered_book_id: offeredBookId }
                : { book_id: bookId, offered_book_title: newBookTitle, offered_book_author: newBookAuthor };
            
            await axios.post('/request', data, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            setOfferedBookId(null);
            setNewBookTitle('');
            setNewBookAuthor('');
            setShowNewBookForm(false);
            setError(null);
            
            fetchBooks();
            fetchUserBooks();
            
            alert("Book requested successfully!");
        } catch (error) {
            setError(error.response?.data?.msg || "Failed to request book");
        }
    };

    if (loading) {
        return <div>Loading books...</div>;
    }

    return (
        <div className="books-container">
            <h2>Available Books</h2>
            {error && <div className="error-message">{error}</div>}
            
            {books.length === 0 ? (
                <p>No books available for exchange.</p>
            ) : (
                <div className="books-table-container">
                    <table className="books-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Author</th>
                                <th>Owner</th>
                                <th>Exchange Options</th>
                            </tr>
                        </thead>
                        <tbody>
                            {books.map(book => (
                                <tr key={book.id}>
                                    <td>{book.title}</td>
                                    <td>{book.author}</td>
                                    <td>{book.owner}</td>
                                    <td>
                                        <div className="exchange-options">
                                            {userBooks.length > 0 && (
                                                <select 
                                                    value={offeredBookId} 
                                                    onChange={e => {
                                                        setOfferedBookId(parseInt(e.target.value, 10));
                                                        setShowNewBookForm(false);
                                                    }}
                                                    className="book-select"
                                                >
                                                    <option value="">Select your book to offer</option>
                                                    {userBooks.map(userBook => (
                                                        <option key={userBook.id} value={userBook.id}>
                                                            {userBook.title} by {userBook.author}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                            
                                            <button 
                                                type="button" 
                                                onClick={() => {
                                                    setShowNewBookForm(!showNewBookForm);
                                                    setOfferedBookId(null);
                                                }}
                                                className="toggle-form-btn"
                                            >
                                                {showNewBookForm ? "Cancel New Book" : "Offer New Book"}
                                            </button>
                                            
                                            {showNewBookForm && (
                                                <div className="new-book-form">
                                                    <input
                                                        type="text"
                                                        value={newBookTitle}
                                                        onChange={e => setNewBookTitle(e.target.value)}
                                                        placeholder="Book Title"
                                                        className="book-input"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={newBookAuthor}
                                                        onChange={e => setNewBookAuthor(e.target.value)}
                                                        placeholder="Book Author"
                                                        className="book-input"
                                                    />
                                                </div>
                                            )}
                                            
                                            <button 
                                                onClick={() => handleRequest(book.id)}
                                                className="request-btn"
                                                disabled={!accessToken}
                                            >
                                                Request Exchange
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default BookList;