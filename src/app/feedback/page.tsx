import FeedbackForm from '../../components/FeedbackForm';

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

                {/* Anonymous Feedback Form */}
                <div className="text-center bg-white/70 rounded-2xl shadow-xl p-12">
                    <div className="text-8xl mb-6">💬</div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Anonymous Feedback</h2>
                    <p className="text-lg text-gray-600 mb-8">
                        Your feedback is <span className="font-bold text-purple-700">completely anonymous</span>. We do not collect your name or email. Please share your thoughts, suggestions, or concerns below!
                    </p>
                    <FeedbackForm />
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