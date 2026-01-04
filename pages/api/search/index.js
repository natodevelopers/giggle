import _ from "lodash";
import fetchSearchResults from "@/utils/fetchSearchResults";
import fetchNewsResults from "@/utils/fetchNewsResults";
import fetchVideosResults from "@/utils/fetchVideosResults";

export default async (req, res) => {
    try {
        const q = req.query.q;

        if (!q || !q.trim()) {
            res.status(400).json({ error: "Query parameter 'q' is required" });
            return;
        }

        const page = Number(req.query.page || 1);
        const start = (page - 1) * 10 + 1;

        console.log(`Calling Search API: q=${q}, start=${start}`);
        console.log(`Decoded query: ${decodeURIComponent(q)}`);

        const [newsResults, searchResults, videosResults] = await Promise.all([
            fetchNewsResults(q, page, 7).catch(err => {
                console.error('Error fetching news results:', err);
                return [];
            }),
            fetchSearchResults(q, start).catch(err => {
                console.error('Error fetching search results:', err);
                return [];
            }),
            fetchVideosResults(q, page, 4).catch(err => {
                console.error('Error fetching video results:', err);
                return [];
            })
        ]);

        console.log(`Search results count - News: ${newsResults?.length || 0}, Search: ${searchResults?.length || 0}, Videos: ${videosResults?.length || 0}`);
        
        // Log chi tiết từng nguồn
        if (searchResults && searchResults.length > 0) {
            console.log('Sample search result:', JSON.stringify(searchResults[0], null, 2));
        } else {
            console.log('No search results returned from Google Custom Search API');
        }

        const RESULTS = [
            ...(newsResults || []),
            ...(searchResults || []),
            ...(videosResults || [])
        ];

        console.log(`Total results: ${RESULTS.length} for query: ${q}`);

        if (RESULTS.length == 0) {
            res.status(200).json([]);
            return;
        }

        res.status(200).json(_.shuffle(RESULTS));
    } catch (error) {
        console.error('Search API Error:', error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}