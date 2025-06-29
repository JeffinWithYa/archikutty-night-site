export default function BudgetPage() {
    return (
        <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                    Budget & Finances
                </h1>
                <div className="text-8xl mb-6">💰</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Coming Soon!</h2>
                <p className="text-lg text-gray-600 mb-8">
                    We're working on making the family reunion budget and finances transparent for everyone. Check back soon for updates!
                </p>
                <a
                    href="https://docs.google.com/spreadsheets/d/1Qw2e3r4t5y6u7i8o9p0a1b2c3d4e5f6g7h8i9j0k1l2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                    View Family Reunion Finances Spreadsheet
                </a>
            </div>
        </div>
    );
} 