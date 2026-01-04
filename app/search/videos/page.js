import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const VideosPageContent = dynamic(() => import('./VideosPageContent'));

export default function Page() {
    return (
        <Suspense fallback={<div>Loading videos...</div>}>
            <VideosPageContent />
        </Suspense>
    );
}