export default function RadarPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">Vendor Radar</h1>
            <p className="text-gray-600 mb-8">Live deals, RFQs, and Tenders in your region.</p>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <p className="text-gray-500 italic">Listening for new deals...</p>
                {/* Real-time deal list would render here via WebSockets/SSE */}
            </div>
        </div>
    )
}
