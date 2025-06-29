export default function FeedbackPage() {
    return (
        <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                        Feedback & Suggestions
                    </h1>
                    <p className="text-xl text-gray-600">
                        Your input helps us make this reunion amazing!
                    </p>
                </div>

                {/* Coming Soon Section */}
                <div className="text-center bg-white/70 rounded-2xl shadow-xl p-12">
                    <div className="text-8xl mb-6">💬</div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Coming Soon!</h2>
                    <p className="text-lg text-gray-600 mb-8">
                        We're building a comprehensive feedback system where you can share your ideas,
                        suggestions, and thoughts about the reunion. Your voice matters to us!
                    </p>

                    <div className="grid md:grid-cols-1 gap-8 mt-12">
                        <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-6 rounded-xl">
                            <div className="text-3xl mb-4">💡</div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Share Ideas</h3>
                            <p className="text-gray-600">
                                Suggest activities, games, or special moments you'd like to see at the reunion
                            </p>
                        </div>
                    </div>

                    <div className="mt-12 bg-white/50 rounded-xl p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            In the meantime...
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Have feedback or suggestions right now? We'd love to hear from you!
                        </p>
                        <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg text-lg">
                            Contact: info@archikutty.com
                        </div>
                    </div>
                </div>

                {/* Feature Preview */}
                <div className="mt-12 grid md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-white/50 rounded-xl">
                        <div className="text-2xl mb-3">📝</div>
                        <h4 className="font-semibold text-gray-800 mb-2">Suggestion Box</h4>
                        <p className="text-sm text-gray-600">Anonymous suggestions welcome</p>
                    </div>

                    <div className="text-center p-6 bg-white/50 rounded-xl">
                        <div className="text-2xl mb-3">🎯</div>
                        <h4 className="font-semibold text-gray-800 mb-2">Event Planning</h4>
                        <p className="text-sm text-gray-600">Help shape future reunions</p>
                    </div>

                    <div className="text-center p-6 bg-white/50 rounded-xl">
                        <div className="text-2xl mb-3">📊</div>
                        <h4 className="font-semibold text-gray-800 mb-2">Polls & Surveys</h4>
                        <p className="text-sm text-gray-600">Vote on activities and preferences</p>
                    </div>
                </div>
            </div>
        </div>
    );
} 