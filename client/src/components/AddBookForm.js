import React, { useState } from 'react';
import axios from 'axios';

function AddBookForm({ accessToken, onBookAdded }) {
    const [formData, setFormData] = useState({
        title: '',
        author: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
        setSuccess(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setSuccess(false);

        try {
            await axios.post('/books', formData, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            
            setFormData({ title: '', author: '' });
            setSuccess(true);
            if (onBookAdded) onBookAdded();
            
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            setError(error.response?.data?.msg || 'Failed to add book. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-book-form">
            <h2>Add Book for Exchange</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Book Title"
                        required
                        disabled={loading}
                    />
                </div>
                <div className="form-group">
                    <input
                        type="text"
                        name="author"
                        value={formData.author}
                        onChange={handleChange}
                        placeholder="Author Name"
                        required
                        disabled={loading}
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                >
                    {loading ? 'Adding...' : 'Add Book'}
                </button>
            </form>
            
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">Book added successfully!</p>}
        </div>
    );
}

export default AddBookForm;