import CountdownTimer from '@/components/CountdownTimer';

export default function CountdownPage() {
    return (
        <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                    Countdown to Our Reunion
                </h1>
                <p className="text-xl text-gray-600 mb-12">
                    The excitement is building! Here's how much time we have left until our special day.
                </p>

                <CountdownTimer />

                <div className="grid md:grid-cols-2 gap-8 mt-16">
                    <div className="bg-white/70 rounded-xl shadow-lg p-8">
                        <div className="text-4xl mb-4">📍</div>
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Event Location</h3>
                        <p className="text-gray-600 mb-2">Family Community Center</p>
                        <p className="text-gray-600 mb-2">123 Reunion Lane</p>
                        <p className="text-gray-600">Hometown, ST 12345</p>
                    </div>

                    <div className="bg-white/70 rounded-xl shadow-lg p-8">
                        <div className="text-4xl mb-4">⏰</div>
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Event Schedule</h3>
                        <div className="text-left space-y-2">
                            <p className="text-gray-600"><span className="font-medium">10:00 AM</span> - Registration & Welcome</p>
                            <p className="text-gray-600"><span className="font-medium">12:00 PM</span> - Lunch & Mingling</p>
                            <p className="text-gray-600"><span className="font-medium">2:00 PM</span> - Family Activities</p>
                            <p className="text-gray-600"><span className="font-medium">6:00 PM</span> - Dinner & Dancing</p>
                        </div>
                    </div>
                </div>

                <div className="mt-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-8">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                        Mark Your Calendar! 📅
                    </h3>
                    <p className="text-lg text-gray-600 mb-6">
                        Save the date and get ready for an amazing family celebration filled with joy, laughter, and unforgettable memories.
                    </p>
                    <a
                        href="/rsvp"
                        className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                        RSVP Now
                    </a>
                </div>
            </div>
        </div>
    );
} 