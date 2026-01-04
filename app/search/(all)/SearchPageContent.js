"use client"

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import ResultsSnippet from "@/components/pages/all/Snippet";
import styles from "./page.module.scss";
import ResultSkeleton from "@/components/pages/all/SnippetSkeleton";
import NoResults from "@/components/shared/NoResults";
import LoadmoreBtn from "@/components/shared/LoadmoreBtn";
import axios from "axios";

const SearchPageContent = () => {
    const searchParams = useSearchParams();
    const query = searchParams.get("q");

    const [results, setResults] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isMoreLoading, setIsMoreLoading] = useState(false);

    useEffect(() => {
        if (!query) {
            setLoading(false);
            return;
        }

        const encodedQuery = encodeURIComponent(query);
        axios.get(`/api/search/?q=${encodedQuery}&page=${page}`)
            .then(res => {
                console.log(`Received ${res.data?.length || 0} results for query: ${query}`);
                // Filter out duplicates based on link
                setResults((prevResults) => {
                    const existingLinks = new Set(prevResults.map(r => r.link));
                    const newResults = (res.data || []).filter(result => result.link && !existingLinks.has(result.link));
                    return [...prevResults, ...newResults];
                });
            })
            .catch(err => {
                console.error('Error fetching search results:', err);
                setError(true);
            })
            .finally(() => {
                setLoading(false);
                setIsMoreLoading(false);
            })

    }, [query, page])

    useEffect(() => { setResults([]), setLoading(true) }, [query])

    if (error) {
        return (
            <div className={styles.searchPage}>
                <div className={styles.results__container}>
                    <p>Something went wrong</p>
                </div>
            </div>
        )
    }

    if (!loading && results.length === 0) {
        return (<NoResults query={query} />)
    }

    return (
        <>
            {(loading) ? (
                <>{Array.from(Array(10).keys()).map((i) => <ResultSkeleton key={i} />)}</>
            ) : (
                <>
                    {results.map((result, index) => (
                        <ResultsSnippet key={`${result.link}-${index}`} results={result} />
                    ))}
                    {(page < 4) && <LoadmoreBtn isLoading={isMoreLoading} onClick={() => { setPage((page) => page + 1); setIsMoreLoading(true) }} />}
                </>
            )}
        </>
    )
}

export default SearchPageContent;