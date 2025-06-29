'use client';

import { useState, useEffect } from 'react';

const CountdownTimer = () => {
    // Set reunion date to December 27th, 2024
    const reunionDate = new Date('2025-12-27T10:00:00').getTime();

    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = reunionDate - now;

            if (distance > 0) {
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000)
                });
            } else {
                // Event has passed
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [reunionDate]);

    return (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Time Until Reunion</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                    <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-xl p-6 shadow-lg">
                        <div className="text-4xl md:text-5xl font-bold mb-2">{timeLeft.days}</div>
                        <div className="text-sm md:text-base font-medium">Days</div>
                    </div>
                </div>

                <div className="text-center">
                    <div className="bg-gradient-to-br from-pink-600 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                        <div className="text-4xl md:text-5xl font-bold mb-2">{timeLeft.hours}</div>
                        <div className="text-sm md:text-base font-medium">Hours</div>
                    </div>
                </div>

                <div className="text-center">
                    <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-xl p-6 shadow-lg">
                        <div className="text-4xl md:text-5xl font-bold mb-2">{timeLeft.minutes}</div>
                        <div className="text-sm md:text-base font-medium">Minutes</div>
                    </div>
                </div>

                <div className="text-center">
                    <div className="bg-gradient-to-br from-pink-600 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                        <div className="text-4xl md:text-5xl font-bold mb-2">{timeLeft.seconds}</div>
                        <div className="text-sm md:text-base font-medium">Seconds</div>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center">
                <p className="text-lg text-gray-900 font-medium">
                    🎉 Get ready for an amazing celebration! 🎉
                </p>
                <p className="text-sm text-gray-700 mt-2 font-medium">
                    December 27th, 2024 at 10:00 AM
                </p>
            </div>
        </div>
    );
};

export default CountdownTimer; 