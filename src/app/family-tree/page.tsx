'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';

export default function FamilyTree() {
    const [showAICall, setShowAICall] = useState(false);
    const [showTextChat, setShowTextChat] = useState(false);
    // Dynamically import the FamilyTreeAICall component to avoid SSR issues
    const FamilyTreeAICall = dynamic(() => import('../../components/FamilyTreeAICall'), { ssr: false });
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="container mx-auto px-4 py-16">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Family Tree
                        </span>
                    </h1>
                    <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                        Discover your roots and see how we're all connected
                    </p>
                    <div className="mt-6 max-w-2xl mx-auto">
                        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-2">
                            <strong>Disclaimer:</strong> Voice calls and text conversations on this page are recorded to help build and improve the family tree. Please do not share sensitive personal information.
                        </p>
                    </div>
                </div>

                {/* AI Call Options */}
                <div className="flex flex-col items-center gap-4 mb-10">
                    <div className="text-center mb-4">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Help Us Build the Family Tree</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Share your family information with our AI assistant. Tell us about your parents, grandparents,
                            siblings, and any family stories you know. This helps us place you in the Archikutty family tree!
                        </p>
                    </div>
                    <button
                        className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform text-lg flex items-center gap-2"
                        onClick={() => setShowAICall(true)}
                    >
                        <span role="img" aria-label="Phone" className="text-2xl">📞</span>
                        Phone Call: Share Your Family Tree Details with AI
                    </button>
                    <button
                        className="bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform text-lg flex items-center gap-2"
                        onClick={() => setShowTextChat(true)}
                    >
                        <span role="img" aria-label="Chat" className="text-2xl">💬</span>
                        Text Chat: Share Your Family Tree Details with AI
                    </button>
                </div>

                {/* AI Call Modal */}
                {showAICall && (
                    <FamilyTreeAICall onClose={() => setShowAICall(false)} mode="audio" />
                )}
                {showTextChat && (
                    <FamilyTreeAICall onClose={() => setShowTextChat(false)} mode="text" />
                )}

                {/* Coming Soon Section */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-white/20">
                        <div className="text-8xl mb-8">🌳</div>

                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Coming Soon!
                        </h2>

                        <p className="text-lg text-gray-700 mb-8 leading-relaxed max-w-2xl mx-auto">
                            We're working on creating a beautiful interactive family tree that will showcase
                            our rich heritage and help everyone understand how we're all connected. This will
                            include photos, stories, and the relationships that bind our family together.
                        </p>

                        <div className="grid md:grid-cols-3 gap-6 mt-12">
                            <div className="p-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                                <div className="text-3xl mb-4">📸</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Family Photos</h3>
                                <p className="text-gray-700 text-sm">Historical and recent photos of family members</p>
                            </div>

                            <div className="p-6 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl">
                                <div className="text-3xl mb-4">📖</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Family Stories</h3>
                                <p className="text-gray-700 text-sm">Cherished memories and tales from generations</p>
                            </div>

                            <div className="p-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                                <div className="text-3xl mb-4">🔗</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Connections</h3>
                                <p className="text-gray-700 text-sm">Interactive map of family relationships</p>
                            </div>
                        </div>

                        <div className="mt-12 p-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl">
                            <h3 className="text-xl font-semibold mb-2">Want to Help?</h3>
                            <p className="mb-4">
                                If you have family photos, stories, or genealogy information you'd like to contribute,
                                please reach out to us!
                            </p>
                            <div className="inline-block bg-white text-purple-600 font-semibold py-2 px-6 rounded-full text-lg">
                                Contact: info@archikutty.com
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 