export default function MapPage() {
    return (
        <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                        Where Are They Coming From?
                    </h1>
                    <p className="text-xl text-gray-600">
                        See how far our family is traveling to be together
                    </p>
                </div>

                {/* Coming Soon Section */}
                <div className="text-center bg-white/70 rounded-2xl shadow-xl p-12 mb-12">
                    <div className="text-8xl mb-6">🗺️</div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Interactive Map Coming Soon!</h2>
                    <p className="text-lg text-gray-600 mb-8">
                        We're creating an amazing interactive map that will show where every family member
                        is traveling from to join our reunion. It'll be incredible to see our family
                        coming together from all around the world!
                    </p>

                    <div className="grid md:grid-cols-3 gap-8 mt-12">
                        <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-6 rounded-xl">
                            <div className="text-3xl mb-4">📍</div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Pin Your Location</h3>
                            <p className="text-gray-600">
                                Mark where you're traveling from and add a personal message
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-6 rounded-xl">
                            <div className="text-3xl mb-4">✈️</div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Travel Stories</h3>
                            <p className="text-gray-600">
                                Share your journey and see how others are making their way to the reunion
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-pink-100 to-red-100 p-6 rounded-xl">
                            <div className="text-3xl mb-4">🌍</div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Global Family</h3>
                            <p className="text-gray-600">
                                Visualize how widespread our amazing family has become
                            </p>
                        </div>
                    </div>
                </div>

                {/* Placeholder Map Preview */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-12">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Map Preview</h3>

                    <div className="bg-white/60 rounded-xl p-8 min-h-[400px] flex items-center justify-center relative overflow-hidden">
                        {/* Simplified world map representation */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-200/30 to-green-200/30"></div>

                        <div className="relative z-10 text-center">
                            <div className="text-6xl mb-4">🌎</div>
                            <h4 className="text-xl font-semibold text-gray-800 mb-2">
                                Interactive World Map
                            </h4>
                            <p className="text-gray-600 mb-6">
                                Soon you'll see pins from all the places our family is traveling from!
                            </p>

                            {/* Sample location pins */}
                            <div className="flex justify-center space-x-8 text-sm">
                                <div className="text-center">
                                    <div className="text-2xl mb-1">📍</div>
                                    <p className="font-medium">Canada</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl mb-1">📍</div>
                                    <p className="font-medium">India</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl mb-1">📍</div>
                                    <p className="font-medium">USA</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl mb-1">📍</div>
                                    <p className="font-medium">UK</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Preview */}
                <div className="grid md:grid-cols-4 gap-6 mb-12">
                    <div className="text-center p-6 bg-white/70 rounded-xl shadow-lg">
                        <div className="text-3xl font-bold text-purple-600 mb-2">~25</div>
                        <p className="text-gray-600">Expected Families</p>
                    </div>

                    <div className="text-center p-6 bg-white/70 rounded-xl shadow-lg">
                        <div className="text-3xl font-bold text-pink-600 mb-2">~8</div>
                        <p className="text-gray-600">Different Countries</p>
                    </div>

                    <div className="text-center p-6 bg-white/70 rounded-xl shadow-lg">
                        <div className="text-3xl font-bold text-purple-600 mb-2">~5000</div>
                        <p className="text-gray-600">Miles (Farthest Travel)</p>
                    </div>

                    <div className="text-center p-6 bg-white/70 rounded-xl shadow-lg">
                        <div className="text-3xl font-bold text-pink-600 mb-2">100%</div>
                        <p className="text-gray-600">Love & Excitement</p>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="text-center bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                        Ready to Add Your Pin? 📌
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Make sure to RSVP so we can include you on our family travel map!
                    </p>
                    <a
                        href="/rsvp"
                        className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                        RSVP & Get On The Map
                    </a>
                </div>
            </div>
        </div>
    );
} 