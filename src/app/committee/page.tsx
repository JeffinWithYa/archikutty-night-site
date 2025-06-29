export default function CommitteePage() {
    return (
        <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                        Meet Our Committee
                    </h1>
                    <p className="text-xl text-gray-600">
                        The amazing people working hard to make this reunion unforgettable
                    </p>
                </div>

                {/* Coming Soon Section */}
                <div className="text-center bg-white/70 rounded-2xl shadow-xl p-12">
                    <div className="text-8xl mb-6">👥</div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Coming Soon!</h2>
                    <p className="text-lg text-gray-600 mb-8">
                        We're currently putting together beautiful headshots and bios of our wonderful committee members.
                        Check back soon to meet the people who are making this reunion possible!
                    </p>

                    <div className="grid md:grid-cols-3 gap-6 mt-12">
                        <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-6 rounded-xl">
                            <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <span className="text-2xl">👤</span>
                            </div>
                            <h3 className="font-semibold text-gray-800">Committee Member</h3>
                            <p className="text-sm text-gray-600">Role & Responsibilities</p>
                        </div>

                        <div className="bg-gradient-to-br from-pink-100 to-purple-100 p-6 rounded-xl">
                            <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <span className="text-2xl">👤</span>
                            </div>
                            <h3 className="font-semibold text-gray-800">Committee Member</h3>
                            <p className="text-sm text-gray-600">Role & Responsibilities</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-6 rounded-xl">
                            <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <span className="text-2xl">👤</span>
                            </div>
                            <h3 className="font-semibold text-gray-800">Committee Member</h3>
                            <p className="text-sm text-gray-600">Role & Responsibilities</p>
                        </div>
                    </div>

                    <div className="mt-12">
                        <p className="text-sm text-gray-500 mb-4">
                            Want to help with the reunion planning?
                        </p>
                        <a
                            href="mailto:info@archikutty.com"
                            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                        >
                            Email the Committee
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
} 