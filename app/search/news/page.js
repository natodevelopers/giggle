import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const NewsPageContent = dynamic(() => import('./NewsPageContent'));

export default function Page() {
    return (
        <Suspense fallback={<div>Loading news...</div>}>
            <NewsPageContent />
        </Suspense>
    );
}