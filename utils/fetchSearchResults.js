import _ from "lodash";

const fetchSearchResults = (q, start) => {
    if (!q || !q.trim()) {
        return Promise.resolve([]);
    }

    if (!process.env.GOOGLE_API_KEY || !process.env.GOOGLE_API_CX) {
        console.error('Missing GOOGLE_API_KEY or GOOGLE_API_CX');
        return Promise.resolve([]);
    }

    const apiKeys = process.env.GOOGLE_API_KEY.split(';').filter(key => key.trim());
    if (apiKeys.length === 0) {
        console.error('No valid API keys found');
        return Promise.resolve([]);
    }

    const GOOGLE_API_KEY = _.sample(apiKeys);
    const encodedQuery = encodeURIComponent(q);
    const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${process.env.GOOGLE_API_CX}&q=${encodedQuery}&start=${start}`;

    console.log(`Fetching search results for: ${q} (encoded: ${encodedQuery})`);

    return new Promise((resolve) => {
        const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        
        fetch(apiUrl, {
            headers: {
                'Referer': origin,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            }
        })
            .then(response => {
                if (!response.ok) {
                    console.error(`Google Custom Search API error: ${response.status}`);
                    return response.json().then(err => {
                        console.error('API Error details:', err);
                        return { error: err, items: null };
                    });
                }
                return response.json();
            })
            .then(responseJson => {
                // Kiểm tra lỗi từ API
                if (responseJson.error) {
                    console.error('Google Custom Search API Error:', JSON.stringify(responseJson.error, null, 2));
                    console.error('Full API response:', JSON.stringify(responseJson, null, 2));
                    resolve([]);
                    return;
                }

                // Log toàn bộ response để debug
                console.log(`API Response for "${q}":`, JSON.stringify({
                    hasItems: !!responseJson.items,
                    itemsCount: responseJson.items?.length || 0,
                    searchInformation: responseJson.searchInformation
                }, null, 2));

                const responseItems = responseJson.items;

                if (!responseItems || !Array.isArray(responseItems)) {
                    console.log(`No items found for query: ${q}`);
                    console.log('Full response:', JSON.stringify(responseJson, null, 2));
                    resolve([]);
                    return;
                }

                const items = responseItems.map((item, i) => ({
                    title: item.title || '',
                    link: item.formattedUrl || item.link || '',
                    displayLink: item.displayLink || '',
                    snippet: item.snippet || '',
                    thumbnail: (i == 0 && item.pagemap?.cse_thumbnail?.[0]?.src || null),
                    favicon: `https://www.google.com/s2/favicons?domain=${item.link || item.formattedUrl}&sz=${256}`
                }));

                console.log(`Found ${items.length} search results for: ${q}`);
                resolve(items);
            })
            .catch(error => {
                console.error('Error fetching search results:', error);
                resolve([]);
            });
    })
}

export default fetchSearchResults;