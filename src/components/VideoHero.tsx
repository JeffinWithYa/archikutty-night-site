const VideoHero = () => {
    return (
        <div className="relative h-screen flex items-center justify-center overflow-hidden">
            {/* Video Background Placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700">
                <div className="absolute inset-0 bg-black/20"></div>

                {/* Placeholder for future video */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white/80">
                        <div className="text-8xl mb-4">🎥</div>
                        <p className="text-lg font-medium">Invitation Video Placeholder</p>
                        <p className="text-sm opacity-75">Your beautiful invitation video will play here</p>
                    </div>
                </div>

                {/* Animated decorative elements */}
                <div className="absolute top-20 left-20 w-4 h-4 bg-white/20 rounded-full animate-pulse"></div>
                <div className="absolute top-40 right-32 w-6 h-6 bg-white/15 rounded-full animate-bounce"></div>
                <div className="absolute bottom-32 left-40 w-3 h-3 bg-white/25 rounded-full animate-ping"></div>
                <div className="absolute bottom-20 right-20 w-5 h-5 bg-white/20 rounded-full animate-pulse"></div>
            </div>

            {/* Hero Content */}
            <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                    <span className="block">Family</span>
                    <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                        Reunion
                    </span>
                    <span className="block text-4xl md:text-5xl mt-2">2024</span>
                </h1>

                <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
                    A celebration of love, laughter, and lasting memories
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <a
                        href="/rsvp"
                        className="bg-white text-purple-700 font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                        RSVP Today
                    </a>
                    <a
                        href="/countdown"
                        className="border-2 border-white text-white font-semibold py-4 px-8 rounded-full hover:bg-white hover:text-purple-700 transition-all duration-200"
                    >
                        View Countdown
                    </a>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </div>
        </div>
    );
};

export default VideoHero; 