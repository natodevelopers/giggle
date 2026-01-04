export default async (req, res) => {
    try {
        const q = req.query.q;
        const page = req.query.page || "";

        if (!q) {
            res.status(400).json({ error: "Query parameter 'q' is required" });
            return;
        }

        console.log(`Calling Videos API: q=${q}, start=${page}`);

        // Check if YouTube API key is configured
        if (!process.env.YOUTUBE_API_KEY) {
            console.error('YouTube API key not configured');
            res.status(200).json({
                videos: [],
                pageInfo: { nextPageToken: null, totalResults: 0, resultsPerPage: 0 },
                error: "YouTube API key not configured"
            });
            return;
        }

        const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(q)}&type=video&key=${process.env.YOUTUBE_API_KEY}${page ? `&pageToken=${page}` : ''}`;
        
        const origin = req.headers.origin || req.headers.referer || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        
        const response = await fetch(apiUrl, {
            headers: {
                'Referer': origin,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('YouTube API Error:', response.status, errorData);
            
            res.status(200).json({ 
                videos: [],
                pageInfo: { nextPageToken: null, totalResults: 0, resultsPerPage: 0 },
                error: errorData.error?.message || `YouTube API unavailable (${response.status})`
            });
            return;
        }

        const responseJson = await response.json();

        if (responseJson.error) {
            console.error('YouTube API Error:', responseJson.error);
            res.status(200).json({ 
                videos: [],
                pageInfo: { nextPageToken: null, totalResults: 0, resultsPerPage: 0 },
                error: responseJson.error.message || "YouTube API unavailable"
            });
            return;
        }

        if (!responseJson?.items || responseJson.items.length === 0) {
            res.status(200).json({
                videos: [],
                pageInfo: { nextPageToken: null, totalResults: 0, resultsPerPage: 0 },
            });
            return;
        }

        const videos = responseJson.items.map((item) => {
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
            nextPageToken: responseJson.nextPageToken || null,
            totalResults: responseJson.pageInfo?.totalResults || 0,
            resultsPerPage: responseJson.pageInfo?.resultsPerPage || 0,
        };

        res.status(200).json({ videos, pageInfo });
        
    } catch (error) {
        console.error('Videos API Error:', error);
        res.status(200).json({ 
            videos: [],
            pageInfo: { nextPageToken: null, totalResults: 0, resultsPerPage: 0 },
            error: "Video search temporarily unavailable"
        });
    }
}