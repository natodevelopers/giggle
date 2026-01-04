import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import styles from "./page.module.scss";

const SearchPageContent = dynamic(() => import('./SearchPageContent'));

const ResultCard = dynamic(() => import('@/components/pages/all/Card'));

export default function SearchPage() {
    return (
        <div className={styles.searchPage}>
            <div className={styles.results__container}>
                <Suspense fallback={<div>Loading search...</div>}>
                    <SearchPageContent />
                </Suspense>
            </div>
            <Suspense fallback={<div>Loading card...</div>}>
                <ResultCard />
            </Suspense>
        </div>
    );
}