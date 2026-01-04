"use client"

import CardSkeleton from "@/components/pages/videos/CardSkeleton";
import VideoCard from "@/components/pages/videos/VideoCard";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./page.module.scss";
import NoResults from "@/components/shared/NoResults";
import LoadmoreBtn from "@/components/shared/LoadmoreBtn";

const VideosPageContent = (props) => {

    const searchParams = useSearchParams();
    const query = searchParams.get("q");

    const [results, setResults] = useState([]);
    const [page, setPage] = useState("");
    const [loading, setLoading] = useState(true);
    const [nextPageToken, setNextPageToken] = useState("");
    const [isMoreLoading, setIsMoreLoading] = useState(false);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!query) {
            setLoading(false);
            return;
        }
        
        fetch(`/api/search/videos?q=${query}&page=${page}`)
            .then(res => {
                if (!res.ok) {
                    // Gracefully handle API errors
                    setError(true);
                    setErrorMessage('Videos API is currently unavailable');
                    setLoading(false);
                    setIsMoreLoading(false);
                    return null;
                }
                return res.json();
            })
            .then(data => {
                if (!data) return; // Skip if error occurred above
                
                if (data.error) {
                    setError(true);
                    setErrorMessage(data.error || "An error occurred");
                    setLoading(false);
                    setIsMoreLoading(false);
                    return;
                }
                setLoading(false);
                setError(false);
                setErrorMessage("");
                // Filter out duplicates based on video ID
                setResults((prevResults) => {
                    const existingIds = new Set(prevResults.map(r => r.id));
                    const newVideos = (data?.videos || []).filter(video => video.id && !existingIds.has(video.id));
                    return [...prevResults, ...newVideos];
                });
                setNextPageToken(data?.pageInfo?.nextPageToken || "");
                setIsMoreLoading(false);
            })
            .catch(err => {
                console.error('Video fetch error:', err);
                setError(true);
                setErrorMessage("Videos service is temporarily unavailable");
                setLoading(false);
                setIsMoreLoading(false);
            });
    }, [query, page]);

    useEffect(() => { 
        setResults([]);
        setLoading(true);
        setError(false);
        setErrorMessage("");
        setPage("");
    }, [query])

    if (error) {
        console.log("Error message: ", errorMessage, " - and error: ", error);
        return (
            <div className={styles.videos__page}>
                <div className={styles.results__container}>
                    <h2>Videos temporarily unavailable</h2>
                    <p>YouTube API quota exceeded. Please try again later.</p>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className={styles.videos__page}>
                <div className={styles.results__container}>
                    {Array.from(Array(10).keys()).map((i) => <CardSkeleton key={i} />)}
                </div>
            </div>
        )
    }

    if (!results.length) {
        return (
            <div className={styles.videos__page}>
                <NoResults query={query} type="videos" />
            </div>
        )
    }

    return (
        <div className={styles.videos__page}>
            <div className={styles.results__container}>
                {results.map((result, i) => (
                    <VideoCard key={`${result.id}-${i}`} results={result} />
                ))}
            </div>
            <LoadmoreBtn isLoading={isMoreLoading} onClick={() => {setPage(nextPageToken); setIsMoreLoading(true); }} />
        </div>
    )
}

export default VideosPageContent;
