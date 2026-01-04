"use client"

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./page.module.scss";
import Card from "@/components/pages/images/Card";
import CardSkeleton from "@/components/pages/images/CardSkeleton";
import LoadmoreBtn from "@/components/shared/LoadmoreBtn";
import axios from "axios";
import NoResults from "@/components/shared/NoResults";

const ImagesPageContent = (props) => {

    const searchParams = useSearchParams();
    const query = searchParams.get("q");

    const [results, setResults] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [isMoreLoading, setIsMoreLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!query) {
            setLoading(false);
            return;
        }

        axios.get(`/api/search/images?q=${query}&page=${page}`)
            .then(res => {
                if (res.data.error) {
                    setError(true);
                    setLoading(false);
                    setIsMoreLoading(false);
                    return;
                }
                setError(false);
                // Filter out duplicates based on link
                setResults((prevResults) => {
                    const existingLinks = new Set(prevResults.map(r => r.link));
                    const newImages = (res.data || []).filter(image => image.link && !existingLinks.has(image.link));
                    return [...prevResults, ...newImages];
                });
            })
            .catch(err => {
                console.error('Error fetching images:', err);
                setError(true);
            })
            .finally(() => {
                setLoading(false);
                setIsMoreLoading(false);
            })
    }, [query, page])

    useEffect(() => { 
        setResults([]);
        setLoading(true);
        setError(false);
        setPage(1);
    }, [query]);

    if (loading) {
        return (
            <div className={styles.searchPage}>
                <div className={styles.results__container}>
                    {Array.from(Array(15).keys()).map((i) => <CardSkeleton key={i} />)}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className={styles.searchPage}>
                <div className={styles.results__container}>
                    <h2>Error loading images</h2>
                    <p>Please try again later</p>
                </div>
            </div>
        )
    }

    if (results.length === 0) {
        return (<NoResults query={query} type="Images" />)
    }

    return (
        <div className={styles.searchPage}>
            <div className={styles.results__container}>
                {results.map((result, index) => (
                    <Card key={`${result.link}-${index}`} results={result} />
                ))}
            </div>
            {
                (page < 5) && <LoadmoreBtn isLoading={isMoreLoading} onClick={() => { setPage((page) => page + 1); setIsMoreLoading(true) }} />
            }
        </div>
    )
}

export default ImagesPageContent;