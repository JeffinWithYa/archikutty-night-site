'use client';

import { useState } from 'react';

export default function RSVPPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        attending: '',
        guests: '1',
        dietary: '',
        message: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // For now, just show an alert - in real implementation, this would submit to a backend
        alert('Thank you for your RSVP! We\'ll be in touch soon.');
        console.log('RSVP submitted:', formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                        RSVP for Archikutty Night 2025
                    </h1>
                    <p className="text-xl text-gray-600">
                        We can't wait to celebrate with you! Please let us know if you'll be joining us.
                    </p>
                </div>

                <div className="bg-white/70 rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
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
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter your email address"
                            />
                        </div>

                        <div>
                            <label htmlFor="attending" className="block text-sm font-medium text-gray-700 mb-2">
                                Will you be attending? *
                            </label>
                            <select
                                id="attending"
                                name="attending"
                                required
                                value={formData.attending}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="">Please select</option>
                                <option value="yes">Yes, I'll be there!</option>
                                <option value="no">Sorry, can't make it</option>
                                <option value="maybe">Maybe - need to confirm</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-2">
                                Number of Guests (including yourself)
                            </label>
                            <select
                                id="guests"
                                name="guests"
                                value={formData.guests}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="1">1 (just me)</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                                <option value="6+">6 or more</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="dietary" className="block text-sm font-medium text-gray-700 mb-2">
                                Dietary Restrictions or Allergies <span className="text-gray-500">(optional)</span>
                            </label>
                            <input
                                type="text"
                                id="dietary"
                                name="dietary"
                                value={formData.dietary}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Let us know about any dietary needs (optional)"
                            />
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                Milestones or Stories from This Year (graduation, wedding, new job, special story, etc.) <span className="text-gray-500">(optional)</span>
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                rows={4}
                                value={formData.message}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Share any milestones, achievements, or stories from this year that you'd like the committee to know. This info will help us personalize your Archikutty Night experience! (Optional)"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                        >
                            Submit RSVP
                        </button>
                    </form>
                </div>

                <div className="text-center mt-8">
                    <p className="text-sm text-gray-600">
                        Questions about the event? <a href="/contact" className="text-purple-600 hover:text-purple-800">Contact us here</a>
                    </p>
                </div>
            </div>
        </div>
    );
} 