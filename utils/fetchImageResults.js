import axios from "axios";
import _ from "lodash";

const fetchImageResults = (q, page) => {
    if (!q) {
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
    const start = (page - 1) * 10 + 1;

    return new Promise((resolve) => {
        axios.get(`https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${process.env.GOOGLE_API_CX}&q=${encodeURIComponent(q)}&start=${start}&searchType=image`, {
            headers: {
                'Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            }
        })
            .then(res => {
                // Kiểm tra lỗi từ API
                if (res.data.error) {
                    console.error('Google Custom Search API Error:', res.data.error);
                    resolve([]);
                    return;
                }

                const responseItems = res.data.items;

                if (!responseItems || !Array.isArray(responseItems)) {
                    resolve([]);
                    return;
                }

                const items = responseItems.map(item => {
                    return {
                        link: item.link,
                        title: item.title || '',
                        snippet: item.snippet || '',
                        thumbnail: item.image?.thumbnailLink || item.image?.link || item.link,
                        htmlSnippet: item.htmlSnippet || '',
                        htmlTitle: item.htmlTitle || '',
                    }
                })

                resolve(items);
            })
            .catch(error => {
                console.error('Error fetching image results:', error.response?.data || error.message);
                resolve([]);
            });
    })
}

export default fetchImageResults;