'use client';

import { useState } from 'react';

export default function FeedbackForm() {
    const [feedback, setFeedback] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ feedback }),
            });
            if (!res.ok) throw new Error('Failed to submit feedback');
            setSubmitted(true);
            setFeedback('');
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="text-green-700 font-semibold text-lg mt-6">Thank you for your feedback!</div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 mt-6">
            <textarea
                className="w-full max-w-xl min-h-[120px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Type your feedback here..."
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                required
                maxLength={2000}
                disabled={loading}
            />
            <button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-2 px-6 rounded-lg shadow-lg text-lg disabled:opacity-60"
                disabled={loading || !feedback.trim()}
            >
                {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
            {error && <div className="text-red-600 mt-2">{error}</div>}
        </form>
    );
} 