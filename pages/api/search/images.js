import _ from "lodash";
import fetchImageResults from "@/utils/fetchImageResults";
import fetchVideosResults from "@/utils/fetchVideosResults";

export default async (req, res) => {
  try {
    const q = req.query.q;
    const page = Number(req.query.page) || 1;

    if (!q) {
      res.status(400).json({ error: "Query parameter 'q' is required" });
      return;
    }

    console.log(`Calling Image API: q=${q}, page=${page}`);

    const [imageResults, videosResults] = await Promise.all([
      fetchImageResults(q, page).catch(err => {
        console.error('Error fetching image results:', err);
        return [];
      }),
      fetchVideosResults(q, page, 4).catch(err => {
        console.error('Error fetching video results:', err);
        return [];
      })
    ]);

    const RESULTS = [
      ...(imageResults || []),
      ...(videosResults || [])
    ];

    if (RESULTS.length == 0) {
      res.status(200).json([]);
      return;
    }

    res.status(200).json(_.shuffle(RESULTS));
  } catch (error) {
    console.error('Images API Error:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
