'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

export default function FamilyTree() {
    const [showAICall, setShowAICall] = useState(false);
    const [showTextChat, setShowTextChat] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile device
    useEffect(() => {
        const checkIsMobile = () => {
            const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
            const mobileRegex = /android|avantgo|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile|o2|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i;
            const mobileRegex2 = /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i;
            return mobileRegex.test(userAgent) || mobileRegex2.test(userAgent.substr(0, 4)) ||
                /iPad|iPhone|iPod/.test(userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
                window.innerWidth <= 768;
        };

        setIsMobile(checkIsMobile());

        // Re-check on window resize
        const handleResize = () => setIsMobile(checkIsMobile());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle phone call action
    const handlePhoneCall = () => {
        if (isMobile) {
            // On mobile, open the phone dialer with the Canadian number
            window.location.href = 'tel:+12267504637';
        } else {
            // On desktop, use WebRTC
            setShowAICall(true);
        }
    };

    // Dynamically import the FamilyTreeAICall component to avoid SSR issues
    const FamilyTreeAICall = dynamic(() => import('../../components/FamilyTreeAICall'), { ssr: false });
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="container mx-auto px-4 py-16">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Family Tree
                        </span>
                    </h1>
                    <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                        Discover your roots and see how we're all connected
                    </p>
                    <div className="mt-6 max-w-2xl mx-auto">
                        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-2">
                            <strong>Disclaimer:</strong> Voice calls and text conversations on this page are recorded to help build and improve the family tree. Please do not share sensitive personal information.
                        </p>
                    </div>
                </div>

                {/* AI Call Options */}
                <div className="flex flex-col items-center gap-4 mb-10">
                    <div className="text-center mb-4">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Help Us Build the Family Tree</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Share your family information with our AI assistant. Tell us about your parents, grandparents,
                            siblings, and any family stories you know. This helps us place you in the Archikutty family tree!
                        </p>
                    </div>

                    {isMobile ? (
                        // Mobile: Show phone number to call
                        <div className="text-center mb-4">
                            <button
                                className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform text-lg flex items-center gap-2"
                                onClick={handlePhoneCall}
                            >
                                <span role="img" aria-label="Phone" className="text-2xl">📞</span>
                                Call (226) 750-4637: Share Your Family Details
                            </button>
                            <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
                                Tap to call our Canadian phone number and share your family tree information with our AI assistant
                            </p>
                        </div>
                    ) : (
                        // Desktop: Show WebRTC call option
                        <button
                            className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform text-lg flex items-center gap-2"
                            onClick={handlePhoneCall}
                        >
                            <span role="img" aria-label="Phone" className="text-2xl">📞</span>
                            Phone Call: Share Your Family Tree Details with AI
                        </button>
                    )}

                    <button
                        className="bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform text-lg flex items-center gap-2"
                        onClick={() => setShowTextChat(true)}
                    >
                        <span role="img" aria-label="Chat" className="text-2xl">💬</span>
                        Text Chat: Share Your Family Tree Details with AI
                    </button>
                </div>

                {/* AI Call Modal - Only show for desktop WebRTC calls */}
                {showAICall && !isMobile && (
                    <FamilyTreeAICall onClose={() => setShowAICall(false)} mode="audio" />
                )}
                {showTextChat && (
                    <FamilyTreeAICall onClose={() => setShowTextChat(false)} mode="text" />
                )}

                {/* Coming Soon Section */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-white/20">
                        <div className="text-8xl mb-8">🌳</div>

                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Coming Soon!
                        </h2>

                        <p className="text-lg text-gray-700 mb-8 leading-relaxed max-w-2xl mx-auto">
                            We're working on creating a beautiful interactive family tree that will showcase
                            our rich heritage and help everyone understand how we're all connected. This will
                            include photos, stories, and the relationships that bind our family together.
                        </p>

                        <div className="grid md:grid-cols-3 gap-6 mt-12">
                            <div className="p-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                                <div className="text-3xl mb-4">📸</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Family Photos</h3>
                                <p className="text-gray-700 text-sm">Historical and recent photos of family members</p>
                            </div>

                            <div className="p-6 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl">
                                <div className="text-3xl mb-4">📖</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Family Stories</h3>
                                <p className="text-gray-700 text-sm">Cherished memories and tales from generations</p>
                            </div>

                            <div className="p-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                                <div className="text-3xl mb-4">🔗</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Connections</h3>
                                <p className="text-gray-700 text-sm">Interactive map of family relationships</p>
                            </div>
                        </div>

                        <div className="mt-12 p-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl">
                            <h3 className="text-xl font-semibold mb-2">Want to Help?</h3>
                            <p className="mb-4">
                                If you have family photos, stories, or genealogy information you'd like to contribute,
                                please reach out to us!
                            </p>
                            <div className="inline-block bg-white text-purple-600 font-semibold py-2 px-6 rounded-full text-lg">
                                Contact: info@archikutty.com
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 