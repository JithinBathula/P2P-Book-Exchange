import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ExchangeRequests({ accessToken }) {
    const [requests, setRequests] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await axios.get('/exchanges', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                setRequests(response.data);
            } catch (error) {
                console.error("Error fetching requests:", error);
                setError(error.response?.data?.msg || "Failed to fetch exchange requests");
            }
        };

        if (accessToken) {
            fetchRequests();
        }
    }, [accessToken]);

    const updateExchangeStatus = async (exchangeId, status) => {
        try {
            await axios.put(`/exchanges/${exchangeId}`, { status }, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            // Update local state after successful update
            setRequests(requests.map(req =>
                req.id === exchangeId ? { ...req, status } : req
            ));
        } catch (error) {
            console.error(`Error updating status to ${status}:`, error);
            alert(`Error updating status to ${status}: ${error.response?.data?.msg || "An unknown error occurred."}`)

        }
    };

    return (
        <div>
            <h2>Exchange Requests</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {requests.length === 0 ? (
                <p>No exchange requests found.</p>
            ) : (
                requests.map(request => (
                    <div key={request.id}>
                        <p>
                            Request for "{request.book_title}" from {request.requester_username} (Status: {request.status})
                        </p>
                        <p>Offered book: {request.offered_book_title} by {request.offered_book_author}</p> {/* Display offered book */}
                        {request.status === 'pending' && (
                            <div>
                                <button onClick={() => updateExchangeStatus(request.id, 'accepted')}>Accept</button>
                                <button onClick={() => updateExchangeStatus(request.id, 'rejected')}>Reject</button>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}

export default ExchangeRequests;