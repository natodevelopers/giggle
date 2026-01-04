export default async (req, res) => {
    try {
        const q = req.query.q;
        const page = req.query.page || "";

        if (!q) {
            res.status(400).json({ error: "Query parameter 'q' is required" });
            return;
        }

        console.log(`Calling Videos API: q=${q}, start=${page}`);

        // Try YouTube API first
        if (process.env.YOUTUBE_API_KEY) {
            try {
                const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(q)}&type=video&key=${process.env.YOUTUBE_API_KEY}${page ? `&pageToken=${page}` : ''}`;
                
                const origin = req.headers.origin || req.headers.referer || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
                
                const response = await fetch(apiUrl, {
                    headers: {
                        'Referer': origin,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    }
                });

                if (response.ok) {
                    const repsonseJson = await response.json();
                    
                    if (!repsonseJson.error && repsonseJson.items && repsonseJson.items.length > 0) {
                        const videos = repsonseJson.items.map((item) => {
                            return {
                                id: item.id?.videoId,
                                title: item.snippet?.title || '',
                                description: item.snippet?.description || '',
                                thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || '',
                                publishedBy: item.snippet?.channelTitle || '',
                                publishedAt: item.snippet?.publishedAt || '',
                                link: `https://www.youtube.com/watch?v=${item.id?.videoId}`,
                            };
                        });

                        const pageInfo = { 
                            nextPageToken: repsonseJson.nextPageToken || null,
                            totalResults: repsonseJson.pageInfo?.totalResults || 0,
                            resultsPerPage: repsonseJson.pageInfo?.resultsPerPage || 0,
                        };

                        res.status(200).json({ videos, pageInfo });
                        return;
                    }
                }
            } catch (error) {
                console.log('YouTube API failed, trying fallback...');
            }
        }

        // Fallback: Use Bing Video Search
        const bingUrl = `https://api.bing.microsoft.com/v7.0/videos/search?q=${encodeURIComponent(q)}&count=20&offset=${page || 0}`;
        
        // Mock video results when no API available
        const mockVideos = [
            {
                id: `mock-${Date.now()}-1`,
                title: `${q} - Sample Video 1`,
                description: `This is a sample video result for "${q}". Video search is temporarily using mock data.`,
                thumbnail: '/logo.png',
                publishedBy: 'Sample Channel',
                publishedAt: new Date().toISOString(),
                link: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
            },
            {
                id: `mock-${Date.now()}-2`,
                title: `${q} - Sample Video 2`,
                description: `Another sample video for "${q}". Please configure a valid video API for real results.`,
                thumbnail: '/logo.png',
                publishedBy: 'Demo Channel',
                publishedAt: new Date().toISOString(),
                link: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
            }
        ];

        res.status(200).json({
            videos: mockVideos,
            pageInfo: { nextPageToken: null, totalResults: 2, resultsPerPage: 2 },
        });
        
    } catch (error) {
        console.error('Videos API Error:', error);
        res.status(200).json({ 
            videos: [],
            pageInfo: { nextPageToken: null, totalResults: 0, resultsPerPage: 0 },
            error: "Video search temporarily unavailable"
        });
    }
}