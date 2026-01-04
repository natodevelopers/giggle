"use client";

import styles from "./style.module.scss"
import { FaSearch } from "react-icons/fa";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';

const fetchSuggestions = async (search, signal) => {
    if (!search || search.trim().length === 0) {
        return [];
    }

    try {
        const res = await fetch(`https://auto-suggest-queries.p.rapidapi.com/suggestqueries?query=${search}`, {
            "method": "GET",
            "headers": {
                "X-RapidAPI-Key": process.env.NEXT_PUBLIC_RAPID_API_KEY,
                "X-RapidAPI-Host": process.env.NEXT_PUBLIC_RAPID_API_HOST
            },
            signal
        });

        const data = await res.json() || [];
        return Array.isArray(data) ? data : [];
    } catch (err) {
        return [];
    }
}

const SearchBar = (props) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);
    const [focusedIndex, setFocusedIndex] = useState(-1);

    const [search, setSearch] = useState(props.value || "");
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setSearch(searchParams.get("q") || "");
    }, [pathname, searchParams]);

    useEffect(() => {
        if (!search || search.trim().length === 0) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        const controller = new AbortController();
        const { signal } = controller;

        const timeoutId = setTimeout(() => {
            fetchSuggestions(search, signal).then(data => {
                if (!signal.aborted) {
                    setSuggestions(data);
                    setIsOpen(data.length > 0);
                    setFocusedIndex(-1);
                }
            }).catch(() => {
                if (!signal.aborted) {
                    setSuggestions([]);
                    setIsOpen(false);
                }
            });
        }, 300); // Debounce 300ms

        return () => {
            clearTimeout(timeoutId);
            controller.abort();
        };
    }, [search]);

    const handleSearch = useCallback((e) => {
        e.preventDefault();
        if (inputRef.current) {
            inputRef.current.blur();
        }
        setIsOpen(false);

        const searchQuery = search.trim();
        if (!searchQuery) return;

        if (pathname === "/") {
            router.push(`/search?q=${searchQuery}`);
        } else {
            router.push(`${pathname}?q=${searchQuery}`);
        }

        fetch(`/api/history?q=${searchQuery}&p=${pathname}&t=${Date.now()}`).catch(() => {});
    }, [search, pathname, router]);

    const handleSuggestionClick = useCallback((suggestion) => {
        setSearch(suggestion);
        setIsOpen(false);
        if (inputRef.current) {
            inputRef.current.blur();
        }

        if (pathname === "/") {
            router.push(`/search?q=${suggestion}`);
        } else {
            router.push(`${pathname}?q=${suggestion}`);
        }
    }, [pathname, router]);

    const handleKeyDown = useCallback((e) => {
        if (!isOpen || suggestions.length === 0) {
            if (e.key === 'Enter') {
                handleSearch(e);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setFocusedIndex(prev => 
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (focusedIndex >= 0 && focusedIndex < suggestions.length) {
                    handleSuggestionClick(suggestions[focusedIndex]);
                } else {
                    handleSearch(e);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setFocusedIndex(-1);
                if (inputRef.current) {
                    inputRef.current.blur();
                }
                break;
            default:
                break;
        }
    }, [isOpen, suggestions, focusedIndex, handleSearch, handleSuggestionClick]);

    const handleInputChange = useCallback((e) => {
        setSearch(e.target.value);
        setFocusedIndex(-1);
    }, []);

    const handleInputFocus = useCallback(() => {
        if (suggestions.length > 0) {
            setIsOpen(true);
        }
    }, [suggestions.length]);

    const handleInputBlur = useCallback(() => {
        // Delay to allow click events on suggestions
        setTimeout(() => {
            setIsOpen(false);
            setFocusedIndex(-1);
        }, 200);
    }, []);

    const containerClass = `${styles.searchBar} ${isOpen ? styles.searchBar__open : ''}`;
    const suggestionsContainerClass = `${styles.suggestionsContainer} ${isOpen ? styles.suggestionsContainer__open : ''}`;

    return (
        <form onSubmit={handleSearch} className={containerClass}>
            <div className={styles.searchBar__container}>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Start typing to search ..."
                    value={search || ""}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    className={styles.input}
                />
                <button type="submit" className={styles.searchButton}>
                    <FaSearch />
                </button>
            </div>
            {isOpen && suggestions.length > 0 && (
                <div className={suggestionsContainerClass} ref={suggestionsRef}>
                    <ul className={styles.suggestionsList}>
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                className={`${styles.suggestion} ${index === focusedIndex ? styles.suggestionHighlighted : ''}`}
                                onClick={() => handleSuggestionClick(suggestion)}
                                onMouseEnter={() => setFocusedIndex(index)}
                            >
                                <span className={styles.searchIcon}>
                                    <FaSearch />
                                </span>
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </form>
    );
}

export default SearchBar;