import VideoHero from '@/components/VideoHero';
import CountdownTimer from '@/components/CountdownTimer';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Video */}
      <VideoHero />

      {/* Countdown Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <CountdownTimer />
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Welcome to Archikutty Night 2025!
          </h2>
          <p className="text-xl text-gray-700 mb-8 leading-relaxed">
            Join us for Archikutty Night 2025—an unforgettable celebration filled with love, laughter, and cherished memories. It's time to reconnect with family and create new moments together.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Save the Date</h3>
              <p className="text-gray-700">Mark your calendars for our special day</p>
            </div>

            <div className="text-center p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
              <div className="text-4xl mb-4">🎊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fun Activities</h3>
              <p className="text-gray-700">Games, music, and entertainment for all ages</p>
            </div>

            <div className="text-center p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
              <div className="text-4xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Delicious Food</h3>
              <p className="text-gray-700">Amazing dishes and family recipes to enjoy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-100 to-pink-100">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Join Us?
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            Don't miss out on this special family gathering. RSVP today!
          </p>
          <a
            href="/rsvp"
            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            RSVP Now
          </a>
        </div>
      </section>
    </div>
  );
}
