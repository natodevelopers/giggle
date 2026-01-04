// Test endpoint để kiểm tra API search
export default async (req, res) => {
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const q = req.query.q || 'test';
    
    try {
        const fetchSearchResults = (await import('@/utils/fetchSearchResults')).default;
        
        console.log(`Testing search for: ${q}`);
        const results = await fetchSearchResults(q, 1);
        
        res.status(200).json({
            query: q,
            resultsCount: results.length,
            results: results.slice(0, 5), // Chỉ trả về 5 kết quả đầu
            message: results.length > 0 ? 'Success' : 'No results found'
        });
    } catch (error) {
        console.error('Test search error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}

