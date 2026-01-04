import { currentUser } from "@clerk/nextjs/server";
import mongoClint from "@/utils/db";

export default async function handler(req, res) {
    try {
        // Only allow POST requests for security
        if (req.method !== 'GET') {
            res.status(405).json({ message: 'Method not allowed' });
            return;
        }

        const { q: query, t: localTimestamp, p: path } = req.query;

        if (!query || !localTimestamp) {
            res.status(400).json({ message: 'Bad request: missing required parameters' });
            return;
        }

        // Try to get user, but don't require authentication
        let email = null;
        try {
            const user = await currentUser();
            if (user) {
                email = user.emailAddresses[0]?.emailAddress || null;
            }
        } catch (err) {
            // User not authenticated, continue without email
            console.log('User not authenticated, saving history without email');
        }

        // Only save history if we have an email (user is logged in)
        if (!email) {
            res.status(200).json({ message: 'History not saved: user not authenticated' });
            return;
        }

        console.log(`Calling History API with email: ${email}, query: ${query}, path: ${path}, localTimestamp: ${localTimestamp}`);

        const client = await mongoClint;
        const db = client.db();

        await db.collection('history').insertOne({
            email,
            query,
            path: path || '/search',
            localTimestamp
        });

        res.status(200).json({ message: 'History saved successfully' });
    } catch (error) {
        console.error('History API Error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}
