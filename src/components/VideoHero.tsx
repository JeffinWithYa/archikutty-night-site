const VideoHero = () => {
    return (
        <div className="relative h-screen flex items-center justify-center overflow-hidden">
            {/* Video Background */}
            <video
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                poster="/archikutty_invite.mp4" // Fallback poster
            >
                <source src="/archikutty_invite.mp4" type="video/mp4" />
                {/* Fallback content for browsers that don't support video */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white/80">
                            <div className="text-8xl mb-4">🎥</div>
                            <p className="text-lg font-medium">Archikutty Night 2025</p>
                            <p className="text-sm opacity-75">Video not supported in this browser</p>
                        </div>
                    </div>
                </div>
            </video>

            {/* Video overlay for better text readability */}
            <div className="absolute inset-0 bg-black/30"></div>

            {/* Hero Content */}
            <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight drop-shadow-lg">
                    <span className="block">Archikutty Night</span>
                    <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                        2025
                    </span>
                </h1>

                <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                    A celebration of family, laughter, and lasting memories
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <a
                        href="/rsvp"
                        className="bg-white text-purple-700 font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                        RSVP Today
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