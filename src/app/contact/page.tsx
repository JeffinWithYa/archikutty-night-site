export default function ContactPage() {
    const faqs = [
        {
            question: "What time does the reunion start?",
            answer: "The reunion starts at 6:00 PM."
        },
        {
            question: "Will food be provided?",
            answer: "Yes! We'll have dinner provided, including vegetarian and dietary restriction options."
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
                                    <p className="text-gray-600">info@archikutty.com</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="text-2xl">📍</div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">Venue Address</h3>
                                    <p className="text-gray-600">Sankkamam Party Hall</p>
                                    <p className="text-gray-600">42 Tuxedo Ct, Scarborough,</p>
                                    <p className="text-gray-600">ON M1G 3S7</p>
                                </div>
                            </div>
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
                            <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg text-lg">
                                Contact: info@archikutty.com
                            </div>
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