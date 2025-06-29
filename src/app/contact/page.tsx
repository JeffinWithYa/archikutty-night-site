export default function ContactPage() {
    const faqs = [
        {
            question: "What time does the reunion start?",
            answer: "The reunion starts at 10:00 AM with registration and welcome activities."
        },
        {
            question: "Is there a dress code?",
            answer: "Casual and comfortable attire is perfect! Feel free to wear something that represents your personality."
        },
        {
            question: "Will food be provided?",
            answer: "Yes! We'll have lunch and dinner provided, including vegetarian and dietary restriction options."
        },
        {
            question: "Can I bring my children?",
            answer: "Absolutely! This is a family-friendly event with activities for all ages."
        },
        {
            question: "Is there parking available?",
            answer: "Yes, there's plenty of free parking available at the venue."
        }
    ];

    return (
        <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                        Contact & FAQ
                    </h1>
                    <p className="text-xl text-gray-600">
                        Have questions? We're here to help!
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Contact Information */}
                    <div className="bg-white/70 rounded-2xl shadow-xl p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Get In Touch</h2>

                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <div className="text-2xl">📧</div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">Email</h3>
                                    <p className="text-gray-600">reunion2024@family.com</p>
                                    <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="text-2xl">📞</div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">Phone</h3>
                                    <p className="text-gray-600">(555) 123-4567</p>
                                    <p className="text-sm text-gray-500">Available Mon-Fri, 9 AM - 6 PM</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="text-2xl">📍</div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">Venue Address</h3>
                                    <p className="text-gray-600">Family Community Center</p>
                                    <p className="text-gray-600">123 Reunion Lane</p>
                                    <p className="text-gray-600">Hometown, ST 12345</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                            <h3 className="font-semibold text-gray-800 mb-2">Committee Chair</h3>
                            <p className="text-gray-600">Sarah Johnson</p>
                            <p className="text-sm text-gray-500">Available for any questions about the reunion</p>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="bg-white/70 rounded-2xl shadow-xl p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>

                        <div className="space-y-6">
                            {faqs.map((faq, index) => (
                                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                                    <h3 className="font-semibold text-gray-800 mb-2">{faq.question}</h3>
                                    <p className="text-gray-600 text-sm">{faq.answer}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-500 mb-4">
                                Don't see your question here?
                            </p>
                            <a
                                href="mailto:reunion2024@family.com"
                                className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                            >
                                Ask Us Directly
                            </a>
                        </div>
                    </div>
                </div>

                {/* Coming Soon Notice */}
                <div className="mt-12 text-center bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-8">
                    <div className="text-4xl mb-4">🚧</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">More Info Coming Soon!</h2>
                    <p className="text-gray-600">
                        We're working on adding more detailed information about accommodations,
                        local attractions, and travel tips. Stay tuned!
                    </p>
                </div>
            </div>
        </div>
    );
} 