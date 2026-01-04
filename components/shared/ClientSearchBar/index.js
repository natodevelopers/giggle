"use client";

import { Suspense } from 'react';
import SearchBar from '../SearchBar';

export default function ClientSearchBar(props) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchBar {...props} />
        </Suspense>
    );
}