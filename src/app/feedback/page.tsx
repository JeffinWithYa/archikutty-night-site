'use client';

import { useState } from 'react';

export default function FeedbackPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        category: '',
        subject: '',
        message: '',
        anonymous: false
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');
        setErrorMessage('');

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                setSubmitStatus('success');
                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    category: '',
                    subject: '',
                    message: '',
                    anonymous: false
                });
            } else {
                setSubmitStatus('error');
                setErrorMessage(result.error || 'Failed to submit feedback. Please try again.');
            }
        } catch (error) {
            setSubmitStatus('error');
            setErrorMessage('Network error. Please check your connection and try again.');
            console.error('Feedback submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    return (
        <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                        Feedback & Suggestions
                    </h1>
                    <p className="text-xl text-gray-600">
                        Your input helps us make this reunion amazing!
                    </p>
                </div>

                <div className="bg-white/70 rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Anonymous Option */}
                        <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <input
                                type="checkbox"
                                id="anonymous"
                                name="anonymous"
                                checked={formData.anonymous}
                                onChange={handleChange}
                                className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <label htmlFor="anonymous" className="text-sm font-medium text-blue-800">
                                Submit feedback anonymously
                            </label>
                        </div>

                        {/* Name and Email (hidden if anonymous) */}
                        {!formData.anonymous && (
                            <>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required={!formData.anonymous}
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required={!formData.anonymous}
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Enter your email address"
                                    />
                                </div>
                            </>
                        )}

                        {/* Category */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                                Feedback Category
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="">Select a category</option>
                                <option value="event-planning">Event Planning & Activities</option>
                                <option value="website">Website & Technology</option>
                                <option value="logistics">Logistics & Venue</option>
                                <option value="food">Food & Catering</option>
                                <option value="family-tree">Family Tree & Genealogy</option>
                                <option value="suggestions">General Suggestions</option>
                                <option value="complaint">Issue or Complaint</option>
                                <option value="appreciation">Appreciation & Thanks</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* Subject */}
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                Subject <span className="text-gray-500">(optional)</span>
                            </label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Brief subject line"
                            />
                        </div>

                        {/* Message */}
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                Your Feedback or Suggestion *
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                rows={6}
                                required
                                value={formData.message}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Share your thoughts, ideas, suggestions, or feedback about the reunion..."
                            />
                        </div>

                        {/* Status Messages */}
                        {submitStatus === 'success' && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                <div className="flex items-center">
                                    <div className="text-green-600 text-2xl mr-3">✅</div>
                                    <div>
                                        <h4 className="text-green-800 font-semibold">Feedback Submitted Successfully!</h4>
                                        <p className="text-green-700 text-sm">
                                            Thank you for your input! Your feedback has been saved and will be reviewed by the committee.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {submitStatus === 'error' && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                <div className="flex items-center">
                                    <div className="text-red-600 text-2xl mr-3">❌</div>
                                    <div>
                                        <h4 className="text-red-800 font-semibold">Submission Failed</h4>
                                        <p className="text-red-700 text-sm">{errorMessage}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full font-semibold py-4 px-8 rounded-lg shadow-lg transition-all duration-200 ${isSubmitting
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl transform hover:scale-105'
                                }`}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Submitting Feedback...
                                </div>
                            ) : (
                                'Submit Feedback'
                            )}
                        </button>
                    </form>
                </div>

                {/* Info Section */}
                <div className="mt-12 grid md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-white/50 rounded-xl">
                        <div className="text-2xl mb-3">📝</div>
                        <h4 className="font-semibold text-gray-800 mb-2">Anonymous Option</h4>
                        <p className="text-sm text-gray-600">Feel free to share honest feedback anonymously</p>
                    </div>

                    <div className="text-center p-6 bg-white/50 rounded-xl">
                        <div className="text-2xl mb-3">🎯</div>
                        <h4 className="font-semibold text-gray-800 mb-2">All Categories</h4>
                        <p className="text-sm text-gray-600">Website, events, food, logistics - everything is welcome</p>
                    </div>

                    <div className="text-center p-6 bg-white/50 rounded-xl">
                        <div className="text-2xl mb-3">💬</div>
                        <h4 className="font-semibold text-gray-800 mb-2">Direct Contact</h4>
                        <p className="text-sm text-gray-600">
                            <a href="mailto:info@archikutty.com" className="text-purple-600 hover:text-purple-800">
                                info@archikutty.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 