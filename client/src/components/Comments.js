import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Comments.css';

const Comments = ({ movieId, currentUserId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyVisible, setReplyVisible] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Pobieranie komentarzy z backendu
    useEffect(() => {
        const fetchComments = async () => {
            setLoading(true);
            setError(null);
    
            const token = localStorage.getItem('access_token');
            try {
                const response = await axios.get(`http://localhost:5000/api/user/comments/${movieId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setComments(response.data);
            } catch (err) {
                setError('Failed to fetch comments. Please try again.');
                console.error('Error fetching comments:', err);
            } finally {
                setLoading(false);
            }
        };
    
        fetchComments();
    }, [movieId]);

    // Dodawanie nowego komentarza
    const handleAddComment = async () => {
        if (newComment.trim() === '') {
            setError('Comment cannot be empty.');
            return;
        }
    
        const token = localStorage.getItem('access_token');
        if (!token) {
            alert('You need to log in to add a comment.');
            return;
        }
    
        try {
            const response = await axios.post('http://localhost:5000/api/user/comments', {
                movieId,
                commentText: newComment,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`, // Dodanie tokenu autoryzacji
                    'Content-Type': 'application/json',
                },
            });
    
            setComments([...comments, response.data]); // Dodaj nowy komentarz do listy
            setNewComment('');
            setError(''); // Wyczyszczenie błędów
        } catch (err) {
            setError('Failed to add comment. Please try again.');
            console.error('Error adding comment:', err);
        }
    };

    // Dodawanie odpowiedzi
    const handleAddReply = async (parentId) => {
        if (replyText.trim() === '') {
            setError('Reply cannot be empty.');
            return;
        }
    
        const token = localStorage.getItem('access_token');
        if (!token) {
            alert('You need to log in to reply to a comment.');
            return;
        }
    
        try {
            const response = await axios.post('http://localhost:5000/api/user/comments/reply', {
                movieId,
                commentText: replyText,
                parentId,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
    
            // Aktualizuj odpowiedni komentarz, dodając do niego odpowiedź
            const updatedComments = comments.map((comment) => {
                if (comment._id === parentId) {
                    return {
                        ...comment,
                        replies: [...(comment.replies || []), response.data],
                    };
                }
                return comment;
            });
    
            setComments(updatedComments);
            setReplyText('');
            setReplyVisible(null);
            setError(''); // Czyszczenie błędów
        } catch (err) {
            setError('Failed to add reply. Please try again.');
            console.error('Error adding reply:', err);
        }
    };

    return (
        <div className="comments-container">
            <h2 className="comments-title">Comments</h2>

            {/* Sekcja błędów */}
            {error && <div className="error-message">{error}</div>}

            {/* Sekcja ładowania */}
            {loading ? (
                <div className="loading-message">Loading comments...</div>
            ) : (
                <>
                    {/* Sekcja dodawania nowego komentarza */}
                    <div className="add-comment">
                        <textarea
                            className="comment-input"
                            placeholder="Write your comment here..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        ></textarea>
                        <button className="add-comment-btn" onClick={handleAddComment}>
                            Add Comment
                        </button>
                    </div>

                    {/* Lista komentarzy */}
                    <div className="comments-list">
                        {comments.map((comment) => (
                            <div key={comment._id} className="comment-item">
                                <div className="comment-header">
                                    <span className="username">User: {comment.userId}</span>
                                    <span className="timestamp">
                                        {new Date(comment.createdAt).toLocaleString()}
                                    </span>
                                    <button
                                        className="reply-btn"
                                        onClick={() =>
                                            setReplyVisible(replyVisible === comment._id ? null : comment._id)
                                        }
                                    >
                                        Reply
                                    </button>
                                </div>
                                <p className="comment-text">{comment.text}</p>

                                {/* Sekcja odpowiedzi */}
                                {replyVisible === comment._id && (
                                    <div className="reply-section">
                                        <textarea
                                            className="comment-input"
                                            placeholder="Write your reply here..."
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                        ></textarea>
                                        <button
                                            className="add-comment-btn"
                                            onClick={() => handleAddReply(comment._id)}
                                        >
                                            Add Reply
                                        </button>
                                    </div>
                                )}

                                {/* Renderowanie zagnieżdżonych odpowiedzi */}
                                {comment.replies &&
                                    comment.replies.map((reply) => (
                                        <div key={reply._id} className="reply-item">
                                            <div className="comment-header">
                                                <span className="username">User: {reply.userId}</span>
                                                <span className="timestamp">
                                                    {new Date(reply.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="comment-text">{reply.text}</p>
                                        </div>
                                    ))}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Comments;
